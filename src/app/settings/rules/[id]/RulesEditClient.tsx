"use client";

import { useState, useTransition, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { 
  Sliders, ToggleLeft, ToggleRight, Check, X, Loader2, 
  Sparkles, RefreshCw, AlertCircle, Save, Tag, Calendar, ChevronDown, Search
} from "lucide-react";
import { Rule, RuleAction, RuleTrigger, RuleGroup } from "@/lib/api/rules";
import { updateRuleAction } from "@/app/actions/automations";
import { BottomSheetDrawer } from "@/components/ui/BottomSheetDrawer";
import { getCategoryStyle } from "@/lib/category-icons";

interface RulesEditClientProps {
  rule: Rule;
  categories: string[];
  bills: { id: string; name: string }[];
  ruleGroups: RuleGroup[];
}

export function RulesEditClient({ rule, categories, bills, ruleGroups }: RulesEditClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Form states
  const [title, setTitle] = useState(rule.title);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [bill, setBill] = useState("");
  const [isCCTransfer, setIsCCTransfer] = useState(false);
  const [active, setActive] = useState(rule.active ?? true);
  const [strict, setStrict] = useState(rule.strict ?? false);
  const [stopProcessing, setStopProcessing] = useState(rule.stopProcessing ?? false);
  const [ruleGroupId, setRuleGroupId] = useState("");
  const [ruleGroupTitle, setRuleGroupTitle] = useState("");

  // Drawer states
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isBillDrawerOpen, setIsBillDrawerOpen] = useState(false);
  const [isGroupDrawerOpen, setIsGroupDrawerOpen] = useState(false);

  // Parse initial trigger keyword and actions on mount
  useEffect(() => {
    const keywordTrigger = rule.triggers.find(t => t.type === "description_contains" || t.type === "description_is");
    setKeyword(keywordTrigger ? keywordTrigger.value : "");

    const categoryAction = rule.actions.find(a => a.type === "set_category");
    setCategory(categoryAction ? categoryAction.value : "");

    const ccTransferAction = rule.actions.find(a => a.type === "convert_transfer" && a.value === "Credit Card Clearing");
    setIsCCTransfer(!!ccTransferAction);

    const billAction = rule.actions.find(a => a.type === "link_to_bill");
    setBill(billAction ? billAction.value : "");

    setRuleGroupId(rule.ruleGroupId || "");
    setRuleGroupTitle(rule.ruleGroupTitle || "");
  }, [rule]);

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);

    startTransition(async () => {
      try {
        const triggers: RuleTrigger[] = [
          {
            type: "description_contains",
            value: keyword,
          }
        ];

        const actions: RuleAction[] = [];
        
        if (isCCTransfer) {
          actions.push({
            type: "convert_transfer",
            value: "Credit Card Clearing"
          });
        }

        if (category) {
          actions.push({
            type: "set_category",
            value: category
          });
        }

        if (bill) {
          actions.push({
            type: "link_to_bill",
            value: bill
          });
        }

        if (actions.length === 0) {
          setSaveStatus({ success: false, message: "Rule must perform at least one action (Category, Subscription, or CC Transfer)." });
          return;
        }

        const payload = {
          title,
          active,
          strict,
          stopProcessing,
          ruleGroupId: ruleGroupId || undefined,
          ruleGroupTitle: ruleGroupTitle || undefined,
          triggers,
          actions,
        };

        const res = await updateRuleAction(rule.id, payload);
        if (res.success) {
          setSaveStatus({ success: true, message: "Rule updated successfully!" });
          router.refresh();
          setTimeout(() => {
            router.push("/settings/rules");
          }, 800);
        } else {
          setSaveStatus({ success: false, message: res.error || "Failed to update rule" });
        }
      } catch (err: any) {
        setSaveStatus({ success: false, message: err.message || "An error occurred" });
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {saveStatus && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          saveStatus.success 
            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/25 text-rose-400"
        }`}>
          {saveStatus.success ? <Check size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{saveStatus.message}</span>
        </div>
      )}

      {/* Basic Setup Card */}
      <div className="glass-card p-5 flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Rule Details</h3>
        
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-300">Rule Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 text-sm outline-none focus:border-zinc-700 transition-colors"
            required
            disabled={isPending}
          />
        </div>

        {/* Rule Group Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-300">Rule Group</label>
          <button
            type="button"
            onClick={() => setIsGroupDrawerOpen(true)}
            disabled={isPending}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 hover:border-zinc-700 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Sliders size={14} className="text-zinc-500" />
              <span className={ruleGroupTitle ? "text-zinc-100 text-sm" : "text-zinc-400 text-sm"}>
                {ruleGroupTitle || "Select a rule group..."}
              </span>
            </div>
            <ChevronDown size={16} className="text-zinc-500" />
          </button>
        </div>

        {/* Keyword */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-300">Match Keyword</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 text-sm outline-none focus:border-zinc-700 transition-colors"
            required
            disabled={isPending}
          />
          <span className="text-[11px] text-zinc-500">
            Triggers when the description contains this text (case insensitive).
          </span>
        </div>
      </div>

      {/* Actions Config Card */}
      <div className="glass-card p-5 flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Rule Actions</h3>

        <div className="flex flex-col gap-5 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/80">
          
          {/* Action 1: CC Transfer */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-zinc-200">Convert to CC Transfer</span>
              <span className="text-xs text-zinc-550">Link this transaction to the Credit Card Clearing account.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsCCTransfer(!isCCTransfer)}
              disabled={isPending}
              className="text-zinc-450 hover:text-zinc-200 transition-colors"
            >
              {isCCTransfer ? (
                <ToggleRight size={28} className="text-indigo-500" />
              ) : (
                <ToggleLeft size={28} className="text-zinc-650" />
              )}
            </button>
          </div>

          <hr className="border-zinc-800/60" />

          {/* Action 2: Set Category (Bottom Sheet trigger) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Set Category</label>
            <button
              type="button"
              onClick={() => setIsCategoryDrawerOpen(true)}
              disabled={isPending}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 hover:border-zinc-700 transition-colors text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                {category ? (() => {
                  const style = getCategoryStyle(category);
                  const Icon = style.icon;
                  return (
                    <>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${style.bgClass} ${style.borderClass}`}>
                        <Icon size={10} className={style.colorClass} />
                      </div>
                      <span className="text-zinc-100 text-sm font-semibold truncate">{category}</span>
                    </>
                  );
                })() : (
                  <>
                    <Tag size={14} className="text-zinc-500" />
                    <span className="text-zinc-500 text-sm">Select a category...</span>
                  </>
                )}
              </div>
              <ChevronDown size={16} className="text-zinc-500" />
            </button>
          </div>

          <hr className="border-zinc-800/60" />

          {/* Action 3: Link to Bill (Bottom Sheet trigger) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Link to Bill (Subscription)</label>
            <button
              type="button"
              onClick={() => setIsBillDrawerOpen(true)}
              disabled={isPending}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 hover:border-zinc-700 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-zinc-500" />
                <span className={bill ? "text-zinc-100 text-sm" : "text-zinc-500 text-sm"}>
                  {bill || "Select a subscription..."}
                </span>
              </div>
              <ChevronDown size={16} className="text-zinc-500" />
            </button>
          </div>

        </div>
      </div>

      {/* Advanced Config Card */}
      <div className="glass-card p-5 flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Advanced Config</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Active Status */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-900/20 rounded-xl border border-zinc-800/80">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-zinc-200">Active</span>
              <span className="text-[10px] text-zinc-500">Rule executes on transactions.</span>
            </div>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className="text-zinc-450 hover:text-zinc-200 transition-colors"
            >
              {active ? (
                <ToggleRight size={24} className="text-indigo-500" />
              ) : (
                <ToggleLeft size={24} className="text-zinc-650" />
              )}
            </button>
          </div>

          {/* Strict match */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-900/20 rounded-xl border border-zinc-800/80">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-zinc-200">Strict Match</span>
              <span className="text-[10px] text-zinc-500">Triggers only on exact string matches.</span>
            </div>
            <button
              type="button"
              onClick={() => setStrict(!strict)}
              className="text-zinc-450 hover:text-zinc-200 transition-colors"
            >
              {strict ? (
                <ToggleRight size={24} className="text-indigo-500" />
              ) : (
                <ToggleLeft size={24} className="text-zinc-650" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Save / Cancel Buttons */}
      <div className="flex items-center justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={() => router.push("/settings/rules")}
          className="px-5 py-2.5 text-zinc-400 hover:text-zinc-200 font-semibold rounded-xl hover:bg-zinc-900 transition-all text-sm"
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-zinc-100 font-semibold rounded-xl transition-all text-sm flex items-center gap-2"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          <span>Save Changes</span>
        </button>
      </div>

      {/* Portal bottom sheet drawers */}
      <CategorySelectDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        categories={categories}
        selected={category}
        onSelect={(cat) => {
          setCategory(cat);
          setIsCategoryDrawerOpen(false);
        }}
      />

      <BillSelectDrawer
        isOpen={isBillDrawerOpen}
        onClose={() => setIsBillDrawerOpen(false)}
        bills={bills}
        selected={bill}
        onSelect={(billName) => {
          setBill(billName);
          setIsBillDrawerOpen(false);
        }}
      />

      <RuleGroupSelectDrawer
        isOpen={isGroupDrawerOpen}
        onClose={() => setIsGroupDrawerOpen(false)}
        ruleGroups={ruleGroups}
        selectedGroupId={ruleGroupId}
        onSelect={(groupId, groupTitle) => {
          setRuleGroupId(groupId);
          setRuleGroupTitle(groupTitle);
          setIsGroupDrawerOpen(false);
        }}
      />
    </form>
  );
}

// --- Category Selection Bottom Sheet Drawer ---
interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
}

function CategorySelectDrawer({ isOpen, onClose, categories, selected, onSelect }: CategoryDrawerProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const list = search.trim() === ""
      ? categories
      : categories.filter(c => c.toLowerCase().includes(search.toLowerCase()));
    return [...list].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }));
  }, [search, categories]);

  return (
    <BottomSheetDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Select Category"
      headerAction={
        <button 
          type="button"
          onClick={() => onSelect("")} 
          className="text-xs text-rose-400 hover:text-rose-350 font-semibold py-1 px-2.5 rounded bg-rose-500/5 border border-rose-500/10"
        >
          Clear Selection
        </button>
      }
    >
      {/* Search */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-900/40">
        <Search size={16} className="text-zinc-500 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-zinc-105 outline-none placeholder-zinc-500 py-1"
          placeholder="Search categories..."
        />
        {search && (
          <button type="button" onClick={() => setSearch("")} className="text-zinc-500 hover:text-zinc-300">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto overscroll-contain py-2 px-2 no-scrollbar">
        <ul className="grid grid-cols-1 gap-1">
          {filtered.length === 0 ? (
            <li className="px-4 py-8 text-sm text-zinc-500 text-center">No categories found</li>
          ) : (
            filtered.map(cat => {
              const style = getCategoryStyle(cat);
              const Icon = style.icon;
              const isSelected = cat === selected;
              return (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => onSelect(cat)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm text-left hover:bg-zinc-900/40 active:scale-[0.98] active:bg-zinc-900/60 duration-100 transition-all ${
                      isSelected ? "bg-zinc-900/60 font-semibold" : ""
                    }`}
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
    </BottomSheetDrawer>
  );
}

// --- Bill Selection Bottom Sheet Drawer ---
interface BillDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bills: { id: string; name: string }[];
  selected: string;
  onSelect: (billName: string) => void;
}

function BillSelectDrawer({ isOpen, onClose, bills, selected, onSelect }: BillDrawerProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const list = search.trim() === ""
      ? bills
      : bills.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
    return [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true }));
  }, [search, bills]);

  return (
    <BottomSheetDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Select Subscription"
      headerAction={
        <button 
          type="button"
          onClick={() => onSelect("")} 
          className="text-xs text-rose-400 hover:text-rose-350 font-semibold py-1 px-2.5 rounded bg-rose-500/5 border border-rose-500/10"
        >
          Clear Selection
        </button>
      }
    >
      {/* Search */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-900/40">
        <Search size={16} className="text-zinc-500 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-zinc-105 outline-none placeholder-zinc-500 py-1"
          placeholder="Search subscriptions..."
        />
        {search && (
          <button type="button" onClick={() => setSearch("")} className="text-zinc-500 hover:text-zinc-300">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Bills List */}
      <div className="flex-1 overflow-y-auto overscroll-contain py-2 px-2 no-scrollbar">
        <ul className="grid grid-cols-1 gap-1">
          {filtered.length === 0 ? (
            <li className="px-4 py-8 text-sm text-zinc-500 text-center">No subscriptions found</li>
          ) : (
            filtered.map(b => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => onSelect(b.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-left hover:bg-zinc-905/50 transition-all ${
                    b.name === selected ? "bg-zinc-900/80 font-bold text-zinc-100" : "text-zinc-350"
                  }`}
                >
                  <span>{b.name}</span>
                  {b.name === selected && <Check size={14} className="text-indigo-400" />}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </BottomSheetDrawer>
  );
}

// --- Rule Group Selection Bottom Sheet Drawer ---
interface RuleGroupDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ruleGroups: RuleGroup[];
  selectedGroupId: string;
  onSelect: (groupId: string, groupTitle: string) => void;
}

function RuleGroupSelectDrawer({ isOpen, onClose, ruleGroups, selectedGroupId, onSelect }: RuleGroupDrawerProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const list = search.trim() === ""
      ? ruleGroups
      : ruleGroups.filter(rg => rg.title.toLowerCase().includes(search.toLowerCase()));
    return [...list].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base", numeric: true }));
  }, [search, ruleGroups]);

  return (
    <BottomSheetDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Select Rule Group"
      headerAction={
        <button 
          type="button"
          onClick={() => onSelect("", "")} 
          className="text-xs text-rose-400 hover:text-rose-350 font-semibold py-1 px-2.5 rounded bg-rose-500/5 border border-rose-500/10"
        >
          Clear Group
        </button>
      }
    >
      {/* Search */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-900/40">
        <Search size={16} className="text-zinc-500 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-zinc-105 outline-none placeholder-zinc-500 py-1"
          placeholder="Search rule groups..."
        />
        {search && (
          <button type="button" onClick={() => setSearch("")} className="text-zinc-500 hover:text-zinc-300">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto overscroll-contain py-2 px-2 no-scrollbar">
        <ul className="grid grid-cols-1 gap-1">
          {filtered.length === 0 ? (
            <li className="px-4 py-8 text-sm text-zinc-500 text-center">No rule groups found</li>
          ) : (
            filtered.map(rg => (
              <li key={rg.id}>
                <button
                  type="button"
                  onClick={() => onSelect(rg.id, rg.title)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-left hover:bg-zinc-905/50 transition-all ${
                    rg.id === selectedGroupId ? "bg-zinc-900/80 font-bold text-zinc-100" : "text-zinc-350"
                  }`}
                >
                  <span>{rg.title}</span>
                  {rg.id === selectedGroupId && <Check size={14} className="text-indigo-400" />}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </BottomSheetDrawer>
  );
}
