import {
  createRequirementSchema,
  listRequirementsQuerySchema,
} from "../validators/requirement.schema.js";
import {
  createRequirement,
  getRequirements,
  getRequirementById,
} from "../services/requirement.service.js";

function formatZodErrors(zodError) {
  return zodError.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
}

export async function createRequirementHandler(req, res, next) {
  try {
    const parseResult = createRequirementSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formatZodErrors(parseResult.error),
      });
    }

    const created = await createRequirement(parseResult.data);

    return res.status(201).json({
      success: true,
      message: "Requirement created successfully",
      data: created,
    });
  } catch (err) {
    next(err);
  }
}

export async function getRequirementsHandler(req, res, next) {
  try {
    const parseResult = listRequirementsQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: formatZodErrors(parseResult.error),
      });
    }

    const result = await getRequirements(parseResult.data);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getRequirementByIdHandler(req, res, next) {
  try {
    const { id } = req.params;
    const requirement = await getRequirementById(id);

    if (requirement?.error === "INVALID_ID") {
      return res.status(400).json({
        success: false,
        message: "Invalid requirement ID format",
      });
    }

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: requirement,
    });
  } catch (err) {
    next(err);
  }
}
