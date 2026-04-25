import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Loader2, CheckCircle2, X, Image as ImageIcon, Sparkles, Package, RefreshCw } from 'lucide-react';
import { uploadReceipt } from '../api/apiClient';

export default function ReceiptScanner() {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Te rog încarcă o imagine (JPG, PNG, HEIC, WebP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Imaginea e prea mare. Maxim 10MB.');
      return;
    }
    setError(null);
    setResult(null);
    setFileName(file.name);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setProgress('Se încarcă imaginea...');

    try {
      setProgress('AI-ul analizează bonul cu Gemini Vision...');
      const data = await uploadReceipt(selectedFile);
      setResult(data);
      setProgress('');
    } catch (err) {
      const serverError = err?.response?.data;
      let errorMsg = 'Nu am putut procesa bonul.';
      
      if (serverError?.hint) {
        errorMsg += ` ${serverError.hint}`;
      } else if (serverError?.details) {
        errorMsg += ` ${serverError.details}`;
      } else if (serverError?.error) {
        errorMsg += ` ${serverError.error}`;
      } else if (err.code === 'ECONNABORTED') {
        errorMsg = 'Procesarea a durat prea mult. Încearcă cu o imagine mai clară.';
      }
      
      setError(errorMsg);
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setSelectedFile(null);
    setFileName('');
    setResult(null);
    setError(null);
    setProgress('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const totalAmount = result?.receipt?.totalAmount || result?.products?.reduce((s, p) => s + (p.price || 0), 0) || 0;

  return (
    <div className="w-full max-w-lg mx-auto" id="receipt-scanner">
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500 to-neon-blue flex items-center justify-center">
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-white">Scanner AI</h3>
            <p className="text-xs text-dark-300">Powered by Gemini Vision • Scanează orice bon</p>
          </div>
        </div>

        {/* Result View */}
        {result ? (
          <div className="animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-neon-green">
                <CheckCircle2 size={20} />
                <span className="font-semibold text-sm">{result.message || 'Bon procesat cu succes!'}</span>
              </div>
            </div>

            {/* Store & Total */}
            {(result.receipt?.storeName || totalAmount > 0) && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-accent-500/10 border border-accent-500/20 mb-4">
                <span className="text-sm text-dark-200">
                  🏪 {result.receipt?.storeName || 'Magazin'}
                </span>
                {totalAmount > 0 && (
                  <span className="text-sm font-bold text-accent-400">
                    {totalAmount.toFixed(2)} RON
                  </span>
                )}
              </div>
            )}

            {/* Products list */}
            {result.products && result.products.length > 0 ? (
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {result.products.map((product, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-dark-700/50 border border-glass-border">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Package size={14} className="text-accent-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm text-dark-100 block truncate">{product.name}</span>
                        <span className="text-[10px] text-dark-400">
                          {product.category || 'Altele'} • {product.quantity} {product.unit}
                        </span>
                      </div>
                    </div>
                    {product.price > 0 && (
                      <span className="text-xs font-mono text-neon-green ml-2 flex-shrink-0">
                        {product.price.toFixed(2)} lei
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-dark-300 mb-4">Produsele au fost adăugate în cămară.</p>
            )}

            <div className="flex gap-2">
              <button onClick={reset} className="btn-secondary flex-1 text-center flex items-center justify-center gap-2">
                <RefreshCw size={14} />
                Scanează alt bon
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !loading && fileInputRef.current?.click()}
              id="receipt-dropzone"
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${
                loading
                  ? 'border-accent-500/50 bg-accent-500/5 pointer-events-none'
                  : dragActive
                  ? 'border-neon-green bg-neon-green/5 scale-[1.02]'
                  : preview
                  ? 'border-accent-500/30 bg-dark-700/30'
                  : 'border-dark-500 bg-dark-700/20 hover:border-dark-400 hover:bg-dark-700/40'
              } ${preview ? 'p-3' : 'p-8'}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleInputChange}
                className="hidden"
                id="receipt-file-input"
              />

              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview bon"
                    className={`w-full h-48 object-cover rounded-xl transition-all ${loading ? 'opacity-50' : ''}`}
                  />
                  {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/60 rounded-xl">
                      <Loader2 size={32} className="animate-spin text-accent-400 mb-2" />
                      <span className="text-xs text-dark-200">{progress}</span>
                    </div>
                  )}
                  {!loading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reset();
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-dark-900/80 backdrop-blur-sm flex items-center justify-center text-dark-200 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  {!loading && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-dark-300">
                      <ImageIcon size={14} />
                      <span className="truncate">{fileName}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-dark-600 flex items-center justify-center text-dark-300">
                    <Camera size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark-100 mb-1">
                      Trage bonul aici sau click pentru upload
                    </p>
                    <p className="text-xs text-dark-400">
                      Suportă JPG, PNG, HEIC, WebP • Max 10MB
                    </p>
                    <p className="text-xs text-accent-400 mt-1">
                      📱 Pe telefon poți face poză direct
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mt-3 px-4 py-3 rounded-xl bg-neon-pink/10 border border-neon-pink/20 text-neon-pink text-xs font-medium animate-scale-in">
                ❌ {error}
              </div>
            )}

            {/* Scan Button */}
            <button
              onClick={handleScan}
              disabled={!preview || loading}
              id="scan-button"
              className={`mt-5 w-full btn-primary flex items-center justify-center gap-2 ${
                !preview || loading ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{progress || 'Se procesează...'}</span>
                </>
              ) : (
                <>
                  <Upload size={18} />
                  <span>Scanează cu Gemini AI</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}