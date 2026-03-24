"""OCEAN Big Five Personality Analysis Service"""

from typing import Dict, List, Tuple, Any, Optional

# Big Five / OCEAN Questionnaire
OCEAN_QUESTIONS = [
    # Openness (O) - questions 1-8
    {"id": "o1", "text": "I have a vivid imagination.", "trait": "openness", "direction": 1},
    {"id": "o2", "text": "I am interested in abstract ideas.", "trait": "openness", "direction": 1},
    {"id": "o3", "text": "I enjoy trying new things and experiences.", "trait": "openness", "direction": 1},
    {"id": "o4", "text": "I prefer routine over variety.", "trait": "openness", "direction": -1},
    {"id": "o5", "text": "I appreciate art and creative expression.", "trait": "openness", "direction": 1},
    {"id": "o6", "text": "I am curious about many different things.", "trait": "openness", "direction": 1},
    {"id": "o7", "text": "I prefer practical solutions over theoretical ones.", "trait": "openness", "direction": -1},
    {"id": "o8", "text": "I enjoy learning about different cultures.", "trait": "openness", "direction": 1},

    # Conscientiousness (C) - questions 9-16
    {"id": "c1", "text": "I am always prepared.", "trait": "conscientiousness", "direction": 1},
    {"id": "c2", "text": "I pay attention to details.", "trait": "conscientiousness", "direction": 1},
    {"id": "c3", "text": "I like to keep things organized.", "trait": "conscientiousness", "direction": 1},
    {"id": "c4", "text": "I often forget to put things back in their place.", "trait": "conscientiousness", "direction": -1},
    {"id": "c5", "text": "I follow through on plans I make.", "trait": "conscientiousness", "direction": 1},
    {"id": "c6", "text": "I tend to procrastinate on tasks.", "trait": "conscientiousness", "direction": -1},
    {"id": "c7", "text": "I set high standards for myself.", "trait": "conscientiousness", "direction": 1},
    {"id": "c8", "text": "I complete tasks successfully.", "trait": "conscientiousness", "direction": 1},

    # Extraversion (E) - questions 17-24
    {"id": "e1", "text": "I feel comfortable around people.", "trait": "extraversion", "direction": 1},
    {"id": "e2", "text": "I start conversations with strangers.", "trait": "extraversion", "direction": 1},
    {"id": "e3", "text": "I am the life of the party.", "trait": "extraversion", "direction": 1},
    {"id": "e4", "text": "I prefer to be alone rather than in a group.", "trait": "extraversion", "direction": -1},
    {"id": "e5", "text": "I enjoy being the center of attention.", "trait": "extraversion", "direction": 1},
    {"id": "e6", "text": "I feel energized after social interactions.", "trait": "extraversion", "direction": 1},
    {"id": "e7", "text": "I tend to keep in the background.", "trait": "extraversion", "direction": -1},
    {"id": "e8", "text": "I am talkative.", "trait": "extraversion", "direction": 1},

    # Agreeableness (A) - questions 25-32
    {"id": "a1", "text": "I am interested in other people's problems.", "trait": "agreeableness", "direction": 1},
    {"id": "a2", "text": "I feel others' emotions.", "trait": "agreeableness", "direction": 1},
    {"id": "a3", "text": "I have a soft heart.", "trait": "agreeableness", "direction": 1},
    {"id": "a4", "text": "I am not really interested in others.", "trait": "agreeableness", "direction": -1},
    {"id": "a5", "text": "I take time out for others.", "trait": "agreeableness", "direction": 1},
    {"id": "a6", "text": "I make people feel at ease.", "trait": "agreeableness", "direction": 1},
    {"id": "a7", "text": "I insult people.", "trait": "agreeableness", "direction": -1},
    {"id": "a8", "text": "I am helpful and unselfish with others.", "trait": "agreeableness", "direction": 1},

    # Neuroticism (N) - questions 33-40
    {"id": "n1", "text": "I get stressed out easily.", "trait": "neuroticism", "direction": 1},
    {"id": "n2", "text": "I worry about things.", "trait": "neuroticism", "direction": 1},
    {"id": "n3", "text": "I am easily disturbed.", "trait": "neuroticism", "direction": 1},
    {"id": "n4", "text": "I am relaxed most of the time.", "trait": "neuroticism", "direction": -1},
    {"id": "n5", "text": "I get upset easily.", "trait": "neuroticism", "direction": 1},
    {"id": "n6", "text": "I seldom feel blue.", "trait": "neuroticism", "direction": -1},
    {"id": "n7", "text": "I often feel anxious.", "trait": "neuroticism", "direction": 1},
    {"id": "n8", "text": "I remain calm under pressure.", "trait": "neuroticism", "direction": -1},
]


TRAIT_DESCRIPTIONS = {
    "openness": {
        "high": "You are imaginative, insightful, and have a broad range of interests. You enjoy novelty and are open to new experiences, ideas, and values.",
        "medium": "You have a balanced approach to new experiences. You can be creative when needed but also appreciate familiar routines.",
        "low": "You tend to be practical and conventional. You prefer familiar routines and have traditional interests.",
    },
    "conscientiousness": {
        "high": "You are organized, dependable, and disciplined. You prefer planned rather than spontaneous behavior and tend to be methodical.",
        "medium": "You balance structure with flexibility. You can be organized when needed but are adaptable to changing circumstances.",
        "low": "You tend to be flexible and spontaneous. You may prefer keeping your options open rather than following strict plans.",
    },
    "extraversion": {
        "high": "You are outgoing, energetic, and enjoy being around others. You tend to be enthusiastic and action-oriented.",
        "medium": "You can enjoy social situations but also value your alone time. You adapt well to both group and solo activities.",
        "low": "You tend to be reserved and prefer solitary activities. You may find large groups draining and prefer meaningful one-on-one connections.",
    },
    "agreeableness": {
        "high": "You are compassionate, cooperative, and value harmony with others. You tend to be trusting and helpful.",
        "medium": "You balance concern for others with your own needs. You can be cooperative while maintaining healthy boundaries.",
        "low": "You tend to be more competitive and challenging. You prioritize objectivity and may be skeptical of others' intentions.",
    },
    "neuroticism": {
        "high": "You may experience emotional instability and are more prone to stress. Being aware of this can help you develop coping strategies.",
        "medium": "You have moderate emotional reactivity. You experience some stress but generally cope well.",
        "low": "You are emotionally stable and resilient. You tend to remain calm under pressure and handle stress well.",
    },
}


def calculate_ocean_scores(
    answers: Dict[str, int]
) -> Tuple[Dict, Dict, List[str], List[str], Dict]:
    """
    Calculate OCEAN scores from questionnaire answers.
    Answers are on a 1-5 Likert scale (1=Strongly Disagree, 5=Strongly Agree).
    Returns: (raw_scores, normalized_scores, strengths, growth_areas, explanations)
    """
    trait_sums: Dict[str, float] = {
        "openness": 0, "conscientiousness": 0, "extraversion": 0,
        "agreeableness": 0, "neuroticism": 0
    }
    trait_counts: Dict[str, int] = {k: 0 for k in trait_sums}

    for question in OCEAN_QUESTIONS:
        qid = question["id"]
        if qid in answers:
            value = int(answers[qid])
            # Reverse-scored items
            if question["direction"] == -1:
                value = 6 - value
            trait_sums[question["trait"]] += value
            trait_counts[question["trait"]] += 1

    # Calculate raw scores (average per trait, scaled 0-100)
    raw_scores = {}
    for trait, total in trait_sums.items():
        count = trait_counts[trait]
        if count > 0:
            avg = total / count  # 1-5 scale
            raw_scores[trait] = round((avg - 1) / 4 * 100, 1)
        else:
            raw_scores[trait] = 50.0

    # Normalized scores (same as raw for now, can add population norms later)
    normalized_scores = {k: v for k, v in raw_scores.items()}

    # Determine strengths and growth areas
    strengths = []
    growth_areas = []
    explanations = {}

    for trait, score in raw_scores.items():
        if score >= 70:
            level = "high"
        elif score >= 40:
            level = "medium"
        else:
            level = "low"

        explanations[trait] = {
            "score": score,
            "level": level,
            "description": TRAIT_DESCRIPTIONS[trait][level],
        }

        # Determine strengths/growth
        if trait != "neuroticism":
            if score >= 70:
                strengths.append(f"High {trait.capitalize()}")
            elif score < 40:
                growth_areas.append(f"Develop {trait.capitalize()}")
        else:
            # For neuroticism, low is a strength
            if score < 40:
                strengths.append("Emotional Stability")
            elif score >= 70:
                growth_areas.append("Stress Management")

    return raw_scores, normalized_scores, strengths, growth_areas, explanations


def get_ocean_questions():
    """Return questions without revealing scoring details."""
    return [
        {"id": q["id"], "text": q["text"]}
        for q in OCEAN_QUESTIONS
    ]
