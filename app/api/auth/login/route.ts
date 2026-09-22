import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Department } from "@/models/Department";
import { LoginSchema } from "@/lib/validations";
import { setSessionCookie } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/response";
import { ValidationError, UnauthenticatedError } from "@/lib/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid login details", parsed.error.format());
    }

    await connectToDatabase();

    const user = await User.findOne({ email: parsed.data.email.toLowerCase(), isActive: true });
    if (!user) {
      throw new UnauthenticatedError("Invalid email or password");
    }

    const isValidPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthenticatedError("Invalid email or password");
    }

    let deptName: string | undefined;
    let deptCode: string | undefined;
    if (user.departmentId) {
      const dept = await Department.findById(user.departmentId);
      if (dept) {
        deptName = dept.name;
        deptCode = dept.code;
      }
    }

    const sessionUser = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId ? user.departmentId.toString() : undefined,
      departmentName: deptName,
      departmentCode: deptCode,
    };

    await setSessionCookie(sessionUser);

    return jsonSuccess({
      user: sessionUser,
      message: `Welcome back, ${user.name}!`,
    });
  } catch (error) {
    return jsonError(error);
  }
}
