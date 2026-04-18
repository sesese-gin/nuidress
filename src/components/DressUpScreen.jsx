import { useState, useRef } from 'react';
import { removeBackground } from '@imgly/background-removal';
import { 
  Shirt, Cat, Flower, MoveHorizontal, MoveVertical, 
  Sparkles, RotateCcw, Plus, Info 
} from 'lucide-react';
import ClothScaleModal from './ClothScaleModal';
import SakuraIcon from './SakuraIcon';

export default function DressUpScreen({ baseImage, scaleRatio, onReset }) {
  const [placedClothes, setPlacedClothes] = useState([]);
  const [draggedClothId, setDraggedClothId] = useState(null);
  const canvasRef = useRef(null);
  const baseImgRef = useRef(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false); 
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false); 
  
  const [clothCategory, setClothCategory] = useState('poncho'); 
  const [dimType, setDimType] = useState('width'); 

  // ふくらみ補正係数 (UIからは消すが、内部的なデフォルト値として1.1を維持)
  const fitAdjustment = 1.1;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    setPreviewImage(null);

    try {
      const imageBlob = await removeBackground(file);
      const transparentUrl = URL.createObjectURL(imageBlob);
      setPreviewImage(transparentUrl);
      setIsCategoryModalOpen(true);
    } catch (error) {
      console.error("背景の透過に失敗しました:", error);
      alert("画像の処理に失敗しました。別の画像でお試しください。");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCategoryConfirm = () => {
    setIsCategoryModalOpen(false);
    setIsScaleModalOpen(true);
  };

  /**
   * 服を追加する時の処理
   */
  const handleScaleConfirm = ({ totalMm, faceHole }) => {
    if (!baseImgRef.current) return;

    const baseDisplayedWidth = baseImgRef.current.clientWidth;
    const baseTotalMm = scaleRatio; 

    // 服のサイズ ÷ ぬいぐるみのサイズ で比率を出す
    const scaleFactor = totalMm / baseTotalMm;
    const canvasWidth = baseDisplayedWidth * scaleFactor;

    const newCloth = {
      instanceId: Date.now(),
      image: previewImage,
      pixelWidth: canvasWidth, 
      x: 150,
      y: 150,
      visible: true,
      category: clothCategory,
      faceHole: faceHole,
    };
    
    setPlacedClothes([...placedClothes, newCloth]);
    setIsScaleModalOpen(false); 
    setPreviewImage(null); 
  };

  const toggleVisibility = (id) => {
    setPlacedClothes(prev => prev.map(c => 
      c.instanceId === id ? { ...c, visible: !c.visible } : c
    ));
  };

  const handleCanvasMouseMove = (e) => {
    if (!draggedClothId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setPlacedClothes(prev => prev.map(c => 
      c.instanceId === draggedClothId 
        ? { ...c, x: e.clientX - rect.left, y: e.clientY - rect.top } 
        : c
    ));
  };

  return (
    <div className="w-full flex flex-col items-center">
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-sakura-deep/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-sakura-pink/30">
            <h3 className="text-xl font-bold mb-6 text-eye-safe-text border-b border-sakura-pink/20 pb-4 flex items-center gap-2">
              <Shirt className="text-sakura-pink" />
              アイテムの種類を選択
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-eye-safe-text/60 mb-3 ml-1 uppercase tracking-wider">服の種類</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'poncho', label: 'ポンチョ', Icon: Shirt, color: 'text-sakura-pink' },
                    { id: 'headwear', label: '被り物', Icon: Cat, color: 'text-leaf-green' },
                    { id: 'hat', label: '帽子', Icon: Flower, color: 'text-sakura-deep' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setClothCategory(cat.id)}
                      className={`p-4 border-2 rounded-2xl flex flex-col items-center transition-all ${
                        clothCategory === cat.id ? 'border-sakura-pink bg-sakura-light/50' : 'border-leaf-light hover:border-leaf-green/30'
                      }`}
                    >
                      <cat.Icon className={`${cat.color} mb-2`} size={32} />
                      <span className="text-xs font-bold text-eye-safe-text">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-eye-safe-text/60 mb-3 ml-1 uppercase tracking-wider">サイズ指定の方法</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'width', label: '横幅で指定', Icon: MoveHorizontal },
                    { id: 'height', label: '高さで指定', Icon: MoveVertical },
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setDimType(type.id)}
                      className={`p-4 border-2 rounded-2xl flex items-center justify-center gap-3 transition-all ${
                        dimType === type.id ? 'border-leaf-green bg-leaf-light/50' : 'border-sakura-light hover:border-sakura-pink/30'
                      }`}
                    >
                      <type.Icon className="text-leaf-deep" size={24} />
                      <span className="text-xs font-bold text-eye-safe-text">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleCategoryConfirm}
              className="btn-primary w-full mt-8 flex items-center justify-center gap-2 py-4"
            >
              <span>次へ進む</span>
            </button>
          </div>
        </div>
      )}

      {isScaleModalOpen && previewImage && (
        <ClothScaleModal 
          imageUrl={previewImage}
          baseScaleRatio={scaleRatio}
          category={clothCategory}
          dimType={dimType}
          onConfirm={handleScaleConfirm}
          onCancel={() => {
            setIsScaleModalOpen(false);
            setPreviewImage(null);
          }}
        />
      )}

      <div className="bg-sakura-light/50 border border-sakura-pink/30 px-6 py-2 rounded-full mb-6 flex items-center gap-3">
        <Info className="text-sakura-deep" size={18} />
        <p className="text-sakura-deep text-sm font-bold">
          服の画像をアップロードして、メジャーを引いて寸法を指定してね<SakuraIcon size={18} className="ml-1" />
        </p>
      </div>

      <div className="w-full max-w-5xl flex gap-6 h-[550px]">
        
        <div 
          ref={canvasRef}
          className="flex-grow bg-leaf-light relative overflow-hidden flex items-center justify-center select-none rounded-3xl border border-leaf-green/30 shadow-inner"
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={() => setDraggedClothId(null)}
          onMouseLeave={() => setDraggedClothId(null)}
        >
          {baseImage && (
            <img 
              ref={baseImgRef}
              src={baseImage} 
              className="max-w-[95%] max-h-[95%] pointer-events-none rounded-lg shadow-sm" 
            />
          )}
          
          {placedClothes.map((cloth) => (
            cloth.visible && (
              <img
                key={cloth.instanceId}
                src={cloth.image}
                draggable="false"
                style={{
                  left: `${cloth.x}px`, top: `${cloth.y}px`, 
                  width: `${cloth.pixelWidth * fitAdjustment}px`, 
                  position: 'absolute', transform: 'translate(-50%, -50%)',
                  zIndex: cloth.category === 'headwear' ? 5 : 10,
                  WebkitMaskImage: cloth.category === 'headwear' && cloth.faceHole 
                    ? `radial-gradient(ellipse ${cloth.faceHole.width / 2}% ${cloth.faceHole.height / 2}% at ${cloth.faceHole.x}% ${cloth.faceHole.y}%, transparent 98%, black 100%)`
                    : 'none',
                  maskImage: cloth.category === 'headwear' && cloth.faceHole 
                    ? `radial-gradient(ellipse ${cloth.faceHole.width / 2}% ${cloth.faceHole.height / 2}% at ${cloth.faceHole.x}% ${cloth.faceHole.y}%, transparent 98%, black 100%)`
                    : 'none',
                }}
                className="cursor-move hover:scale-[1.02] transition-transform drop-shadow-2xl"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggedClothId(cloth.instanceId);
                }}
              />
            )
          ))}
        </div>

        <div className="w-80 bg-white p-6 flex flex-col rounded-3xl shadow-lg border border-sakura-pink/20 overflow-y-auto">
          <h3 className="font-bold text-eye-safe-text text-lg mb-6 border-b border-sakura-pink/20 pb-3 flex items-center gap-2">
            <Plus className="text-sakura-deep" size={20} />
            服を追加
          </h3>
          
          <div className="mb-6">
            {isProcessing ? (
              <div className="border-2 border-dashed border-sakura-pink bg-sakura-light/50 rounded-2xl p-8 text-center animate-pulse">
                <Sparkles className="text-sakura-pink mx-auto mb-3" size={32} />
                <p className="text-xs font-bold text-sakura-deep">AIが背景を削除中...</p>
              </div>
            ) : (
              <label className="border-2 border-dashed border-leaf-green bg-leaf-light/50 rounded-2xl p-8 text-center block cursor-pointer hover:bg-leaf-light transition-all group">
                <Shirt className="text-leaf-green mx-auto mb-3 group-hover:scale-110 transition-transform" size={40} />
                <span className="text-sm font-bold text-leaf-deep block">服の画像を選ぶ</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="flex-grow flex flex-col min-h-0">
            <h4 className="text-[10px] font-black text-eye-safe-text/40 mb-3 uppercase tracking-[0.2em] shrink-0">Closet</h4>
            {placedClothes.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-eye-safe-text/20 border-2 border-dashed border-sakura-pink/5 rounded-2xl p-4">
                <Shirt size={48} className="mb-2 opacity-10" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No items yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-1 custom-scrollbar">
                {placedClothes.map((cloth) => (
                  <button
                    key={cloth.instanceId}
                    onClick={() => toggleVisibility(cloth.instanceId)}
                    className={`relative aspect-square border-2 rounded-xl overflow-hidden p-1 transition-all hover:scale-105 shadow-sm shrink-0 ${
                      cloth.visible 
                        ? 'border-sakura-pink bg-sakura-light' 
                        : 'border-leaf-light bg-gray-50 opacity-40 grayscale'
                    }`}
                  >
                    <img src={cloth.image} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-sakura-pink/10">
            <button 
              onClick={onReset} 
              className="w-full flex items-center justify-center gap-2 text-eye-safe-text/40 hover:text-sakura-deep font-bold py-2 transition-colors text-xs"
            >
              <RotateCcw size={14} />
              最初からやり直す
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
