"use client"; // Required for interactivity
import { useState } from 'react';

export default function ScannerPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <h2 className="text-3xl font-black mb-4">AI Crop Doctor</h2>
      <p className="text-gray-500 mb-8 text-sm">Take or upload a photo of your plant leaves to identify diseases instantly.</p>
      
      <div className="border-4 border-dashed border-gray-200 rounded-3xl p-12 mb-8 bg-gray-50 hover:border-green-400 transition">
        <div className="text-5xl mb-4">📸</div>
        <p className="text-sm font-bold text-gray-400">Click to capture or drag photo</p>
        <input type="file" className="hidden" id="fileInput" />
        <label htmlFor="fileInput" className="mt-4 inline-block bg-green-700 text-white px-6 py-2 rounded-full cursor-pointer font-bold">
          Upload Image
        </label>
      </div>

      <button className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-xl shadow-lg">
        START DIAGNOSIS
      </button>

      <div className="mt-8 text-left bg-blue-50 p-4 rounded-xl border border-blue-100">
        <h4 className="font-bold text-blue-800 text-xs uppercase mb-1">Fanaka Tip</h4>
        <p className="text-xs text-blue-700 leading-relaxed">Ensure the leaf is well-lit and in focus for 99% accuracy.</p>
      </div>
    </div>
  );
}