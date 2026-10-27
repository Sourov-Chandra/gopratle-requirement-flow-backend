import { Router } from "express";
import {
  createRequirementHandler,
  getRequirementsHandler,
  getRequirementByIdHandler,
} from "../controllers/requirement.controller.js";

const router = Router();

router.post("/", createRequirementHandler);
router.get("/", getRequirementsHandler);
router.get("/:id", getRequirementByIdHandler);

export default router;
