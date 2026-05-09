import { Request } from "express";

export interface AuthUser {
  id: number;
  role: "admin" | "member";
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
