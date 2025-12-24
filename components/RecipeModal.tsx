
import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { Icons } from '../constants';

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
  onSave?: (recipe: Recipe) => void;
  isSaved?: boolean;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose, onSave, isSaved }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Kích hoạt animation xuất hiện ngay sau khi component mount
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setIsVisible(false);
    // Chờ animation slide-down hoàn tất (300ms) rồi mới đóng hoàn toàn
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${isClosing ? 'pointer-events-none' : ''}`} 
      onClick={handleClose}
    >
      <div 
        className={`bg-white w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ease-in-out transform ${
          isVisible 
            ? 'translate-y-0 opacity-100 scale-100' 
            : 'translate-y-full opacity-0 sm:scale-95'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Độ cao linh hoạt cho mâm cơm dài */}
        <div className="relative min-h-[10rem] sm:min-h-[14rem] md:min-h-[16rem] bg-lime-600 flex items-end p-5 sm:p-8 pt-12 sm:pt-16">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-20"
          >
            <Icons.Close />
          </button>
          <div className="z-10 text-white w-full">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                {recipe.meal_type || 'Món ăn'}
              </span>
              <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                Độ khó: {recipe.difficulty}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight">
              {recipe.name}
            </h2>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 sm:space-y-8 no-scrollbar">
          <div>
            <p className="text-gray-600 text-sm sm:text-lg italic leading-relaxed">"{recipe.description}"</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-lime-50 rounded-2xl border border-lime-100">
             <div className="flex flex-col items-center gap-1">
                <span className="text-lime-500"><Icons.Timer /></span>
                <span className="text-[10px] sm:text-xs text-lime-800 font-bold text-center">{recipe.cooking_time} phút</span>
             </div>
             <div className="flex flex-col items-center gap-1">
                <span className="text-lime-500"><Icons.Chef /></span>
                <span className="text-[10px] sm:text-xs text-lime-800 font-bold text-center">{recipe.difficulty}</span>
             </div>
             <div className="flex flex-col items-center gap-1">
                <span className="text-lime-500"><Icons.Check /></span>
                <span className="text-[10px] sm:text-xs text-lime-800 font-bold text-center">{recipe.ingredients.length} món</span>
             </div>
             <div className="flex flex-col items-center gap-1">
                <span className="text-lime-500"><Icons.Book /></span>
                <span className="text-[10px] sm:text-xs text-lime-800 font-bold text-center">{recipe.instructions.length} bước</span>
             </div>
          </div>

          <section>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-5 bg-lime-600 rounded-full" />
              Nguyên liệu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-700 text-sm font-medium">{ing.item}</span>
                  <span className="text-lime-700 font-bold text-[11px] bg-lime-100 px-2 py-0.5 rounded-lg">{ing.amount}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-5 bg-lime-600 rounded-full" />
              Cách làm
            </h3>
            <div className="space-y-4 sm:space-y-6">
              {recipe.instructions.map((step, i) => (
                <div key={i} className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-lime-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-md shadow-lime-100">
                    {i + 1}
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed pt-0.5 sm:pt-1">{step}</p>
                </div>
              ))}
            </div>
          </section>

          {recipe.tips && recipe.tips.length > 0 && (
            <section className="bg-lime-50 p-4 sm:p-6 rounded-2xl border border-lime-100 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-lime-800 mb-3 flex items-center gap-2">
                💡 Mẹo nhỏ
              </h3>
              <ul className="space-y-2">
                {recipe.tips.map((tip, i) => (
                  <li key={i} className="text-lime-800 text-[13px] sm:text-sm flex gap-2">
                    <span className="text-lime-600">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
           {onSave && !isSaved && (
             <button 
               onClick={() => onSave(recipe)}
               className="flex-1 flex items-center justify-center gap-2 bg-lime-600 hover:bg-lime-700 text-white font-bold py-3 px-6 rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-lime-100 text-sm sm:text-base order-1 sm:order-none active:scale-95"
             >
               <Icons.Heart />
               Lưu vào Sổ tay
             </button>
           )}
           <button 
             onClick={handleClose}
             className="flex-1 py-3 px-6 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-all text-sm sm:text-base"
           >
             Đóng
           </button>
        </div>
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
