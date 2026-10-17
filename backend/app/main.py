from __future__ import annotations

import secrets
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import func, inspect, text
from sqlalchemy.orm import Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import get_settings
from app.database import Base, SessionLocal, engine, get_db
from app.models import (
    Achievement,
    AwarenessResource,
    Challenge,
    ChallengeParticipant,
    DailyGoal,
    Exercise,
    FoodItem,
    HealthProfile,
    MoodCheckin,
    Reminder,
    SleepLog,
    SurveyResponse,
    User,
    UserAchievement,
    WaterLog,
    WellnessActivity,
)
from app.schemas import (
    ChatbotRequest,
    ChatbotResponse,
    DailyGoalCreate,
    DailyGoalPatch,
    ForgotPasswordRequest,
    HealthProfileCreate,
    MoodCheckinCreate,
    ReminderCreate,
    ReminderUpdate,
    ResetPasswordRequest,
    SleepLogCreate,
    SurveyResponseCreate,
    Token,
    UserLogin,
    UserOut,
    UserRegister,
    WaterLogCreate,
    WaterSettingsUpdate,
)
from app.security import create_access_token, hash_password, verify_password

settings = get_settings()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Vitality Hub", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)


def ensure_admin_user(db: Session):
    admin = db.query(User).filter(User.email == "vitality@vitalityhub.com").first()
    if not admin:
        admin = User(
            name="Admin User",
            email="vitality@vitalityhub.com",
            password_hash=hash_password("Vitality"),
            role="admin",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)


def seed_default_data(db: Session):
    if db.query(Exercise).count() == 0:
        sample_exercises = [
            {
                "name": "Easy Walking",
                "category": "Walking",
                "description": "A gentle walk that supports movement and mood.",
                "difficulty": "Easy",
                "duration": "10-20 minutes",
                "equipment": "Comfortable shoes",
                "instructions": "1. Warm up with a few gentle steps.\n2. Keep a comfortable pace.\n3. Take a short cool-down walk.",
                "safety_note": "Stop if you feel pain, dizziness, or unusual shortness of breath.",
            },
            {
                "name": "Chair Squats",
                "category": "Beginner exercises",
                "description": "Build lower-body strength with a simple chair-supported squat.",
                "difficulty": "Beginner",
                "duration": "5-8 minutes",
                "equipment": "Chair",
                "instructions": "1. Stand in front of a chair.\n2. Sit down gently and stand up.\n3. Repeat with smooth breathing.",
                "safety_note": "Move slowly and avoid forcing range of motion.",
            },
            {
                "name": "Wall Push-ups",
                "category": "Beginner exercises",
                "description": "A gentle upper-body movement for building strength at home.",
                "difficulty": "Beginner",
                "duration": "5-10 minutes",
                "equipment": "Wall",
                "instructions": "1. Stand facing a wall.\n2. Place hands at chest height.\n3. Bend elbows and push gently away.",
                "safety_note": "Keep shoulders relaxed and stop if you feel discomfort.",
            },
            {
                "name": "Desk Shoulder Rolls",
                "category": "Desk exercises",
                "description": "Relieve tension in the shoulders and neck during desk work.",
                "difficulty": "Easy",
                "duration": "2-3 minutes",
                "equipment": "Chair",
                "instructions": "1. Sit tall.\n2. Roll the shoulders backward.\n3. Repeat slowly in both directions.",
                "safety_note": "Avoid jerky movements or straining the neck.",
            },
            {
                "name": "Standing Calf Raises",
                "category": "Mobility",
                "description": "Gentle lower-leg movement that supports circulation and balance.",
                "difficulty": "Easy",
                "duration": "3-5 minutes",
                "equipment": "None",
                "instructions": "1. Stand tall with feet hip-width apart.\n2. Rise onto the balls of your feet.\n3. Lower slowly and repeat.",
                "safety_note": "Use a wall or chair for support if needed.",
            },
            {
                "name": "Gentle Mobility Flow",
                "category": "Mobility",
                "description": "A mindful sequence to wake up the joints and muscles.",
                "difficulty": "Easy",
                "duration": "8-12 minutes",
                "equipment": "Mat or towel",
                "instructions": "1. Start with slow shoulder circles.\n2. Move to gentle twists and ankle rolls.\n3. End with standing stretches.",
                "safety_note": "Keep the motion gentle and stop if the movement feels painful.",
            },
            {
                "name": "Seated Stretching",
                "category": "Stretching",
                "description": "A focused seated stretch for the hips, hamstrings, and back.",
                "difficulty": "Beginner",
                "duration": "5 minutes",
                "equipment": "Chair",
                "instructions": "1. Sit tall in a chair.\n2. Lengthen the spine and hinge gently forward.\n3. Return to neutral and repeat.",
                "safety_note": "Do not force the stretch deeply if you feel sharp discomfort.",
            },
            {
                "name": "Light Marching in Place",
                "category": "Walking",
                "description": "A simple way to build gentle movement into your day.",
                "difficulty": "Easy",
                "duration": "5-10 minutes",
                "equipment": "None",
                "instructions": "1. Stand with an upright posture.\n2. March slowly and steadily.\n3. Keep the pace comfortable and sustainable.",
                "safety_note": "Stop if you feel dizzy or unusually fatigued.",
            },
            {
                "name": "Beginner Balance Practice",
                "category": "Beginner exercises",
                "description": "A simple balance routine that supports stability and confidence.",
                "difficulty": "Beginner",
                "duration": "5 minutes",
                "equipment": "Chair or wall",
                "instructions": "1. Stand near a wall or chair.\n2. Shift weight gently from one foot to the other.\n3. Keep the body steady and relaxed.",
                "safety_note": "If balance feels difficult, keep support nearby.",
            },
            {
                "name": "Gentle Stretching",
                "category": "Stretching",
                "description": "A light overall stretch routine that can fit into a busy day.",
                "difficulty": "Easy",
                "duration": "8 minutes",
                "equipment": "Mat or towel",
                "instructions": "1. Move slowly through side bends, hamstring stretches, and calf stretches.\n2. Breathe easily.\n3. Finish in a relaxed position.",
                "safety_note": "Stretch only to a comfortable range and avoid holding breath.",
            },
        ]
        for item in sample_exercises:
            db.add(Exercise(**item))

    if db.query(WellnessActivity).count() == 0:
        sample_activities = [
            {"name": "5-Minute Breathing Reset", "category": "Breathing", "description": "A calm and simple breathing exercise for a quick reset.", "duration": "5 minutes", "instructions": "Inhale for four counts, exhale for six counts, and repeat.", "safety_note": "Only do what feels comfortable for your breathing."},
            {"name": "Desk Relaxation", "category": "Stress Management", "description": "A short, comfortable routine to ease tension from screen time.", "duration": "3 minutes", "instructions": "Drop the shoulders, soften the jaw, and lengthen the neck.", "safety_note": "Skip any movement that causes strain."},
            {"name": "Eye Relaxation Break", "category": "Mindfulness", "description": "A simple break for screen users.", "duration": "1 minute", "instructions": "Focus on a distant point and blink slowly several times.", "safety_note": "Optional and easy to adapt."},
            {"name": "Neck and Shoulder Stretch", "category": "Stretching", "description": "A practical release for the upper body.", "duration": "3 minutes", "instructions": "Tilt the ear toward the shoulder and gently rotate the shoulders.", "safety_note": "Move gently and stop if you feel sharp pain."},
            {"name": "Guided Relaxation", "category": "Mindfulness", "description": "A calming guided practice to slow the pace of the day.", "duration": "5 minutes", "instructions": "Notice the breath and allow the body to settle with each exhale.", "safety_note": "This should feel comfortable and optional."},
            {"name": "Tree Pose Basics", "category": "Yoga", "description": "A gentle standing balance pose.", "duration": "2-3 minutes", "instructions": "Stand tall and press one foot into the floor while grounding the other foot.", "safety_note": "Use a wall or chair for support if needed."},
            {"name": "Cat-Cow Mobility", "category": "Yoga", "description": "A gentle flow to loosen the spine.", "duration": "3 minutes", "instructions": "Alternate between arching and rounding the back while breathing slowly.", "safety_note": "Move only within a comfortable range."},
            {"name": "Seated Breathing", "category": "Breathing", "description": "A calming practice that works even in a classroom or office.", "duration": "2 minutes", "instructions": "Sit comfortably and trace the breath slowly for a few cycles.", "safety_note": "Skip if it feels uncomfortable."},
            {"name": "Grounding Check-In", "category": "Mindfulness", "description": "A quick moment of self-observation and centering.", "duration": "2 minutes", "instructions": "Notice contact points with the floor and gently name a few things you can feel.", "safety_note": "This is an educational practice, not a diagnosis."},
            {"name": "Gentle Forward Fold", "category": "Stretching", "description": "Ease the lower back and hamstrings.", "duration": "3 minutes", "instructions": "Hinge forward from the hips and allow the spine to rest naturally.", "safety_note": "Keep the fold gentle and comfortable."},
        ]
        for item in sample_activities:
            db.add(WellnessActivity(**item))

    if db.query(FoodItem).count() == 0:
        foods = [
            ("Banana", "Fruit", "A convenient fruit that provides potassium and fits well in a balanced diet.", "Contains potassium and fiber.", "1 medium banana", "Banana with yogurt and nuts"),
            ("Apple", "Fruit", "A portable fruit that can support a simple healthy-snack habit.", "Contains fiber and assorted plant compounds.", "1 medium apple", "Apple with peanut butter or yogurt"),
            ("Orange", "Fruit", "A bright citrus fruit that is easy to add to meals or snacks.", "Contains vitamin C and hydration.", "1 medium orange", "Orange with oats or yogurt"),
            ("Mixed Vegetables", "Vegetables", "A colorful combination that increases variety and nutrients in meals.", "Includes fiber, vitamins, and minerals.", "1 cup cooked or raw", "Mixed vegetables with rice and dal"),
            ("Dal", "Protein", "A comforting lentil dish that is protein-rich and widely enjoyed.", "Provides plant protein and fiber.", "1 cup cooked", "Dal with rice and vegetables"),
            ("Rice", "Grains", "A staple grain that is often paired with vegetables, legumes, or curries.", "A source of carbohydrates for energy.", "1 serving cooked", "Rice with dal and vegetables"),
            ("Roti", "Grains", "A traditional flatbread that can be part of a filling meal.", "Often offers carbohydrates and some fiber depending on ingredients.", "1 medium roti", "Roti with dal and curd"),
            ("Curd", "Dairy", "A simple dairy option that can add variety to meals.", "May contain protein and probiotics depending on the product.", "1 cup", "Curd with fruit or nuts"),
            ("Sprouts", "Protein", "A lively and nutrient-dense addition to salads or meals.", "Provide fiber and plant protein.", "1 cup", "Sprouts with vegetables and roti"),
            ("Poha", "Breakfast", "A light breakfast staple often prepared with vegetables and spices.", "Can be paired with vegetables and protein sources.", "1 serving", "Poha with sprouts and fruit"),
            ("Idli", "Breakfast", "A soft steamed rice cake popular in many regions.", "A moderate carbohydrate choice often served with chutney or sambar.", "2-3 idlis", "Idli with vegetables and curd"),
            ("Upma", "Breakfast", "A savory porridge made with grains or semolina.", "Can be paired with vegetables and protein.", "1 serving", "Upma with vegetables and fruit"),
            ("Oats", "Breakfast", "A comforting whole-grain breakfast option that supports routine variety.", "Often a source of fiber and complex carbohydrates.", "1 bowl cooked", "Oats with banana and nuts"),
            ("Lentils", "Protein", "A versatile pulse that works well in soups, curries, and salads.", "Provide fiber and plant protein.", "1 cup cooked", "Lentils with rice and vegetables"),
            ("Chickpeas", "Protein", "A nutrient-dense pulse commonly used in curries and salads.", "Provide plant protein and fiber.", "1 cup cooked", "Chickpeas with salad and roti"),
            ("Nuts", "Snacks", "A compact, satisfying snack option when portioned mindfully.", "Contain healthy fats and protein.", "A small handful", "Nuts with fruit or yogurt"),
            ("Leafy Vegetables", "Vegetables", "Leafy greens add color and variety to meals.", "A source of fiber and micronutrients.", "1 cup cooked or raw", "Leafy vegetables with roti and curd"),
            ("Eggs", "Protein", "A common protein option for breakfast or meals.", "Contain protein and a range of nutrients.", "2 eggs", "Eggs with vegetables and toast"),
            ("Milk or Soy Milk", "Dairy Alternatives", "A familiar beverage for many households and a useful source of calcium depending on the product.", "Varies by product; choose fortified options when appropriate.", "1 glass", "Milk with oats and fruit"),
            ("Seasonal Fruit", "Fruit", "Fresh fruit varies by season and can add color to meals and snacks.", "A flexible source of fiber and hydration.", "1 serving", "Seasonal fruit with yogurt or nuts"),
        ]
        for name, category, description, nutrition, serving, pairings in foods:
            db.add(FoodItem(name=name, category=category, description=description, nutrition=nutrition, serving=serving, pairings=pairings))

    if db.query(AwarenessResource).count() == 0:
        resources = [
            {"title": "WHO Healthy Lifestyle", "description": "General guidance on healthy eating, movement, and everyday habits.", "url": "https://www.who.int/health-topics/healthy-diet", "category": "Nutrition", "location": "Global"},
            {"title": "WHO Physical Activity", "description": "Education on movement and active living for adults and youth.", "url": "https://www.who.int/news-room/fact-sheets/detail/physical-activity", "category": "Exercise", "location": "Global"},
            {"title": "India Ministry of Health", "description": "Public health information and service guidance for India.", "url": "https://www.mohfw.gov.in/", "category": "Health Education", "location": "India"},
            {"title": "Mental Health Resource", "description": "A general educational resource for mental wellbeing and support.", "url": "https://www.who.int/health-topics/mental-health", "category": "Mental Wellness", "location": "Global"},
            {"title": "Sleep and Rest Education", "description": "Educational guidance for healthy sleep habits and daily routines.", "url": "https://www.who.int/news-room/fact-sheets/detail/sleep-and-health", "category": "Sleep", "location": "Global"},
        ]
        for item in resources:
            db.add(AwarenessResource(**item))

    if db.query(Challenge).count() == 0:
        db.add(Challenge(title="7-Day Walking Awareness Challenge", description="Take a simple daily walk and track your movement in a calm, encouraging way.", start_date=date.today(), end_date=date.today() + timedelta(days=6)))
        db.add(Challenge(title="Mindful Routine Reset", description="Build a gentle routine of movement, hydration, and mindful breathing.", start_date=date.today(), end_date=date.today() + timedelta(days=13)))

    achievements = [
        {"key": "first_steps", "title": "First Steps", "description": "Complete your first daily goal."},
        {"key": "hydration_habit", "title": "Hydration Habit", "description": "Record at least 2 liters of water in a day."},
        {"key": "mindfulness_beginner", "title": "Mindfulness Beginner", "description": "Complete any mindful or breathing activity."},
        {"key": "walking_week", "title": "Walking Week", "description": "Log movement across at least 3 days in a week."},
        {"key": "consistent_routine", "title": "Consistent Routine", "description": "Complete at least 5 daily goals in a week."},
    ]
    if db.query(Achievement).count() == 0:
        for item in achievements:
            db.add(Achievement(**item))

    demo_user = db.query(User).filter(User.email == "demo#vitalityhub.com").first()
    if not demo_user:
        demo_user = User(name="Demo User", email="demo#vitalityhub.com", password_hash=hash_password("Vitality"), role="user")
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

    if db.query(DailyGoal).filter(DailyGoal.user_id == demo_user.id).count() == 0:
        templates = [
            ("Walk or move for 30 minutes", "Take a manageable walk or movement break to support energy and routine."),
            ("Drink water throughout the day", "Keep a reusable bottle nearby and sip steadily."),
            ("Stretch for 10 minutes", "Ease the body with a simple stretch break."),
            ("Include fruits or vegetables in meals", "Build balanced meals with colorful produce."),
            ("Work toward a consistent sleep routine", "Create a stable wind-down routine for better rest."),
            ("Practice mindful breathing for 5 minutes", "Take a short pause to settle the body and mind."),
        ]
        for title, description in templates:
            db.add(DailyGoal(user_id=demo_user.id, title=title, description=description, completed=False, goal_date=date.today()))

    db.commit()


Base.metadata.create_all(bind=engine)


def migrate_auth_columns():
    if engine.dialect.name != "sqlite":
        return

    columns = {column["name"] for column in inspect(engine).get_columns("users")}
    with engine.begin() as connection:
        if "reset_token" not in columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR"))
        if "reset_expires_at" not in columns:
            connection.execute(text("ALTER TABLE users ADD COLUMN reset_expires_at DATETIME"))


@app.on_event("startup")
def startup_event():
    migrate_auth_columns()
    db = SessionLocal()
    try:
        ensure_admin_user(db)
        seed_default_data(db)
    finally:
        db.close()


def get_current_user(db: Session = Depends(get_db), credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
    token = credentials.credentials
    from jose import jwt
    from app.config import get_settings

    try:
        payload = jwt.decode(token, get_settings().secret_key, algorithms=["HS256"])
        email = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")
    if email is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    return user


def require_admin(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return user


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Vitality Hub"}


@app.post("/api/auth/register", response_model=Dict[str, Any])
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(status_code=400, detail="A user with that email already exists.")
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    user = User(name=payload.name, email=payload.email.lower(), password_hash=hash_password(payload.password), role="user")
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.email)
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role}}


@app.post("/api/auth/login", response_model=Token)
def login_user(payload: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_access_token(user.email)
    return Token(access_token=token)


@app.post("/api/auth/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if user:
        user.reset_token = secrets.token_urlsafe(32)
        user.reset_expires_at = datetime.utcnow() + timedelta(minutes=30)
        db.commit()
        return {
            "message": "If your account exists, a reset link has been prepared.",
            "reset_token": user.reset_token,
            "expires_in_minutes": 30,
        }
    return {
        "message": "If your account exists, a reset link has been prepared.",
        "reset_token": None,
        "expires_in_minutes": 30,
    }


@app.post("/api/auth/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    if payload.new_password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")
    if len(payload.new_password) < 8 or not any(ch.isdigit() for ch in payload.new_password):
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters and include a number.")

    user = db.query(User).filter(User.reset_token == payload.token).first()
    if not user or not user.reset_expires_at:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
    if user.reset_expires_at < datetime.utcnow():
        user.reset_token = None
        user.reset_expires_at = None
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    user.password_hash = hash_password(payload.new_password)
    user.reset_token = None
    user.reset_expires_at = None
    db.commit()
    return {"message": "Password reset successful."}


@app.get("/api/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email, "role": current_user.role}


@app.post("/api/profile")
def create_profile(payload: HealthProfileCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(HealthProfile).filter(HealthProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists. Use PUT to update it.")
    profile = HealthProfile(user_id=current_user.id, **payload.model_dump(exclude_none=True))
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@app.get("/api/profile")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == current_user.id).first()
    if not profile:
        return {}
    return profile


@app.put("/api/profile")
def update_profile(payload: HealthProfileCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == current_user.id).first()
    if not profile:
        profile = HealthProfile(user_id=current_user.id)
        db.add(profile)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


@app.get("/api/goals/today")
def get_today_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    goals = db.query(DailyGoal).filter(DailyGoal.user_id == current_user.id, DailyGoal.goal_date == today).all()
    if not goals:
        templates = [
            {"title": "Walk or move for 30 minutes", "description": "Take a manageable walk or movement break."},
            {"title": "Drink water throughout the day", "description": "Keep a reusable bottle nearby and sip steadily."},
            {"title": "Stretch for 10 minutes", "description": "Ease the body with a simple stretch break."},
            {"title": "Include fruits or vegetables in meals", "description": "Build balanced meals with colorful produce."},
            {"title": "Work toward a consistent sleep routine", "description": "Create a stable wind-down routine for better rest."},
            {"title": "Practice mindful breathing for 5 minutes", "description": "Take a short pause to settle the body and mind."},
        ]
        for item in templates:
            goal = DailyGoal(user_id=current_user.id, title=item["title"], description=item["description"], completed=False, goal_date=today)
            db.add(goal)
        db.commit()
        goals = db.query(DailyGoal).filter(DailyGoal.user_id == current_user.id, DailyGoal.goal_date == today).all()
    return [{"id": g.id, "title": g.title, "description": g.description, "completed": g.completed, "goal_date": g.goal_date} for g in goals]


@app.put("/api/goals/{goal_id}")
def update_goal(goal_id: int, payload: DailyGoalPatch, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(DailyGoal).filter(DailyGoal.id == goal_id, DailyGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")
    goal.completed = payload.completed
    db.commit()
    db.refresh(goal)
    return {"id": goal.id, "title": goal.title, "description": goal.description, "completed": goal.completed, "goal_date": goal.goal_date}


@app.get("/api/goals/progress")
def goals_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    goals = db.query(DailyGoal).filter(DailyGoal.user_id == current_user.id, DailyGoal.goal_date == today).all()
    total = len(goals)
    completed = sum(1 for g in goals if g.completed)
    percent = round((completed / total) * 100, 1) if total else 0
    return {"total": total, "completed": completed, "percent": percent}


@app.post("/api/water")
def add_water_log(payload: WaterLogCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = WaterLog(user_id=current_user.id, amount_ml=payload.amount_ml)
    db.add(log)
    db.commit()
    db.refresh(log)
    return {"id": log.id, "amount_ml": log.amount_ml, "logged_at": log.logged_at}


@app.get("/api/water/today")
def get_today_water(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    logs = db.query(WaterLog).filter(WaterLog.user_id == current_user.id, func.date(WaterLog.logged_at) == today).all()
    total_ml = sum(log.amount_ml for log in logs)
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == current_user.id).first()
    target_ml = int((profile.water_intake_liters or 2.0) * 1000) if profile else 2000
    percent = round((total_ml / target_ml) * 100, 1) if target_ml else 0
    return {"total_ml": total_ml, "target_ml": target_ml, "percent": percent, "logs": [{"id": l.id, "amount_ml": l.amount_ml, "logged_at": l.logged_at} for l in logs]}


@app.put("/api/water/settings")
def update_water_settings(payload: WaterSettingsUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(HealthProfile).filter(HealthProfile.user_id == current_user.id).first()
    if not profile:
        profile = HealthProfile(user_id=current_user.id)
        db.add(profile)
    profile.water_intake_liters = round(payload.target_ml / 1000, 2)
    db.commit()
    return {"target_ml": payload.target_ml, "wake_time": payload.wake_time, "sleep_time": payload.sleep_time, "reminder_enabled": payload.reminder_enabled}


@app.get("/api/water/history")
def water_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(WaterLog).filter(WaterLog.user_id == current_user.id).order_by(WaterLog.logged_at.desc()).all()
    return [{"id": l.id, "amount_ml": l.amount_ml, "logged_at": l.logged_at} for l in logs]


@app.post("/api/sleep")
def add_sleep_record(payload: SleepLogCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.wake_time <= payload.bedtime:
        raise HTTPException(status_code=400, detail="Wake time must be later than bedtime.")
    duration_minutes = int((payload.wake_time - payload.bedtime).total_seconds() / 60)
    log = SleepLog(user_id=current_user.id, bedtime=payload.bedtime, wake_time=payload.wake_time, duration_minutes=duration_minutes, quality=payload.quality)
    db.add(log)
    db.commit()
    db.refresh(log)
    return {"id": log.id, "bedtime": log.bedtime, "wake_time": log.wake_time, "duration_minutes": log.duration_minutes, "quality": log.quality, "logged_at": log.logged_at}


@app.get("/api/sleep/today")
def sleep_today(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    log = db.query(SleepLog).filter(SleepLog.user_id == current_user.id, func.date(SleepLog.logged_at) == today).order_by(SleepLog.logged_at.desc()).first()
    if not log:
        return {"record": None, "message": "No sleep record yet for today."}
    return {"record": {"id": log.id, "bedtime": log.bedtime, "wake_time": log.wake_time, "duration_minutes": log.duration_minutes, "quality": log.quality, "logged_at": log.logged_at}, "message": "Sleep record found."}


@app.get("/api/sleep/weekly")
def sleep_weekly(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(SleepLog).filter(SleepLog.user_id == current_user.id).order_by(SleepLog.logged_at.desc()).limit(7).all()
    chart = [{"date": l.logged_at.date().isoformat(), "duration_minutes": l.duration_minutes} for l in reversed(logs)]
    return {"records": chart, "average_minutes": round(sum(item["duration_minutes"] for item in chart) / len(chart), 1) if chart else 0}


@app.post("/api/mood")
def add_mood_checkin(payload: MoodCheckinCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    existing = db.query(MoodCheckin).filter(MoodCheckin.user_id == current_user.id, func.date(MoodCheckin.created_at) == today).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted a mood check-in today. Please update it later using your history records.")
    mood = MoodCheckin(user_id=current_user.id, mood=payload.mood, note=payload.note)
    db.add(mood)
    db.commit()
    db.refresh(mood)
    if payload.mood in ["Stressed", "Low"]:
        return {"id": mood.id, "mood": mood.mood, "note": mood.note, "support_message": "Consider speaking with a qualified mental-health professional or another trusted support person."}
    return {"id": mood.id, "mood": mood.mood, "note": mood.note, "support_message": "You can also explore supportive wellness resources in the Help and Resources section."}


@app.get("/api/mood/history")
def mood_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(MoodCheckin).filter(MoodCheckin.user_id == current_user.id).order_by(MoodCheckin.created_at.desc()).all()
    return [{"id": r.id, "mood": r.mood, "note": r.note, "created_at": r.created_at} for r in records]


@app.get("/api/exercises")
def get_exercises(q: str | None = Query(default=None), category: str | None = Query(default=None), db: Session = Depends(get_db)):
    query = db.query(Exercise)
    if q:
        query = query.filter((Exercise.name.ilike(f"%{q}%")) | (Exercise.description.ilike(f"%{q}%")))
    if category:
        query = query.filter(Exercise.category.ilike(f"%{category}%"))
    return query.order_by(Exercise.id).all()


@app.get("/api/exercises/search")
def search_exercises(query: str = Query(...), db: Session = Depends(get_db)):
    results = db.query(Exercise).filter((Exercise.name.ilike(f"%{query}%")) | (Exercise.description.ilike(f"%{query}%"))).all()
    return results


@app.get("/api/exercises/{exercise_id}")
def get_exercise(exercise_id: int, db: Session = Depends(get_db)):
    item = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Exercise not found.")
    return item


@app.get("/api/wellness/activities")
def get_wellness_activities(db: Session = Depends(get_db)):
    return db.query(WellnessActivity).all()


@app.get("/api/wellness/activities/{activity_id}")
def get_wellness_activity(activity_id: int, db: Session = Depends(get_db)):
    item = db.query(WellnessActivity).filter(WellnessActivity.id == activity_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Wellness activity not found.")
    return item


@app.get("/api/foods")
def get_foods(query: str | None = Query(default=None), category: str | None = Query(default=None), db: Session = Depends(get_db)):
    q = db.query(FoodItem)
    if query:
        q = q.filter((FoodItem.name.ilike(f"%{query}%")) | (FoodItem.description.ilike(f"%{query}%")))
    if category:
        q = q.filter(FoodItem.category.ilike(f"%{category}%"))
    return q.order_by(FoodItem.id).all()


@app.get("/api/foods/search")
def search_foods(query: str = Query(...), db: Session = Depends(get_db)):
    return db.query(FoodItem).filter((FoodItem.name.ilike(f"%{query}%")) | (FoodItem.description.ilike(f"%{query}%"))).all()


@app.get("/api/foods/{food_id}")
def get_food(food_id: int, db: Session = Depends(get_db)):
    item = db.query(FoodItem).filter(FoodItem.id == food_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Food item not found.")
    return item


@app.post("/api/survey")
def submit_survey(payload: SurveyResponseCreate, request: Request, db: Session = Depends(get_db)):
    survey = SurveyResponse(
        age_group=payload.age_group,
        activity_level=payload.activity_level,
        sleep_range=payload.sleep_range,
        water_range=payload.water_range,
        exercise_frequency=payload.exercise_frequency,
        food_habits=payload.food_habits,
        mood=payload.mood,
        user_id=None,
    )
    db.add(survey)
    db.commit()
    db.refresh(survey)
    return {"message": "Survey submitted successfully.", "id": survey.id}


@app.get("/api/survey")
def get_survey_summary(db: Session = Depends(get_db)):
    rows = db.query(SurveyResponse).all()
    total = len(rows)
    age_counts = {}
    exercise_counts = {}
    for r in rows:
        age_counts[r.age_group] = age_counts.get(r.age_group, 0) + 1
        exercise_counts[r.exercise_frequency] = exercise_counts.get(r.exercise_frequency, 0) + 1
    return {
        "total_responses": total,
        "age_groups": age_counts,
        "exercise_frequency": exercise_counts,
        "sample_responses": [{"id": r.id, "age_group": r.age_group, "activity_level": r.activity_level, "sleep_range": r.sleep_range, "water_range": r.water_range, "food_habits": r.food_habits, "mood": r.mood} for r in rows[-10:]],
    }


@app.get("/api/community/summary")
def community_summary(db: Session = Depends(get_db)):
    responses = db.query(SurveyResponse).all()
    total = len(responses)
    exercise_pct = round((sum(1 for r in responses if r.exercise_frequency.lower() != "never") / total) * 100, 1) if total else 0
    avg_sleep = round(sum(int(r.sleep_range.split("-")[0]) if "-" in r.sleep_range else 7 for r in responses) / total, 1) if total else 0
    avg_water = round(sum(float(r.water_range.split("-")[0].replace("L", "")) if "-" in r.water_range else 2.0 for r in responses) / total, 1) if total else 0
    return {"eligible_participants": total, "exercise_participation_percent": exercise_pct, "average_sleep_hours": avg_sleep, "average_water_liters": avg_water, "data_source": "survey respondents"}


@app.get("/api/community/exercise")
def community_exercise(db: Session = Depends(get_db)):
    results = db.query(SurveyResponse.exercise_frequency, func.count(SurveyResponse.id)).group_by(SurveyResponse.exercise_frequency).all()
    return {"series": [{"label": label, "value": count} for label, count in results]}


@app.get("/api/community/sleep")
def community_sleep(db: Session = Depends(get_db)):
    results = db.query(SurveyResponse.sleep_range, func.count(SurveyResponse.id)).group_by(SurveyResponse.sleep_range).all()
    return {"series": [{"label": label, "value": count} for label, count in results]}


@app.get("/api/community/water")
def community_water(db: Session = Depends(get_db)):
    results = db.query(SurveyResponse.water_range, func.count(SurveyResponse.id)).group_by(SurveyResponse.water_range).all()
    return {"series": [{"label": label, "value": count} for label, count in results]}


@app.get("/api/community/mood")
def community_mood(db: Session = Depends(get_db)):
    results = db.query(SurveyResponse.mood, func.count(SurveyResponse.id)).group_by(SurveyResponse.mood).all()
    return {"series": [{"label": label or "Not shared", "value": count} for label, count in results]}


@app.get("/api/challenges")
def get_challenges(db: Session = Depends(get_db)):
    rows = db.query(Challenge).all()
    return [{"id": c.id, "title": c.title, "description": c.description, "start_date": c.start_date, "end_date": c.end_date, "participants": len(c.participants)} for c in rows]


@app.post("/api/challenges/{challenge_id}/join")
def join_challenge(challenge_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found.")
    existing = db.query(ChallengeParticipant).filter(ChallengeParticipant.challenge_id == challenge_id, ChallengeParticipant.user_id == current_user.id).first()
    if existing:
        return {"message": "You have already joined this challenge."}
    participant = ChallengeParticipant(challenge_id=challenge_id, user_id=current_user.id)
    db.add(participant)
    db.commit()
    return {"message": "Joined challenge successfully.", "challenge_id": challenge_id}


@app.get("/api/challenges/{challenge_id}/stats")
def challenge_stats(challenge_id: int, db: Session = Depends(get_db)):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found.")
    participants = db.query(ChallengeParticipant).filter(ChallengeParticipant.challenge_id == challenge_id).count()
    return {"challenge_id": challenge_id, "title": challenge.title, "participants": participants, "message": "Aggregate participation is shown without exposing private records."}


@app.get("/api/streak")
def streak(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goals = db.query(DailyGoal).filter(DailyGoal.user_id == current_user.id, DailyGoal.completed.is_(True)).all()
    by_day = sorted({g.goal_date.isoformat() for g in goals})
    current_streak = 0
    check_date = date.today()
    while True:
        if check_date.isoformat() in by_day:
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    return {"current_streak": current_streak, "longest_streak": max(current_streak, len(by_day)), "activity_days": by_day}


@app.get("/api/achievements")
def achievements(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    unlocked = db.query(Achievement.id).join(UserAchievement).filter(UserAchievement.user_id == current_user.id).all()
    unlocked_ids = {row[0] for row in unlocked}
    all_items = db.query(Achievement).all()
    return [{"id": item.id, "key": item.key, "title": item.title, "description": item.description, "unlocked": item.id in unlocked_ids} for item in all_items]


@app.post("/api/achievements/check")
def check_achievements(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    earned = []
    goals = db.query(DailyGoal).filter(DailyGoal.user_id == current_user.id).all()
    if any(g.completed for g in goals):
        earned.append("first_steps")
    total_water = sum(w.amount_ml for w in db.query(WaterLog).filter(WaterLog.user_id == current_user.id).all())
    if total_water >= 2000:
        earned.append("hydration_habit")
    mood = db.query(MoodCheckin).filter(MoodCheckin.user_id == current_user.id).count()
    if mood > 0:
        earned.append("mindfulness_beginner")
    daily_completion = 0
    goal_dates = {g.goal_date for g in goals if g.completed}
    if len(goal_dates) >= 3:
        earned.append("walking_week")
    if len(goal_dates) >= 5:
        earned.append("consistent_routine")

    for key in earned:
        achievement = db.query(Achievement).filter(Achievement.key == key).first()
        if achievement and not db.query(UserAchievement).filter(UserAchievement.user_id == current_user.id, UserAchievement.achievement_id == achievement.id).first():
            db.add(UserAchievement(user_id=current_user.id, achievement_id=achievement.id))
    db.commit()
    return {"earned": earned, "message": "Achievements updated based on your current activity records."}


@app.get("/api/reminders")
def reminders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.query(Reminder).filter(Reminder.user_id == current_user.id).all()
    return [{"id": r.id, "category": r.category, "enabled": r.enabled, "frequency": r.frequency, "message": r.message, "wake_time": r.wake_time, "sleep_time": r.sleep_time} for r in rows]


@app.post("/api/reminders")
def create_reminder(payload: ReminderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reminder = Reminder(user_id=current_user.id, **payload.model_dump())
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return {"id": reminder.id, **payload.model_dump()}


@app.put("/api/reminders/{reminder_id}")
def update_reminder(reminder_id: int, payload: ReminderUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.user_id == current_user.id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found.")
    for field, value in payload.model_dump().items():
        setattr(reminder, field, value)
    db.commit()
    db.refresh(reminder)
    return {"id": reminder.id, "category": reminder.category, "enabled": reminder.enabled, "frequency": reminder.frequency, "message": reminder.message, "wake_time": reminder.wake_time, "sleep_time": reminder.sleep_time}


@app.delete("/api/reminders/{reminder_id}")
def delete_reminder(reminder_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.user_id == current_user.id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found.")
    db.delete(reminder)
    db.commit()
    return {"message": "Reminder removed."}


@app.post("/api/chatbot")
def chatbot(payload: ChatbotRequest, request: Request, db: Session = Depends(get_db)):
    text = payload.message.lower()
    if "exercise" in text or "movement" in text:
        reply = "You could start with comfortable walking, gentle stretching, and other low-intensity activities that suit your circumstances."
    elif "eat" in text or "food" in text or "nutrition" in text:
        reply = "Try building plates around fruits, vegetables, protein, and grains. A simple habit is to include at least one colorful produce item with each meal."
    elif "sleep" in text:
        reply = "A consistent bedtime, a short wind-down routine, and limiting bright screens before sleep can help create a calmer evening rhythm."
    elif "breath" in text or "mindful" in text or "stress" in text:
        reply = "A simple breathing exercise is to inhale for four counts and exhale for six counts, repeating gently for a few rounds."
    elif "water" in text or "hydration" in text:
        reply = "A useful habit is to keep water close by and sip steadily throughout the day, adjusting to your activity and environment."
    elif "daily routine" in text or "routine" in text:
        reply = "Try anchoring your day around consistent wake-up, movement, meals, and bedtime moments to create a calming rhythm."
    elif "yoga" in text or "stretch" in text:
        reply = "Begin with gentle mobility, easy standing poses, and soft stretching that feels comfortable and sustainable."
    elif "vitality hub" in text:
        reply = "Vitality Hub supports simple habits like movement, water, mindful breaks, sleep, and balanced meals in a supportive community context."
    else:
        reply = "You can start with small, realistic steps like a short walk, a glass of water, or a brief breathing break. The goal is consistency, not perfection."
    return ChatbotResponse(reply=reply)


@app.get("/api/resources")
def resources(db: Session = Depends(get_db)):
    rows = db.query(AwarenessResource).all()
    return [{"id": r.id, "title": r.title, "description": r.description, "url": r.url, "category": r.category, "location": r.location} for r in rows]


@app.post("/api/resources")
def create_resource(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    item = AwarenessResource(**payload)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.get("/api/admin/summary")
def admin_summary(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    return {
        "users": db.query(User).count(),
        "survey_responses": db.query(SurveyResponse).count(),
        "exercises": db.query(Exercise).count(),
        "resources": db.query(AwarenessResource).count(),
        "challenges": db.query(Challenge).count(),
    }


@app.get("/api/admin/users")
def admin_users(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role} for u in users]
