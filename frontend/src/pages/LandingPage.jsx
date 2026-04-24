import React, { useEffect, useState } from 'react';
import { testConnection } from '../api/apiClient';
import ReceiptScanner from '../components/ReceiptScanner';

export default function LandingPage() {
  const [status, setStatus] = useState("Se încarcă...");

  useEffect(() => {
    testConnection().then(res => setStatus(res));
  }, []);

  return (
    <div className="flex flex-col items-center gap-10 py-10">
      <header className="text-center">
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
          Management Inteligent
        </h1>
        <p className="text-gray-500">Scanează bonul și noi ne ocupăm de restul.</p>
      </header>

      <ReceiptScanner />

      <div className="text-xs text-gray-400 bg-white px-4 py-2 rounded-full shadow-sm">
        Backend Status: <span className="text-green-600 font-bold">{status}</span>
      </div>
    </div>
  );
}