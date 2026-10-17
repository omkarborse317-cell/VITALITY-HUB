from datetime import datetime

from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)
    reset_token = Column(String, nullable=True)
    reset_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("HealthProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    goals = relationship("DailyGoal", back_populates="user", cascade="all, delete-orphan")
    water_logs = relationship("WaterLog", back_populates="user", cascade="all, delete-orphan")
    sleep_logs = relationship("SleepLog", back_populates="user", cascade="all, delete-orphan")
    mood_logs = relationship("MoodCheckin", back_populates="user", cascade="all, delete-orphan")
    challenge_participations = relationship("ChallengeParticipant", back_populates="user", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")
    survey_responses = relationship("SurveyResponse", back_populates="user", cascade="all, delete-orphan")
    user_achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")


class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    age = Column(Integer, nullable=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    activity_level = Column(String, nullable=True)
    sleep_duration_hours = Column(Float, nullable=True)
    water_intake_liters = Column(Float, nullable=True)
    goal = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class DailyGoal(Base):
    __tablename__ = "daily_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    goal_date = Column(Date, default=datetime.utcnow().date)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="goals")


class WaterLog(Base):
    __tablename__ = "water_tracking"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount_ml = Column(Integer, nullable=False)
    logged_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="water_logs")


class SleepLog(Base):
    __tablename__ = "sleep_tracking"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bedtime = Column(DateTime, nullable=False)
    wake_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    quality = Column(String, nullable=False)
    logged_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="sleep_logs")


class MoodCheckin(Base):
    __tablename__ = "mood_checkins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mood = Column(String, nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="mood_logs")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String, nullable=False)
    duration = Column(String, nullable=False)
    equipment = Column(String, nullable=True)
    instructions = Column(Text, nullable=False)
    safety_note = Column(Text, nullable=False)


class WellnessActivity(Base):
    __tablename__ = "wellness_activities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    duration = Column(String, nullable=False)
    instructions = Column(Text, nullable=False)
    safety_note = Column(Text, nullable=True)


class FoodItem(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    nutrition = Column(Text, nullable=True)
    serving = Column(String, nullable=True)
    pairings = Column(Text, nullable=True)


class SurveyResponse(Base):
    __tablename__ = "survey_responses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    age_group = Column(String, nullable=False)
    activity_level = Column(String, nullable=False)
    sleep_range = Column(String, nullable=False)
    water_range = Column(String, nullable=False)
    exercise_frequency = Column(String, nullable=False)
    food_habits = Column(String, nullable=False)
    mood = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="survey_responses")


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    participants = relationship("ChallengeParticipant", back_populates="challenge", cascade="all, delete-orphan")


class ChallengeParticipant(Base):
    __tablename__ = "challenge_participants"

    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("challenge_id", "user_id", name="unique_challenge_user"),)

    challenge = relationship("Challenge", back_populates="participants")
    user = relationship("User", back_populates="challenge_participations")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    unlocked = relationship("UserAchievement", back_populates="achievement", cascade="all, delete-orphan")


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "achievement_id", name="unique_user_achievement"),)

    user = relationship("User", back_populates="user_achievements")
    achievement = relationship("Achievement", back_populates="unlocked")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False)
    enabled = Column(Boolean, default=True)
    frequency = Column(String, nullable=False)
    message = Column(String, nullable=False)
    wake_time = Column(String, nullable=True)
    sleep_time = Column(String, nullable=True)

    user = relationship("User", back_populates="reminders")


class AwarenessResource(Base):
    __tablename__ = "awareness_resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    url = Column(String, nullable=False)
    category = Column(String, nullable=False)
    location = Column(String, nullable=False)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
