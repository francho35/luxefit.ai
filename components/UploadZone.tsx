import { type FC, type ChangeEvent, useRef } from 'react';
import { Upload } from 'lucide-react';
import { ImageState } from '../types';

interface UploadZoneProps {
  label: string;
  description: string;
  imageState: ImageState;
  onImageSelect: (file: File) => void;
  onClear: () => void;
}

export const UploadZone: FC<UploadZoneProps> = ({
  label,
  description,
  imageState,
  onImageSelect,
  onClear,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-4 w-full group">
      <div className="flex justify-between items-end">
        <h3 className="font-display text-xl text-luxe-gold">{label}</h3>
        {imageState.preview && (
          <button 
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="text-xs text-white/50 hover:text-red-400 uppercase tracking-widest transition-colors"
          >
            Remove
          </button>
        )}
      </div>
      
      <div 
        onClick={!imageState.preview ? handleClick : undefined}
        className={`
          relative w-full aspect-[3/4] overflow-hidden border transition-all duration-500 cursor-pointer
          ${imageState.preview 
            ? 'border-luxe-gold/50 shadow-[0_0_30px_rgba(212,175,55,0.1)]' 
            : 'border-white/10 hover:border-luxe-gold/30 hover:bg-white/5 bg-luxe-charcoal/50'
          }
        `}
      >
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={inputRef}
          onChange={handleFileChange} 
        />

        {imageState.preview ? (
          <img 
            src={imageState.preview} 
            alt={label} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 transition-transform duration-500 group-hover:scale-105">
            <div className="mb-4 p-4 rounded-full border border-white/10 bg-white/5 text-luxe-gold">
              <Upload size={24} strokeWidth={1.5} />
            </div>
            <p className="font-serif text-lg text-white mb-2">Upload Image</p>
            <p className="font-sans text-sm text-white/40 font-light">{description}</p>
          </div>
        )}
      </div>
    </div>
  );
};