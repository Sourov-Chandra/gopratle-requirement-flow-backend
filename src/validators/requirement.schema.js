import { z } from "zod";

// Regular expression for YYYY-MM-DD
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
// Regular expression for HH:MM (24-hour format)
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const EVENT_TYPES = [
  "WEDDING",
  "CORPORATE_EVENT",
  "BIRTHDAY",
  "CONCERT",
  "FESTIVAL",
  "CONFERENCE",
  "PRIVATE_PARTY",
  "GRADUATION",
  "OTHER",
];

export const CATEGORIES = ["PLANNER", "PERFORMER", "CREW"];

export const STATUSES = ["OPEN", "REVIEWING", "FULFILLED"];

// Planner details schema
export const plannerDetailsSchema = z.object({
  guestCountRange: z.enum([
    "FEWER_THAN_50",
    "50_200",
    "201_500",
    "MORE_THAN_500",
  ], {
    required_error: "Expected guest count range is required",
  }),
  themePreferences: z.string().max(500).nullish().transform(val => val || null),
  planningScope: z
    .array(
      z.enum([
        "FULL_PLANNING",
        "DAY_OF_COORDINATION",
        "PARTIAL_PLANNING",
        "VENDOR_MANAGEMENT",
      ])
    )
    .min(1, "Select at least one planning scope"),
  cateringCoordinationNeeded: z.boolean({
    required_error: "Catering coordination selection is required",
  }),
  decorLightingNeeded: z.boolean({
    required_error: "Decor & lighting design selection is required",
  }),
  budgetRange: z.object({
    min: z.number().min(0, "Minimum budget cannot be negative"),
    max: z.number().min(0, "Maximum budget cannot be negative"),
    currency: z.string().default("INR"),
  }).refine((data) => data.max >= data.min, {
    message: "Maximum budget must be greater than or equal to minimum budget",
    path: ["max"],
  }),
});

// Performer details schema
export const performerDetailsSchema = z.object({
  performerType: z.enum([
    "BAND",
    "SOLO_SINGER",
    "DJ",
    "STANDUP_COMEDIAN",
    "MAGICIAN",
    "DANCERS",
    "OTHER",
  ], {
    required_error: "Performer type is required",
  }),
  performerTypeOther: z.string().max(100).nullish().transform(val => val || null),
  genre: z.string().min(2, "Genre or style must be at least 2 characters").max(100),
  performanceDurationMinutes: z
    .number()
    .int()
    .min(15, "Performance duration must be at least 15 minutes")
    .max(1440, "Performance duration cannot exceed 24 hours"),
  soundEquipmentProvidedByHost: z.boolean({
    required_error: "Please indicate if sound/PA system is provided",
  }),
  stageRequirements: z.string().max(500).nullish().transform(val => val || null),
  audienceVibe: z.enum([
    "RELAXED",
    "FAMILY_FRIENDLY",
    "HIGH_ENERGY",
    "FORMAL",
    "MIXED",
  ], {
    required_error: "Audience vibe is required",
  }),
  audienceAgeGroups: z
    .array(z.enum(["CHILDREN", "TEENAGERS", "ADULTS", "ALL_AGES"]))
    .min(1, "Select at least one target audience age group"),
  budgetRange: z.object({
    min: z.number().min(0, "Minimum budget cannot be negative"),
    max: z.number().min(0, "Maximum budget cannot be negative"),
    currency: z.string().default("INR"),
  }).refine((data) => data.max >= data.min, {
    message: "Maximum budget must be greater than or equal to minimum budget",
    path: ["max"],
  }),
}).refine(
  (data) => {
    if (data.performerType === "OTHER") {
      return !!data.performerTypeOther && data.performerTypeOther.trim().length >= 2;
    }
    return true;
  },
  {
    message: "Custom performer type is required when 'Other' is selected",
    path: ["performerTypeOther"],
  }
);

// Crew single role item schema
export const crewRoleItemSchema = z.object({
  roleName: z.enum([
    "USHERS_HOSTESSES",
    "STAGEHANDS",
    "BARTENDERS",
    "SECURITY_BOUNCERS",
    "AV_LIGHTING_TECHNICIANS",
    "SETUP_TEARDOWN",
    "OTHER",
  ]),
  roleNameOther: z.string().max(100).nullish().transform(val => val || null),
  count: z.number().int().min(1, "Headcount must be at least 1").max(100, "Headcount cannot exceed 100"),
}).refine(
  (data) => {
    if (data.roleName === "OTHER") {
      return !!data.roleNameOther && data.roleNameOther.trim().length >= 2;
    }
    return true;
  },
  {
    message: "Custom specialization name is required when 'Other' is selected",
    path: ["roleNameOther"],
  }
);

// Crew details schema
export const crewDetailsSchema = z.object({
  roles: z
    .array(crewRoleItemSchema)
    .min(1, "At least one crew role must be specified"),
  callTime: z.string().regex(TIME_REGEX, "Call time must be in HH:MM 24-hour format"),
  shiftHoursPerDay: z
    .number()
    .min(1, "Shift must be at least 1 hour")
    .max(24, "Shift cannot exceed 24 hours"),
  uniformRequired: z.boolean({
    required_error: "Please specify if uniform is required",
  }),
  dressCode: z.string().max(300).nullish().transform(val => val || null),
  prerequisites: z.string().max(500).nullish().transform(val => val || null),
  budgetRate: z.object({
    amount: z.number().min(1, "Rate amount must be greater than 0"),
    unit: z.enum(["PER_PERSON_PER_HOUR", "PER_PERSON_PER_DAY"]),
    currency: z.string().default("INR"),
  }),
});

// Shared base schema
const baseRequirementSchema = z.object({
  eventName: z
    .string({ required_error: "Event name is required" })
    .trim()
    .min(2, "Event name must be at least 2 characters")
    .max(120, "Event name cannot exceed 120 characters"),
  eventType: z.enum(EVENT_TYPES, {
    required_error: "Event type is required",
  }),
  eventTypeOther: z.string().max(100).nullish().transform(val => val || null),
  startDate: z
    .string({ required_error: "Start date is required" })
    .regex(DATE_REGEX, "Start date must be in YYYY-MM-DD format"),
  endDate: z
    .string()
    .regex(DATE_REGEX, "End date must be in YYYY-MM-DD format")
    .nullish()
    .transform(val => val || null),
  location: z
    .string({ required_error: "Location is required" })
    .trim()
    .min(2, "Location must be at least 2 characters")
    .max(120, "Location cannot exceed 120 characters"),
  venue: z.string().max(160).nullish().transform(val => val || null),
});

// Complete Discriminated Requirement Creation Schema
export const createRequirementSchema = z
  .discriminatedUnion("category", [
    baseRequirementSchema.extend({
      category: z.literal("PLANNER"),
      categoryDetails: plannerDetailsSchema,
    }),
    baseRequirementSchema.extend({
      category: z.literal("PERFORMER"),
      categoryDetails: performerDetailsSchema,
    }),
    baseRequirementSchema.extend({
      category: z.literal("CREW"),
      categoryDetails: crewDetailsSchema,
    }),
  ])
  .superRefine((data, ctx) => {
    // Validate eventType Other
    if (data.eventType === "OTHER") {
      if (!data.eventTypeOther || data.eventTypeOther.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please specify the custom event type",
          path: ["eventTypeOther"],
        });
      }
    }

    // Validate end date not before start date
    if (data.endDate && data.startDate) {
      if (data.endDate < data.startDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date cannot be earlier than start date",
          path: ["endDate"],
        });
      }
    }
  });

// Query filters schema
export const listRequirementsQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  eventType: z.enum(EVENT_TYPES).optional(),
  status: z.enum(STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
