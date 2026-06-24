"use server";

import { updateAccountNotes, getAssetAccounts, parseNotes } from "@/lib/firefly";
import { revalidatePath } from "next/cache";

export async function saveAccountConfig(accountId: string, patch: Record<string, any>) {
  try {
    // If setting this account as primary, clear the flag from all other asset accounts
    if (patch.current_source === true) {
      try {
        const assets = await getAssetAccounts();
        for (const asset of assets) {
          if (String(asset.id) !== accountId) {
            const notes = parseNotes(asset.attributes.notes);
            if (notes && notes.current_source === true) {
              await updateAccountNotes(String(asset.id), { current_source: undefined });
            }
          }
        }
      } catch (err) {
        // Log error but don't fail the primary save operation (might be running offline/mock mode)
        console.warn("Could not clear primary source flag from other accounts", err);
      }
    }

    await updateAccountNotes(accountId, patch);

    // Revalidate paths to update UI across the site
    revalidatePath(`/accounts/${accountId}`);
    revalidatePath("/accounts");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Error in saveAccountConfig action:", error);
    return { success: false, error: error.message || "Failed to update configuration" };
  }
}
