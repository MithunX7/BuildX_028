import { Request, Response } from "express";
import { ConstructionProject } from "../models/ConstructionProject";
import { ConstructionConflict } from "../models/ConstructionConflict";
import { sendSuccess, sendError } from "../utils/response";

export async function getProjects(req: Request, res: Response) {
  try {
    const { status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const projects = await ConstructionProject.find(filter).sort({ startDate: 1 });
    return sendSuccess(res, projects);
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getConflicts(req: Request, res: Response) {
  try {
    const conflicts = await ConstructionConflict.find({ status: "ACTIVE" })
      .populate("projectId", "name agencyName roadName location startDate endDate")
      .populate("issueId", "referenceCode title category location priorityLevel")
      .sort({ createdAt: -1 });

    return sendSuccess(res, { conflicts, count: conflicts.length });
  } catch (error) {
    return sendError(res, error);
  }
}
