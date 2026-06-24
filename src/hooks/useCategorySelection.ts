"use client";

import { useState, useMemo } from "react";
import { updateTransactionCategoryAction } from "@/app/actions/transactions";
import { createAutoCategoryRule } from "@/app/actions/automations";

interface UseCategorySelectionOptions {
  transactionId: string;
  journalId: string;
  currentCategory: string;
  categories: string[];
  onUpdate: (newCategory: string) => void;
  onClose: () => void;
  initialQuery?: string;
  closeOnSelect?: boolean;
  transactionName?: string;
}

export function useCategorySelection({
  transactionId,
  journalId,
  currentCategory,
  categories,
  onUpdate,
  onClose,
  initialQuery = "",
  closeOnSelect = true,
  transactionName,
}: UseCategorySelectionOptions) {
  const [query, setQuery] = useState(initialQuery);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoAutomate, setAutoAutomate] = useState(false);

  const filteredCategories = useMemo(() => {
    return query.trim() === ""
      ? categories
      : categories.filter((c) =>
          c.toLowerCase().includes(query.toLowerCase())
        );
  }, [query, categories]);

  async function handleSelect(category: string) {
    if (category === currentCategory) {
      if (autoAutomate && transactionName) {
        setSaving(true);
        setError(null);
        try {
          const autoResult = await createAutoCategoryRule(transactionName, category);
          if (!autoResult.success) {
            throw new Error(autoResult.error || "Failed to create auto-categorization rule");
          }
          onClose();
        } catch (e: any) {
          setError(e.message);
          setSaving(false);
        }
      } else {
        onClose();
      }
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await updateTransactionCategoryAction(transactionId, journalId, category);
      if (!result.success) {
        throw new Error(result.error || "Failed to update category");
      }

      if (autoAutomate && transactionName) {
        const autoResult = await createAutoCategoryRule(transactionName, category);
        if (!autoResult.success) {
          console.warn("Auto rule creation failed:", autoResult.error);
        }
      }

      onUpdate(category);
      if (closeOnSelect) {
        onClose();
      }
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  }

  return {
    query,
    setQuery,
    saving,
    error,
    setError,
    autoAutomate,
    setAutoAutomate,
    filteredCategories,
    handleSelect,
  };
}
