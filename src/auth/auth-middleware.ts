import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors";
import { AuthOperator } from "./auth-operator";

declare module "express-serve-static-core" {
  interface Request {
    operator?: AuthOperator;
  }
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const headerValue = req.header("x-operator-id");
  if (!headerValue) {
    return next(new BadRequestError("missing X-Operator-Id header"));
  }
  if (!UUID_PATTERN.test(headerValue)) {
    return next(new BadRequestError("invalid X-Operator-Id"));
  }
  req.operator = { id: headerValue.toLowerCase() };
  next();
}

export function requireAuth(req: Request): AuthOperator {
  if (!req.operator) {
    throw new BadRequestError("missing X-Operator-Id header");
  }
  return req.operator;
}
