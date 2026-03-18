"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Image as ImageIcon, Send, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FoodInput({ onFoodLogged }) {
  const [textMode, setTextMode] = useState(true);
  const [inputText, setInputText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera stream when unmounting or hiding
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setTextMode(false);
      setImagePreview(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please allow permissions or use file upload.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);
    
    const dataUrl = canvas.toDataURL("image/jpeg");
    setImagePreview(dataUrl);
    
    // Extract base64 part for API
    const base64 = dataUrl.split(",")[1];
    setImageBase64(base64);
    
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setError(null);
    setTextMode(false);
    stopCamera();
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
      const base64 = event.target.result.split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const resetInput = () => {
    setInputText("");
    setImagePreview(null);
    setImageBase64(null);
    setError(null);
    setTextMode(true);
    stopCamera();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !imagePreview) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const payload = {};
      if (imagePreview) {
        payload.image = imageBase64;
        payload.mimeType = "image/jpeg";
      } else {
        payload.text = inputText;
      }
      
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze food");
      }
      
      // Pass data back up
      onFoodLogged({
        ...data,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      });
      
      resetInput();
      
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Log Your Meal
        </span>
      </h2>
      
      <form onSubmit={handleSubmit} className="relative z-10 w-full flex flex-col gap-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="flex bg-neutral-800/50 p-1 rounded-2xl mb-2 backdrop-blur-sm self-start shadow-inner">
           <button
             type="button"
             onClick={() => { setTextMode(true); stopCamera(); setImagePreview(null); }}
             className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 \${
               textMode && !imagePreview && !cameraActive ? "bg-neutral-700 text-white shadow-md" : "text-neutral-400 hover:text-white"
             }`}
           >
             Text
           </button>
           <button
             type="button"
             onClick={() => fileInputRef.current?.click()}
             className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 \${
               imagePreview && !cameraActive ? "bg-neutral-700 text-white shadow-md" : "text-neutral-400 hover:text-white"
             }`}
           >
             Photo Upload
           </button>
           <button
             type="button"
             onClick={startCamera}
             className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 \${
               cameraActive ? "bg-neutral-700 text-white shadow-md" : "text-neutral-400 hover:text-white"
             }`}
           >
             Camera
           </button>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*" 
          className="hidden" 
        />

        <AnimatePresence mode="popLayout">
          {cameraActive && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full aspect-video md:aspect-auto md:h-64 bg-black rounded-2xl overflow-hidden shadow-inner ring-1 ring-white/10"
            >
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-4 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="bg-white text-black p-4 rounded-full shadow-xl hover:scale-105 transition-transform"
                >
                  <Camera className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="bg-neutral-800 text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}

          {imagePreview && !cameraActive && (
             <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="relative group w-full h-64 rounded-2xl overflow-hidden ring-1 ring-white/10"
             >
                <img src={imagePreview} alt="Food preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); setImageBase64(null); setTextMode(true); }}
                  className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
             </motion.div>
          )}

          {(!imagePreview && !cameraActive) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
               <input
                 type="text"
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 placeholder="E.g., 2 slices of pepperoni pizza and a salad"
                 className="w-full bg-neutral-900/80 border border-white/10 text-white h-16 pl-6 pr-16 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-neutral-500 shadow-inner"
               />
               <button
                  type="submit"
                  disabled={isLoading || !inputText.trim()}
                  className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white pt-1 w-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 -ml-1 mt-[-4px]" />}
                </button>
            </motion.div>
          )}
        </AnimatePresence>

        {(imagePreview || cameraActive) && (
          <button
            type="submit"
            disabled={isLoading || (!imagePreview && !cameraActive)}
            className="mt-2 w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-medium rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Image...
              </>
            ) : (
              <>
                Analyze Food
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
}
