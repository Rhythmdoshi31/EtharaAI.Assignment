import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";
export declare const authorize: (role: "admin" | "member") => (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=role.d.ts.map