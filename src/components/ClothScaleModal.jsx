import { useState, useRef, useEffect } from 'react';
import { Ruler, Cat, X, Info } from 'lucide-react';
import SakuraIcon from './SakuraIcon';

export default function ClothScaleModal({ imageUrl, category, dimType, onConfirm, onCancel }) {
  const [step, setStep] = useState(1); 
  const [measurePx, setMeasurePx] = useState(0); 
  const [measureMm, setMeasureMm] = useState(0); 
  const [posX, setPosX] = useState(100); 
  const [posY, setPosY] = useState(150); 
  const [faceHole, setFaceHole] = useState({ x: 150, y: 150, width: 100, height: 100 });
  const [dragMode, setDragMode] = useState(null);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setImgSize({ width: img.width, height: img.height });
    };
  }, [imageUrl]);

  const handleNext = () => {
    if (category === 'headwear' && step === 1) {
      setStep(2);
    } else {
      handleConfirm();
    }
  };

  const handleConfirm = () => {
    if (!imgRef.current) return;
    const imgRect = imgRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const imgLeft = imgRect.left - containerRect.left;
    const imgTop = imgRect.top - containerRect.top;
    
    // 計測基準 (1pxあたりのmm)
    const mmPerPx = measureMm / measurePx;
    const displayedWidth = imgRef.current.clientWidth;
    const displayedHeight = imgRef.current.clientHeight;
    
    // 常に「画像全体の横幅が実寸何mmか」を計算して返す
    // (DressUpScreenが横幅ベースでスケールを計算するため)
    const totalMmWidth = displayedWidth * mmPerPx;

    console.log("--- [Debug] Cloth Image Scale ---");
    console.log(`計測方向: ${dimType}`);
    console.log(`計測した長さ: ${measureMm}mm (${measurePx}px)`);
    console.log(`1pxあたりのmm: ${mmPerPx.toFixed(4)}mm/px`);
    console.log(`服画像の横幅(表示px): ${displayedWidth}px`);
    console.log(`服画像の全横幅(推定mm): ${totalMmWidth.toFixed(2)}mm`);

    const faceHoleData = category === 'headwear' ? {
      x: ((faceHole.x - imgLeft) / imgRect.width) * 100,
      y: ((faceHole.y - imgTop) / imgRect.height) * 100,
      width: (faceHole.width / imgRect.width) * 100,
      height: (faceHole.height / imgRect.height) * 100,
    } : null;

    onConfirm({ totalMm: totalMmWidth, measureMm, faceHole: faceHoleData });
  };

  const handleFaceDrag = (e) => {
    if (!dragMode || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (dragMode === 'move') {
      setFaceHole(prev => ({ ...prev, x: mx, y: my }));
    } else {
      const isWest = dragMode.includes('w');
      const isEast = dragMode.includes('e');
      const isNorth = dragMode.includes('n');
      const isSouth = dragMode.includes('s');
      setFaceHole(prev => {
        let l = prev.x - prev.width / 2; let r = prev.x + prev.width / 2;
        let t = prev.y - prev.height / 2; let b = prev.y + prev.height / 2;
        if (isWest) l = mx; if (isEast) r = mx; if (isNorth) t = my; if (isSouth) b = my;
        return { x: (l + r) / 2, y: (t + b) / 2, width: Math.abs(r - l), height: Math.abs(b - t) };
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-sakura-deep/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] border border-sakura-pink/20">
        
        <div className="p-6 border-b border-sakura-pink/10 flex justify-between items-center bg-sakura-light/30">
          <h3 className="font-bold text-eye-safe-text flex items-center gap-2">
            {step === 1 ? <Ruler className="text-sakura-pink" size={20} /> : <Cat className="text-leaf-green" size={20} />}
            {step === 1 ? `サイズ基準を設定 (${dimType === 'width' ? '横幅' : '高さ'})` : '顔が出る位置を指定'}
          </h3>
          <button onClick={onCancel} className="text-eye-safe-text/30 hover:text-sakura-pink transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          <div 
            ref={containerRef}
            className="flex-grow bg-leaf-light relative overflow-hidden flex items-center justify-center min-h-[400px]"
            onMouseMove={handleFaceDrag}
            onMouseUp={() => setDragMode(null)}
          >
            <img 
              ref={imgRef}
              src={imageUrl} 
              className="max-w-[90%] max-h-[90%] object-contain select-none shadow-xl rounded-lg" 
            />
            
            {step === 1 && (
              <div 
                style={{ 
                  width: dimType === 'width' ? `${measurePx}px` : '4px',
                  height: dimType === 'height' ? `${measurePx}px` : '4px',
                  left: `${posX}px`, top: `${posY}px`,
                  transform: dimType === 'width' ? 'translate(0, -50%)' : 'translate(-50%, 0)'
                }}
                className="absolute bg-sakura-pink shadow-lg flex items-center justify-between cursor-move"
                onMouseDown={(e) => {
                  if (e.target !== e.currentTarget) return;
                  const sx = e.clientX - posX; const sy = e.clientY - posY;
                  const move = (me) => { setPosX(me.clientX - sx); setPosY(me.clientY - sy); };
                  const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                  window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
                }}
              >
                {/* ハンドル1用ガイド破線 */}
                <div 
                  className={`absolute border-sakura-pink/80 border-dashed pointer-events-none ${
                    dimType === 'width' ? 'h-[2000px] border-l -top-[1000px]' : 'w-[2000px] border-t -left-[1000px]'
                  }`} 
                  style={{ [dimType === 'width' ? 'left' : 'top']: 0 }}
                />

                {/* ハンドル1 (左または上) */}
                <div 
                  className={`w-8 h-8 bg-white border-2 border-sakura-pink rounded-full shadow-xl hover:scale-110 transition-transform z-10 flex items-center justify-center ${
                    dimType === 'width' ? '-ml-4 cursor-ew-resize' : '-mt-4 cursor-ns-resize absolute top-0 left-1/2 -translate-x-1/2'
                  }`}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const start = dimType === 'width' ? e.clientX : e.clientY;
                    const startPx = measurePx; const startPos = dimType === 'width' ? posX : posY;
                    const move = (me) => {
                      const delta = (dimType === 'width' ? me.clientX : me.clientY) - start;
                      const newVal = Math.max(20, startPx - delta);
                      if (newVal > 20) { 
                        setMeasurePx(newVal); 
                        if (dimType === 'width') setPosX(startPos + delta); else setPosY(startPos + delta); 
                      }
                    };
                    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
                  }}
                >
                   <div className="w-1.5 h-1.5 bg-sakura-pink rounded-full" />
                </div>

                <div className={`absolute ${dimType === 'width' ? '-top-10 left-1/2 -translate-x-1/2' : 'top-1/2 -left-32 -translate-y-1/2'} bg-sakura-pink text-white text-[10px] px-3 py-1 rounded-full font-bold whitespace-nowrap shadow-md pointer-events-none z-20`}>
                  ここを {measureMm}mm に設定 <SakuraIcon size={12} className="ml-1" />
                </div>

                {/* ハンドル2用ガイド破線 */}
                <div 
                  className={`absolute border-sakura-pink/80 border-dashed pointer-events-none ${
                    dimType === 'width' ? 'h-[2000px] border-l -top-[1000px]' : 'w-[2000px] border-t -left-[1000px]'
                  }`} 
                  style={{ [dimType === 'width' ? 'right' : 'bottom']: 0 }}
                />

                {/* ハンドル2 (右または下) */}
                <div 
                  className={`w-8 h-8 bg-white border-2 border-sakura-pink rounded-full shadow-xl hover:scale-110 transition-transform z-10 flex items-center justify-center ${
                    dimType === 'width' ? '-mr-4 cursor-ew-resize' : '-mb-4 cursor-ns-resize absolute bottom-0 left-1/2 -translate-x-1/2'
                  }`}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const start = dimType === 'width' ? e.clientX : e.clientY;
                    const startPx = measurePx;
                    const move = (me) => { 
                      setMeasurePx(Math.max(20, startPx + ((dimType === 'width' ? me.clientX : me.clientY) - start))); 
                    };
                    const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
                  }}
                >
                  <div className="w-1.5 h-1.5 bg-sakura-pink rounded-full" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div
                style={{
                  width: `${faceHole.width}px`, height: `${faceHole.height}px`,
                  left: `${faceHole.x}px`, top: `${faceHole.y}px`,
                  position: 'absolute', transform: 'translate(-50%, -50%)',
                }}
                className="bg-leaf-green/20 border-2 border-leaf-green rounded-full cursor-move flex items-center justify-center shadow-xl backdrop-blur-[1px]"
                onMouseDown={() => setDragMode('move')}
              >
                <div className="text-[10px] font-bold text-leaf-deep bg-white/80 px-2 py-0.5 rounded-full">顔の位置</div>
                {['nw', 'ne', 'sw', 'se'].map(d => (
                  <div
                    key={d}
                    className={`absolute w-4 h-4 bg-white border-2 border-leaf-green rounded-full cursor-${d}-resize ${d.includes('n') ? 'top-0' : 'bottom-0'} ${d.includes('w') ? 'left-0' : 'right-0'} -translate-x-1/2 -translate-y-1/2 shadow-sm`}
                    onMouseDown={(e) => { e.stopPropagation(); setDragMode(d); }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="w-full md:w-80 p-8 bg-white border-l border-sakura-pink/10 flex flex-col gap-8">
            <div className="bg-sakura-light/50 p-4 rounded-2xl text-[11px] text-sakura-deep leading-relaxed font-medium flex gap-2">
              <Info size={14} className="shrink-0" />
              <span>
                {step === 1 ? (
                  <>ピンクの破線を服の端に合わせて、実寸を入力してね<SakuraIcon size={12} className="ml-1" /></>
                ) : (
                  <>グリーンの円を、被り物の<b>「顔が出る穴」</b>に合わせてね🌿</>
                )}
              </span>
            </div>
            
            {step === 1 && (
              <div>
                <label className="block text-[10px] font-bold text-eye-safe-text/40 mb-3 uppercase tracking-widest">Real Size (mm)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    value={measureMm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMeasureMm(val === '' ? '' : Number(val));
                    }}
                    className="w-full border-2 border-sakura-light rounded-xl p-4 text-xl font-bold text-eye-safe-text focus:border-sakura-pink focus:outline-none transition-colors"
                  />
                  <span className="font-bold text-sakura-deep">mm</span>
                </div>
              </div>
            )}

            <div className="mt-auto space-y-4">
              <button 
                onClick={handleNext}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4"
              >
                <span>{category === 'headwear' && step === 1 ? '次へ：顔の位置指定' : 'この内容で確定'}</span>
              </button>
              {step === 2 && (
                <button 
                  onClick={() => setStep(1)}
                  className="w-full bg-leaf-light text-leaf-deep font-bold py-3 rounded-xl hover:bg-leaf-green/20 transition-all text-sm"
                >
                  戻る
                </button>
              )}
              <button 
                onClick={onCancel}
                className="w-full text-eye-safe-text/30 font-bold py-2 hover:text-eye-safe-text transition-all text-xs"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
