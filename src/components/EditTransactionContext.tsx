"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { 
  getTransactionDetailsAction, 
  updateTransactionAction, 
  deleteTransactionAction,
  getAccountsAction 
} from "@/app/actions/transactions";

export interface TransactionDetails {
  id: string;
  transactionGroupId: string;
  description: string;
  amount: number;
  type: "withdrawal" | "deposit" | "transfer";
  date: string;
  time: string;
  sourceId: string;
  sourceName: string;
  destinationId: string;
  destinationName: string;
  categoryName: string;
  tags: string[];
  notes: string;
}

export interface AccountOption {
  id: string;
  name: string;
  type: string;
}

interface EditTransactionContextType {
  isOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  transaction: TransactionDetails | null;
  accounts: AccountOption[];
  categories: string[];
  openEditTransaction: (
    transactionId: string, 
    initialInfo?: { name: string; amount: number; date: string; category: string }
  ) => void;
  closeEditTransaction: () => void;
  saveTransaction: (updated: Partial<TransactionDetails>) => Promise<boolean>;
  deleteTransaction: () => Promise<boolean>;
}

const EditTransactionContext = createContext<EditTransactionContextType | undefined>(undefined);

export function EditTransactionProvider({ 
  children,
  categories = []
}: { 
  children: React.ReactNode;
  categories?: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);

  const closeEditTransaction = useCallback(() => {
    setIsOpen(false);
    setTransaction(null);
  }, []);

  const openEditTransaction = useCallback(async (
    transactionId: string,
    initialInfo?: { name: string; amount: number; date: string; category: string }
  ) => {
    setIsOpen(true);
    setIsLoading(true);

    // Set initial placeholder info using what we have immediately
    if (initialInfo) {
      const dateObj = new Date(initialInfo.date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const formattedDate = !isNaN(dateObj.getTime()) ? `${year}-${month}-${day}` : new Date().toISOString().split('T')[0];

      setTransaction({
        id: "",
        transactionGroupId: transactionId,
        description: initialInfo.name,
        amount: Math.abs(initialInfo.amount),
        type: initialInfo.amount > 0 ? "deposit" : "withdrawal",
        date: formattedDate,
        time: "12:00",
        sourceId: "",
        sourceName: "",
        destinationId: "",
        destinationName: "",
        categoryName: initialInfo.category,
        tags: [],
        notes: ""
      });
    }

    try {
      // Lazy load full details and accounts list
      const [detailsRes, accountsRes] = await Promise.all([
        getTransactionDetailsAction(transactionId),
        getAccountsAction()
      ]);

      if (detailsRes.success && detailsRes.data) {
        const group = detailsRes.data;
        const journal = group.attributes?.transactions?.[0];
        
        if (journal) {
          // Parse date/time
          let datePart = new Date().toISOString().split('T')[0];
          let timePart = "12:00";
          if (journal.date) {
            const d = new Date(journal.date);
            if (!isNaN(d.getTime())) {
              datePart = d.toISOString().split('T')[0];
              const hours = String(d.getHours()).padStart(2, '0');
              const minutes = String(d.getMinutes()).padStart(2, '0');
              timePart = `${hours}:${minutes}`;
            }
          }

          setTransaction({
            id: String(journal.transaction_journal_id),
            transactionGroupId: transactionId,
            description: journal.description || "",
            amount: parseFloat(journal.amount || "0"),
            type: journal.type as "withdrawal" | "deposit" | "transfer",
            date: datePart,
            time: timePart,
            sourceId: String(journal.source_id || ""),
            sourceName: journal.source_name || "",
            destinationId: String(journal.destination_id || ""),
            destinationName: journal.destination_name || "",
            categoryName: journal.category_name || "",
            tags: journal.tags || [],
            notes: journal.notes || ""
          });
        }
      }

      if (accountsRes.success && accountsRes.data) {
        const combined: AccountOption[] = [];
        
        // Add asset accounts
        accountsRes.data.assetAccounts.forEach((acc: any) => {
          combined.push({
            id: String(acc.id),
            name: acc.attributes?.name || "Asset Account",
            type: "Asset account"
          });
        });

        // Add liability accounts
        accountsRes.data.liabilityAccounts.forEach((acc: any) => {
          combined.push({
            id: String(acc.id),
            name: acc.attributes?.name || "Liability Account",
            type: "Liability account"
          });
        });

        setAccounts(combined);
      }
    } catch (err) {
      console.error("Failed to load transaction details lazily:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveTransaction = useCallback(async (updated: Partial<TransactionDetails>): Promise<boolean> => {
    if (!transaction) return false;
    setIsSaving(true);

    try {
      const merged = { ...transaction, ...updated };
      
      // Combine Date + Time
      const combinedDateTime = new Date(`${merged.date}T${merged.time}:00`);
      const isoDateString = !isNaN(combinedDateTime.getTime()) 
        ? combinedDateTime.toISOString() 
        : new Date(merged.date).toISOString();

      // Get existing transaction first to build updated journals array
      const detailsRes = await getTransactionDetailsAction(transaction.transactionGroupId);
      if (!detailsRes.success || !detailsRes.data) {
        throw new Error("Could not fetch current transaction state for update");
      }

      const rawGroup = detailsRes.data;
      const journals = rawGroup.attributes?.transactions || [];

      // Update the first journal split
      const updatedJournals = journals.map((j: any, idx: number) => {
        if (idx === 0) {
          const { category_id, ...rest } = j;
          return {
            ...rest,
            description: merged.description,
            amount: String(merged.amount),
            type: merged.type,
            date: isoDateString,
            source_id: merged.sourceId || undefined,
            source_name: merged.sourceId ? undefined : merged.sourceName,
            destination_id: merged.destinationId || undefined,
            destination_name: merged.destinationId ? undefined : merged.destinationName,
            category_name: merged.categoryName || "",
            tags: merged.tags,
            notes: merged.notes
          };
        }
        return j;
      });

      const res = await updateTransactionAction(transaction.transactionGroupId, {
        transactions: updatedJournals
      });

      if (res.success) {
        closeEditTransaction();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to save transaction updates:", err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [transaction, closeEditTransaction]);

  const deleteTrans = useCallback(async (): Promise<boolean> => {
    if (!transaction) return false;
    setIsDeleting(true);

    try {
      const res = await deleteTransactionAction(transaction.transactionGroupId);
      if (res.success) {
        closeEditTransaction();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [transaction, closeEditTransaction]);

  return (
    <EditTransactionContext.Provider
      value={{
        isOpen,
        isLoading,
        isSaving,
        isDeleting,
        transaction,
        accounts,
        categories,
        openEditTransaction,
        closeEditTransaction,
        saveTransaction,
        deleteTransaction: deleteTrans
      }}
    >
      {children}
    </EditTransactionContext.Provider>
  );
}

export function useEditTransaction() {
  const context = useContext(EditTransactionContext);
  if (!context) {
    throw new Error("useEditTransaction must be used within an EditTransactionProvider");
  }
  return context;
}
