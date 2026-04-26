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
      setProgress('AI-ul analizează bonul cu Claude Vision...');
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
      <div className="card">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="icon-container icon-container-md bg-accent-muted rounded-xl">
            <Sparkles size={20} className="text-accent-light" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Scanner AI</h3>
            <p className="text-xs text-text-muted">Powered by Claude AI · Scanează orice bon</p>
          </div>
        </div>

        {/* Result View */}
        {result ? (
          <div className="animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 size={18} />
                <span className="font-semibold text-sm">{result.message || 'Bon procesat cu succes!'}</span>
              </div>
            </div>

            {/* Store & Total */}
            {(result.receipt?.storeName || totalAmount > 0) && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-accent-muted border border-[rgba(99,102,241,0.2)] mb-4">
                <span className="text-sm text-text-secondary">
                  🏪 {result.receipt?.storeName || 'Magazin'}
                </span>
                {totalAmount > 0 && (
                  <span className="text-sm font-bold text-accent-light">
                    {totalAmount.toFixed(2)} RON
                  </span>
                )}
              </div>
            )}

            {/* Products list */}
            {result.products && result.products.length > 0 ? (
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {result.products.map((product, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-bg-elevated border border-border">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Package size={14} className="text-accent-light flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm text-text-primary block truncate">{product.name}</span>
                        <span className="text-[10px] text-text-muted">
                          {product.category || 'Altele'} · {product.quantity} {product.unit}
                        </span>
                      </div>
                    </div>
                    {product.price > 0 && (
                      <span className="text-xs font-mono text-success ml-2 flex-shrink-0">
                        {product.price.toFixed(2)} lei
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted mb-4">Produsele au fost adăugate în cămară.</p>
            )}

            <button onClick={reset} className="btn btn-secondary w-full">
              <RefreshCw size={14} />
              Scanează alt bon
            </button>
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
                  ? 'border-accent/50 bg-accent-muted pointer-events-none'
                  : dragActive
                  ? 'border-success bg-success-muted scale-[1.01]'
                  : preview
                  ? 'border-accent/30 bg-bg-elevated'
                  : 'border-border hover:border-border-hover hover:bg-bg-elevated'
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-base/60 rounded-xl">
                      <Loader2 size={28} className="animate-spin text-accent-light mb-2" />
                      <span className="text-xs text-text-secondary">{progress}</span>
                    </div>
                  )}
                  {!loading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reset();
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-bg-base/80 backdrop-blur-sm flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  {!loading && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
                      <ImageIcon size={14} />
                      <span className="truncate">{fileName}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="icon-container icon-container-lg bg-bg-elevated rounded-2xl text-text-muted">
                    <Camera size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary mb-1">
                      Trage bonul aici sau click pentru upload
                    </p>
                    <p className="text-xs text-text-muted">
                      Suportă JPG, PNG, HEIC, WebP · Max 10MB
                    </p>
                    <p className="text-xs text-accent-light mt-1">
                      📱 Pe telefon poți face poză direct
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mt-3 px-4 py-3 rounded-xl bg-danger-muted border border-[rgba(239,68,68,0.2)] text-danger text-xs font-medium animate-scale-in">
                ❌ {error}
              </div>
            )}

            {/* Scan Button */}
            <button
              onClick={handleScan}
              disabled={!preview || loading}
              id="scan-button"
              className={`mt-5 w-full btn btn-primary btn-lg ${
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
                  <span>Scanează cu Claude AI</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}