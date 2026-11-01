import { z } from "zod";
import { REGISTRATION } from "@/lib/config";
import {
  displayFlatNumber,
  isValidFlatNumber,
  normalizeFlatNumber,
} from "@/lib/flat-number";

export const registrationSchema = z.object({
  flatNumber: z
    .string()
    .trim()
    .min(1, "Flat number is required")
    .max(REGISTRATION.flatNumberMaxLength, "Flat number is too long")
    .transform((value) => displayFlatNumber(value))
    .superRefine((value, ctx) => {
      const normalized = normalizeFlatNumber(value);
      if (!isValidFlatNumber(normalized)) {
        ctx.addIssue({
          code: "custom",
          message: "Use a flat like A-101 or 101 (letters, numbers, hyphen)",
        });
      }
    }),
  headCount: z.coerce
    .number()
    .int("Head count must be a whole number")
    .min(REGISTRATION.minHeadCount, "At least 1 person is required")
    .max(
      REGISTRATION.maxHeadCount,
      `Maximum ${REGISTRATION.maxHeadCount} people per flat`,
    ),
  residentName: z
    .string()
    .trim()
    .max(REGISTRATION.residentNameMaxLength, "Name is too long")
    .optional()
    .nullable()
    .transform((value) => {
      if (!value) return null;
      const cleaned = value.replace(/\s+/g, " ").trim();
      return cleaned.length ? cleaned : null;
    }),
  /** Honeypot — must stay empty */
  website: z.string().max(0).optional().default(""),
  /** Client form open timestamp for timing check */
  formOpenedAt: z.number().int().positive().optional(),
});

export const registrationUpdateSchema = registrationSchema.omit({
  website: true,
  formOpenedAt: true,
});

export const adminRegistrationUpdateSchema = z.object({
  flatNumber: z
    .string()
    .trim()
    .min(1)
    .max(REGISTRATION.flatNumberMaxLength)
    .optional(),
  headCount: z.coerce
    .number()
    .int()
    .min(REGISTRATION.minHeadCount)
    .max(REGISTRATION.maxHeadCount)
    .optional(),
  residentName: z
    .string()
    .trim()
    .max(REGISTRATION.residentNameMaxLength)
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
