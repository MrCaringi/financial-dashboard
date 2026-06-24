"use server";

import { 
  updateTransactionCategory, 
  getTransaction, 
  deleteTransaction, 
  updateTransaction,
  getAssetAccounts,
  getLiabilityAccounts
} from "@/lib/firefly";
import { revalidatePath } from "next/cache";

export async function updateTransactionCategoryAction(
  transactionId: string,
  journalId: string,
  category: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!transactionId || !journalId || !category) {
      return { success: false, error: "transactionId, journalId, and category are required" };
    }

    await updateTransactionCategory(transactionId, journalId, category);

    triggerRevalidation();

    return { success: true };
  } catch (error: any) {
    console.error("Error in updateTransactionCategoryAction server action:", error);
    return { success: false, error: error.message || "Failed to update category" };
  }
}

export async function getTransactionDetailsAction(
  transactionId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const data = await getTransaction(transactionId);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error in getTransactionDetailsAction server action:", error);
    return { success: false, error: error.message || "Failed to fetch transaction details" };
  }
}

export async function updateTransactionAction(
  transactionId: string,
  payload: any
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateTransaction(transactionId, payload);
    triggerRevalidation();
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateTransactionAction server action:", error);
    return { success: false, error: error.message || "Failed to update transaction" };
  }
}

export async function deleteTransactionAction(
  transactionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteTransaction(transactionId);
    triggerRevalidation();
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteTransactionAction server action:", error);
    return { success: false, error: error.message || "Failed to delete transaction" };
  }
}

export async function getAccountsAction(): Promise<{
  success: boolean;
  data?: {
    assetAccounts: any[];
    liabilityAccounts: any[];
  };
  error?: string;
}> {
  try {
    const [assets, liabilities] = await Promise.all([
      getAssetAccounts(),
      getLiabilityAccounts()
    ]);
    return {
      success: true,
      data: {
        assetAccounts: assets || [],
        liabilityAccounts: liabilities || []
      }
    };
  } catch (error: any) {
    console.error("Error in getAccountsAction server action:", error);
    return { success: false, error: error.message || "Failed to fetch accounts" };
  }
}

function triggerRevalidation() {
  revalidatePath("/");
  revalidatePath("/uncategorized");
  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/transactions");
}
