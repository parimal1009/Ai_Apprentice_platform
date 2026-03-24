"""
LangGraph-based AI Analysis Pipeline

Orchestrates the full analysis workflow:
1. Detect input type
2. Extract text (PDF) / Transcribe audio/video
3. Parse candidate profile
4. Run OCEAN personality analysis
5. Infer skills and experience
6. Generate LLM insights (Groq)
7. Build report payload
"""

from typing import TypedDict, Optional, List, Dict, Any
from dataclasses import dataclass, field
import os
import re
import json
import logging

logger = logging.getLogger(__name__)


class AnalysisState(TypedDict, total=False):
    """Shared state across the analysis pipeline."""
    input_type: str
    raw_text: Optional[str]
    file_path: Optional[str]
    extracted_text: Optional[str]
    transcript: Optional[str]
    parsed_profile: Optional[Dict]
    personality_scores: Optional[Dict]
    inferred_skills: Optional[List[str]]
    education_detected: Optional[List[Dict]]
    experience_detected: Optional[List[Dict]]
    llm_insights: Optional[Dict]
    candidate_summary: Optional[str]
    charts_data: Optional[Dict]
    report_payload: Optional[Dict]
    confidence_score: Optional[float]
    errors: List[str]
    status: str


# ============================================================
# Pipeline Nodes
# ============================================================

async def detect_input_type(state: AnalysisState) -> AnalysisState:
    """Detect and validate input type."""
    state["status"] = "detecting_input"
    input_type = state.get("input_type", "text")
    if input_type not in ["text", "pdf", "audio", "video"]:
        state["errors"] = state.get("errors", []) + [f"Unknown input type: {input_type}"]
    return state


async def extract_text_from_pdf(state: AnalysisState) -> AnalysisState:
    """Extract text from PDF using PyMuPDF."""
    if state.get("input_type") != "pdf":
        return state

    state["status"] = "extracting_pdf"
    file_path = state.get("file_path")

    if not file_path or not os.path.exists(file_path):
        state["errors"] = state.get("errors", []) + ["PDF file not found"]
        return state

    try:
        import fitz  # PyMuPDF
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        state["extracted_text"] = text.strip()
    except Exception as e:
        state["errors"] = state.get("errors", []) + [f"PDF extraction error: {str(e)}"]
        state["extracted_text"] = ""

    return state


async def transcribe_audio(state: AnalysisState) -> AnalysisState:
    """Transcribe audio/video using available speech-to-text."""
    if state.get("input_type") not in ["audio", "video"]:
        return state

    state["status"] = "transcribing"
    file_path = state.get("file_path")

    if not file_path:
        state["errors"] = state.get("errors", []) + ["Audio file not found"]
        return state

    try:
        from app.core.config import settings
        
        # 1. Try Groq (Whisper Large V3 - much faster and very reliable)
        if settings.GROQ_API_KEY:
            from groq import AsyncGroq
            client = AsyncGroq(api_key=settings.GROQ_API_KEY)
            
            # Determine filename to give it an audio extension hint if needed, 
            # though groq accepts webm directly
            filename = os.path.basename(file_path)
            
            with open(file_path, "rb") as f:
                file_data = f.read()
                
            transcription = await client.audio.transcriptions.create(
                file=(filename, file_data),
                model="whisper-large-v3",
                response_format="verbose_json",
            )
            
            state["transcript"] = transcription.text
            state["extracted_text"] = state["transcript"]
            return state

        # 2. Fallback to Hugging Face Whisper API
        import httpx
        if settings.HUGGINGFACE_API_KEY:
            api_url = "https://api-inference.huggingface.co/models/openai/whisper-large-v3"
            headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}"}

            with open(file_path, "rb") as f:
                data = f.read()

            async with httpx.AsyncClient(timeout=120) as client:
                response = await client.post(api_url, headers=headers, content=data)
                if response.status_code == 200:
                    result = response.json()
                    state["transcript"] = result.get("text", "")
                    state["extracted_text"] = state["transcript"]
                    return state
                else:
                    state["errors"] = state.get("errors", []) + [f"HF API Error: {response.text}"]

        # Fallback: basic text placeholder
        state["transcript"] = "[Audio transcription unavailable - API key not configured or APIs failed]"
        state["extracted_text"] = state["transcript"]
        state["errors"] = state.get("errors", []) + ["Transcription service unavailable, using fallback"]

    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        state["errors"] = state.get("errors", []) + [f"Transcription error: {str(e)}"]
        state["transcript"] = ""
        state["extracted_text"] = ""

    return state


async def clean_text(state: AnalysisState) -> AnalysisState:
    """Clean and normalize extracted text."""
    state["status"] = "cleaning_text"

    text = state.get("extracted_text") or state.get("raw_text") or ""

    # Basic cleaning
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()

    if not text:
        state["errors"] = state.get("errors", []) + ["No text to analyze"]

    state["extracted_text"] = text
    return state


async def parse_candidate_profile(state: AnalysisState) -> AnalysisState:
    """Parse candidate profile from extracted text using pattern matching."""
    state["status"] = "parsing_profile"
    text = state.get("extracted_text", "")

    if not text:
        return state

    profile = {}

    # Extract email
    emails = re.findall(r'[\w.+-]+@[\w-]+\.[\w.-]+', text)
    if emails:
        profile["email"] = emails[0]

    # Extract phone
    phones = re.findall(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    if phones:
        profile["phone"] = phones[0]

    # Extract names (basic heuristic - first line or capitalized words at start)
    lines = text.split('\n')
    if lines:
        first_line = lines[0].strip()
        if len(first_line.split()) <= 4 and first_line.replace(' ', '').isalpha():
            profile["name"] = first_line

    state["parsed_profile"] = profile
    return state


async def infer_skills_and_experience(state: AnalysisState) -> AnalysisState:
    """Infer skills, education, and experience from text."""
    state["status"] = "inferring_skills"
    text = (state.get("extracted_text") or "").lower()

    if not text:
        return state

    # Skill detection
    skill_keywords = {
        "Python": ["python", "django", "flask", "fastapi"],
        "JavaScript": ["javascript", "js", "node", "react", "vue", "angular", "typescript"],
        "Data Analysis": ["data analysis", "pandas", "numpy", "data science", "analytics"],
        "Machine Learning": ["machine learning", "ml", "deep learning", "tensorflow", "pytorch"],
        "SQL": ["sql", "postgresql", "mysql", "database"],
        "Cloud": ["aws", "azure", "gcp", "cloud"],
        "DevOps": ["docker", "kubernetes", "ci/cd", "devops"],
        "Communication": ["communication", "presentation", "public speaking"],
        "Leadership": ["leadership", "team lead", "management", "supervisor"],
        "Project Management": ["project management", "agile", "scrum", "kanban"],
        "Customer Service": ["customer service", "client relations"],
        "Marketing": ["marketing", "seo", "social media", "content"],
        "Finance": ["finance", "accounting", "budgeting", "financial"],
        "Design": ["design", "figma", "photoshop", "ui/ux"],
        "Healthcare": ["healthcare", "medical", "nursing", "clinical"],
        "Engineering": ["engineering", "mechanical", "electrical", "civil"],
        "IT Support": ["it support", "help desk", "troubleshooting"],
        "Sales": ["sales", "business development", "revenue"],
        "Writing": ["writing", "copywriting", "content creation", "blogging"],
        "Research": ["research", "analysis", "methodology"],
    }

    detected_skills = []
    for skill, keywords in skill_keywords.items():
        if any(kw in text for kw in keywords):
            detected_skills.append(skill)

    state["inferred_skills"] = detected_skills

    # Education detection
    education_patterns = [
        r"(?:bachelor|bsc|ba|b\.a\.|b\.sc\.).*?(?:in\s+)?[\w\s]+",
        r"(?:master|msc|ma|m\.a\.|m\.sc\.|mba).*?(?:in\s+)?[\w\s]+",
        r"(?:phd|doctorate|ph\.d\.).*?(?:in\s+)?[\w\s]+",
        r"(?:diploma|certificate|nvq|btec|a-level|gcse).*?[\w\s]+",
        r"(?:level\s+\d).*?(?:in\s+)?[\w\s]+",
    ]
    education_items = []
    for pattern in education_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for m in matches[:3]:
            education_items.append({"qualification": m.strip().title()})

    state["education_detected"] = education_items

    # Experience detection (simplified)
    experience_items = []
    exp_patterns = re.findall(
        r'(?:worked at|experience at|employed at|role at|position at)\s+([^,.]+)',
        text, re.IGNORECASE
    )
    for exp in exp_patterns[:5]:
        experience_items.append({"company": exp.strip().title()})

    # Also detect years of experience
    year_patterns = re.findall(r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s+)?experience', text, re.IGNORECASE)
    if year_patterns:
        experience_items.append({"total_years": int(year_patterns[0])})

    state["experience_detected"] = experience_items
    return state


async def run_ocean_analysis(state: AnalysisState) -> AnalysisState:
    """Run OCEAN personality analysis on text."""
    state["status"] = "analyzing_personality"
    text = (state.get("extracted_text") or "").lower()

    if not text:
        return state

    # Rule-based OCEAN analysis from text signals
    scores = {
        "openness": 50.0,
        "conscientiousness": 50.0,
        "extraversion": 50.0,
        "agreeableness": 50.0,
        "neuroticism": 30.0,
    }

    # Openness indicators
    openness_positive = ["creative", "innovative", "curious", "diverse", "artistic", "imaginative", "exploring"]
    openness_count = sum(1 for w in openness_positive if w in text)
    scores["openness"] = min(95, 50 + openness_count * 8)

    # Conscientiousness indicators
    consc_positive = ["organized", "detail", "reliable", "punctual", "thorough", "systematic", "disciplined", "planned"]
    consc_count = sum(1 for w in consc_positive if w in text)
    scores["conscientiousness"] = min(95, 50 + consc_count * 7)

    # Extraversion indicators
    extra_positive = ["team", "collaborate", "lead", "present", "social", "outgoing", "energetic", "networking"]
    extra_count = sum(1 for w in extra_positive if w in text)
    scores["extraversion"] = min(95, 50 + extra_count * 7)

    # Agreeableness indicators
    agree_positive = ["helpful", "supportive", "cooperative", "volunteer", "mentor", "empathetic", "patient"]
    agree_count = sum(1 for w in agree_positive if w in text)
    scores["agreeableness"] = min(95, 50 + agree_count * 8)

    # Neuroticism (low = calm, collected)
    neuro_negative = ["calm", "resilient", "stable", "composed", "patient", "relaxed"]
    neuro_count = sum(1 for w in neuro_negative if w in text)
    scores["neuroticism"] = max(10, 40 - neuro_count * 6)

    state["personality_scores"] = scores
    return state


async def generate_llm_insights(state: AnalysisState) -> AnalysisState:
    """Generate AI insights using Groq (Llama 3.3 70B)."""
    state["status"] = "generating_insights"
    text = state.get("extracted_text", "")

    if not text or len(text) < 20:
        state["llm_insights"] = _generate_fallback_insights(state)
        return state

    try:
        from app.core.config import settings

        if not settings.GROQ_API_KEY:
            state["llm_insights"] = _generate_fallback_insights(state)
            state["errors"] = state.get("errors", []) + ["Groq API key not configured, using fallback"]
            return state

        from groq import AsyncGroq

        client = AsyncGroq(api_key=settings.GROQ_API_KEY)

        skills = state.get("inferred_skills", [])
        personality = state.get("personality_scores", {})

        prompt = f"""Analyze this candidate profile and provide structured insights.

CANDIDATE TEXT:
{text[:3000]}

DETECTED SKILLS: {', '.join(skills) if skills else 'None detected'}
PERSONALITY SCORES (OCEAN): {json.dumps(personality) if personality else 'Not available'}

Provide a JSON response with these fields:
{{
  "candidate_summary": "2-3 sentence overview",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "gaps": ["gap 1", "gap 2"],
  "communication_style": "brief description",
  "role_fit": "best suited role types",
  "learning_potential": "assessment of learning capacity",
  "recommended_paths": ["path 1", "path 2"],
  "interview_suggestions": ["question 1", "question 2"],
  "coach_notes": "notes for training providers"
}}

Return ONLY valid JSON, no markdown formatting."""

        chat_completion = await client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=1500,
        )

        response_text = chat_completion.choices[0].message.content or ""

        # Parse JSON from response
        try:
            # Try to extract JSON from the response
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                insights = json.loads(json_match.group())
                state["llm_insights"] = insights
                state["candidate_summary"] = insights.get("candidate_summary", "")
            else:
                state["llm_insights"] = _generate_fallback_insights(state)
                state["errors"] = state.get("errors", []) + ["Could not parse LLM response"]
        except json.JSONDecodeError:
            state["llm_insights"] = _generate_fallback_insights(state)
            state["errors"] = state.get("errors", []) + ["Invalid JSON in LLM response"]

    except Exception as e:
        logger.error(f"LLM insights generation failed: {e}")
        state["llm_insights"] = _generate_fallback_insights(state)
        state["errors"] = state.get("errors", []) + [f"LLM generation failed: {str(e)}"]

    return state


def _generate_fallback_insights(state: AnalysisState) -> Dict:
    """Generate deterministic fallback insights when LLM is unavailable."""
    skills = state.get("inferred_skills", [])
    personality = state.get("personality_scores", {})

    summary_parts = []
    if skills:
        summary_parts.append(f"Candidate demonstrates skills in {', '.join(skills[:3])}")
    if personality:
        top_trait = max(personality, key=personality.get) if personality else "conscientiousness"
        summary_parts.append(f"with notable {top_trait}")
    summary = ". ".join(summary_parts) + "." if summary_parts else "Profile analysis completed with limited data."

    strengths = []
    if skills:
        strengths.extend([f"Technical competency in {s}" for s in skills[:3]])
    if personality.get("conscientiousness", 0) > 60:
        strengths.append("Strong organizational skills")
    if personality.get("openness", 0) > 60:
        strengths.append("Open to learning new concepts")
    if not strengths:
        strengths = ["Potential for growth", "Willingness to learn"]

    gaps = []
    if not skills:
        gaps.append("Technical skills not clearly demonstrated")
    if len(skills) < 3:
        gaps.append("Could benefit from broader skill development")
    if not gaps:
        gaps = ["Consider documenting achievements more clearly"]

    return {
        "candidate_summary": summary,
        "strengths": strengths,
        "gaps": gaps,
        "communication_style": "Standard professional communication",
        "role_fit": "General apprenticeship roles" if not skills else f"Roles requiring {', '.join(skills[:2])}",
        "learning_potential": "Shows capacity for structured learning",
        "recommended_paths": [
            "Level 3 Apprenticeship",
            "Skills development program",
        ],
        "interview_suggestions": [
            "Describe a project you're proud of",
            "How do you approach learning new skills?",
        ],
        "coach_notes": "Candidate would benefit from mentorship and structured goal setting.",
        "_fallback": True,
    }


async def build_report_payload(state: AnalysisState) -> AnalysisState:
    """Build the final report payload."""
    state["status"] = "building_report"

    state["report_payload"] = {
        "input_type": state.get("input_type"),
        "extracted_text": (state.get("extracted_text") or "")[:500],
        "parsed_profile": state.get("parsed_profile"),
        "skills_detected": state.get("inferred_skills", []),
        "education_detected": state.get("education_detected", []),
        "experience_detected": state.get("experience_detected", []),
        "personality_scores": state.get("personality_scores"),
        "ai_insights": state.get("llm_insights"),
        "candidate_summary": state.get("candidate_summary") or (
            state.get("llm_insights", {}).get("candidate_summary", "")
        ),
        "confidence_score": _calculate_confidence(state),
        "errors": state.get("errors", []),
    }

    state["confidence_score"] = state["report_payload"]["confidence_score"]
    state["status"] = "completed"
    return state


def _calculate_confidence(state: AnalysisState) -> float:
    """Calculate confidence score based on data quality."""
    score = 0.0
    max_score = 5.0

    if state.get("extracted_text") and len(state["extracted_text"]) > 50:
        score += 1.0
    if state.get("inferred_skills"):
        score += 1.0
    if state.get("education_detected"):
        score += 0.5
    if state.get("experience_detected"):
        score += 0.5
    if state.get("personality_scores"):
        score += 1.0
    if state.get("llm_insights") and not state.get("llm_insights", {}).get("_fallback"):
        score += 1.0
    else:
        score += 0.5

    return round(score / max_score, 2)


# ============================================================
# Main Pipeline Entry Point
# ============================================================

async def run_analysis(
    input_type: str,
    input_text: Optional[str] = None,
    file_path: Optional[str] = None,
) -> Dict[str, Any]:
    """Run the full analysis pipeline."""

    state: AnalysisState = {
        "input_type": input_type,
        "raw_text": input_text,
        "file_path": file_path,
        "errors": [],
        "status": "started",
    }

    # Execute pipeline steps in order
    try:
        state = await detect_input_type(state)

        if input_type == "text":
            state["extracted_text"] = input_text
        elif input_type == "pdf":
            state = await extract_text_from_pdf(state)
        elif input_type in ["audio", "video"]:
            state = await transcribe_audio(state)

        state = await clean_text(state)
        state = await parse_candidate_profile(state)
        state = await infer_skills_and_experience(state)
        state = await run_ocean_analysis(state)
        state = await generate_llm_insights(state)
        state = await build_report_payload(state)

    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        state["errors"] = state.get("errors", []) + [str(e)]
        state["status"] = "failed"

    return {
        "extracted_text": state.get("extracted_text"),
        "candidate_summary": state.get("candidate_summary") or state.get("report_payload", {}).get("candidate_summary"),
        "skills_detected": state.get("inferred_skills", []),
        "education_detected": state.get("education_detected", []),
        "experience_detected": state.get("experience_detected", []),
        "personality_scores": state.get("personality_scores"),
        "ai_insights": state.get("llm_insights"),
        "report_data": state.get("report_payload"),
        "confidence_score": state.get("confidence_score"),
    }
