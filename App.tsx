import React, { useState, useEffect, useMemo } from "react";
import { Tab, Recipe, User, QuickSuggestion } from "./types";
import { Icons, COLORS } from "./constants";
import { ChatView } from "./components/ChatView";
import { CookBookView } from "./components/CookBookView";
import { QuickSuggestionsView } from "./components/QuickSuggestionsView";
import { RecipeModal } from "./components/RecipeModal";
import { AuthModal } from "./components/AuthModal";
import {
  getSavedRecipes,
  saveRecipe,
  removeRecipe,
} from "./services/supabaseCookbookService";
import {
  getCurrentUser,
  onAuthStateChange,
  signOut,
} from "./services/supabaseAuthService";
import {
  getQuickSuggestions,
  createQuickSuggestion,
  updateQuickSuggestion,
  deleteQuickSuggestion,
  initializeDefaultSuggestions,
} from "./services/supabaseQuickSuggestionsService";
import { clearChatHistory } from "./services/supabaseChatService";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.CHAT);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cookBook, setCookBook] = useState<Recipe[]>([]);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoadingCookBook, setIsLoadingCookBook] = useState(true);
  const [quickSuggestions, setQuickSuggestions] = useState<QuickSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showClearChatConfirm, setShowClearChatConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await loadCookBook();
        await loadQuickSuggestions();
      }
      setIsLoadingCookBook(false);
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = onAuthStateChange(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadCookBook();
        await loadQuickSuggestions();
      } else {
        setCookBook([]);
        setQuickSuggestions([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadCookBook = async () => {
    try {
      const recipes = await getSavedRecipes();
      setCookBook(recipes);
    } catch (error) {
      console.error("Error loading cookbook:", error);
    }
  };

  const loadQuickSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      let suggestions = await getQuickSuggestions();
      // Nếu user chưa có suggestions, khởi tạo mặc định
      if (suggestions.length === 0) {
        suggestions = await initializeDefaultSuggestions();
      }
      setQuickSuggestions(suggestions);
    } catch (error) {
      console.error("Error loading quick suggestions:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleAddSuggestion = async (suggestion: { label: string; prompt: string }) => {
    const newSuggestion = await createQuickSuggestion(suggestion);
    setQuickSuggestions(prev => [...prev, newSuggestion]);
    triggerToast("Đã thêm gợi ý mới!");
  };

  const handleUpdateSuggestion = async (id: string, updates: { label?: string; prompt?: string }) => {
    const updated = await updateQuickSuggestion(id, updates);
    setQuickSuggestions(prev => prev.map(s => s.id === id ? updated : s));
    triggerToast("Đã cập nhật!");
  };

  const handleDeleteSuggestion = async (id: string) => {
    await deleteQuickSuggestion(id);
    setQuickSuggestions(prev => prev.filter(s => s.id !== id));
    triggerToast("Đã xóa gợi ý!");
  };

  const handleClearChatHistory = async () => {
    try {
      await clearChatHistory();
      setShowClearChatConfirm(false);
      triggerToast("Đã xóa lịch sử chat!");
      // Force reload trang để reset ChatView state
      window.location.reload();
    } catch (error) {
      console.error("Error clearing chat history:", error);
      triggerToast("Có lỗi xảy ra!");
    }
  };

  // Danh sách các định danh (ID và Tên) để kiểm tra trạng thái đã lưu nhanh chóng
  const savedIdentifiers = useMemo(() => {
    const ids = cookBook.map((r) => r.id).filter(Boolean);
    const names = cookBook.map((r) => r.name).filter(Boolean);
    return new Set([...ids, ...names]);
  }, [cookBook]);

  const isRecipeSaved = (recipe: Recipe) => {
    if (!recipe) return false;
    return cookBook.some(
      (r) =>
        (recipe.id && r.id === recipe.id) ||
        (recipe.name && r.name === recipe.name)
    );
  };

  // Fix for mobile 100vh issue
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty(
        "--app-height",
        `${window.innerHeight}px`
      );
    };
    window.addEventListener("resize", setAppHeight);
    setAppHeight();
    return () => window.removeEventListener("resize", setAppHeight);
  }, []);

  const handleLogin = () => {
    setIsAuthModalOpen(true);
    setIsSidebarOpen(false);
  };

  const handleAuthSuccess = async (authUser: any) => {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      await loadCookBook();
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setCookBook([]);
    setIsSidebarOpen(false);
  };

  const saveToCookBook = async (recipe: Recipe) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      if (isRecipeSaved(recipe)) {
        triggerToast("Đã lưu rồi!");
        return;
      }

      const recipeWithId = { ...recipe, id: recipe.id || `rcp_${Date.now()}` };
      await saveRecipe(recipeWithId);
      setCookBook((prev) => [recipeWithId, ...prev]);
      triggerToast("Đã lưu thành công!");
    } catch (error: any) {
      if (error.message === "Recipe already saved") {
        triggerToast("Đã lưu rồi!");
      } else {
        console.error("Error saving recipe:", error);
        triggerToast("Có lỗi xảy ra, vui lòng thử lại");
      }
    }
  };

  const removeFromCookBook = async (id: string) => {
    try {
      await removeRecipe(id);
      setCookBook((prev) => prev.filter((r) => r.id !== id));
      triggerToast("Đã xóa khỏi Sổ tay");
    } catch (error) {
      console.error("Error removing recipe:", error);
      triggerToast("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white p-6">
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={() => { setActiveTab(Tab.CHAT); setIsSidebarOpen(false); }}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="bg-lime-600 p-2 rounded-xl text-white shadow-lg shadow-lime-100 flex items-center justify-center">
            <Icons.Logo className="w-[22px] h-[22px]" />
          </div>
          <span className="text-xl font-black text-gray-800 tracking-tight">
            YummyAI
          </span>
        </button>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icons.Close />
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        <button
          onClick={() => {
            setActiveTab(Tab.CHAT);
            setIsSidebarOpen(false);
          }}
          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
            activeTab === Tab.CHAT
              ? "bg-lime-50 text-lime-700 font-bold shadow-sm shadow-lime-100"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Icons.Chat />
          <span className="text-sm">Gợi Ý Món Ăn</span>
        </button>
        <button
          onClick={() => {
            setActiveTab(Tab.COOKBOOK);
            setIsSidebarOpen(false);
          }}
          className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
            activeTab === Tab.COOKBOOK
              ? "bg-lime-50 text-lime-700 font-bold shadow-sm shadow-lime-100"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <Icons.Book />
          <span className="text-sm">Sổ Tay Nấu Ăn</span>
          {cookBook.length > 0 && (
            <span className="ml-auto bg-lime-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
              {cookBook.length}
            </span>
          )}
        </button>
        {user && (
          <button
            onClick={() => {
              setActiveTab(Tab.SUGGESTIONS);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
              activeTab === Tab.SUGGESTIONS
                ? "bg-lime-50 text-lime-700 font-bold shadow-sm shadow-lime-100"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Icons.Logo className="w-6 h-6" />
            <span className="text-sm">Gợi Ý Nhanh</span>
            {quickSuggestions.length > 0 && (
              <span className="ml-auto bg-lime-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {quickSuggestions.length}
              </span>
            )}
          </button>
        )}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-100 space-y-4">
        {user ? (
          <div className="space-y-3">
            {/* User Profile with Menu */}
            <div className="relative">
              <div className="flex items-center gap-3 px-2 py-3 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-lime-600 flex items-center justify-center text-white shadow-sm border-2 border-white">
                  <Icons.User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-all"
                >
                  <Icons.MoreVertical />
                </button>
              </div>
              
              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-[50]" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute bottom-full left-0 right-0 mb-2 z-[51] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-all text-sm font-medium"
                    >
                      <Icons.Logout />
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
            
            {/* Clear Chat History Button */}
            <button
              onClick={() => setShowClearChatConfirm(true)}
              className="w-full flex items-center justify-center gap-2 text-gray-500 bg-gray-100 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all text-sm"
            >
              <Icons.Trash />
              Xóa lịch sử chat
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg text-sm"
          >
            <Icons.Login />
            Đăng nhập / Đăng ký
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="flex bg-lime-50 overflow-hidden font-sans w-full"
      style={{ height: "var(--app-height, 100vh)" }}
    >
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-gray-900/95 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300 whitespace-nowrap w-max max-w-[90vw]">
          <div className="text-lime-500 shrink-0">
            <Icons.Check />
          </div>
          <span className="text-sm font-bold truncate">{showToast}</span>
        </div>
      )}

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onSave={saveToCookBook}
          isSaved={isRecipeSaved(selectedRecipe)}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Clear Chat History Confirmation Modal */}
      {showClearChatConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto text-red-500">
              <Icons.Trash />
            </div>
            <h3 className="text-xl font-black text-gray-800 text-center mb-2">Xóa lịch sử chat?</h3>
            <p className="text-gray-500 text-center text-sm mb-6 leading-relaxed">
              Tất cả tin nhắn sẽ bị xóa vĩnh viễn. Bạn có chắc chắn không?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowClearChatConfirm(false)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all text-sm"
              >
                Hủy
              </button>
              <button 
                onClick={handleClearChatHistory}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-100 text-sm"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="hidden lg:block w-72 border-r border-gray-100 bg-white shrink-0">
        <SidebarContent />
      </aside>

      <div
        className={`fixed inset-0 z-[110] lg:hidden transition-opacity duration-300 ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-[70%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <SidebarContent />
        </div>
      </div>

      <main className="flex-1 flex flex-col min-w-0 bg-white lg:bg-lime-50 relative h-full">
        <header className="lg:hidden flex items-center justify-between px-5 h-16 bg-white border-b border-gray-100 shrink-0 z-50">
          <button 
            onClick={() => setActiveTab(Tab.CHAT)}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="bg-lime-600 p-1.5 rounded-xl text-white shadow-md shadow-lime-100 flex items-center justify-center">
              <Icons.Logo className="w-[18px] h-[18px]" />
            </div>
            <span className="text-lg font-black text-gray-800 tracking-tight">
              YummyAI
            </span>
          </button>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <Icons.Menu />
          </button>
        </header>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {activeTab === Tab.CHAT ? (
            <div className="flex-1 flex flex-col min-h-0 p-0 md:p-4 lg:p-6 xl:p-8">
              <ChatView
                onSaveRecipe={saveToCookBook}
                onViewRecipe={setSelectedRecipe}
                savedIdentifiers={savedIdentifiers}
                quickSuggestions={quickSuggestions.map(s => ({ label: s.label, prompt: s.prompt }))}
              />
            </div>
          ) : activeTab === Tab.COOKBOOK ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {isLoadingCookBook ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-lime-200 border-t-lime-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải...</p>
                  </div>
                </div>
              ) : (
                <CookBookView
                  recipes={cookBook}
                  onDelete={removeFromCookBook}
                  onView={setSelectedRecipe}
                />
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              <QuickSuggestionsView
                suggestions={quickSuggestions}
                onAdd={handleAddSuggestion}
                onUpdate={handleUpdateSuggestion}
                onDelete={handleDeleteSuggestion}
                isLoading={isLoadingSuggestions}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
