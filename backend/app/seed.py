"""Seed database with demo data."""

import asyncio
import secrets
from datetime import datetime, date, timezone, timedelta
from sqlalchemy import select

from app.core.database import engine, async_session_factory, Base
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.models import (
    ApprenticeProfile, CompanyProfile, TrainingProviderProfile,
    ApprenticeshipType, ApprenticeshipListing, Cohort, CohortMember,
    Assessment, AssessmentQuestion, AssessmentAttempt, Application,
    PsychometricResult, AnalysisJob, AnalysisResult, Collaboration,
    Notification, AdminSettings
)


async def seed():
    """Create all tables and seed demo data."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as db:
        # Check if already seeded
        existing = await db.execute(select(User).limit(1))
        if existing.scalar_one_or_none():
            print("Database already seeded. Skipping.")
            return

        print("Seeding database...")

        # =============================================
        # Users
        # =============================================
        admin_user = User(
            email="admin@apprentice.ai",
            hashed_password=hash_password("Admin123!"),
            role=UserRole.ADMIN,
            first_name="System",
            last_name="Admin",
            is_active=True,
            is_verified=True,
        )
        db.add(admin_user)

        apprentice1 = User(
            email="alex@example.com",
            hashed_password=hash_password("Demo123!"),
            role=UserRole.APPRENTICE,
            first_name="Alex",
            last_name="Morgan",
            is_active=True,
            is_verified=True,
        )
        db.add(apprentice1)

        apprentice2 = User(
            email="jordan@example.com",
            hashed_password=hash_password("Demo123!"),
            role=UserRole.APPRENTICE,
            first_name="Jordan",
            last_name="Lee",
            is_active=True,
            is_verified=True,
        )
        db.add(apprentice2)

        apprentice3 = User(
            email="sam@example.com",
            hashed_password=hash_password("Demo123!"),
            role=UserRole.APPRENTICE,
            first_name="Sam",
            last_name="Taylor",
            is_active=True,
            is_verified=True,
        )
        db.add(apprentice3)

        company1_user = User(
            email="hr@techcorp.com",
            hashed_password=hash_password("Demo123!"),
            role=UserRole.COMPANY,
            first_name="Sarah",
            last_name="Chen",
            is_active=True,
            is_verified=True,
        )
        db.add(company1_user)

        company2_user = User(
            email="recruit@innovate.com",
            hashed_password=hash_password("Demo123!"),
            role=UserRole.COMPANY,
            first_name="James",
            last_name="Wright",
            is_active=True,
            is_verified=True,
        )
        db.add(company2_user)

        provider_user = User(
            email="admin@skillsacademy.com",
            hashed_password=hash_password("Demo123!"),
            role=UserRole.TRAINING_PROVIDER,
            first_name="Maria",
            last_name="Johnson",
            is_active=True,
            is_verified=True,
        )
        db.add(provider_user)

        await db.flush()

        # =============================================
        # Apprentice Profiles
        # =============================================
        profile1 = ApprenticeProfile(
            user_id=apprentice1.id,
            phone="+44 7700 900123",
            date_of_birth=date(2002, 5, 15),
            city="London",
            postcode="E1 6AN",
            headline="Aspiring Software Developer",
            bio="Passionate about technology and coding. Looking for an opportunity to start my career in software development.",
            skills=["Python", "JavaScript", "HTML", "CSS", "Git"],
            education=[
                {"institution": "London Academy", "qualification": "A-Levels", "year": "2023", "subjects": "Computer Science, Maths, Physics"},
            ],
            work_experience=[
                {"company": "Local Tech Shop", "role": "IT Assistant", "duration": "6 months", "description": "Customer support and basic repairs"},
            ],
            languages=["English", "French"],
            availability="immediate",
            career_interests=["Software Development", "Web Development", "Data Science"],
            work_preference="hybrid",
            apprenticeship_level="level_3",
            profile_completeness=85,
        )
        db.add(profile1)

        profile2 = ApprenticeProfile(
            user_id=apprentice2.id,
            phone="+44 7700 900456",
            date_of_birth=date(2003, 8, 22),
            city="Manchester",
            postcode="M1 1AA",
            headline="Healthcare Administration Enthusiast",
            bio="Detail-oriented and compassionate individual looking to build a career in healthcare administration.",
            skills=["Microsoft Office", "Communication", "Customer Service", "Data Entry"],
            education=[
                {"institution": "Manchester College", "qualification": "BTEC Level 3 Health & Social Care", "year": "2024"},
            ],
            work_experience=[],
            languages=["English", "Urdu"],
            availability="1_month",
            career_interests=["Healthcare", "Business Administration"],
            work_preference="onsite",
            apprenticeship_level="level_3",
            profile_completeness=70,
        )
        db.add(profile2)

        profile3 = ApprenticeProfile(
            user_id=apprentice3.id,
            phone="+44 7700 900789",
            date_of_birth=date(2001, 1, 10),
            city="Birmingham",
            postcode="B1 1BB",
            headline="Digital Marketing Graduate",
            bio="Creative thinker with a passion for digital marketing and content creation.",
            skills=["Social Media", "Content Creation", "SEO", "Analytics", "Canva", "Adobe Suite"],
            education=[
                {"institution": "Birmingham University", "qualification": "BA Marketing", "year": "2023"},
            ],
            work_experience=[
                {"company": "Freelance", "role": "Social Media Manager", "duration": "1 year", "description": "Managed accounts for 3 small businesses"},
            ],
            languages=["English"],
            availability="immediate",
            career_interests=["Digital Marketing", "Content Strategy"],
            work_preference="remote",
            apprenticeship_level="level_4",
            profile_completeness=90,
        )
        db.add(profile3)

        # =============================================
        # Company Profiles
        # =============================================
        company1 = CompanyProfile(
            user_id=company1_user.id,
            company_name="TechCorp Solutions",
            industry="Information Technology",
            company_size="51-200",
            website="https://techcorp.example.com",
            description="Leading technology solutions provider specializing in enterprise software and cloud services.",
            city="London",
            postcode="EC2A 1NT",
            contact_email="hr@techcorp.com",
            contact_phone="+44 20 7946 0958",
            required_skills=["Python", "JavaScript", "Cloud", "SQL"],
            apprenticeship_interests=["Software Development", "Data Analysis", "DevOps"],
        )
        db.add(company1)

        company2 = CompanyProfile(
            user_id=company2_user.id,
            company_name="Innovate Digital Agency",
            industry="Marketing & Advertising",
            company_size="11-50",
            website="https://innovate.example.com",
            description="Award-winning digital marketing agency helping brands grow their online presence.",
            city="Manchester",
            postcode="M2 3AW",
            contact_email="recruit@innovate.com",
            required_skills=["SEO", "Social Media", "Content Creation", "Analytics"],
            apprenticeship_interests=["Digital Marketing", "Content Strategy"],
        )
        db.add(company2)

        await db.flush()

        # =============================================
        # Training Provider Profile
        # =============================================
        provider = TrainingProviderProfile(
            user_id=provider_user.id,
            provider_name="Skills Academy UK",
            specialisation="Digital & IT Apprenticeships",
            ofsted_rating="Good",
            description="Award-winning training provider delivering high-quality apprenticeships in technology, digital marketing, and business administration.",
            city="London",
            postcode="WC1E 6BT",
            website="https://skillsacademy.example.com",
            contact_email="admin@skillsacademy.com",
            contact_phone="+44 20 7946 0123",
            courses=["Software Development", "Digital Marketing", "Business Administration", "Data Analysis"],
        )
        db.add(provider)
        await db.flush()

        # =============================================
        # Apprenticeship Types
        # =============================================
        at1 = ApprenticeshipType(
            provider_id=provider.id,
            name="Software Developer",
            reference_code="SD-L3",
            level="Level 3",
            description="Level 3 Software Developer apprenticeship covering full-stack web development.",
            duration_months=18,
            sector="IT & Technology",
        )
        db.add(at1)

        at2 = ApprenticeshipType(
            provider_id=provider.id,
            name="Digital Marketer",
            reference_code="DM-L3",
            level="Level 3",
            description="Level 3 Digital Marketer apprenticeship covering SEO, social media, and analytics.",
            duration_months=15,
            sector="Marketing",
        )
        db.add(at2)

        at3 = ApprenticeshipType(
            provider_id=provider.id,
            name="Data Analyst",
            reference_code="DA-L4",
            level="Level 4",
            description="Level 4 Data Analyst apprenticeship covering data processing, visualization, and insights.",
            duration_months=24,
            sector="IT & Technology",
        )
        db.add(at3)

        await db.flush()

        # =============================================
        # Apprenticeship Listings
        # =============================================
        listing1 = ApprenticeshipListing(
            company_id=company1.id,
            title="Junior Software Developer Apprentice",
            description="Join our development team and learn modern web technologies while working on real projects for enterprise clients.",
            requirements="A-Level or equivalent in a STEM subject. Basic understanding of programming concepts.",
            level="Level 3",
            sector="IT & Technology",
            location="London",
            work_type="hybrid",
            salary_range="£18,000 - £22,000",
            duration="18 months",
            positions_available=3,
            skills_required=["Python", "JavaScript", "Git"],
            benefits=["25 days holiday", "Pension scheme", "Training budget", "Flexible working"],
            deadline=date(2026, 6, 30),
        )
        db.add(listing1)

        listing2 = ApprenticeshipListing(
            company_id=company1.id,
            title="DevOps Apprentice",
            description="Learn DevOps practices including CI/CD, containerization, and cloud infrastructure.",
            requirements="Interest in IT infrastructure and automation. Basic Linux knowledge preferred.",
            level="Level 4",
            sector="IT & Technology",
            location="London",
            work_type="onsite",
            salary_range="£20,000 - £24,000",
            duration="24 months",
            positions_available=1,
            skills_required=["Linux", "Docker", "Cloud"],
            benefits=["25 days holiday", "Pension", "Learning platform access"],
            deadline=date(2026, 7, 31),
        )
        db.add(listing2)

        listing3 = ApprenticeshipListing(
            company_id=company2.id,
            title="Digital Marketing Apprentice",
            description="Work alongside our marketing team to deliver impactful digital campaigns for exciting brands.",
            requirements="Creative mindset with an interest in social media and digital content.",
            level="Level 3",
            sector="Marketing",
            location="Manchester",
            work_type="hybrid",
            salary_range="£16,000 - £19,000",
            duration="15 months",
            positions_available=2,
            skills_required=["Social Media", "Content Creation", "Analytics"],
            benefits=["23 days holiday", "Creative freedom", "Portfolio building"],
            deadline=date(2026, 5, 31),
        )
        db.add(listing3)

        listing4 = ApprenticeshipListing(
            company_id=company2.id,
            title="Content & SEO Apprentice",
            description="Learn SEO strategy and content marketing while working with real client campaigns.",
            level="Level 3",
            sector="Marketing",
            location="Manchester",
            work_type="remote",
            salary_range="£16,000 - £18,000",
            duration="15 months",
            positions_available=1,
            skills_required=["Writing", "SEO", "Research"],
            benefits=["Remote working", "Training courses", "Mentorship"],
        )
        db.add(listing4)

        await db.flush()

        # =============================================
        # Cohorts
        # =============================================
        cohort1 = Cohort(
            provider_id=provider.id,
            apprenticeship_type_id=at1.id,
            name="Software Dev Cohort 2026-A",
            start_date=date(2026, 3, 1),
            end_date=date(2027, 9, 1),
            capacity=20,
            status="active",
            notes="First cohort of 2026 for software development.",
        )
        db.add(cohort1)

        cohort2 = Cohort(
            provider_id=provider.id,
            apprenticeship_type_id=at2.id,
            name="Digital Marketing Cohort 2026-A",
            start_date=date(2026, 4, 1),
            end_date=date(2027, 7, 1),
            capacity=15,
            status="planned",
        )
        db.add(cohort2)

        await db.flush()

        # =============================================
        # Cohort Members
        # =============================================
        member1 = CohortMember(
            cohort_id=cohort1.id,
            apprentice_id=profile1.id,
            status="in_progress",
            progress=35,
        )
        db.add(member1)

        # =============================================
        # Applications
        # =============================================
        app1 = Application(
            apprentice_id=profile1.id,
            listing_id=listing1.id,
            status="shortlisted",
            cover_letter="I am excited about this opportunity to join TechCorp as a Junior Software Developer.",
        )
        db.add(app1)

        app2 = Application(
            apprentice_id=profile2.id,
            listing_id=listing3.id,
            status="pending",
            cover_letter="I would love to be part of the digital marketing team at Innovate.",
        )
        db.add(app2)

        app3 = Application(
            apprentice_id=profile3.id,
            listing_id=listing3.id,
            status="interview",
            cover_letter="With my experience in social media management, I believe I'd be a great fit.",
        )
        db.add(app3)

        app4 = Application(
            apprentice_id=profile3.id,
            listing_id=listing4.id,
            status="offered",
        )
        db.add(app4)

        # =============================================
        # Assessment (FA0005)
        # =============================================
        assessment1 = Assessment(
            apprenticeship_type_id=at1.id,
            title="Software Development Fundamentals Assessment",
            reference_code="FA0005",
            description="Assess fundamental knowledge of software development concepts, programming basics, and problem-solving.",
            time_limit_minutes=45,
            pass_score=70,
        )
        db.add(assessment1)
        await db.flush()

        # Assessment Questions
        questions = [
            AssessmentQuestion(
                assessment_id=assessment1.id,
                question_text="What does HTML stand for?",
                options=["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"],
                correct_answer=0,
                explanation="HTML stands for Hyper Text Markup Language, used for structuring web content.",
                points=1, order=0
            ),
            AssessmentQuestion(
                assessment_id=assessment1.id,
                question_text="Which of the following is NOT a programming language?",
                options=["Python", "Java", "HTML", "C++"],
                correct_answer=2,
                explanation="HTML is a markup language, not a programming language.",
                points=1, order=1
            ),
            AssessmentQuestion(
                assessment_id=assessment1.id,
                question_text="What is the purpose of version control systems like Git?",
                options=["To compile code", "To track changes in code over time", "To run automated tests", "To deploy applications"],
                correct_answer=1,
                explanation="Git tracks changes in source code during software development.",
                points=1, order=2
            ),
            AssessmentQuestion(
                assessment_id=assessment1.id,
                question_text="What does CSS stand for?",
                options=["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"],
                correct_answer=1,
                explanation="CSS stands for Cascading Style Sheets.",
                points=1, order=3
            ),
            AssessmentQuestion(
                assessment_id=assessment1.id,
                question_text="Which data structure uses FIFO (First In, First Out)?",
                options=["Stack", "Queue", "Tree", "Graph"],
                correct_answer=1,
                explanation="A Queue follows the First In, First Out principle.",
                points=2, order=4
            ),
            AssessmentQuestion(
                assessment_id=assessment1.id,
                question_text="What is an API?",
                options=["Application Programming Interface", "Advanced Programming Integration", "Automated Process Implementation", "Application Process Interface"],
                correct_answer=0,
                explanation="API stands for Application Programming Interface.",
                points=1, order=5
            ),
            AssessmentQuestion(
                assessment_id=assessment1.id,
                question_text="Which HTTP method is used to retrieve data from a server?",
                options=["POST", "PUT", "GET", "DELETE"],
                correct_answer=2,
                explanation="GET is used to retrieve/read data from a server.",
                points=1, order=6
            ),
            AssessmentQuestion(
                assessment_id=assessment1.id,
                question_text="What is the time complexity of searching in a sorted array using binary search?",
                options=["O(n)", "O(log n)", "O(n²)", "O(1)"],
                correct_answer=1,
                explanation="Binary search has O(log n) time complexity.",
                points=2, order=7
            ),
            AssessmentQuestion(
                assessment_id=assessment1.id,
                question_text="Which of the following is a relational database?",
                options=["MongoDB", "Redis", "PostgreSQL", "Cassandra"],
                correct_answer=2,
                explanation="PostgreSQL is a relational database management system.",
                points=1, order=8
            ),
            AssessmentQuestion(
                assessment_id=assessment1.id,
                question_text="What does DRY stand for in software development?",
                options=["Don't Repeat Yourself", "Deploy Run Yield", "Data Recovery Yield", "Dynamic Resource Yielding"],
                correct_answer=0,
                explanation="DRY stands for Don't Repeat Yourself, a principle to reduce code duplication.",
                points=1, order=9
            ),
        ]
        for q in questions:
            db.add(q)

        # =============================================
        # Sample Assessment Attempt
        # =============================================
        attempt = AssessmentAttempt(
            assessment_id=assessment1.id,
            apprentice_id=profile1.id,
            cohort_id=cohort1.id,
            token=secrets.token_urlsafe(32),
            answers={"0": 0, "1": 2, "2": 1, "3": 1, "4": 1, "5": 0, "6": 2, "7": 1, "8": 2, "9": 0},
            score=91.7,
            total_points=12,
            passed=True,
            started_at=datetime.now(timezone.utc) - timedelta(hours=2),
            completed_at=datetime.now(timezone.utc) - timedelta(hours=1, minutes=30),
            status="completed",
        )
        db.add(attempt)

        # =============================================
        # Sample Psychometric Result
        # =============================================
        psych = PsychometricResult(
            apprentice_id=profile1.id,
            test_type="ocean",
            scores={
                "openness": 78, "conscientiousness": 82,
                "extraversion": 65, "agreeableness": 71, "neuroticism": 28
            },
            normalized_scores={
                "openness": 78, "conscientiousness": 82,
                "extraversion": 65, "agreeableness": 71, "neuroticism": 28
            },
            strengths=["High Conscientiousness", "High Openness", "Emotional Stability"],
            growth_areas=["Develop Extraversion"],
            trait_explanations={
                "openness": {"score": 78, "level": "high", "description": "Imaginative and open to new experiences"},
                "conscientiousness": {"score": 82, "level": "high", "description": "Organized and dependable"},
                "extraversion": {"score": 65, "level": "medium", "description": "Balanced social engagement"},
                "agreeableness": {"score": 71, "level": "high", "description": "Compassionate and cooperative"},
                "neuroticism": {"score": 28, "level": "low", "description": "Emotionally stable and resilient"},
            },
        )
        db.add(psych)

        # =============================================
        # Sample Analysis Result
        # =============================================
        analysis_job = AnalysisJob(
            apprentice_id=profile1.id,
            input_type="text",
            input_text="Experienced in Python and JavaScript development...",
            status="completed",
            completed_at=datetime.now(timezone.utc) - timedelta(days=1),
        )
        db.add(analysis_job)
        await db.flush()

        analysis_result = AnalysisResult(
            job_id=analysis_job.id,
            extracted_text="Experienced in Python and JavaScript development...",
            candidate_summary="A motivated junior developer with strong fundamentals in Python and JavaScript.",
            skills_detected=["Python", "JavaScript", "Git", "SQL"],
            education_detected=[{"qualification": "A-Levels in Computer Science"}],
            experience_detected=[{"company": "Local Tech Shop", "role": "IT Assistant"}],
            personality_scores={"openness": 75, "conscientiousness": 80, "extraversion": 60, "agreeableness": 70, "neuroticism": 25},
            ai_insights={
                "candidate_summary": "A motivated junior developer with strong fundamentals.",
                "strengths": ["Strong technical foundation", "Eager learner", "Good attention to detail"],
                "gaps": ["Limited professional experience", "Could expand backend skills"],
                "communication_style": "Clear and professional",
                "role_fit": "Junior Software Developer, Full-Stack Developer",
                "learning_potential": "High - demonstrates curiosity and self-directed learning",
                "recommended_paths": ["Level 3 Software Development", "Full-Stack Web Development"],
                "interview_suggestions": ["Discuss a project you built independently", "How do you approach debugging?"],
                "coach_notes": "Strong candidate for software development apprenticeship. Would benefit from pair programming mentorship.",
            },
            confidence_score=0.85,
        )
        db.add(analysis_result)

        # =============================================
        # Collaboration
        # =============================================
        collab = Collaboration(
            provider_id=provider.id,
            company_id=company1.id,
            status="active",
            apprenticeship_types=["Software Developer", "Data Analyst"],
            notes="Partnership for IT apprenticeship placements.",
        )
        db.add(collab)

        # =============================================
        # Notifications
        # =============================================
        notifs = [
            Notification(user_id=apprentice1.id, title="Application Shortlisted", message="Your application for Junior Software Developer at TechCorp has been shortlisted!", type="success", link="/applications"),
            Notification(user_id=apprentice1.id, title="Assessment Available", message="A new assessment FA0005 has been assigned to you.", type="action", link="/assessments"),
            Notification(user_id=company1_user.id, title="New Application", message="A new application has been received for Junior Software Developer.", type="info"),
            Notification(user_id=provider_user.id, title="Cohort Update", message="Software Dev Cohort 2026-A is now active with enrolled apprentices.", type="info"),
        ]
        for n in notifs:
            db.add(n)

        # =============================================
        # Admin Settings
        # =============================================
        settings_data = [
            AdminSettings(key="platform_name", value="AI Apprentice Platform", description="Platform display name"),
            AdminSettings(key="max_applications_per_listing", value=100, description="Maximum applications per listing"),
            AdminSettings(key="ai_processing_enabled", value=True, description="Enable AI analysis processing"),
            AdminSettings(key="transcription_enabled", value=True, description="Enable audio/video transcription"),
            AdminSettings(key="default_assessment_time_limit", value=60, description="Default assessment time limit in minutes"),
        ]
        for s in settings_data:
            db.add(s)

        await db.commit()
        print("Database seeded successfully!")
        print("\nDemo Credentials:")
        print("=" * 50)
        print("Admin:     admin@apprentice.ai / Admin123!")
        print("Apprentice: alex@example.com / Demo123!")
        print("Apprentice: jordan@example.com / Demo123!")
        print("Company:   hr@techcorp.com / Demo123!")
        print("Company:   recruit@innovate.com / Demo123!")
        print("Provider:  admin@skillsacademy.com / Demo123!")


if __name__ == "__main__":
    asyncio.run(seed())
