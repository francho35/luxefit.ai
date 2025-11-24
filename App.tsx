import { type FC, useState, useRef, type Dispatch, type SetStateAction } from 'react';
import { ArrowDown, Sparkles, AlertCircle } from 'lucide-react';
import { UploadZone } from './components/UploadZone';
import { Button } from './components/Button';
import { ResultModal } from './components/ResultModal';
import { generateOutfitSwap } from './services/geminiService';
import { ImageState, AppStatus } from './types';

const INITIAL_IMAGE_STATE: ImageState = {
  file: null,
  preview: null,
  base64: null,
  mimeType: '',
};

const App: FC = () => {
  const [modelImage, setModelImage] = useState<ImageState>(INITIAL_IMAGE_STATE);
  const [outfitImage, setOutfitImage] = useState<ImageState>(INITIAL_IMAGE_STATE);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const studioRef = useRef<HTMLDivElement>(null);

  // Helper to process file input
  const processFile = (file: File, setter: Dispatch<SetStateAction<ImageState>>) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Split base64 to get clean data for API and mimeType
      const matches = result.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        setter({
          file,
          preview: result,
          mimeType: matches[1],
          base64: matches[2],
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!modelImage.base64 || !outfitImage.base64) return;
    
    setStatus(AppStatus.PROCESSING);
    setError(null);

    try {
      const generatedUrl = await generateOutfitSwap({ modelImage, outfitImage });
      setResultImage(generatedUrl);
      setStatus(AppStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      // Basic error message handling
      let message = "Something went wrong. Please ensure both images are clear and try again.";
      if (err.message) {
         if (err.message.includes("412")) {
           message = "Image generation is currently unavailable in your region.";
         } else if (err.message.includes("No content generated")) {
           message = "The AI could not generate a result. This often happens if the images trigger safety filters. Try using a different photo.";
         }
      }
      setError(message);
      setStatus(AppStatus.ERROR);
    }
  };

  const scrollToStudio = () => {
    studioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReset = () => {
    setModelImage(INITIAL_IMAGE_STATE);
    setOutfitImage(INITIAL_IMAGE_STATE);
    setResultImage(null);
    setStatus(AppStatus.IDLE);
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* --- HERO SECTION --- */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background: Placeholder for the 'Boutique' prompt result */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop" 
                alt="High End Boutique"
                className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-luxe-black"></div>
        </div>

        <nav className="relative z-20 flex justify-between items-center p-8 md:px-16">
          <div className="font-display text-2xl tracking-widest text-luxe-white">LUXEFIT<span className="text-luxe-gold">.AI</span></div>
          <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest font-sans text-luxe-white/70">
            <span>Collection</span>
            <span>Virtual Studio</span>
            <span>About</span>
          </div>
        </nav>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <span className="font-display text-luxe-gold tracking-[0.3em] text-sm md:text-base mb-6 animate-pulse">
            POWERED BY GEMINI 2.5 FLASH
          </span>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-luxe-white mb-8 leading-tight">
            Redefine Your <br/> <span className="italic text-luxe-gold">Style</span>
          </h1>
          <p className="font-sans text-luxe-white/70 max-w-lg text-lg font-light mb-12 leading-relaxed">
            Experience the future of fashion. Upload your photo and a reference outfit to instantly visualize your new look with cinematic realism.
          </p>
          
          <button 
            onClick={scrollToStudio}
            className="group flex flex-col items-center gap-4 text-luxe-white/50 hover:text-luxe-gold transition-colors duration-500"
          >
            <span className="text-xs uppercase tracking-widest">Enter Studio</span>
            <div className="p-4 border border-white/10 rounded-full group-hover:border-luxe-gold group-hover:bg-luxe-gold/10 transition-all">
              <ArrowDown className="group-hover:translate-y-1 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* --- STUDIO SECTION --- */}
      <section ref={studioRef} className="min-h-screen bg-luxe-black py-24 px-4 md:px-16 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl text-white mb-4">The Atelier</h2>
            <p className="font-sans text-white/40 font-light">Select your muse and your garment.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-start">
            
            {/* Upload Area A */}
            <UploadZone 
              label="01. The Model" 
              description="Upload a full-body photo of yourself."
              imageState={modelImage}
              onImageSelect={(file) => processFile(file, setModelImage)}
              onClear={() => setModelImage(INITIAL_IMAGE_STATE)}
            />

            {/* Upload Area B */}
            <UploadZone 
              label="02. The Outfit" 
              description="Upload the outfit you wish to wear."
              imageState={outfitImage}
              onImageSelect={(file) => processFile(file, setOutfitImage)}
              onClear={() => setOutfitImage(INITIAL_IMAGE_STATE)}
            />

          </div>

          {/* Actions */}
          <div className="mt-16 flex flex-col items-center justify-center gap-6">
            
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-6 py-3 border border-red-900/50 rounded-sm">
                <AlertCircle size={16} />
                <span className="text-sm font-sans">{error}</span>
              </div>
            )}

            <Button 
              onClick={handleGenerate}
              disabled={!modelImage.file || !outfitImage.file}
              isLoading={status === AppStatus.PROCESSING}
              className="w-full md:w-auto min-w-[240px] shadow-[0_0_40px_rgba(212,175,55,0.15)] hover:shadow-[0_0_60px_rgba(212,175,55,0.3)]"
            >
              {status === AppStatus.PROCESSING ? 'Weaving Reality...' : 'Generate Look'} <Sparkles size={16} />
            </Button>
            
            {!process.env.API_KEY && (
               <p className="text-xs text-red-500 font-mono mt-4">
                 * Missing API Key. Please configure metadata.json/process.env
               </p>
            )}
          </div>

        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-white/5 text-center">
        <p className="font-display text-luxe-gold text-lg mb-2">LUXEFIT.AI</p>
        <p className="font-sans text-white/20 text-xs uppercase tracking-widest">
          &copy; 2024 All Rights Reserved
        </p>
      </footer>

      {/* --- MODALS --- */}
      <ResultModal 
        isOpen={!!resultImage} 
        onClose={() => setResultImage(null)} 
        resultImage={resultImage} 
        onReset={handleReset}
      />

    </div>
  );
};

export default App;