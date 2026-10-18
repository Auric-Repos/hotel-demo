import { z } from "zod";

export const createInquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().min(5, "Phone number is too short").optional().nullable(),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;

