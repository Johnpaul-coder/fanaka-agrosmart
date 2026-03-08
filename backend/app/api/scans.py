import os
import base64
import requests
from dotenv import load_dotenv
from fastapi import APIRouter, UploadFile, File, HTTPException
import random

load_dotenv()
router = APIRouter()

PLANT_API_KEY = os.getenv("PLANT_API_KEY", "your_api_key_here")

# The fallback data just in case the real AI is offline
MOCK_DIAGNOSES = [
    {"disease": "Maize Lethal Necrosis", "confidence": "94%", "treatment": "Uproot infected plants."},
    {"disease": "Tomato Early Blight", "confidence": "88%", "treatment": "Apply copper fungicides."},
]

@router.post("/upload")
async def analyze_crop(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    contents = await file.read()
    
    # 1. If no real API key is set, use the Mock AI (Safe Fallback)
    if PLANT_API_KEY == "your_api_key_here":
        print("WARNING: No real API key found. Using Mock AI.")
        result = random.choice(MOCK_DIAGNOSES)
        return {
            "status": "success",
            "filename": file.filename,
            "diagnosis": f"[MOCK] {result['disease']}",
            "confidence": result["confidence"],
            "treatment": result["treatment"]
        }

    # 2. If a real key IS found, send it to the Real AI!
    print("Connecting to Real Plant AI...")
    
    # We have to turn the image into text (base64) to send it over the internet safely
    encoded_image = base64.b64encode(contents).decode("utf-8")
    
    # The Handshake with the Plant.id AI
    api_url = "https://api.plant.id/v2/health_assessment"
    payload = {
        "images": [encoded_image],
        "modifiers": ["crops_fast", "similar_images"],
        "disease_details": ["description", "treatment"]
    }
    headers = {
        "Content-Type": "application/json",
        "Api-Key": PLANT_API_KEY
    }

    try:
        response = requests.post(api_url, json=payload, headers=headers)
        data = response.json()
        
        # Dig into the AI's response to find the top disease
        health_assessment = data.get("health_assessment", {})
        diseases = health_assessment.get("diseases", [])
        
        if diseases:
            top_disease = diseases[0]
            name = top_disease.get("name", "Unknown Disease")
            probability = f"{round(top_disease.get('probability', 0) * 100, 1)}%"
            treatment = top_disease.get("disease_details", {}).get("treatment", "Consult a local agronomist.")
            
            return {
                "status": "success",
                "filename": file.filename,
                "diagnosis": name,
                "confidence": probability,
                "treatment": str(treatment)
            }
        else:
            return {
                "status": "success",
                "filename": file.filename,
                "diagnosis": "Healthy Plant",
                "confidence": "99%",
                "treatment": "No diseases detected! Keep up the good work."
            }
            
    except Exception as e:
        print(f"Real AI Error: {e}")
        raise HTTPException(status_code=500, detail="Real AI engine failed to process the image.")