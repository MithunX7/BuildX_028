import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Department } from "../models/Department";
import { LoginSchema } from "../validators";
import { signToken, SessionUser, isAdminRole, hashPassword } from "../utils/auth";
import { sendSuccess, sendError } from "../utils/response";
import { ValidationError, UnauthenticatedError, ConflictError } from "../utils/errors";
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

    const normalizedRole = isAdminRole(user.role) ? "ADMIN" : (user.role === "ADMIN" ? "ADMIN" : "USER");

    const sessionUser: SessionUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: normalizedRole,
      departmentId: user.departmentId ? user.departmentId.toString() : undefined,
      departmentCode: deptCode,
      phone: user.phone,
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

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      throw new ValidationError("Name, email, and password are required.");
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new ConflictError("An account with this email address already exists.");
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      role: "USER",
      isActive: true,
    });

    const sessionUser: SessionUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: "USER",
      phone: user.phone,
    };

    const token = signToken(sessionUser);

    return sendSuccess(res, {
      user: sessionUser,
      token,
      message: "Registration successful! Welcome to NagpurOne.",
    }, 201);
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

    const normalizedRole = isAdminRole(user.role) ? "ADMIN" : (user.role === "ADMIN" ? "ADMIN" : "USER");

    return sendSuccess(res, {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: normalizedRole,
        departmentId: user.departmentId?.toString(),
        departmentName: deptName,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      throw new UnauthenticatedError("User is not logged in");
    }

    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new UnauthenticatedError("User not found");
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    await user.save();

    const normalizedRole = isAdminRole(user.role) ? "ADMIN" : (user.role === "ADMIN" ? "ADMIN" : "USER");

    return sendSuccess(res, {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: normalizedRole,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function logout(req: Request, res: Response) {
  return sendSuccess(res, { message: "Successfully logged out" });
}
