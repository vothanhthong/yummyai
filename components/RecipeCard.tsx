
import React from 'react';
import { Recipe } from '../types';
import { Icons, COLORS } from '../constants';

interface RecipeCardProps {
  recipe: Recipe;
  onSave?: (recipe: Recipe) => void;
  onDelete?: (id: string) => void;
  onView: (recipe: Recipe) => void;
  isSaved?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSave, onDelete, onView, isSaved }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3 gap-2">
          {/* Sửa đổi: Cho phép xuống dòng tối đa 2 dòng thay vì cắt cụt */}
          <h3 className="text-lg font-bold text-gray-800 leading-tight line-clamp-2 min-h-[3rem]">
            {recipe.name}
          </h3>
          <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold shrink-0">
            {recipe.meal_type || 'Bữa ăn'}
          </span>
        </div>
        
        <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
          {recipe.description}
        </p>
        
        <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-1 text-gray-500">
            <Icons.Timer />
            <span className="text-[10px] sm:text-xs font-medium">{recipe.cooking_time}p</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Icons.Chef />
            <span className="text-[10px] sm:text-xs font-medium">{recipe.difficulty}</span>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Nguyên liệu chính</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recipe.ingredients.slice(0, 4).map((ing, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                  <div className="w-1 h-1 rounded-full bg-orange-500" />
                  <span className="text-[11px] text-gray-700 truncate">{ing.item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          {onSave && !isSaved && (
            <button
              onClick={() => onSave(recipe)}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-3 rounded-xl transition-colors shadow-sm text-sm"
            >
              <Icons.Heart />
              Lưu
            </button>
          )}
          {isSaved && onDelete && (
            <button
              onClick={() => onDelete(recipe.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-500 font-bold py-2.5 px-3 rounded-xl transition-colors text-sm"
            >
              <Icons.Trash />
              Xóa
            </button>
          )}
          <button 
            onClick={() => onView(recipe)}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-3 rounded-xl transition-colors text-sm"
          >
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};
