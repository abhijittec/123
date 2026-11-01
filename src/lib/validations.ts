import { z } from "zod";
import { REGISTRATION } from "@/lib/config";
import {
  displayFlatNumber,
  isValidFlatNumber,
  normalizeFlatNumber,
} from "@/lib/flat-number";

const registrationFields = {
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
  kidsUnder10: z.coerce
    .number()
    .int("Kids count must be a whole number")
    .min(REGISTRATION.minKidsUnder10, "Kids under 10 cannot be negative")
    .max(
      REGISTRATION.maxHeadCount,
      `Maximum ${REGISTRATION.maxHeadCount} kids under 10`,
    )
    .default(0),
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
};

function withKidsConstraint<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((data: z.infer<T>, ctx) => {
    const kids = (data as { kidsUnder10?: number }).kidsUnder10;
    const head = (data as { headCount?: number }).headCount;
    if (
      typeof kids === "number" &&
      typeof head === "number" &&
      kids > head
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["kidsUnder10"],
        message: "Kids under 10 cannot exceed total head count",
      });
    }
  });
}

export const registrationSchema = withKidsConstraint(
  z.object({
    ...registrationFields,
    /** Honeypot — must stay empty */
    website: z.string().max(0).optional().default(""),
    /** Client form open timestamp for timing check */
    formOpenedAt: z.number().int().positive().optional(),
  }),
);

export const registrationUpdateSchema = withKidsConstraint(
  z.object(registrationFields),
);

export const adminRegistrationUpdateSchema = withKidsConstraint(
  z.object({
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
    kidsUnder10: z.coerce
      .number()
      .int()
      .min(REGISTRATION.minKidsUnder10)
      .max(REGISTRATION.maxHeadCount)
      .optional(),
    residentName: z
      .string()
      .trim()
      .max(REGISTRATION.residentNameMaxLength)
      .nullable()
      .optional(),
    isActive: z.boolean().optional(),
  }),
);

export type RegistrationInput = z.infer<typeof registrationSchema>;
