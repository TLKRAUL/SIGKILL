import { useState } from 'react';
import { Clock, AlertTriangle, Trash2, Package, CalendarDays, Check, X } from 'lucide-react';

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
  if (days === null) return { label: 'Necunoscut', class: 'badge-neutral' };
  if (days < 0) return { label: 'Expirat', class: 'badge-danger' };
  if (days <= 2) return { label: `${days}z rămase`, class: 'badge-danger' };
  if (days <= 7) return { label: `${days}z rămase`, class: 'badge-warning' };
  return { label: `${days}z rămase`, class: 'badge-success' };
}

function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toISOString().split('T')[0];
}

export default function FoodCard({ item, onDelete, onUpdateExpiry }) {
  const [editing, setEditing] = useState(false);
  const [newDate, setNewDate] = useState(formatDateForInput(item.expiryDate));
  const daysLeft = getDaysUntilExpiry(item.expiryDate);
  const status = getExpiryStatus(daysLeft);
  const emoji = categoryIcons[item.category] || categoryIcons['Altele'];

  const handleSave = () => {
    if (newDate && onUpdateExpiry) {
      onUpdateExpiry(item._id || item.id, newDate);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setNewDate(formatDateForInput(item.expiryDate));
    setEditing(false);
  };

  return (
    <div className="card group relative" id={`food-card-${item._id || item.id}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="text-2xl mt-0.5 flex-shrink-0">{emoji}</div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-text-primary text-sm truncate">{item.name}</h4>
            <p className="text-xs text-text-muted mt-0.5">{item.category || 'Necategorizat'}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5">
                <Package size={12} className="text-text-muted" />
                <span className="text-xs text-text-secondary">{Number(item.quantity || 1).toLocaleString('ro-RO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} {item.unit || 'buc'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delete */}
        {onDelete && (
          <button
            onClick={() => onDelete(item._id || item.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg bg-danger-muted flex items-center justify-center text-danger hover:bg-[rgba(239,68,68,0.2)] flex-shrink-0"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Expiry Badge + Edit */}
      <div className="mt-3">
        {editing ? (
          <div className="flex items-center gap-2 animate-fade-in">
            <input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-border bg-bg-surface text-text-primary outline-none focus:border-accent-solid/40"
              min={new Date().toISOString().split('T')[0]}
            />
            <button onClick={handleSave} className="w-7 h-7 rounded-lg bg-success-muted flex items-center justify-center text-success hover:bg-[rgba(34,197,94,0.2)] transition-colors">
              <Check size={13} />
            </button>
            <button onClick={handleCancel} className="w-7 h-7 rounded-lg bg-danger-muted flex items-center justify-center text-danger hover:bg-[rgba(239,68,68,0.2)] transition-colors">
              <X size={13} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className={`badge ${status.class}`}>
              {daysLeft !== null && daysLeft <= 2 ? <AlertTriangle size={10} /> : <Clock size={10} />}
              {status.label}
            </span>
            <div className="flex items-center gap-2">
              {item.addedDate && (
                <span className="text-[10px] text-text-muted">
                  {new Date(item.addedDate).toLocaleDateString('ro-RO')}
                </span>
              )}
              {onUpdateExpiry && (
                <button
                  onClick={() => setEditing(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-md bg-bg-surface border border-border flex items-center justify-center text-text-muted hover:text-accent-solid hover:border-accent-solid/30"
                  title="Schimbă data de expirare"
                >
                  <CalendarDays size={11} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
