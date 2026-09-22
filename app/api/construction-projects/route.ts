import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ConstructionProject } from "@/models/ConstructionProject";
import { jsonSuccess, jsonError } from "@/lib/response";

export async function GET() {
  try {
    await connectToDatabase();
    const projects = await ConstructionProject.find({}).sort({ startDate: 1 });
    return jsonSuccess({ projects, count: projects.length });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();

    const project = await ConstructionProject.create({
      name: body.name,
      agencyName: body.agencyName,
      purpose: body.purpose,
      roadName: body.roadName,
      location: {
        type: "Point",
        coordinates: body.coordinates,
      },
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      status: body.status || "PLANNED",
      restorationPlan: body.restorationPlan,
    });

    return jsonSuccess({ project, message: "Construction project registered successfully" }, undefined, 201);
  } catch (error) {
    return jsonError(error);
  }
}
