import { NextRequest, NextResponse } from "next/server";
import { updateTransactionCategory } from "@/lib/firefly";
import { revalidatePath } from "next/cache";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { journalId, category } = body;

    if (!journalId || !category) {
      return NextResponse.json(
        { error: "journalId and category are required" },
        { status: 400 }
      );
    }

    await updateTransactionCategory(id, journalId, category);
    
    // Invalidate caches
    revalidatePath("/");
    revalidatePath("/uncategorized");
    revalidatePath("/dashboard");
    revalidatePath("/accounts");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Category update failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
