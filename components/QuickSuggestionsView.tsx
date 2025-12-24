import React, { useState } from "react";
import { QuickSuggestion } from "../types";
import { Icons } from "../constants";

interface QuickSuggestionsViewProps {
  suggestions: QuickSuggestion[];
  onAdd: (suggestion: { label: string; prompt: string }) => Promise<void>;
  onUpdate: (id: string, updates: { label?: string; prompt?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const QuickSuggestionsView: React.FC<QuickSuggestionsViewProps> = ({
  suggestions,
  onAdd,
  onUpdate,
  onDelete,
  isLoading,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form states
  const [newLabel, setNewLabel] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (!newLabel.trim() || !newPrompt.trim()) return;
    
    setIsSaving(true);
    try {
      await onAdd({ label: newLabel.trim(), prompt: newPrompt.trim() });
      setNewLabel("");
      setNewPrompt("");
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding suggestion:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (suggestion: QuickSuggestion) => {
    setEditingId(suggestion.id);
    setEditLabel(suggestion.label);
    setEditPrompt(suggestion.prompt);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editLabel.trim() || !editPrompt.trim()) return;
    
    setIsSaving(true);
    try {
      await onUpdate(editingId, { label: editLabel.trim(), prompt: editPrompt.trim() });
      setEditingId(null);
    } catch (error) {
      console.error("Error updating suggestion:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting suggestion:", error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel("");
    setEditPrompt("");
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6">
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto text-red-500">
              <Icons.Trash />
            </div>
            <h3 className="text-xl font-black text-gray-800 text-center mb-2">Xác nhận xóa?</h3>
            <p className="text-gray-500 text-center text-sm mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa gợi ý này không?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all text-sm"
              >
                Hủy
              </button>
              <button 
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-100 text-sm"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800">Gợi ý nhanh ⚡</h1>
            <p className="text-gray-500 mt-1">Tùy chỉnh các nút gợi ý nhanh trong chat.</p>
          </div>
          <div className="bg-lime-50 text-lime-700 px-4 py-2 rounded-2xl font-bold border border-lime-100 text-sm self-start">
            {suggestions.length} gợi ý
          </div>
        </div>
      </div>

      {/* Add New Button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full mb-6 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-lime-300 hover:text-lime-600 transition-all flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          Thêm gợi ý mới
        </button>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6 animate-in slide-in-from-top-2 duration-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Thêm gợi ý mới</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nhãn (hiển thị trên nút)
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="VD: 🍳 Ăn sáng"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:bg-white transition-all text-sm"
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nội dung gợi ý (prompt gửi cho AI)
              </label>
              <textarea
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="VD: Gợi ý cho mình món ăn sáng đơn giản"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:bg-white transition-all text-sm resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewLabel("");
                  setNewPrompt("");
                }}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleAdd}
                disabled={isSaving || !newLabel.trim() || !newPrompt.trim()}
                className="flex-1 py-3 px-4 bg-lime-600 hover:bg-lime-700 disabled:bg-gray-300 text-white font-bold rounded-2xl transition-all shadow-lg shadow-lime-100 text-sm"
              >
                {isSaving ? "Đang lưu..." : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-lime-200 border-t-lime-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải...</p>
          </div>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="bg-white rounded-[40px] p-16 text-center border-2 border-dashed border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-lime-50 rounded-full flex items-center justify-center mb-6 text-lime-200">
            <Icons.Chat />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-2">Chưa có gợi ý nào</h3>
          <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
            Tạo gợi ý nhanh đầu tiên để sử dụng trong chat!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              {editingId === suggestion.id ? (
                // Edit Mode
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nhãn
                    </label>
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:bg-white transition-all text-sm"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nội dung gợi ý
                    </label>
                    <textarea
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-500 focus:bg-white transition-all text-sm resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={cancelEdit}
                      className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all text-sm"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSaving || !editLabel.trim() || !editPrompt.trim()}
                      className="flex-1 py-2.5 px-4 bg-lime-600 hover:bg-lime-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition-all text-sm"
                    >
                      {isSaving ? "Đang lưu..." : "Lưu"}
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-lime-50 text-lime-700 px-3 py-1.5 rounded-full text-sm font-bold border border-lime-100">
                        {suggestion.label}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      "{suggestion.prompt}"
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(suggestion)}
                      className="p-2.5 text-gray-400 hover:text-lime-600 hover:bg-lime-50 rounded-xl transition-all"
                      title="Chỉnh sửa"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(suggestion.id)}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Xóa"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
