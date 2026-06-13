import { Request, Response, NextFunction } from "express";
export declare const ADMIN_PASSWORD: string;
export interface AuthRequest extends Request {
    investorId?: number;
    driverId?: number;
    isAdmin?: boolean;
}
/** Accepts investor JWT only (requires investorId claim). Does NOT grant admin access. */
export declare function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void;
/** Accepts admin JWT only (role = "admin"). */
export declare function requireAdminAuth(req: AuthRequest, res: Response, next: NextFunction): void;
/**
 * Accepts either:
 * - Admin JWT (role = "admin"), OR
 * - Approved investor JWT (investorId + DB-backed approvalStatus check).
 * Used only for READ endpoints in admin_investors to preserve backward
 * compatibility with the investor portal's /portal/candidatos page.
 */
export declare function requireAdminOrApprovedAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function signAdminToken(): string;
export declare function requireApproved(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
export declare function signToken(investorId: number): string;
export declare function signDriverToken(driverId: number): string;
export declare function requireDriverAuth(req: AuthRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map