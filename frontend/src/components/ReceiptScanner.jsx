import React, { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';

export default function ReceiptScanner() {
  const [loading, setLoading] = useState(false);

  const handleScan = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
        {loading ? <Loader2 className="animate-spin" /> : <Camera />}
      </div>
      <h3 className="text-xl font-bold mb-4">Adaugă alimente</h3>
      <button 
        onClick={handleScan}
        className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center gap-2"
      >
        <Upload size={20} />
        {loading ? "Se procesează..." : "Încarcă Bon"}
      </button>
    </div>
  );
}