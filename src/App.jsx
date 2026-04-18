import { useState } from 'react';
import { Smile, ChevronRight } from 'lucide-react';
import UploadScreen from './components/UploadScreen';
import ScaleScreen from './components/ScaleScreen';
import DressUpScreen from './components/DressUpScreen'; 

function App() {
  const [step, setStep] = useState(1);                
  const [baseImage, setBaseImage] = useState(null);   
  const [scaleRatio, setScaleRatio] = useState(null); 

  const handleStartScale = (imageUrl) => {
    setBaseImage(imageUrl);
    setStep(2);
  };

  const handleScaleConfirmed = (ratio) => {
    setScaleRatio(ratio);
    setStep(4); // プロポーション測定をスキップして直接着せ替えへ
  };

  const handleReset = () => {
    setStep(1);
    setBaseImage(null);
    setScaleRatio(null);
  };

  return (
    <div className="min-h-screen bg-sakura-light flex items-center justify-center p-4">
      <div className="card-container p-8 w-full max-w-5xl min-h-[700px] flex flex-col">
        <header className="border-b border-sakura-pink/20 pb-4 mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-eye-safe-text flex items-center gap-3">
            <Smile className="text-sakura-pink" size={32} strokeWidth={2.5} />
            <span>ぬいぐるみ着せ替え</span>
            {step === 2 && (
              <div className="flex items-center gap-2 text-sakura-deep text-sm ml-2">
                <ChevronRight size={16} />
                <span>一円玉合わせ</span>
              </div>
            )}
            {step === 4 && (
              <div className="flex items-center gap-2 text-sakura-deep text-sm ml-2">
                <ChevronRight size={16} />
                <span>着せ替えシミュレーション</span>
              </div>
            )}
          </h1>
        </header>

        <div className="flex-grow flex items-stretch justify-center h-full">
          {step === 1 && <UploadScreen onImageSelected={handleStartScale} />}
          
          {step === 2 && <ScaleScreen imageUrl={baseImage} onScaleConfirmed={handleScaleConfirmed} />}
          
          {step === 4 && (
            <DressUpScreen 
              baseImage={baseImage} 
              scaleRatio={scaleRatio} 
              onReset={handleReset} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
