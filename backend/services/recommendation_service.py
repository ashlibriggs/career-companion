from models import (
    ActionItem,
    CareerProfile,
    ResumeWorkspace,
    SavedJob,
)


def build_recommendation_context(user):
    """
    Collects the authenticated user's persisted career data.
    """
    profile = CareerProfile.query.filter_by(
        user_id=user.id
    ).first()

    resume = ResumeWorkspace.query.filter_by(
        user_id=user.id
    ).first()

    saved_jobs = (
        SavedJob.query
        .filter_by(user_id=user.id)
        .order_by(SavedJob.created_at.desc())
        .all()
    )

    action_items = (
        ActionItem.query
        .filter_by(user_id=user.id)
        .order_by(ActionItem.created_at.desc())
        .all()
    )

    return {
        "profile": profile,
        "resume": resume,
        "saved_jobs": saved_jobs,
        "action_items": action_items,
    }


def choose_next_best_step(context):
    """
    Applies transparent product rules to choose one priority.

    Gemini will later improve the wording, but this function owns
    the recommendation decision.
    """
    profile = context["profile"]
    resume = context["resume"]
    saved_jobs = context["saved_jobs"]
    action_items = context["action_items"]

    incomplete_actions = [
        item
        for item in action_items
        if item.status != "completed"
    ]

    if not profile or not _profile_is_complete(profile):
        return {
            "rule": "complete_profile",
            "title": "Complete your career profile",
            "action_title": "Complete my career profile",
            "action_description": (
                "Add your target role, preferred location, "
                "weekly application goal, and career focus."
            ),
            "reason": (
                "Career Companion needs a clear understanding "
                "of your goals before it can prioritize the "
                "strongest next steps for your job search."
            ),
            "estimated_minutes": 10,
            "evidence": {
                "profile_complete": False,
            },
        }

    if not resume or not _resume_is_complete(resume):
        missing_sections = _get_missing_resume_sections(
            resume
        )

        readable_sections = ", ".join(
            missing_sections
        )

        return {
            "rule": "complete_resume",
            "title": "Strengthen your resume foundation",
            "action_title": (
                "Complete my resume foundation"
            ),
            "action_description": (
                "Add or improve these resume sections: "
                f"{readable_sections}."
            ),
            "reason": (
                "Your resume workspace is missing information "
                "that will help you tailor stronger applications "
                f"for {profile.target_role or 'your target roles'}."
            ),
            "estimated_minutes": 20,
            "evidence": {
                "missing_resume_sections":
                    missing_sections,
                "target_role":
                    profile.target_role or "",
            },
        }

    if incomplete_actions:
        priority_item = _choose_priority_action(
            incomplete_actions
        )

        return {
            "rule": "complete_action_item",
            "title": priority_item.title,
            "action_title": priority_item.title,
            "action_description": (
                priority_item.description
                or (
                    "Complete this existing priority "
                    "before adding another task."
                )
            ),
            "reason": (
                "You already identified this as an active "
                "priority. Finishing one current action will "
                "create more momentum than adding another."
            ),
            "estimated_minutes": (
                priority_item.estimated_minutes
                or 20
            ),
            "evidence": {
                "action_item_id": priority_item.id,
                "priority": priority_item.priority,
            },
        }

    unapplied_jobs = [
        job
        for job in saved_jobs
        if job.status == "saved"
    ]

    if unapplied_jobs:
        selected_job = unapplied_jobs[0]

        return {
            "rule": "prepare_saved_job",
            "title": (
                f"Prepare your application for "
                f"{selected_job.title}"
            ),
            "action_title": (
                f"Tailor my resume for "
                f"{selected_job.title}"
            ),
            "action_description": (
                f"Review the {selected_job.title} role at "
                f"{selected_job.company} and align your "
                "resume summary, skills, and experience "
                "with the strongest requirements."
            ),
            "reason": (
                f"You saved the {selected_job.title} role "
                f"at {selected_job.company}, but it is still "
                "in your saved stage. Preparing a tailored "
                "application is the strongest next move."
            ),
            "estimated_minutes": 30,
            "evidence": {
                "saved_job_id": selected_job.id,
                "job_title": selected_job.title,
                "company": selected_job.company,
                "status": selected_job.status,
            },
        }

    if saved_jobs:
        return {
            "rule": "review_saved_jobs",
            "title": "Review your saved opportunities",
            "action_title": (
                "Review my saved opportunities"
            ),
            "action_description": (
                "Compare your saved roles and choose the "
                "one that best matches your current goals."
            ),
            "reason": (
                "You have opportunities in your tracker, "
                "but no unfinished action currently connects "
                "your saved jobs to a focused next move."
            ),
            "estimated_minutes": 15,
            "evidence": {
                "saved_job_count": len(saved_jobs),
            },
        }

    return {
        "rule": "search_opportunities",
        "title": "Search for one focused opportunity",
        "action_title": (
            "Search for one focused opportunity"
        ),
        "action_description": (
            "Use your target role and preferred location "
            "to find one strong opportunity and save it "
            "to your tracker."
        ),
        "reason": (
            "Your profile and resume foundation are ready, "
            "but you do not have any saved opportunities yet."
        ),
        "estimated_minutes": 15,
        "evidence": {
            "target_role":
                profile.target_role or "",
            "location":
                profile.location or "",
        },
    }


def _profile_is_complete(profile):
    return all(
        [
            _has_text(profile.name),
            _has_text(profile.target_role),
            _has_text(profile.location),
            profile.weekly_application_goal,
            _has_text(profile.career_focus),
        ]
    )


def _resume_is_complete(resume):
    return all(
        [
            _has_text(resume.target_role),
            _has_text(resume.professional_summary),
            _has_text(resume.skills),
            _has_text(resume.experience_highlights),
        ]
    )


def _get_missing_resume_sections(resume):
    if resume is None:
        return [
            "target role",
            "professional summary",
            "technical skills",
            "experience highlights",
        ]

    missing_sections = []

    if not _has_text(resume.target_role):
        missing_sections.append("target role")

    if not _has_text(
        resume.professional_summary
    ):
        missing_sections.append(
            "professional summary"
        )

    if not _has_text(resume.skills):
        missing_sections.append(
            "technical skills"
        )

    if not _has_text(
        resume.experience_highlights
    ):
        missing_sections.append(
            "experience highlights"
        )

    return missing_sections


def _choose_priority_action(action_items):
    priority_order = {
        "high": 0,
        "medium": 1,
        "low": 2,
    }

    return sorted(
        action_items,
        key=lambda item: (
            priority_order.get(
                item.priority,
                3,
            ),
            item.created_at,
        ),
    )[0]


def _has_text(value):
    return bool(
        isinstance(value, str)
        and value.strip()
    )