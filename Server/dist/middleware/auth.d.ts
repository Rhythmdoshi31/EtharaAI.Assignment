import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map