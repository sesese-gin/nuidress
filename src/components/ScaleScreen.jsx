import { useState, useRef } from 'react';
import { Ruler, Check, Info } from 'lucide-react';
import SakuraIcon from './SakuraIcon';

export default function ScaleScreen({ imageUrl, onScaleConfirmed }) {
  const [circleRadius, setCircleRadius] = useState(30);
  const [circlePos, setCirclePos] = useState({ x: 150, y: 150 });
  const [isDraggingCircle, setIsDraggingCircle] = useState(false);
  const scaleRef = useRef(null);
  const imgRef = useRef(null);

  const handleConfirm = () => {
    if (!imgRef.current) return;
    const displayedWidth = imgRef.current.clientWidth;
    const diameterPx = circleRadius * 2;
    const mmPerPx = 20 / diameterPx;
    const totalMm = displayedWidth * mmPerPx;

    console.log("--- [Debug] Base Image Scale ---");
    console.log(`1円玉の直径(px): ${diameterPx}px`);
    console.log(`画像表示幅(px): ${displayedWidth}px`);
    console.log(`1pxあたりのmm: ${mmPerPx.toFixed(4)}mm/px`);
    console.log(`画像の全幅(mm): ${totalMm.toFixed(2)}mm`);

    onScaleConfirmed(totalMm);
  };

  return (
    <div className="w-full flex gap-6 h-[500px]">
      <div 
        ref={scaleRef}
        className="flex-grow bg-leaf-light relative overflow-hidden flex items-center justify-center rounded-2xl border border-leaf-green/30 shadow-inner"
        onMouseMove={(e) => {
          if (isDraggingCircle && scaleRef.current) {
            const rect = scaleRef.current.getBoundingClientRect();
            setCirclePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }
        }}
        onMouseUp={() => setIsDraggingCircle(false)}
        onMouseLeave={() => setIsDraggingCircle(false)}
      >
        {imageUrl && (
          <img 
            ref={imgRef}
            src={imageUrl} 
            className="max-w-[95%] max-h-[95%] pointer-events-none rounded-lg shadow-sm" 
          />
        )}
        
        <div
          style={{
            width: `${circleRadius * 2}px`, height: `${circleRadius * 2}px`,
            left: `${circlePos.x}px`, top: `${circlePos.y}px`,
            position: 'absolute', transform: 'translate(-50%, -50%)',
          }}
          className="bg-sakura-pink/50 rounded-full border-4 border-sakura-pink cursor-grab active:cursor-grabbing shadow-lg"
          onMouseDown={() => setIsDraggingCircle(true)}
        >
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-1 h-1 bg-sakura-deep rounded-full opacity-50" />
          </div>
        </div>
      </div>

      <div className="w-72 bg-white p-6 flex flex-col justify-between rounded-2xl shadow-lg border border-sakura-pink/20">
        <div>
          <h3 className="font-bold text-eye-safe-text text-lg mb-4 flex items-center gap-2 border-b border-sakura-pink/20 pb-2">
            <Ruler className="text-sakura-deep" size={20} />
            スケール設定
          </h3>
          <div className="bg-sakura-light/50 p-3 rounded-xl mb-6">
            <p className="text-xs text-sakura-deep flex gap-1 font-medium leading-relaxed">
              <Info size={14} className="shrink-0" />
              ピンクの円を一円玉（直径20mm）の大きさに合わせてね<SakuraIcon size={14} className="ml-1" />
            </p>
          </div>
          <label className="text-[10px] font-bold text-eye-safe-text/50 uppercase tracking-widest mb-2 block">Size Adjust</label>
          <input 
            type="range" min="10" max="100" 
            value={circleRadius} 
            onChange={(e) => setCircleRadius(Number(e.target.value))} 
            className="w-full h-2 bg-leaf-light rounded-lg appearance-none cursor-pointer accent-sakura-pink" 
          />
        </div>
        <button 
          onClick={handleConfirm} 
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Check size={20} />
          <span>確定する</span>
        </button>
      </div>
    </div>
  );
}
