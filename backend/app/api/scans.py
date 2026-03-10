import os
import base64
import json
import re
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import httpx

router = APIRouter()

GROQ_API_KEY  = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL  = "https://api.groq.com/openai/v1/chat/completions"

# ── Vision model (supports images) ──────────────────────────────────────────
VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
# ── Text-only fallback (faster, cheaper) ────────────────────────────────────
TEXT_MODEL   = "llama3-70b-8192"

# ── System prompt ────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """
You are an expert agricultural AI assistant specialising in Kenyan smallholder farming.
Your job is to diagnose crop diseases, pest infestations, and nutrient deficiencies from
either a photo or a text description — or both.

You MUST respond with ONLY valid JSON in this exact structure (no markdown, no extra text):

{
  "diagnosis": {
    "primary": "Disease/pest/problem name",
    "scientific_name": "Scientific name if applicable, else null",
    "category": "Disease | Pest | Nutrient Deficiency | Environmental | Unknown",
    "confidence": 87,
    "confidence_explanation": "One sentence explaining why this confidence level was given"
  },
  "symptoms_identified": [
    "Symptom 1 you detected",
    "Symptom 2 you detected"
  ],
  "causes": [
    "Primary cause",
    "Contributing factor"
  ],
  "severity": {
    "level": "Low | Moderate | High | Critical",
    "description": "Brief description of current severity and spread risk"
  },
  "treatment": {
    "immediate_actions": [
      "Action to take today",
      "Second urgent action"
    ],
    "agrochemicals": [
      {
        "name": "Product name e.g. Dithane M45",
        "type": "Fungicide | Pesticide | Herbicide | Fertiliser | Biocontrol",
        "active_ingredient": "Active ingredient name",
        "application": "How to apply — dosage and frequency",
        "estimated_cost_kes": "e.g. KES 850/kg"
      }
    ],
    "organic_alternatives": [
      "Organic/natural solution 1",
      "Organic/natural solution 2"
    ],
    "prevention": [
      "Prevention tip 1",
      "Prevention tip 2"
    ]
  },
  "crop_impact": {
    "yield_loss_risk": "e.g. 20-40% if untreated",
    "spread_risk": "Low | Moderate | High",
    "time_to_act": "e.g. Within 48 hours"
  },
  "alternative_diagnoses": [
    {
      "name": "Alternative possibility",
      "confidence": 25,
      "distinguishing_factor": "What would confirm this instead"
    }
  ],
  "follow_up_questions": [
    "Question to help refine diagnosis if needed"
  ]
}

Rules:
- confidence is an integer 0-100
- Always suggest agrochemicals available in Kenya
- If you cannot diagnose, set category to "Unknown" and confidence to 0
- Never include markdown formatting in your response
- Always give at least one organic alternative
- agrochemicals array must have at least 1 item if a treatment exists
""".strip()


def encode_image(image_bytes: bytes) -> str:
    """Convert image bytes to base64 string."""
    return base64.b64encode(image_bytes).decode("utf-8")


def clean_json_response(text: str) -> str:
    """Strip any accidental markdown fences or leading text."""
    # Remove ```json ... ``` wrapping
    text = re.sub(r"^```json\s*", "", text.strip())
    text = re.sub(r"\s*```$", "", text.strip())
    # Find first { and last }
    start = text.find("{")
    end   = text.rfind("}")
    if start != -1 and end != -1:
        return text[start:end+1]
    return text


async def call_groq(messages: list, model: str) -> dict:
    """Call Groq API and return parsed JSON response."""
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY not set in .env file. Get your free key at console.groq.com"
        )

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.2,     # Low temp = more consistent diagnosis
        "max_tokens": 1500,
        "response_format": {"type": "json_object"},  # Force JSON output
    }

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            res = await client.post(GROQ_API_URL, json=payload, headers=headers)
            res.raise_for_status()
        except httpx.HTTPStatusError as e:
            body = e.response.text
            if e.response.status_code == 401:
                raise HTTPException(401, "Invalid GROQ_API_KEY. Check your .env file.")
            elif e.response.status_code == 429:
                raise HTTPException(429, "Groq rate limit reached. Try again in a moment.")
            raise HTTPException(502, f"Groq API error: {body}")
        except httpx.TimeoutException:
            raise HTTPException(504, "Groq API timed out. Try again.")

    raw = res.json()["choices"][0]["message"]["content"]
    cleaned = clean_json_response(raw)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        raise HTTPException(500, f"AI returned invalid JSON. Raw: {cleaned[:300]}")


# ── ROUTE 1: Scan with IMAGE upload (+ optional text description) ─────────────
@router.post("/diagnose")
async def diagnose_crop(
    description: Optional[str] = Form(None),
    crop_type:   Optional[str] = Form(None),
    image:       Optional[UploadFile] = File(None),
):
    """
    Diagnose a crop problem from an image and/or text description.
    
    - image: photo of the affected crop (JPG, PNG, WEBP)
    - description: farmer's description of the problem
    - crop_type: name of the crop (e.g. "tomatoes", "maize")
    """
    if not image and not description:
        raise HTTPException(400, "Please provide either an image or a description (or both).")

    # Build the user message content
    user_content = []

    # Add image if provided
    if image:
        # Validate file type
        allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
        if image.content_type not in allowed:
            raise HTTPException(400, f"Unsupported image type: {image.content_type}. Use JPG, PNG or WEBP.")

        image_bytes = await image.read()

        # Groq vision supports base64 images
        b64 = encode_image(image_bytes)
        media_type = image.content_type

        user_content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:{media_type};base64,{b64}",
                "detail": "high",
            }
        })

    # Build text prompt
    text_parts = []
    if crop_type:
        text_parts.append(f"Crop: {crop_type}")
    if description:
        text_parts.append(f"Farmer's description: {description}")
    if not text_parts:
        text_parts.append("Please diagnose this crop problem from the image.")

    user_content.append({
        "type": "text",
        "text": "\n".join(text_parts) + "\n\nProvide your diagnosis as JSON only."
    })

    # Choose model: vision model if image present, text model if text only
    model = VISION_MODEL if image else TEXT_MODEL

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": user_content if image else user_content[-1]["text"]},
    ]

    result = await call_groq(messages, model)

    return {
        "success": True,
        "input_type": "image_and_text" if (image and description) else ("image" if image else "text"),
        "crop_type": crop_type,
        "diagnosis": result,
    }


# ── ROUTE 2: Text-only quick scan (no file upload needed) ────────────────────
class TextScanRequest(BaseModel):
    description: str
    crop_type: Optional[str] = None

@router.post("/diagnose/text")
async def diagnose_text(data: TextScanRequest):
    """
    Quick text-only diagnosis — no image required.
    Faster and cheaper than the vision endpoint.
    """
    if not data.description.strip():
        raise HTTPException(400, "Please describe the crop problem.")

    prompt_parts = []
    if data.crop_type:
        prompt_parts.append(f"Crop: {data.crop_type}")
    prompt_parts.append(f"Problem description: {data.description}")
    prompt_parts.append("Diagnose this and respond in JSON only.")

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": "\n".join(prompt_parts)},
    ]

    result = await call_groq(messages, TEXT_MODEL)

    return {
        "success": True,
        "input_type": "text",
        "crop_type": data.crop_type,
        "diagnosis": result,
    }


# ── ROUTE 3: Get scan history for a farmer ───────────────────────────────────
# (Optional: save scans to DB for future reference)
from sqlalchemy.orm import Session
from fastapi import Depends
from app.database import get_db
from app.models.scan_model import Scan
import datetime

@router.get("/history/{farmer_id}")
def scan_history(farmer_id: int, db: Session = Depends(get_db)):
    scans = db.query(Scan).filter(
        Scan.farmer_id == farmer_id
    ).order_by(Scan.created_at.desc()).limit(20).all()
    return {"scans": [
        {
            "id": s.id,
            "crop_type": s.crop_type,
            "diagnosis": s.diagnosis_name,
            "confidence": s.confidence,
            "severity": s.severity,
            "created_at": s.created_at,
        }
        for s in scans
    ]}


@router.post("/save")
async def save_scan(
    farmer_id: int = Form(...),
    crop_type: Optional[str] = Form(None),
    diagnosis_name: str = Form(...),
    confidence: int = Form(...),
    severity: str = Form(...),
    full_result: str = Form(...),   # JSON string of full diagnosis
    db: Session = Depends(get_db),
):
    scan = Scan(
        farmer_id=farmer_id,
        crop_type=crop_type,
        diagnosis_name=diagnosis_name,
        confidence=confidence,
        severity=severity,
        full_result=full_result,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(scan)
    db.commit()
    return {"success": True, "scan_id": scan.id}