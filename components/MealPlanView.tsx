import React, { useState, useEffect } from "react";
import { Recipe, MealPlan, MealType } from "../types";
import { Icons } from "../constants";
import {
  getMealPlans,
  addMealToSlot,
  removeMealFromSlot,
  getWeekRange,
  formatDateVN,
  clearWeekMealPlan,
} from "../services/supabaseMealPlanService";
import { generateMealPlan } from "../services/openRouterService";

interface MealPlanViewProps {
  cookbook: Recipe[];
  onViewRecipe: (recipe: Recipe) => void;
}

const MEAL_CONFIG: { type: MealType; label: string; icon: string }[] = [
  { type: "breakfast", label: "Bữa sáng", icon: "🌅" },
  { type: "lunch", label: "Bữa trưa", icon: "🌞" },
  { type: "dinner", label: "Bữa tối", icon: "🌙" },
];

export const MealPlanView: React.FC<MealPlanViewProps> = ({
  cookbook,
  onViewRecipe,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPicker, setShowPicker] = useState<{
    date: string;
    mealType: MealType;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPreferences, setAiPreferences] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Load meal plans for current week
  useEffect(() => {
    loadMealPlans();
  }, [currentWeekStart]);

  const loadMealPlans = async () => {
    setIsLoading(true);
    const { start, end } = getWeekRange(currentWeekStart);
    const plans = await getMealPlans(start, end);
    setMealPlans(plans);
    setIsLoading(false);
  };

  // Get days of the current week
  const getWeekDays = (): string[] => {
    const { start } = getWeekRange(currentWeekStart);
    const days: string[] = [];
    const startDate = new Date(start);
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };

  // Navigate weeks
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToToday = () => {
    setCurrentWeekStart(new Date());
  };

  // Get meal for a specific day and type
  const getMealForSlot = (date: string, mealType: MealType): MealPlan | undefined => {
    return mealPlans.find((m) => m.date === date && m.meal_type === mealType);
  };

  // Add meal to slot
  const handleAddMeal = async (recipe: Recipe) => {
    if (!showPicker) return;
    try {
      const newMeal = await addMealToSlot(showPicker.date, showPicker.mealType, recipe);
      setMealPlans((prev) => [...prev.filter(
        (m) => !(m.date === showPicker.date && m.meal_type === showPicker.mealType)
      ), newMeal]);
      setShowPicker(null);
      setSearchQuery("");
    } catch (error) {
      console.error("Error adding meal:", error);
    }
  };

  // Remove meal from slot
  const handleRemoveMeal = async (meal: MealPlan) => {
    try {
      await removeMealFromSlot(meal.id);
      setMealPlans((prev) => prev.filter((m) => m.id !== meal.id));
      setExpandedMeal(null);
    } catch (error) {
      console.error("Error removing meal:", error);
    }
  };

  // Filter recipes for picker
  const filteredRecipes = cookbook.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // AI Generate meal plan
  const handleAIGenerate = async () => {
    setIsGeneratingAI(true);
    setShowAIModal(false);
    try {
      const result = await generateMealPlan(aiPreferences || undefined);
      if (result?.meals) {
        // Add each meal to the plan
        for (const meal of result.meals) {
          try {
            const mealType = meal.mealType as MealType;
            await addMealToSlot(meal.date, mealType, meal.recipe);
          } catch (e) {
            console.error("Error adding AI meal:", e);
          }
        }
        // Reload plans
        await loadMealPlans();
      }
    } catch (error) {
      console.error("AI generation failed:", error);
    }
    setIsGeneratingAI(false);
    setAiPreferences("");
  };

  // Clear week meal plan
  const handleClearWeek = async () => {
    const { start, end } = getWeekRange(currentWeekStart);
    try {
      await clearWeekMealPlan(start, end);
      setMealPlans([]);
      setShowClearConfirm(false);
    } catch (error) {
      console.error("Error clearing week:", error);
    }
  };

  const weekDays = getWeekDays();
  const { start, end } = getWeekRange(currentWeekStart);
  const weekLabel = `${new Date(start).getDate()}/${new Date(start).getMonth() + 1} - ${new Date(end).getDate()}/${new Date(end).getMonth() + 1}`;

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-800">
            Thực đơn tuần 📅
          </h1>
          <p className="text-gray-500 mt-1">Lên kế hoạch bữa ăn cho cả tuần</p>
        </div>
        <div className="flex gap-2">
          {mealPlans.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
            >
              <Icons.Trash />
              <span className="hidden sm:inline">Xóa tuần</span>
            </button>
          )}
          <button
            onClick={() => setShowAIModal(true)}
            disabled={isGeneratingAI}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingAI ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang tạo...</span>
              </>
            ) : (
              <>
                <span>🪄</span>
                <span>AI lên thực đơn</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousWeek}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <p className="font-bold text-gray-800">{weekLabel}</p>
            <button
              onClick={goToToday}
              className="text-xs text-orange-500 font-medium hover:underline"
            >
              Hôm nay
            </button>
          </div>
          <button
            onClick={goToNextWeek}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : (
        /* Days List */
        <div className="space-y-4">
          {weekDays.map((dateStr) => {
            const isToday = dateStr === new Date().toISOString().split("T")[0];
            return (
              <div
                key={dateStr}
                className={`bg-white rounded-3xl shadow-sm border-2 ${
                  isToday ? "border-orange-300 bg-orange-50" : "border-gray-100"
                } overflow-hidden`}
              >
                {/* Day Header */}
                <div className={`px-4 py-3 border-b ${isToday ? "border-orange-200 bg-orange-100" : "border-gray-50 bg-gray-50"}`}>
                  <p className={`font-bold ${isToday ? "text-orange-600" : "text-gray-700"}`}>
                    {formatDateVN(dateStr)}
                    {isToday && <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Hôm nay</span>}
                  </p>
                </div>

                {/* Meal Slots */}
                <div className="p-3 space-y-2">
                  {MEAL_CONFIG.map(({ type, label, icon }) => {
                    const meal = getMealForSlot(dateStr, type);
                    const isExpanded = expandedMeal === `${dateStr}-${type}`;

                    return (
                      <div key={type}>
                        {meal ? (
                          /* Filled Meal Card */
                          <div
                            className={`rounded-2xl border border-orange-100 bg-orange-50/50 overflow-hidden transition-all ${
                              isExpanded ? "" : "cursor-pointer hover:bg-orange-100/50"
                            }`}
                          >
                            <div
                              onClick={() => setExpandedMeal(isExpanded ? null : `${dateStr}-${type}`)}
                              className="flex items-center gap-3 p-3"
                            >
                              <span className="text-lg">{icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-orange-600 font-medium">{label}</p>
                                <p className="font-bold text-gray-800 truncate">{meal.recipe_data.name}</p>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Icons.Timer />
                                <span>{meal.recipe_data.cooking_time} phút</span>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <div className="px-3 pb-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {meal.recipe_data.description}
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => onViewRecipe(meal.recipe_data)}
                                    className="flex-1 py-2 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-all"
                                  >
                                    Xem chi tiết
                                  </button>
                                  <button
                                    onClick={() => handleRemoveMeal(meal)}
                                    className="px-3 py-2 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-all"
                                  >
                                    <Icons.Trash />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Empty Slot */
                          <button
                            onClick={() => setShowPicker({ date: dateStr, mealType: type })}
                            className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50/50 transition-all"
                          >
                            <span className="text-lg opacity-50">{icon}</span>
                            <p className="text-sm font-medium">{label} - Thêm món...</p>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recipe Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md max-h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-800">Chọn món ăn</h3>
                <p className="text-xs text-gray-500">
                  {formatDateVN(showPicker.date)} - {MEAL_CONFIG.find(m => m.type === showPicker.mealType)?.label}
                </p>
              </div>
              <button
                onClick={() => { setShowPicker(null); setSearchQuery(""); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <Icons.Close />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Icons.Search />
                </span>
                <input
                  type="text"
                  placeholder="Tìm trong sổ tay..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Recipe List */}
            <div className="flex-1 overflow-y-auto p-4">
              {cookbook.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Chưa có món trong sổ tay</p>
                  <p className="text-sm text-gray-300 mt-1">Hãy lưu món từ chat trước nhé!</p>
                </div>
              ) : filteredRecipes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Không tìm thấy món phù hợp</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => handleAddMeal(recipe)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all text-left"
                    >
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500">
                        <Icons.Chef />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate">{recipe.name}</p>
                        <p className="text-xs text-gray-500">{recipe.cooking_time} phút • {recipe.difficulty}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Preferences Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🪄
            </div>
            <h3 className="text-xl font-black text-gray-800 text-center mb-2">
              AI lên thực đơn tuần
            </h3>
            <p className="text-gray-500 text-center text-sm mb-4">
              AI sẽ tạo 21 món ăn cho 7 ngày tới (Sáng, Trưa, Tối)
            </p>
            
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">
                Yêu cầu đặc biệt (tuỳ chọn)
              </label>
              <textarea
                value={aiPreferences}
                onChange={(e) => setAiPreferences(e.target.value)}
                placeholder="Ví dụ: Ăn chay, không cay, gia đình 4 người, tiết kiệm..."
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowAIModal(false); setAiPreferences(""); }}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all text-sm"
              >
                Huỷ
              </button>
              <button
                onClick={handleAIGenerate}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-100 text-sm"
              >
              🪄 Tạo ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Week Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto text-red-500">
              <Icons.Trash />
            </div>
            <h3 className="text-xl font-black text-gray-800 text-center mb-2">Xóa thực đơn tuần?</h3>
            <p className="text-gray-500 text-center text-sm mb-6 leading-relaxed">
              Tất cả bữa ăn trong tuần này sẽ bị xóa. Bạn có chắc không?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all text-sm"
              >
                Huỷ
              </button>
              <button 
                onClick={handleClearWeek}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-100 text-sm"
              >
                Xóa hết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
