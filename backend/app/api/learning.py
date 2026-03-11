from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx
import os

router = APIRouter(tags=["learning"])

GROQ_API_KEY_LEARNING = os.getenv("GROQ_API_KEY_LEARNING")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"


class CourseContentRequest(BaseModel):
    crop: str
    topic: str
    language: str = "english"  # "english" or "kiswahili"


class TranslateRequest(BaseModel):
    text: str
    target_language: str  # "kiswahili" or "english"


class CourseContentResponse(BaseModel):
    crop: str
    topic: str
    language: str
    content: str
    tips: list[str]
    modern_techniques: list[str]


async def call_groq(messages: list, max_tokens: int = 1200) -> str:
    if not GROQ_API_KEY_LEARNING:
        raise HTTPException(status_code=500, detail="Learning API key not configured. Please set GROQ_API_KEY_LEARNING in .env")

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY_LEARNING}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.7,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(GROQ_API_URL, headers=headers, json=payload)
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Groq API error: {response.text}")
        data = response.json()
        return data["choices"][0]["message"]["content"]


@router.post("/course-content", response_model=CourseContentResponse)
async def get_course_content(request: CourseContentRequest):
    """Generate modern, up-to-date farming course content for a specific crop and topic."""

    lang_instruction = (
        "Respond entirely in Kiswahili (Swahili). Use simple, clear Kiswahili that Kenyan farmers will understand."
        if request.language == "kiswahili"
        else "Respond in clear, simple English suitable for Kenyan smallholder farmers."
    )

    system_prompt = f"""You are an expert agricultural advisor specializing in Kenyan farming. 
You provide practical, modern, up-to-date advice based on 2024/2025 best practices.
{lang_instruction}
Always focus on techniques relevant to Kenya's climate, soil types, and market conditions.
Your advice should be actionable, specific, and reflect current research and farming trends."""

    user_prompt = f"""Generate comprehensive farming course content about "{request.topic}" for {request.crop} farming in Kenya.

Return your response in this EXACT JSON format (no markdown, no code blocks, just raw JSON):
{{
  "content": "A detailed 3-4 paragraph explanation of the topic covering modern techniques, current best practices for 2024/2025, climate-smart approaches, and Kenya-specific context",
  "tips": ["practical tip 1", "practical tip 2", "practical tip 3", "practical tip 4", "practical tip 5"],
  "modern_techniques": ["modern technique 1", "modern technique 2", "modern technique 3", "modern technique 4"]
}}

Make content specific to Kenyan conditions, mention specific counties/regions where relevant, include real product names, costs in KES where helpful, and reference current market trends."""

    raw = await call_groq([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ], max_tokens=1200)

    # Parse JSON from response
    import json
    import re

    # Strip markdown code fences if present
    clean = re.sub(r"```(?:json)?|```", "", raw).strip()

    try:
        parsed = json.loads(clean)
        return CourseContentResponse(
            crop=request.crop,
            topic=request.topic,
            language=request.language,
            content=parsed.get("content", raw),
            tips=parsed.get("tips", []),
            modern_techniques=parsed.get("modern_techniques", []),
        )
    except json.JSONDecodeError:
        # Fallback: return raw content if JSON parsing fails
        return CourseContentResponse(
            crop=request.crop,
            topic=request.topic,
            language=request.language,
            content=raw,
            tips=[],
            modern_techniques=[],
        )


@router.post("/translate")
async def translate_text(request: TranslateRequest):
    """Translate UI text or course snippets between English and Kiswahili."""

    if request.target_language == "kiswahili":
        instruction = "Translate the following text from English to Kiswahili. Return ONLY the translated text, nothing else."
    else:
        instruction = "Translate the following text from Kiswahili to English. Return ONLY the translated text, nothing else."

    result = await call_groq([
        {"role": "system", "content": instruction},
        {"role": "user", "content": request.text}
    ], max_tokens=500)

    return {"translated": result.strip(), "target_language": request.target_language}


@router.get("/courses")
async def get_course_catalog():
    """Return the static course catalog (crops + topics). Content is fetched dynamically."""
    return {
        "courses": COURSE_CATALOG
    }


# Static catalog — 12 courses covering key Kenyan crops
COURSE_CATALOG = [
    {
        "id": 1,
        "crop": "Maize",
        "crop_sw": "Mahindi",
        "emoji": "🌽",
        "topic": "Climate-Smart Maize Farming & Push-Pull Technology",
        "topic_sw": "Kilimo cha Mahindi Kinachozingatia Hali ya Hewa na Teknolojia ya Push-Pull",
        "level": "Beginner",
        "level_sw": "Mwanzo",
        "duration": "45 min",
        "category": "Cereals",
        "category_sw": "Nafaka",
        "color": "#e8f5e9",
        "accent": "#4a8c5c",
    },
    {
        "id": 2,
        "crop": "Tomatoes",
        "crop_sw": "Nyanya",
        "emoji": "🍅",
        "topic": "Greenhouse Tomato Farming & Drip Irrigation Systems",
        "topic_sw": "Kilimo cha Nyanya Grinhausi na Mfumo wa Umwagiliaji wa Matone",
        "level": "Intermediate",
        "level_sw": "Kati",
        "duration": "60 min",
        "category": "Vegetables",
        "category_sw": "Mboga",
        "color": "#fce4ec",
        "accent": "#e07b2a",
    },
    {
        "id": 3,
        "crop": "Avocado",
        "crop_sw": "Parachichi",
        "emoji": "🥑",
        "topic": "Export-Grade Avocado Farming & Hass Variety Management",
        "topic_sw": "Kilimo cha Parachichi cha Kuuza Nje & Usimamizi wa Aina ya Hass",
        "level": "Advanced",
        "level_sw": "Juu",
        "duration": "75 min",
        "category": "Fruits",
        "category_sw": "Matunda",
        "color": "#e8f5e9",
        "accent": "#2d5c3e",
    },
    {
        "id": 4,
        "crop": "Mushrooms",
        "crop_sw": "Uyoga",
        "emoji": "🍄",
        "topic": "Mushroom Cultivation: Oyster & Button Varieties for Urban Markets",
        "topic_sw": "Ulimaji wa Uyoga: Aina ya Oyster na Button kwa Masoko ya Mjini",
        "level": "Intermediate",
        "level_sw": "Kati",
        "duration": "50 min",
        "category": "High-Value",
        "category_sw": "Thamani ya Juu",
        "color": "#fff3e0",
        "accent": "#e07b2a",
    },
    {
        "id": 5,
        "crop": "French Beans",
        "crop_sw": "Maharagwe ya Ufaransa",
        "emoji": "🫘",
        "topic": "French Beans for Export: EU Standards & Post-Harvest Handling",
        "topic_sw": "Maharagwe ya Ufaransa kwa Usafirishaji Nje: Viwango vya EU & Utunzaji Baada ya Mavuno",
        "level": "Advanced",
        "level_sw": "Juu",
        "duration": "65 min",
        "category": "Export Crops",
        "category_sw": "Mazao ya Kusafirisha",
        "color": "#e8f5e9",
        "accent": "#4a8c5c",
    },
    {
        "id": 6,
        "crop": "Potatoes",
        "crop_sw": "Viazi",
        "emoji": "🥔",
        "topic": "High-Yield Potato Farming: Certified Seed & Blight Management",
        "topic_sw": "Kilimo cha Viazi chenye Mavuno Mengi: Mbegu Zilizoidhinishwa & Udhibiti wa Ugonjwa",
        "level": "Beginner",
        "level_sw": "Mwanzo",
        "duration": "45 min",
        "category": "Tubers",
        "category_sw": "Mizizi",
        "color": "#fff8e1",
        "accent": "#e07b2a",
    },
    {
        "id": 7,
        "crop": "Dairy Farming",
        "crop_sw": "Ufugaji wa Ng'ombe wa Maziwa",
        "emoji": "🐄",
        "topic": "Zero-Grazing Dairy Systems & Fodder Conservation",
        "topic_sw": "Mifumo ya Kufuga Bila Malisho & Uhifadhi wa Chakula cha Mifugo",
        "level": "Intermediate",
        "level_sw": "Kati",
        "duration": "70 min",
        "category": "Livestock",
        "category_sw": "Mifugo",
        "color": "#e3f2fd",
        "accent": "#1a3a2a",
    },
    {
        "id": 8,
        "crop": "Capsicum",
        "crop_sw": "Pilipili Hoho",
        "emoji": "🫑",
        "topic": "Capsicum Farming: Hydroponics & Soilless Growing Techniques",
        "topic_sw": "Kilimo cha Pilipili Hoho: Haidroponiki & Mbinu za Kukua Bila Udongo",
        "level": "Advanced",
        "level_sw": "Juu",
        "duration": "80 min",
        "category": "High-Value",
        "category_sw": "Thamani ya Juu",
        "color": "#fce4ec",
        "accent": "#e07b2a",
    },
    {
        "id": 9,
        "crop": "Sukuma Wiki",
        "crop_sw": "Sukuma Wiki",
        "emoji": "🥬",
        "topic": "Urban & Peri-Urban Kale Farming: Sack Gardens & Vertical Beds",
        "topic_sw": "Kilimo cha Sukuma Wiki Mjini: Bustani ya Mfuko na Vitanda vya Wima",
        "level": "Beginner",
        "level_sw": "Mwanzo",
        "duration": "30 min",
        "category": "Urban Farming",
        "category_sw": "Kilimo cha Mjini",
        "color": "#e8f5e9",
        "accent": "#4a8c5c",
    },
    {
        "id": 10,
        "crop": "Mango",
        "crop_sw": "Embe",
        "emoji": "🥭",
        "topic": "Mango Orchard Management: Grafting, Pruning & Market Timing",
        "topic_sw": "Usimamizi wa Bustani ya Embe: Kuunganisha, Kupogoa & Muda wa Soko",
        "level": "Intermediate",
        "level_sw": "Kati",
        "duration": "55 min",
        "category": "Fruits",
        "category_sw": "Matunda",
        "color": "#fff3e0",
        "accent": "#e07b2a",
    },
    {
        "id": 11,
        "crop": "Sorghum",
        "crop_sw": "Mtama",
        "emoji": "🌾",
        "topic": "Drought-Tolerant Sorghum: KARI Varieties & Value Addition",
        "topic_sw": "Mtama Unaostahimili Ukame: Aina za KARI & Kuongeza Thamani",
        "level": "Beginner",
        "level_sw": "Mwanzo",
        "duration": "40 min",
        "category": "Cereals",
        "category_sw": "Nafaka",
        "color": "#fff8e1",
        "accent": "#4a8c5c",
    },
    {
        "id": 12,
        "crop": "Poultry",
        "crop_sw": "Kuku",
        "emoji": "🐔",
        "topic": "Kienyeji Chicken Farming: Improved Breeds, Vaccines & Profitability",
        "topic_sw": "Ufugaji wa Kuku wa Kienyeji: Mifugo Iliyoboreshwa, Chanjo & Faida",
        "level": "Beginner",
        "level_sw": "Mwanzo",
        "duration": "45 min",
        "category": "Livestock",
        "category_sw": "Mifugo",
        "color": "#fff3e0",
        "accent": "#1a3a2a",
    },
]