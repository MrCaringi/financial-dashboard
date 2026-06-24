"use client";

import { useState, useRef, useEffect } from "react";
import { Tag, Loader2, X, Check } from "lucide-react";
import { getCategoryStyle } from "@/lib/category-icons";
import { useCategorySelection } from "@/hooks/useCategorySelection";
import { CategoryDrawer } from "./CategoryDrawer";

interface CategoryComboboxProps {
  transactionId: string;
  journalId: string;
  currentCategory: string;
  categories: string[];
  onUpdate: (newCategory: string) => void;
  onClose: () => void;
  showCurrentIcon?: boolean;
  initialQuery?: string;
  selectOnFocus?: boolean;
  closeOnSelect?: boolean;
  transactionName?: string;
  transactionAmount?: number;
}

export function CategoryCombobox({
  transactionId,
  journalId,
  currentCategory,
  categories,
  onUpdate,
  onClose,
  showCurrentIcon = false,
  initialQuery = "",
  selectOnFocus = false,
  closeOnSelect = true,
  transactionName,
  transactionAmount,
}: CategoryComboboxProps) {
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
    initialQuery,
    closeOnSelect,
    transactionName,
  });

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px)").matches;
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
    if (selectOnFocus) {
      inputRef.current?.select();
    }
  }, [selectOnFocus]);

  // Close on outside click/touch
  useEffect(() => {
    function handleOutside(e: MouseEvent | TouchEvent) {
      const target = e instanceof TouchEvent ? e.touches[0]?.target : (e as MouseEvent).target;
      if (containerRef.current && target instanceof Node && !containerRef.current.contains(target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleOutside as EventListener);
    document.addEventListener("touchstart", handleOutside as EventListener, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutside as EventListener);
      document.removeEventListener("touchstart", handleOutside as EventListener);
    };
  }, [onClose]);

  if (isMobile) {
    return (
      <CategoryDrawer
        transactionId={transactionId}
        journalId={journalId}
        currentCategory={currentCategory}
        categories={categories}
        onUpdate={onUpdate}
        onClose={onClose}
        transactionName={transactionName}
        transactionAmount={transactionAmount}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="mt-2 rounded-[var(--radius-element)] overflow-hidden border border-zinc-800/80 bg-zinc-950 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search input */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800/80">
        <Tag size={14} className="text-zinc-400 flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filtered.length > 0) handleSelect(filtered[0]);
            if (e.key === "Escape") onClose();
          }}
          className="flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder-zinc-500"
          placeholder="Search categories…"
          disabled={saving}
        />
        {saving ? (
          <Loader2 size={14} className="text-zinc-400 animate-spin flex-shrink-0" />
        ) : (
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {error && (
        <div className="px-3 py-2 text-xs text-rose-500 bg-rose-500/10 border-b border-rose-500/20">
          {error}
        </div>
      )}

      {/* Options list */}
      <ul className="max-h-48 overflow-y-auto overscroll-contain" style={{ touchAction: 'pan-y' }}>
        {filtered.length === 0 ? (
          <li className="px-3 py-3 text-xs text-zinc-500 text-center">
            No categories found
          </li>
        ) : (
          filtered.map((cat) => {
            const style = getCategoryStyle(cat);
            const Icon = style.icon;
            return (
              <li key={cat}>
                <button
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
                  onClick={() => handleSelect(cat)}
                  disabled={saving}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 ${style.bgClass} ${style.borderClass}`}>
                      <Icon size={11} className={style.colorClass} />
                    </div>
                    <span className={showCurrentIcon && cat === currentCategory ? "text-zinc-100 font-semibold truncate" : "text-zinc-300 truncate"}>
                      {cat}
                    </span>
                  </div>
                  {showCurrentIcon && cat === currentCategory && <Check size={14} className="text-zinc-100 flex-shrink-0 ml-2" />}
                </button>
              </li>
            );
          })
        )}
      </ul>
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-zinc-800/80 bg-zinc-950/80">
        <input
          type="checkbox"
          id={`auto-rule-toggle-${transactionId}`}
          checked={autoAutomate}
          onChange={(e) => setAutoAutomate(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-zinc-800 bg-zinc-900 text-indigo-600 focus:ring-indigo-600/30 accent-indigo-500 cursor-pointer"
        />
        <label htmlFor={`auto-rule-toggle-${transactionId}`} className="text-xs text-zinc-400 select-none cursor-pointer">
          Always categorize similar transactions
        </label>
      </div>
    </div>
  );
}
