"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function CropScanner() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // When the farmer selects a photo or takes a picture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Create a temporary URL so we can show the picture on the screen
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); // Clear any old results
      setError("");
    }
  };

  // When the farmer clicks "Analyze Crop"
  const handleScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setError("");

    // Package the image file to send to the Python backend
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/scans/upload", {
        method: "POST",
        body: formData, // Notice we don't use JSON.stringify for files!
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        setError("Failed to analyze the image. Please try again.");
      }
    } catch (err) {
      setError("Cannot connect to the AI engine. Make sure the backend is running.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div style={{ padding: '30px 20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2e7d32', margin: 0, fontSize: '24px' }}>🌱 AI Plant Doctor</h1>
        <Link href="/" style={{ color: '#0066cc', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Home</Link>
      </header>

      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee', textAlign: 'center' }}>
        <p style={{ color: '#555', marginBottom: '20px' }}>
          Take a clear photo of the sick crop leaf, and our AI will diagnose the problem instantly.
        </p>

        {/* THE CAMERA BUTTON */}
        {/* The 'capture="environment"' tells mobile phones to open the back camera! */}
        <label style={{ display: 'block', backgroundColor: '#e8f5e9', border: '2px dashed #4CAF50', padding: '30px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}>
          <span style={{ fontSize: '40px' }}>📸</span>
          <br />
          <strong style={{ color: '#2e7d32' }}>Tap to Open Camera</strong>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
        </label>

        {/* SHOW THE PICTURE THEY JUST TOOK */}
        {previewUrl && (
          <div style={{ marginBottom: '20px' }}>
            <img src={previewUrl} alt="Crop preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
          </div>
        )}

        {error && <p style={{ color: '#d32f2f', fontWeight: 'bold' }}>{error}</p>}

        {/* THE SCAN BUTTON */}
        <button 
          onClick={handleScan} 
          disabled={!selectedFile || isScanning}
          style={{ 
            width: '100%', padding: '15px', backgroundColor: !selectedFile || isScanning ? '#ccc' : '#2e7d32', 
            color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: !selectedFile || isScanning ? 'not-allowed' : 'pointer' 
          }}>
          {isScanning ? "🤖 AI is Analyzing..." : "Analyze Crop"}
        </button>
      </div>

      {/* THE RESULTS CARD */}
      {result && (
        <div style={{ marginTop: '25px', backgroundColor: '#fff8e1', padding: '20px', borderRadius: '12px', border: '1px solid #ffe082' }}>
          <h2 style={{ color: '#f57f17', marginTop: 0, marginBottom: '15px', fontSize: '20px' }}>Diagnosis Results</h2>
          <p style={{ margin: '5px 0', fontSize: '16px' }}><strong>Disease:</strong> {result.diagnosis}</p>
          <p style={{ margin: '5px 0', fontSize: '16px' }}><strong>Confidence:</strong> <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>{result.confidence}</span></p>
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff', borderRadius: '8px', borderLeft: '4px solid #4CAF50' }}>
            <p style={{ margin: 0, color: '#333', fontSize: '14px', lineHeight: '1.5' }}>
              <strong>Treatment Plan:</strong><br />
              {result.treatment}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}