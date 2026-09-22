import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { UserRole } from "../types/auth";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  departmentId?: Types.ObjectId;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["USER", "ADMIN", "COMMANDER", "COORDINATOR", "INSPECTOR", "VERIFIER", "OPERATOR", "CITIZEN"],
      default: "USER",
    },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    phone: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
