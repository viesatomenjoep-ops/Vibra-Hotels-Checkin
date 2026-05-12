'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';

interface ScannerProps {
  onScanComplete: (data: { firstName: string, lastName: string, country: string, idPhotoBase64?: string }) => void;
  onCancel: () => void;
  t: Record<string, string>;
}

export default function PassportScanner({ onScanComplete, onCancel, t }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } // Prefer back camera on phones
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Camera access denied or error:", err);
        setHasPermission(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureAndScan = () => {
    setIsScanning(true);
    
    // Capture snapshot from video
    let idPhotoBase64 = '';
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        idPhotoBase64 = canvas.toDataURL('image/jpeg', 0.8);
      }
    }

    // Simulate OCR processing time (2 seconds)
    // In a production app, you would send the canvas snapshot to an OCR API here.
    setTimeout(() => {
      setIsScanning(false);
      onScanComplete({
        firstName: '', // Real MRZ data would go here
        lastName: '',
        country: '',
        idPhotoBase64
      });
    }, 2000);
  };

  if (hasPermission === false) {
    return (
      <div className="p-6 text-center text-red-500 bg-red-50 rounded-xl">
        Camera access denied. Please allow camera permissions or fill in manually.
        <button onClick={onCancel} className="mt-4 block w-full text-center text-gray-600 underline">
          {t.continue_manual || 'Continue manually'}
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-inner border-2 border-gray-200">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-64 md:h-80 object-cover opacity-80"
      />
      
      {/* Scanner Overlay Guide */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
         <div className="w-3/4 h-1/4 border-2 border-[#00d2d3]/70 rounded-lg relative">
             <div className="absolute w-full h-0.5 bg-[#00d2d3]/80 shadow-[0_0_8px_#00d2d3] animate-scan top-1/2"></div>
         </div>
         <p className="text-white/70 text-sm mt-4 backdrop-blur-sm px-3 py-1 rounded-full bg-black/30">
           Plaats de MRZ code hierin / Place MRZ code here
         </p>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4 gap-3">
        <button 
          type="button"
          onClick={captureAndScan}
          disabled={isScanning}
          className="bg-[#00d2d3] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
        >
          {isScanning ? <RefreshCw className="animate-spin" size={20} /> : <Camera size={20} />}
          {isScanning ? t.processing : t.start_scanner}
        </button>
        {!isScanning && (
          <button type="button" onClick={onCancel} className="bg-black/50 backdrop-blur-md text-white px-4 py-3 rounded-xl font-medium">
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
