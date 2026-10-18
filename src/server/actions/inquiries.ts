import "server-only";
import { db } from "@/server/db";
import { inquiries, type Inquiry } from "@/server/db/schema";
import { createInquirySchema } from "@/lib/schemas/inquiry";

export type CreateInquiryResult =
  | { ok: true; inquiry: Inquiry }
  | { ok: false; error: string; message?: string };

export async function createInquiry(
  tenantId: string,
  input: unknown
): Promise<CreateInquiryResult> {
  const parsed = createInquirySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "validation_failed",
      message: parsed.error.issues[0]?.message || "Validation failed",
    };
  }

  const [inquiry] = await db
    .insert(inquiries)
    .values({
      tenantId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
      status: "new",
    })
    .returning();

  return { ok: true, inquiry };
}

