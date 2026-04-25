import ReceiptScanner from '../components/ReceiptScanner';
import { ScanLine, Sparkles, CheckCircle2 } from 'lucide-react';

const tips = [
  'Asigură-te că bonul este bine iluminat și textul e vizibil.',
  'Poziționează bonul drept, fără pliuri sau cute.',
  'AI-ul suportă bonuri de la toate supermarketurile din România.',
  'Poți scana mai multe bonuri pe zi — fără limită!',
];

export default function ScanPage() {
  return (
    <div className="relative z-10 max-w-4xl mx-auto px-6 pb-6 pt-24 page-enter" id="scan-page">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-dark-300 mb-4">
          <ScanLine size={12} className="text-neon-green" />
          Scanner AI
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
          Scanează <span className="gradient-text">Bonul</span>
        </h1>
        <p className="text-dark-400 max-w-md mx-auto">
          Încarcă o fotografie cu bonul fiscal și AI-ul va extrage automat toate produsele.
        </p>
      </div>

      {/* Scanner */}
      <ReceiptScanner />

      {/* Tips */}
      <div className="mt-10 card max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-neon-yellow" />
          <h3 className="text-sm font-display font-semibold text-white">Tips pentru scanare perfectă</h3>
        </div>
        <div className="space-y-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-dark-300">
              <CheckCircle2 size={16} className="text-neon-green flex-shrink-0 mt-0.5" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
