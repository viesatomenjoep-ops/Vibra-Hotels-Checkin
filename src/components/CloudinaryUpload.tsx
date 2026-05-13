'use client';

import { useState } from 'react';
import { UploadCloud, CheckCircle, XCircle } from 'lucide-react';

interface CloudinaryUploadProps {
  onUploadSuccess: (url: string) => void;
  categoryName: string;
}

export default function CloudinaryUpload({ onUploadSuccess, categoryName }: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    // You should replace these with your actual Cloudinary credentials from env
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'viesa_preset'); 
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo'}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      if (data.secure_url) {
        setPreview(data.secure_url);
        onUploadSuccess(data.secure_url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-2xl bg-white shadow-sm transition-all hover:border-[#00d2d3]">
      {preview ? (
        <div className="relative w-full h-40">
          <img src={preview} alt={`Upload for ${categoryName}`} className="w-full h-full object-cover rounded-xl" />
          <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center cursor-pointer w-full text-center">
          <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-700">
            {uploading ? 'Uploading...' : `Upload photo for ${categoryName}`}
          </span>
          <span className="text-xs text-gray-400 mt-1">Tap to open camera or select file</span>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" // Prioritize back camera on mobile
            className="hidden" 
            onChange={handleFileChange} 
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}
