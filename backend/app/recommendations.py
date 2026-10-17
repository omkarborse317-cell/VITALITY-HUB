import re

from app.models import WellnessActivity


INTEREST_CATEGORIES = {
    "yoga": "Yoga",
    "breathing": "Breathing",
    "mindfulness": "Mindfulness",
    "stretching": "Stretching",
}


def activity_duration_minutes(duration: str) -> int | None:
    values = re.findall(r"\d+(?:\.\d+)?", duration)
    if not values:
        return None
    return round(max(float(value) for value in values))


def rank_wellness_activities(
    activities: list[WellnessActivity],
    interests: list[str],
    available_minutes: int,
    limit: int = 8,
) -> list[dict]:
    selected_categories = {
        INTEREST_CATEGORIES[interest]
        for interest in interests
        if interest in INTEREST_CATEGORIES
    }
    ranked = []

    for activity in activities:
        if selected_categories and activity.category not in selected_categories:
            continue

        duration_minutes = activity_duration_minutes(activity.duration)
        if duration_minutes is not None and duration_minutes > available_minutes:
            continue

        reasons = []
        if activity.category in selected_categories:
            reasons.append(f"Matches your {activity.category.lower()} interest")
        if duration_minutes is not None:
            reasons.append(f"fits your {available_minutes}-minute time window")
        score = (10 if activity.category in selected_categories else 0) + (
            4 if duration_minutes is not None else 0
        )
        ranked.append(
            {
                "id": activity.id,
                "name": activity.name,
                "category": activity.category,
                "description": activity.description,
                "duration": activity.duration,
                "instructions": activity.instructions,
                "safety_note": activity.safety_note,
                "reason": " and ".join(reasons)
                or "A general wellness activity to explore.",
                "score": score,
            }
        )

    ranked.sort(key=lambda item: (-item["score"], item["name"]))
    return ranked[:limit]
