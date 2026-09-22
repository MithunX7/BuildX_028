import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Department } from "../models/Department";
import { LoginSchema } from "../validators";
import { signToken, SessionUser } from "../utils/auth";
import { sendSuccess, sendError } from "../utils/response";
import { ValidationError, UnauthenticatedError } from "../utils/errors";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export async function login(req: Request, res: Response) {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError("Invalid login details", parsed.error.format());
    }

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

    const sessionUser: SessionUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as SessionUser["role"],
      departmentId: user.departmentId ? user.departmentId.toString() : undefined,
      departmentCode: deptCode,
    };

    const token = signToken(sessionUser);

    return sendSuccess(res, {
      user: {
        ...sessionUser,
        departmentName: deptName,
      },
      token,
      message: `Welcome back, ${user.name}!`,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      throw new UnauthenticatedError("User is not logged in");
    }

    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      throw new UnauthenticatedError("User no longer exists");
    }

    let deptName: string | undefined;
    if (user.departmentId) {
      const dept = await Department.findById(user.departmentId);
      if (dept) deptName = dept.name;
    }

    return sendSuccess(res, {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId?.toString(),
        departmentName: deptName,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function logout(req: Request, res: Response) {
  return sendSuccess(res, { message: "Successfully logged out" });
}
