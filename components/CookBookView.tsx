
import React, { useState, useMemo } from 'react';
import { Recipe } from '../types';
import { RecipeCard } from './RecipeCard';
import { Icons } from '../constants';

interface CookBookViewProps {
  recipes: Recipe[];
  onDelete: (id: string) => void;
  onView: (recipe: Recipe) => void;
}

type FilterType = 'all' | 'Sáng' | 'Trưa' | 'Tối' | 'Ăn vặt';
type DifficultyFilter = 'all' | 'Dễ' | 'Trung bình' | 'Khó';

// Custom Dropdown Component
interface DropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  colorScheme: 'lime' | 'olive';
}

const CustomDropdown: React.FC<DropdownProps> = ({ value, options, onChange, colorScheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedLabel = options.find(opt => opt.value === value)?.label || '';
  
  const colors = colorScheme === 'lime' 
    ? {
        bg: 'bg-lime-50/50',
        border: 'border-lime-200',
        text: 'text-lime-800',
        hoverBg: 'hover:bg-lime-100',
        selectedBg: 'bg-lime-100',
        icon: 'text-lime-600',
        focusRing: 'ring-lime-500'
      }
    : {
        bg: 'bg-green-50/50',
        border: 'border-green-200',
        text: 'text-green-800',
        hoverBg: 'hover:bg-green-100',
        selectedBg: 'bg-green-100',
        icon: 'text-green-600',
        focusRing: 'ring-green-500'
      };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between ${colors.bg} border ${colors.border} ${colors.text} px-4 py-3 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 ${colors.focusRing} transition-all cursor-pointer`}
      >
        <span>{selectedLabel}</span>
        <div className={`${colors.icon} transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <Icons.ChevronDown />
        </div>
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[50]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 z-[51] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-all ${
                  value === option.value 
                    ? `${colors.selectedBg} ${colors.text}` 
                    : `text-gray-600 ${colors.hoverBg}`
                }`}
              >
                {option.label}
                {value === option.value && (
                  <span className={`ml-auto ${colors.icon}`}>
                    <Icons.Check />
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const CookBookView: React.FC<CookBookViewProps> = ({ recipes, onDelete, onView }) => {
  const [activeType, setActiveType] = useState<FilterType>('all');
  const [activeDiff, setActiveDiff] = useState<DifficultyFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State cho việc xác nhận xóa
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  const mealTypeOptions = [
    { value: 'all', label: 'Tất cả bữa ăn' },
    { value: 'Sáng', label: 'Bữa Sáng' },
    { value: 'Trưa', label: 'Bữa Trưa' },
    { value: 'Tối', label: 'Bữa Tối' },
    { value: 'Ăn vặt', label: 'Ăn vặt' },
  ];

  const difficultyOptions = [
    { value: 'all', label: 'Tất cả độ khó' },
    { value: 'Dễ', label: 'Độ khó: Dễ' },
    { value: 'Trung bình', label: 'Độ khó: Trung bình' },
    { value: 'Khó', label: 'Độ khó: Khó' },
  ];

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchType = activeType === 'all' || recipe.meal_type?.includes(activeType);
      const matchDiff = activeDiff === 'all' || recipe.difficulty === activeDiff;
      const matchSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchDiff && matchSearch;
    });
  }, [recipes, activeType, activeDiff, searchQuery]);

  const confirmDelete = () => {
    if (recipeToDelete) {
      onDelete(recipeToDelete.id);
      setRecipeToDelete(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6">
      {/* Delete Confirmation Modal */}
      {recipeToDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto text-red-500">
              <Icons.Trash />
            </div>
            <h3 className="text-xl font-black text-gray-800 text-center mb-2">Xác nhận xóa?</h3>
            <p className="text-gray-500 text-center text-sm mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa món <span className="font-bold text-gray-800">"{recipeToDelete.name}"</span> khỏi sổ tay không?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setRecipeToDelete(null)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all text-sm"
              >
                Hủy
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-100 text-sm"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800">Sổ tay của bạn 📖</h1>
            <p className="text-gray-500 mt-1">Lưu trữ tất cả các món ăn yêu thích tại đây.</p>
          </div>
          <div className="bg-lime-50 text-lime-700 px-4 py-2 rounded-2xl font-bold border border-lime-100 text-sm self-start">
            {recipes.length} món đã lưu
          </div>
        </div>

        {/* Filters Section - Custom Dropdowns */}
        <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Icons.Search />
              </span>
              <input 
                type="text"
                placeholder="Tìm tên món ăn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 focus:bg-white transition-all"
              />
            </div>

            {/* Custom Select Filters Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Meal Type Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Bữa ăn</label>
                <CustomDropdown
                  value={activeType}
                  options={mealTypeOptions}
                  onChange={(value) => setActiveType(value as FilterType)}
                  colorScheme="lime"
                />
              </div>

              {/* Difficulty Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Độ khó</label>
                <CustomDropdown
                  value={activeDiff}
                  options={difficultyOptions}
                  onChange={(value) => setActiveDiff(value as DifficultyFilter)}
                  colorScheme="olive"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="bg-white rounded-[40px] p-16 text-center border-2 border-dashed border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-lime-50 rounded-full flex items-center justify-center mb-6 text-lime-200">
             <Icons.Book />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-2">Chưa có công thức nào</h3>
          <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
            Hãy bắt đầu trò chuyện với YummyAI để khám phá những món ngon và lưu lại đây nhé!
          </p>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-gray-300 mb-4 flex justify-center">
            <Icons.Search className="w-12 h-12" />
          </div>
          <p className="text-gray-500 font-medium">Không tìm thấy món ăn phù hợp với bộ lọc.</p>
          <button 
            onClick={() => { setActiveType('all'); setActiveDiff('all'); setSearchQuery(''); }}
            className="mt-4 text-lime-600 font-bold hover:underline"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          {filteredRecipes.map(recipe => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onDelete={() => setRecipeToDelete(recipe)} 
              onView={onView}
              isSaved={true} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
