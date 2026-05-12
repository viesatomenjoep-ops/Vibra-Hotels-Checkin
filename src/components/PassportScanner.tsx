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
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      
      // The guide is 75% width, 25% height, centered.
      const cropW = videoWidth * 0.75;
      const cropH = videoHeight * 0.25;
      const cropX = (videoWidth - cropW) / 2;
      const cropY = (videoHeight - cropH) / 2;

      const canvas = document.createElement('canvas');
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw only the cropped area
        ctx.drawImage(videoRef.current, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        
        // Optional: Simple contrast enhancement for better OCR
        ctx.filter = 'contrast(1.5) grayscale(1)';
        ctx.drawImage(canvas, 0, 0);
        
        idPhotoBase64 = canvas.toDataURL('image/jpeg', 0.9);
      }
    }

    // Initialize Tesseract OCR
    import('tesseract.js').then(({ createWorker }) => {
      const processOCR = async () => {
        try {
          const worker = await createWorker('eng');
          const { data: { text } } = await worker.recognize(idPhotoBase64);
          await worker.terminate();

          // Tesseract might misread characters, so we normalize common errors in MRZ
          const normalizedText = text.replace(/[«]/g, '<').replace(/\s+/g, '');
          const lines = normalizedText.split('\n');
          
          let firstName = '';
          let lastName = '';
          let country = '';

          // Find the line that has the most '<' characters (likely the name line)
          let mrzNameLine = '';
          let maxChevrons = 0;
          
          for (const line of lines) {
            const chevronCount = (line.match(/</g) || []).length;
            if (chevronCount > maxChevrons && chevronCount > 2) {
              maxChevrons = chevronCount;
              mrzNameLine = line;
            }
          }
          
          if (mrzNameLine) {
            let cleanLine = mrzNameLine;
            // Remove common MRZ prefixes (P<, I<, A<, C<, V<, ID) and the following 3-letter country code
            const prefixMatch = mrzNameLine.match(/^[PIACV]</) || mrzNameLine.startsWith('ID');
            if (prefixMatch) {
              if (mrzNameLine.length >= 5) {
                country = mrzNameLine.substring(2, 5).replace(/</g, '');
                cleanLine = mrzNameLine.substring(5);
              }
            } else if (mrzNameLine.length > 5 && mrzNameLine.includes('<<')) {
              // Even if prefix is misread, strip the first 5 chars if they look like a country code block
              const firstPart = mrzNameLine.split('<<')[0];
              if (firstPart.length > 5 && (firstPart[2] !== '<' || firstPart[3] !== '<')) {
                 cleanLine = mrzNameLine.substring(5);
              }
            }

            const nameParts = cleanLine.split(/<<+/).filter(p => p.length > 0 && !/^<+$/.test(p));
            
            if (nameParts.length > 0) {
              lastName = nameParts[0].replace(/</g, ' ').replace(/[^A-Z ]/g, '').trim();
            }
            if (nameParts.length > 1) {
              firstName = nameParts[1].replace(/</g, ' ').replace(/[^A-Z ]/g, '').trim();
            }
          }

          setIsScanning(false);
          onScanComplete({
            firstName,
            lastName,
            country,
            idPhotoBase64
          });

        } catch (err) {
          console.error("OCR Error:", err);
          setIsScanning(false);
          // Fallback to empty strings if OCR fails
          onScanComplete({ firstName: '', lastName: '', country: '', idPhotoBase64 });
        }
      };

      processOCR();
    });
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
         <div className="w-3/4 h-1/4 border-2 border-[var(--brand-color)]/70 rounded-lg relative">
             <div className="absolute w-full h-0.5 bg-[var(--brand-color)]/80 shadow-[0_0_8px_var(--brand-color)] animate-scan top-1/2"></div>
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
          className="bg-[var(--brand-color)] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
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
