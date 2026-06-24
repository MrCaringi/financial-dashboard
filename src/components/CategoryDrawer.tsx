"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Tag, Loader2, X, Check } from "lucide-react";
import { getCategoryStyle } from "@/lib/category-icons";
import { useCategorySelection } from "@/hooks/useCategorySelection";
import { fmt } from "@/lib/format";
import { useVisualViewport } from "@/hooks/useVisualViewport";

interface CategoryDrawerProps {
  transactionId: string;
  journalId: string;
  currentCategory: string;
  categories: string[];
  onUpdate: (newCategory: string) => void;
  onClose: () => void;
  transactionName?: string;
  transactionAmount?: number;
}

export function CategoryDrawer({
  transactionId,
  journalId,
  currentCategory,
  categories,
  onUpdate,
  onClose,
  transactionName,
  transactionAmount,
}: CategoryDrawerProps) {
  const { style: viewportStyle } = useVisualViewport();
  const {
    query,
    setQuery,
    saving,
    error,
    autoAutomate,
    setAutoAutomate,
    filteredCategories: filtered,
    handleSelect,
  } = useCategorySelection({
    transactionId,
    journalId,
    currentCategory,
    categories,
    onUpdate,
    onClose,
    initialQuery: "",
    closeOnSelect: true,
    transactionName,
  });

  const [mounted, setMounted] = useState(false);
  
  // Touch tracking for drag-to-dismiss
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Lock background scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - dragStartY.current;
    if (delta > 0) {
      setDragY(delta);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY > 120) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] animate-drawer-backdrop"
        onClick={onClose}
      />

      {/* Drawer Container (aligned with visual viewport) */}
      <div
        className="fixed left-0 right-0 z-50 flex flex-col justify-end pointer-events-none"
        style={{
          bottom: viewportStyle.bottom,
          height: viewportStyle.height,
        }}
      >
        {/* Drawer Panel */}
        <div
          ref={drawerRef}
          className="relative z-10 w-full max-h-[85vh] max-h-full bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-md shadow-2xl rounded-t-[2rem] flex flex-col animate-drawer-slide overscroll-contain pb-safe pointer-events-auto"
          role="dialog"
          aria-modal="true"
          style={{
            transform: `translateY(${dragY}px)`,
            transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Pull Handle wrapper to increase tap target */}
          <div 
            className="w-full py-3 flex-shrink-0 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-12 h-1.5 bg-zinc-700/60 rounded-full mx-auto hover:bg-zinc-650 transition-colors" />
          </div>

          {/* Transaction Brief Header */}
          {transactionName && (
            <div 
              className="px-5 pb-3 pt-1 border-b border-zinc-800/40 flex justify-between items-center text-xs text-zinc-400 select-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <span className="truncate font-medium pr-4">{transactionName}</span>
              {transactionAmount !== undefined && (
                <span className={`font-bold tabular-nums ${transactionAmount > 0 ? "text-emerald-500" : "text-zinc-100"}`}>
                  {transactionAmount > 0 ? "+" : ""}{fmt(transactionAmount)}
                </span>
              )}
            </div>
          )}

          {/* Search Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-800/40">
            <Tag size={16} className="text-zinc-400 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-base text-zinc-100 outline-none placeholder-zinc-500 py-1"
              placeholder="Search categories…"
              disabled={saving}
            />
            {saving ? (
              <Loader2 size={16} className="text-zinc-400 animate-spin flex-shrink-0" />
            ) : (
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 active:scale-95 transition-all"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {error && (
            <div className="px-5 py-2 text-xs text-rose-500 bg-rose-500/10 border-b border-rose-500/20 font-medium">
              {error}
            </div>
          )}

          {/* Category List */}
          <div className="flex-1 overflow-y-auto overscroll-contain py-2 px-2 no-scrollbar">
            <ul className="grid grid-cols-1 gap-1">
              {filtered.length === 0 ? (
                <li className="px-4 py-8 text-sm text-zinc-500 text-center">
                  No categories found
                </li>
              ) : (
                filtered.map((cat) => {
                  const style = getCategoryStyle(cat);
                  const Icon = style.icon;
                  const isSelected = cat === currentCategory;
                  return (
                    <li key={cat}>
                      <button
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm text-left hover:bg-zinc-900/40 active:scale-[0.98] active:bg-zinc-900/60 duration-100 transition-all disabled:opacity-50 ${
                          isSelected ? "bg-zinc-900/60 font-semibold" : ""
                        }`}
                        onClick={() => handleSelect(cat)}
                        disabled={saving}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-9 h-9 rounded-full border flex items-center justify-center flex-shrink-0 ${style.bgClass} ${style.borderClass}`}>
                            <Icon size={14} className={style.colorClass} />
                          </div>
                          <span className={isSelected ? "text-zinc-100 font-semibold truncate" : "text-zinc-300 truncate"}>
                            {cat}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <Check size={12} />
                          </div>
                        )}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
          <div className="border-t border-zinc-800/60 bg-zinc-950/90 px-5 py-4 flex items-center gap-3">
            <input
              type="checkbox"
              id={`auto-rule-toggle-drawer-${transactionId}`}
              checked={autoAutomate}
              onChange={(e) => setAutoAutomate(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-850 bg-zinc-900 text-indigo-600 focus:ring-indigo-600/30 accent-indigo-500 cursor-pointer"
            />
            <label htmlFor={`auto-rule-toggle-drawer-${transactionId}`} className="text-sm text-zinc-400 select-none cursor-pointer">
              Always categorize similar transactions
            </label>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
