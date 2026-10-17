from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8)
    confirm_password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not any(ch.isdigit() for ch in v):
            raise ValueError("Password must include at least one number.")
        return v

    @field_validator("confirm_password")
    @classmethod
    def same_password(cls, v: str, info):
        data = info.data
        if "password" in data and v != data["password"]:
            raise ValueError("Passwords do not match.")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)
    confirm_password: str = Field(min_length=8)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str


class HealthProfileBase(BaseModel):
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    activity_level: Optional[str] = None
    sleep_duration_hours: Optional[float] = None
    water_intake_liters: Optional[float] = None
    goal: Optional[str] = None


class HealthProfileCreate(HealthProfileBase):
    pass


class WellnessPreferenceUpdate(BaseModel):
    interests: list[Literal["yoga", "breathing", "mindfulness", "stretching"]] = Field(
        default_factory=list,
        max_length=4,
    )
    available_minutes: int = Field(default=10, ge=1, le=120)


class DailyGoalCreate(BaseModel):
    title: str
    description: str
    completed: bool = False


class DailyGoalPatch(BaseModel):
    completed: bool


class WaterLogCreate(BaseModel):
    amount_ml: int = Field(gt=0)


class WaterSettingsUpdate(BaseModel):
    target_ml: int = Field(gt=0)
    wake_time: Optional[str] = None
    sleep_time: Optional[str] = None
    reminder_enabled: bool = True


class SleepLogCreate(BaseModel):
    bedtime: datetime
    wake_time: datetime
    quality: str


class MoodCheckinCreate(BaseModel):
    mood: str
    note: Optional[str] = None


class SurveyResponseCreate(BaseModel):
    age_group: str
    activity_level: str
    sleep_range: str
    water_range: str
    exercise_frequency: str
    food_habits: str
    mood: Optional[str] = None


class GoalResponse(BaseModel):
    id: int
    title: str
    description: str
    completed: bool
    goal_date: date


class WaterLogOut(BaseModel):
    id: int
    amount_ml: int
    logged_at: datetime


class SleepLogOut(BaseModel):
    id: int
    bedtime: datetime
    wake_time: datetime
    duration_minutes: int
    quality: str
    logged_at: datetime


class ReminderCreate(BaseModel):
    category: str
    enabled: bool = True
    frequency: str = "daily"
    message: str = "Take a quick wellness break."
    wake_time: Optional[str] = None
    sleep_time: Optional[str] = None


class ReminderUpdate(ReminderCreate):
    pass


class ChatbotRequest(BaseModel):
    message: str


class ChatbotResponse(BaseModel):
    reply: str
