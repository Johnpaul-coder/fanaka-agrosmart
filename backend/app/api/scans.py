from fastapi import APIRouter, File, UploadFile

router = APIRouter()

@router.post("/upload")
async def scan_crop(file: UploadFile = File(...)):
    # This will connect to crop_disease_v1.h5 later
    return {
        "filename": file.filename,
        "diagnosis": "Scanning in progress...",
        "result": "Healthy" 
    }