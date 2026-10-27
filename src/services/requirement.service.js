import { ObjectId } from "mongodb";
import { getRequirementsCollection } from "../config/db.js";

/**
 * Format database document for API response (convert ObjectId to string id)
 */
function serializeDocument(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    id: _id.toString(),
    ...rest,
  };
}

export async function createRequirement(validatedPayload) {
  const collection = getRequirementsCollection();

  const now = new Date();
  const newRequirement = {
    eventName: validatedPayload.eventName,
    eventType: validatedPayload.eventType,
    eventTypeOther: validatedPayload.eventTypeOther || null,
    startDate: validatedPayload.startDate,
    endDate: validatedPayload.endDate || null,
    location: validatedPayload.location,
    venue: validatedPayload.venue || null,
    category: validatedPayload.category,
    categoryDetails: validatedPayload.categoryDetails,
    status: "OPEN", // Server-controlled status
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(newRequirement);

  return {
    id: result.insertedId.toString(),
    ...newRequirement,
  };
}

export async function getRequirements({ category, eventType, status, page = 1, limit = 10 }) {
  const collection = getRequirementsCollection();

  const query = {};
  if (category) query.category = category;
  if (eventType) query.eventType = eventType;
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [items, totalItems] = await Promise.all([
    collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 0;

  return {
    items: items.map(serializeDocument),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalItems,
      totalPages,
    },
  };
}

export async function getRequirementById(idString) {
  if (!ObjectId.isValid(idString)) {
    return { error: "INVALID_ID" };
  }

  const collection = getRequirementsCollection();
  const doc = await collection.findOne({ _id: new ObjectId(idString) });

  if (!doc) {
    return null;
  }

  return serializeDocument(doc);
}
