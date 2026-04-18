import { Upload } from 'lucide-react';
import SakuraIcon from './SakuraIcon';

export default function UploadScreen({ onImageSelected }) {
  
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onImageSelected(imageUrl);
    }
  };

  return (
    <div className="bg-leaf-light w-full max-w-2xl flex flex-col items-center justify-center relative rounded-3xl border-2 border-dashed border-leaf-green h-[500px] mx-auto transition-colors hover:bg-leaf-light/80">
      <label className="w-40 h-40 border-8 border-sakura-pink rounded-full flex items-center justify-center cursor-pointer hover:bg-sakura-light transition-all shadow-lg group">
        <Upload className="text-sakura-pink group-hover:scale-110 transition-transform" size={64} strokeWidth={2.5} />
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleUpload} 
        />
      </label>
      <div className="mt-10 text-center">
        <p className="text-sakura-deep font-bold text-xl mb-2">
          写真をアップロードしてね！
        </p>
        <p className="text-eye-safe-text/70 text-sm leading-relaxed px-8">
          ※必ず<span className="text-leaf-deep font-bold">「一円玉」</span>をぬいぐるみの横に置いて<br/>一緒に撮影した写真を使ってください<SakuraIcon size={22} className="ml-1" />
        </p>
      </div>
    </div>
  );
}