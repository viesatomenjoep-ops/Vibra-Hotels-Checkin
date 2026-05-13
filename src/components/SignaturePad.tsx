'use client';

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
}

export default function SignaturePad({ onSave }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) {
      alert('Please provide a signature first.');
      return;
    }
    const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    if (dataUrl) {
      onSave(dataUrl);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="border border-gray-300 rounded-xl bg-white overflow-hidden shadow-sm">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-48 sm:h-64 cursor-crosshair touch-none',
          }}
          onEnd={() => setIsEmpty(false)}
        />
      </div>
      <div className="flex justify-between items-center px-1">
        <button
          type="button"
          onClick={clear}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors px-3 py-2 rounded-lg"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={save}
          disabled={isEmpty}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            isEmpty 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-[#00d2d3] text-white hover:bg-[#00b0b1] shadow-md'
          }`}
        >
          Confirm Signature
        </button>
      </div>
    </div>
  );
}
