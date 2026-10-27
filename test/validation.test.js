import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  createRequirementSchema,
  listRequirementsQuerySchema,
} from "../src/validators/requirement.schema.js";

describe("EventTalentBridge - Validation Tests", () => {
  describe("Planner Requirement Schema", () => {
    test("validates valid planner requirement", () => {
      const validPayload = {
        eventName: "Annual Corporate Gala 2026",
        eventType: "CORPORATE_EVENT",
        startDate: "2026-11-20",
        endDate: "2026-11-21",
        location: "Dhaka",
        venue: "Grand Ballroom",
        category: "PLANNER",
        categoryDetails: {
          guestCountRange: "201_500",
          themePreferences: "Modern Minimalist",
          planningScope: ["FULL_PLANNING", "VENDOR_MANAGEMENT"],
          cateringCoordinationNeeded: true,
          decorLightingNeeded: true,
          budgetRange: {
            min: 100000,
            max: 250000,
            currency: "INR",
          },
        },
      };

      const result = createRequirementSchema.safeParse(validPayload);
      assert.equal(result.success, true);
    });

    test("fails when planner max budget < min budget", () => {
      const invalidPayload = {
        eventName: "Birthday Celebration",
        eventType: "BIRTHDAY",
        startDate: "2026-12-01",
        location: "Mumbai",
        category: "PLANNER",
        categoryDetails: {
          guestCountRange: "50_200",
          planningScope: ["DAY_OF_COORDINATION"],
          cateringCoordinationNeeded: false,
          decorLightingNeeded: false,
          budgetRange: {
            min: 50000,
            max: 20000, // Invalid: max < min
            currency: "INR",
          },
        },
      };

      const result = createRequirementSchema.safeParse(invalidPayload);
      assert.equal(result.success, false);
      assert.ok(
        result.error.issues.some((issue) =>
          issue.message.includes("Maximum budget must be greater than or equal to minimum")
        )
      );
    });

    test("fails when planningScope array is empty", () => {
      const invalidPayload = {
        eventName: "Birthday Celebration",
        eventType: "BIRTHDAY",
        startDate: "2026-12-01",
        location: "Mumbai",
        category: "PLANNER",
        categoryDetails: {
          guestCountRange: "50_200",
          planningScope: [], // Empty
          cateringCoordinationNeeded: false,
          decorLightingNeeded: false,
          budgetRange: {
            min: 10000,
            max: 20000,
          },
        },
      };

      const result = createRequirementSchema.safeParse(invalidPayload);
      assert.equal(result.success, false);
      assert.ok(
        result.error.issues.some((i) => i.message.includes("Select at least one planning scope"))
      );
    });
  });

  describe("Performer Requirement Schema", () => {
    test("validates valid performer requirement", () => {
      const validPayload = {
        eventName: "Indie Rock Night",
        eventType: "CONCERT",
        startDate: "2026-11-15",
        location: "Bangalore",
        venue: "Hard Rock Cafe",
        category: "PERFORMER",
        categoryDetails: {
          performerType: "BAND",
          genre: "Alternative Rock",
          performanceDurationMinutes: 120,
          soundEquipmentProvidedByHost: true,
          stageRequirements: "Drum riser and 3 monitor wedges",
          audienceVibe: "HIGH_ENERGY",
          audienceAgeGroups: ["ADULTS", "TEENAGERS"],
          budgetRange: {
            min: 30000,
            max: 60000,
            currency: "INR",
          },
        },
      };

      const result = createRequirementSchema.safeParse(validPayload);
      assert.equal(result.success, true);
    });

    test("requires performerTypeOther when performerType is OTHER", () => {
      const payload = {
        eventName: "Illusion & Wonder Gala",
        eventType: "PRIVATE_PARTY",
        startDate: "2026-12-10",
        location: "Delhi",
        category: "PERFORMER",
        categoryDetails: {
          performerType: "OTHER",
          performerTypeOther: null, // missing custom type
          genre: "Illusionist",
          performanceDurationMinutes: 60,
          soundEquipmentProvidedByHost: false,
          audienceVibe: "RELAXED",
          audienceAgeGroups: ["ALL_AGES"],
          budgetRange: {
            min: 20000,
            max: 40000,
          },
        },
      };

      const result = createRequirementSchema.safeParse(payload);
      assert.equal(result.success, false);
      assert.ok(
        result.error.issues.some((i) =>
          i.message.includes("Custom performer type is required")
        )
      );
    });

    test("fails when performer duration is under 15 minutes", () => {
      const payload = {
        eventName: "Quick Act",
        eventType: "PRIVATE_PARTY",
        startDate: "2026-12-10",
        location: "Delhi",
        category: "PERFORMER",
        categoryDetails: {
          performerType: "DJ",
          genre: "Pop",
          performanceDurationMinutes: 10, // Invalid: < 15
          soundEquipmentProvidedByHost: true,
          audienceVibe: "RELAXED",
          audienceAgeGroups: ["ALL_AGES"],
          budgetRange: {
            min: 10000,
            max: 20000,
          },
        },
      };

      const result = createRequirementSchema.safeParse(payload);
      assert.equal(result.success, false);
      assert.ok(
        result.error.issues.some((i) =>
          i.message.includes("Performance duration must be at least 15 minutes")
        )
      );
    });
  });

  describe("Crew Requirement Schema", () => {
    test("validates valid crew requirement with multiple roles", () => {
      const validPayload = {
        eventName: "Global Tech Summit 2026",
        eventType: "CONFERENCE",
        startDate: "2026-11-25",
        endDate: "2026-11-27",
        location: "Hyderabad",
        venue: "HITEX Exhibition Center",
        category: "CREW",
        categoryDetails: {
          roles: [
            { roleName: "USHERS_HOSTESSES", count: 8 },
            { roleName: "AV_LIGHTING_TECHNICIANS", count: 4 },
            { roleName: "SECURITY_BOUNCERS", count: 6 },
          ],
          callTime: "07:30",
          shiftHoursPerDay: 9,
          uniformRequired: true,
          dressCode: "Black formal blazer and trousers",
          prerequisites: "Fluent in English and customer handling experience",
          budgetRate: {
            amount: 1500,
            unit: "PER_PERSON_PER_DAY",
            currency: "INR",
          },
        },
      };

      const result = createRequirementSchema.safeParse(validPayload);
      assert.equal(result.success, true);
    });

    test("fails when role headcount is 0 or negative", () => {
      const payload = {
        eventName: "Event Crew Test",
        eventType: "FESTIVAL",
        startDate: "2026-12-05",
        location: "Kolkata",
        category: "CREW",
        categoryDetails: {
          roles: [{ roleName: "STAGEHANDS", count: 0 }], // count must be >= 1
          callTime: "09:00",
          shiftHoursPerDay: 8,
          uniformRequired: false,
          budgetRate: {
            amount: 1000,
            unit: "PER_PERSON_PER_DAY",
            currency: "INR",
          },
        },
      };

      const result = createRequirementSchema.safeParse(payload);
      assert.equal(result.success, false);
      assert.ok(
        result.error.issues.some((i) => i.message.includes("Headcount must be at least 1"))
      );
    });

    test("requires roleNameOther when roleName is OTHER", () => {
      const payload = {
        eventName: "Event Crew Test",
        eventType: "FESTIVAL",
        startDate: "2026-12-05",
        location: "Kolkata",
        category: "CREW",
        categoryDetails: {
          roles: [{ roleName: "OTHER", count: 2, roleNameOther: "" }],
          callTime: "09:00",
          shiftHoursPerDay: 8,
          uniformRequired: false,
          budgetRate: {
            amount: 1000,
            unit: "PER_PERSON_PER_DAY",
            currency: "INR",
          },
        },
      };

      const result = createRequirementSchema.safeParse(payload);
      assert.equal(result.success, false);
      assert.ok(
        result.error.issues.some((i) =>
          i.message.includes("Custom specialization name is required")
        )
      );
    });
  });

  describe("Shared Validation Constraints", () => {
    test("rejects when eventName is missing or less than 2 characters", () => {
      const payload = {
        eventName: "A", // too short
        eventType: "WEDDING",
        startDate: "2026-11-20",
        location: "Dhaka",
        category: "PLANNER",
        categoryDetails: {
          guestCountRange: "50_200",
          planningScope: ["FULL_PLANNING"],
          cateringCoordinationNeeded: false,
          decorLightingNeeded: false,
          budgetRange: { min: 1000, max: 2000 },
        },
      };

      const result = createRequirementSchema.safeParse(payload);
      assert.equal(result.success, false);
      assert.ok(
        result.error.issues.some((i) =>
          i.message.includes("Event name must be at least 2 characters")
        )
      );
    });

    test("rejects when endDate is earlier than startDate", () => {
      const payload = {
        eventName: "Wedding Celebration",
        eventType: "WEDDING",
        startDate: "2026-12-25",
        endDate: "2026-12-20", // earlier than start date
        location: "Dhaka",
        category: "PLANNER",
        categoryDetails: {
          guestCountRange: "50_200",
          planningScope: ["FULL_PLANNING"],
          cateringCoordinationNeeded: false,
          decorLightingNeeded: false,
          budgetRange: { min: 1000, max: 2000 },
        },
      };

      const result = createRequirementSchema.safeParse(payload);
      assert.equal(result.success, false);
      assert.ok(
        result.error.issues.some((i) =>
          i.message.includes("End date cannot be earlier than start date")
        )
      );
    });

    test("rejects invalid category value", () => {
      const payload = {
        eventName: "Wedding Celebration",
        eventType: "WEDDING",
        startDate: "2026-12-25",
        location: "Dhaka",
        category: "INVALID_CATEGORY",
        categoryDetails: {},
      };

      const result = createRequirementSchema.safeParse(payload);
      assert.equal(result.success, false);
    });

    test("rejects mismatched category details (e.g. planner data under crew category)", () => {
      const payload = {
        eventName: "Concert 2026",
        eventType: "CONCERT",
        startDate: "2026-12-25",
        location: "Dhaka",
        category: "CREW",
        categoryDetails: {
          // planner data instead of crew data
          guestCountRange: "50_200",
          planningScope: ["FULL_PLANNING"],
          cateringCoordinationNeeded: false,
          decorLightingNeeded: false,
          budgetRange: { min: 1000, max: 2000 },
        },
      };

      const result = createRequirementSchema.safeParse(payload);
      assert.equal(result.success, false);
    });
  });

  describe("Query Parameters Validation", () => {
    test("validates valid query parameters with defaults", () => {
      const query = {
        category: "PERFORMER",
        page: "2",
        limit: "15",
      };

      const result = listRequirementsQuerySchema.safeParse(query);
      assert.equal(result.success, true);
      assert.equal(result.data.category, "PERFORMER");
      assert.equal(result.data.page, 2);
      assert.equal(result.data.limit, 15);
    });

    test("applies default page and limit", () => {
      const query = {};
      const result = listRequirementsQuerySchema.safeParse(query);
      assert.equal(result.success, true);
      assert.equal(result.data.page, 1);
      assert.equal(result.data.limit, 10);
    });

    test("rejects invalid page number", () => {
      const query = { page: "0" }; // min is 1
      const result = listRequirementsQuerySchema.safeParse(query);
      assert.equal(result.success, false);
    });
  });
});
