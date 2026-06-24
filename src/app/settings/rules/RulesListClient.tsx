"use client";

import { useState, useMemo } from "react";
import { Sliders, Search, Sparkles, RefreshCw, ChevronDown, Plus, X } from "lucide-react";
import Link from "next/link";
import { Rule, RuleGroup } from "@/lib/api/rules";
import { getCategoryStyle } from "@/lib/category-icons";
import { PageHeader } from "@/components/PageHeader";
import { createRuleGroupAction } from "@/app/settings/actions";

interface RulesListClientProps {
  initialRules: Rule[];
  categories: string[];
  bills: { id: string; name: string }[];
  initialRuleGroups: RuleGroup[];
}

export function RulesListClient({ initialRules, categories, bills, initialRuleGroups }: RulesListClientProps) {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>(initialRuleGroups);
  const [search, setSearch] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Filter rules by search query
  const filteredRules = rules.filter(rule => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      rule.title.toLowerCase().includes(q) ||
      (rule.description && rule.description.toLowerCase().includes(q)) ||
      rule.triggers.some(t => t.value.toLowerCase().includes(q)) ||
      rule.actions.some(a => a.value.toLowerCase().includes(q))
    );
  });

  // Group rules by Rule Group dynamically
  const groupedRules = useMemo(() => {
    const groups: Record<string, Rule[]> = {};
    
    // Initialize groups with empty arrays for all fetched rule groups
    ruleGroups.forEach(g => {
      groups[g.title] = [];
    });

    filteredRules.forEach(rule => {
      const groupName = rule.ruleGroupTitle || "Default Rule Group";
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(rule);
    });
    return groups;
  }, [filteredRules, ruleGroups]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        backHref="/settings"
        subtitle="Manage automation triggers and actions"
        title="Automation Rules"
      />

      {/* Search */}
      <div className="flex gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute left-3 top-2.5 text-zinc-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Filter rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-700"
          />
        </div>
      </div>

      {/* Rules grouped by Rule Group */}
      <div className="flex flex-col gap-6">
        {Object.keys(groupedRules).length === 0 ? (
          <div className="glass-card p-12 text-center flex flex-col items-center justify-center">
            <Sliders size={32} className="text-zinc-600 mb-2" />
            <p className="text-sm text-zinc-450">No rules matching your filter.</p>
          </div>
        ) : (
          Object.entries(groupedRules)
            .sort((a, b) => a[0].localeCompare(b[0], undefined, { sensitivity: "base", numeric: true }))
            .map(([groupTitle, groupRules]) => {
              const isCollapsed = collapsedGroups[groupTitle] !== false;
              return (
                <div key={groupTitle} className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setCollapsedGroups(prev => ({ ...prev, [groupTitle]: !isCollapsed }))}
                    className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1 cursor-pointer w-full text-left py-1 hover:text-zinc-200 transition-colors group/header"
                  >
                    <span>{groupTitle}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-400 bg-zinc-800/85 px-2.5 py-0.5 rounded-full border border-zinc-700/60 normal-case tracking-normal">
                        {groupRules.length}
                      </span>
                      <ChevronDown size={14} className={`text-zinc-500 group-hover/header:text-zinc-300 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                    </div>
                  </button>
                  
                  {!isCollapsed && (
                    <div className="flex flex-col gap-3">
                      {groupRules.map(rule => {
                        const keyword = rule.triggers.find(t => t.type === "description_contains" || t.type === "description_is")?.value || "";
                        const category = rule.actions.find(a => a.type === "set_category")?.value;
                        const isCC = rule.actions.some(a => a.type === "convert_transfer" && a.value === "Credit Card Clearing");
                        const bill = rule.actions.find(a => a.type === "link_to_bill")?.value;
                        const catStyle = category ? getCategoryStyle(category) : null;
                        const CatIcon = catStyle ? catStyle.icon : null;

                        return (
                          <Link
                            key={rule.id}
                            href={`/settings/rules/${rule.id}`}
                            className={`glass-card p-4 transition-all border flex flex-col gap-2.5 hover:bg-zinc-900/20 hover:border-zinc-700/60 active:scale-[0.99] cursor-pointer group ${
                              rule.active ? "border-zinc-800/60" : "border-zinc-900/30 opacity-60"
                            }`}
                          >
                            {/* Header: Title and Status on left, Category Badge on right */}
                            <div className="flex justify-between items-start">
                              <div className="flex flex-col gap-1 pr-4 min-w-0">
                                <h4 className="font-semibold text-sm text-zinc-100 truncate">{rule.title}</h4>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-450 font-medium">
                                  <span className={`w-1.5 h-1.5 rounded-full ${rule.active ? "bg-emerald-500 animate-pulse" : "bg-zinc-650"}`} />
                                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                                    {rule.active ? "Active" : "Paused"}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex-shrink-0">
                                {category && catStyle && CatIcon ? (
                                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${catStyle.bgClass} ${catStyle.colorClass} ${catStyle.borderClass}`}>
                                    <CatIcon size={10} className="flex-shrink-0" />
                                    <span>{category}</span>
                                  </span>
                                ) : (
                                  <span className="text-zinc-700 italic text-[11px] py-0.5 select-none">—</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Horizontal Line and Left/Right columns */}
                            <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-start gap-4">
                              {/* Left Column: When */}
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500 select-none">When</span>
                                <span className="text-zinc-200 font-semibold text-sm truncate max-w-[200px] sm:max-w-[300px]">
                                  {keyword}
                                </span>
                              </div>

                              {/* Right Column: Subscription */}
                              <div className="flex flex-col gap-0.5 items-end text-right min-w-0">
                                <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500 select-none">Subscription</span>
                                {isCC || bill ? (
                                  <span className="text-zinc-200 font-semibold text-sm truncate max-w-[200px] sm:max-w-[300px]">
                                    {bill || (isCC && "CC Clearing")}
                                  </span>
                                ) : (
                                  <span className="text-zinc-500 italic text-sm select-none">—</span>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
        )}

        {/* Add New Rule Group Section */}
        <div className="pt-4 border-t border-zinc-800/40">
          {!isCreatingGroup ? (
            <button
              type="button"
              onClick={() => {
                setIsCreatingGroup(true);
                setErrorMessage("");
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors px-1 py-1 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Rule Group</span>
            </button>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newGroupName.trim() || isSubmitting) return;
                setIsSubmitting(true);
                setErrorMessage("");
                const res = await createRuleGroupAction(newGroupName);
                setIsSubmitting(false);
                if (res.success && res.group) {
                  setRuleGroups(prev => [...prev, res.group!]);
                  setNewGroupName("");
                  setIsCreatingGroup(false);
                } else {
                  setErrorMessage(res.error || "Failed to create rule group");
                }
              }}
              className="flex flex-col gap-2 max-w-sm mt-1"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New rule group name..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-700 w-full"
                  autoFocus
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newGroupName.trim()}
                  className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 border border-zinc-700/60 rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors"
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingGroup(false);
                    setNewGroupName("");
                    setErrorMessage("");
                  }}
                  className="bg-zinc-900/40 hover:bg-zinc-800/80 text-zinc-400 border border-zinc-800 rounded-xl p-1.5 flex items-center justify-center cursor-pointer transition-colors"
                  disabled={isSubmitting}
                >
                  <X size={14} />
                </button>
              </div>
              {errorMessage && (
                <span className="text-[10px] text-rose-400 font-semibold px-1">
                  {errorMessage}
                </span>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
