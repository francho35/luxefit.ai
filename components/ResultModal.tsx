import { type FC } from 'react';
import { X, Download, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultImage: string | null;
  onReset: () => void;
}

export const ResultModal: FC<ResultModalProps> = ({ isOpen, onClose, resultImage, onReset }) => {
  if (!isOpen || !resultImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md fade-in">
      <div className="relative w-full max-w-4xl bg-luxe-charcoal border border-white/10 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        
        {/* Image Container */}
        <div className="w-full md:w-2/3 bg-black relative aspect-[3/4] md:aspect-auto md:h-[80vh]">
          <img 
            src={resultImage} 
            alt="Generated Outfit" 
            className="w-full h-full object-contain"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-luxe-gold text-black text-xs font-bold tracking-widest uppercase">
              Gemini 2.5 Flash
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full md:w-1/3 p-8 flex flex-col justify-between bg-luxe-charcoal border-l border-white/5">
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-display text-2xl text-luxe-gold">Your Look</h2>
              <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <p className="font-sans text-white/60 leading-relaxed mb-8">
              The outfit has been successfully applied to your photo while maintaining your pose and environment.
            </p>
            
            <div className="space-y-4">
              <Button 
                variant="primary" 
                className="w-full"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = resultImage;
                  link.download = 'luxefit-generated.png';
                  link.click();
                }}
              >
                <Download size={18} /> Save Image
              </Button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <button 
              onClick={() => {
                onClose();
                onReset();
              }}
              className="flex items-center gap-2 text-sm text-white/40 hover:text-luxe-gold transition-colors"
            >
              <RefreshCw size={14} /> Try Another Outfit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};