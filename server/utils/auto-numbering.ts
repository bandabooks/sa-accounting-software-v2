import { db } from "../db";
import { numberSequences } from "../../shared/schema";
import { eq, and } from "drizzle-orm";

export async function generateExpenseReference(companyId: number): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  try {
    // Get or create number sequence for expenses
    const [sequence] = await db
      .select()
      .from(numberSequences)
      .where(and(
        eq(numberSequences.companyId, companyId),
        eq(numberSequences.documentType, 'expense')
      ));

    if (sequence) {
      // Update next number
      const nextNumber = sequence.nextNumber;
      await db
        .update(numberSequences)
        .set({ 
          nextNumber: nextNumber + 1,
          updatedAt: new Date()
        })
        .where(eq(numberSequences.id, sequence.id));

      // Format: EXP-2025-0001
      return `EXP-${currentYear}-${String(nextNumber).padStart(4, '0')}`;
    } else {
      // Create new sequence
      await db
        .insert(numberSequences)
        .values({
          companyId,
          documentType: 'expense',
          prefix: 'EXP-',
          nextNumber: 2, // Next number after this first one
          format: 'prefix-year-number',
          yearReset: true
        });

      return `EXP-${currentYear}-0001`;
    }
  } catch (error) {
    console.error('Error generating expense reference:', error);
    // Fallback to timestamp-based reference
    const timestamp = Date.now();
    return `EXP-${currentYear}-${String(timestamp).slice(-4)}`;
  }
}