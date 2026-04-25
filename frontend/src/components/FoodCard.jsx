import { Clock, AlertTriangle, Trash2, Package } from 'lucide-react';

const categoryIcons = {
  'Lactate': '🥛',
  'Fructe': '🍎',
  'Legume': '🥦',
  'Carne': '🥩',
  'Panificație': '🍞',
  'Băuturi': '🥤',
  'Conserve': '🥫',
  'Condimente': '🧂',
  'Dulciuri': '🍫',
  'Altele': '📦',
};

function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function getExpiryStatus(days) {
  if (days === null) return { label: 'Necunoscut', color: 'text-dark-400', bg: 'bg-dark-600' };
  if (days < 0) return { label: 'Expirat', color: 'text-neon-pink', bg: 'bg-neon-pink/10' };
  if (days <= 2) return { label: `${days}z rămase`, color: 'text-neon-orange', bg: 'bg-neon-orange/10' };
  if (days <= 7) return { label: `${days}z rămase`, color: 'text-neon-yellow', bg: 'bg-neon-yellow/10' };
  return { label: `${days}z rămase`, color: 'text-neon-green', bg: 'bg-neon-green/10' };
}

export default function FoodCard({ item, onDelete }) {
  const daysLeft = getDaysUntilExpiry(item.expiryDate);
  const status = getExpiryStatus(daysLeft);
  const emoji = categoryIcons[item.category] || categoryIcons['Altele'];

  return (
    <div className="card group relative overflow-hidden" id={`food-card-${item._id || item.id}`}>
      {/* Expiry Warning Glow */}
      {daysLeft !== null && daysLeft <= 2 && (
        <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-neon-pink/5 to-transparent pointer-events-none" />
      )}

      <div className="relative flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="text-2xl mt-0.5 flex-shrink-0">{emoji}</div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-white text-sm truncate">{item.name}</h4>
            <p className="text-xs text-dark-400 mt-0.5">{item.category || 'Necategorizat'}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5">
                <Package size={12} className="text-dark-400" />
                <span className="text-xs text-dark-300">{item.quantity || '1'} {item.unit || 'buc'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delete */}
        {onDelete && (
          <button
            onClick={() => onDelete(item._id || item.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg bg-neon-pink/10 flex items-center justify-center text-neon-pink hover:bg-neon-pink/20 flex-shrink-0"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Expiry Badge */}
      <div className="mt-3 flex items-center justify-between">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.color}`}>
          {daysLeft !== null && daysLeft <= 2 ? <AlertTriangle size={12} /> : <Clock size={12} />}
          {status.label}
        </div>
        {item.addedDate && (
          <span className="text-[10px] text-dark-500">
            Adăugat {new Date(item.addedDate).toLocaleDateString('ro-RO')}
          </span>
        )}
      </div>
    </div>
  );
}
