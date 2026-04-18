import { useState, useRef } from 'react';
import { Info, Check } from 'lucide-react';
import SakuraIcon from './SakuraIcon';

export default function ProportionScreen({ imageUrl, scaleRatio, onConfirmed }) {
  const [head, setHead] = useState({ x: 150, y: 100, width: 80, height: 80 });
  const [body, setBody] = useState({ x: 150, y: 250, width: 100, height: 120 });
  
  const [dragMode, setDragMode] = useState(null); 
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!dragMode || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const [target, action] = dragMode.split('-');
    const isHead = target === 'head';
    const item = isHead ? head : body;
    const setItem = isHead ? setHead : setBody;

    if (action === 'move') {
      setItem({ ...item, x: mouseX, y: mouseY });
      return;
    }

    let leftEdge = item.x - item.width / 2;
    let rightEdge = item.x + item.width / 2;
    let topEdge = item.y - item.height / 2;
    let bottomEdge = item.y + item.height / 2;

    const MIN_SIZE = 20;

    if (action.includes('w')) leftEdge = Math.min(mouseX, rightEdge - MIN_SIZE);
    if (action.includes('e')) rightEdge = Math.max(mouseX, leftEdge + MIN_SIZE);
    if (action.includes('n')) topEdge = Math.min(mouseY, bottomEdge - MIN_SIZE);
    if (action.includes('s')) bottomEdge = Math.max(mouseY, topEdge + MIN_SIZE);

    setItem({
      ...item,
      x: (leftEdge + rightEdge) / 2,
      y: (topEdge + bottomEdge) / 2,
      width: rightEdge - leftEdge,
      height: bottomEdge - topEdge,
    });
  };

  const handleMouseUp = () => setDragMode(null);

  const handleConfirm = () => {
    if (!containerRef.current) return;
    
    // 画像が実際に表示されている幅を取得（コンテナ内のimg要素）
    const imgElement = containerRef.current.querySelector('img');
    const displayedWidth = imgElement ? imgElement.clientWidth : containerRef.current.clientWidth;
    const displayedHeight = imgElement ? imgElement.clientHeight : containerRef.current.clientHeight;

    // 1pxあたりのmmを算出 (全体のmm ÷ 表示ピクセル幅)
    const mmPerPx = scaleRatio / displayedWidth;

    onConfirmed({
      headWidthMm: head.width * mmPerPx,
      headHeightMm: head.height * mmPerPx,
      bodyWidthMm: body.width * mmPerPx,
      bodyHeightMm: body.height * mmPerPx,
    });
  };

  const renderHandles = (targetName, borderColor) => {
    const handles = [
      { dir: 'nw', cursor: 'nwse-resize', pos: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2' },
      { dir: 'ne', cursor: 'nesw-resize', pos: 'top-0 right-0 translate-x-1/2 -translate-y-1/2' },
      { dir: 'se', cursor: 'nwse-resize', pos: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2' },
      { dir: 'sw', cursor: 'nesw-resize', pos: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2' },
    ];

    return handles.map((h) => (
      <div
        key={h.dir}
        className={`absolute w-5 h-5 bg-white border-2 ${borderColor} rounded-full cursor-${h.cursor} ${h.pos} hover:scale-125 transition-transform z-10 shadow-md`}
        onMouseDown={(e) => {
          e.stopPropagation();
          setDragMode(`${targetName}-${h.dir}`);
        }}
      />
    ));
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="bg-sakura-light/50 border border-sakura-pink/30 px-6 py-3 rounded-2xl mb-6 flex items-center gap-3">
        <Info className="text-sakura-deep" size={20} />
        <p className="text-sakura-deep text-sm font-bold">
          枠をドラッグして、ぬいぐるみの「頭」と「体」のサイズを合わせてね<SakuraIcon size={20} className="ml-1" />
        </p>
      </div>

      <div 
        ref={containerRef}
        className="w-full max-w-3xl h-[500px] bg-leaf-light relative overflow-hidden flex items-center justify-center select-none rounded-3xl border border-leaf-green/30 shadow-inner mb-8"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {imageUrl && <img src={imageUrl} className="max-w-[95%] max-h-[95%] pointer-events-none rounded-lg shadow-sm" />}
        
        <div
          style={{
            width: `${head.width}px`, height: `${head.height}px`,
            left: `${head.x}px`, top: `${head.y}px`,
            position: 'absolute', transform: 'translate(-50%, -50%)',
          }}
          className="bg-sakura-pink/30 rounded-full border-2 border-sakura-pink cursor-move flex items-center justify-center group shadow-xl backdrop-blur-[2px]"
          onMouseDown={() => setDragMode('head-move')}
        >
          <span className="text-sakura-deep font-black text-sm pointer-events-none drop-shadow-sm">頭</span>
          {renderHandles('head', 'border-sakura-pink')}
        </div>

        <div
          style={{
            width: `${body.width}px`, height: `${body.height}px`,
            left: `${body.x}px`, top: `${body.y}px`,
            position: 'absolute', transform: 'translate(-50%, -50%)',
          }}
          className="bg-leaf-green/30 rounded-2xl border-2 border-leaf-green cursor-move flex items-center justify-center group shadow-xl backdrop-blur-[2px]"
          onMouseDown={() => setDragMode('body-move')}
        >
          <span className="text-leaf-deep font-black text-sm pointer-events-none drop-shadow-sm">体</span>
          {renderHandles('body', 'border-leaf-green')}
        </div>
      </div>

      <button 
        onClick={handleConfirm} 
        className="btn-primary flex items-center gap-2 px-10"
      >
        <Check size={24} strokeWidth={2.5} />
        <span>サイズ測定を完了する</span>
      </button>
    </div>
  );
}
