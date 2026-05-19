import { NextFunction, Request, Response, Router } from "express";
import { requireAuth } from "../auth/auth-middleware";
import { BadRequestError } from "../errors";
import {
  PaymentSplitCreateRequest,
  PaymentSplitUpdateRequest,
  toResponse,
} from "./payment-split-dtos";
import { PaymentSplitRepository } from "./payment-split-repository";
import { PaymentSplitService } from "./payment-split-service";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function paymentSplitRoutes(): Router {
  const router = Router();
  const service = new PaymentSplitService(new PaymentSplitRepository());

  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      requireAuth(req);
      const practitionerId = req.query.practitionerId;
      if (typeof practitionerId !== "string") {
        throw new BadRequestError("practitionerId query parameter is required");
      }
      if (!UUID_PATTERN.test(practitionerId)) {
        throw new BadRequestError("invalid practitionerId");
      }
      const splits = await service.listByPractitioner(
        practitionerId.toLowerCase()
      );
      res.json(splits.map(toResponse));
    } catch (err) {
      next(err);
    }
  });

  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const operator = requireAuth(req);
      const created = await service.create(
        req.body as PaymentSplitCreateRequest,
        operator
      );
      res.status(201).json(toResponse(created));
    } catch (err) {
      next(err);
    }
  });

  router.get(
    "/:id",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        requireAuth(req);
        const id = String(req.params.id);
        if (!UUID_PATTERN.test(id)) {
          throw new BadRequestError("invalid id");
        }
        const split = await service.get(id);
        res.json(toResponse(split));
      } catch (err) {
        next(err);
      }
    }
  );

  router.put(
    "/:id",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const operator = requireAuth(req);
        const id = String(req.params.id);
        if (!UUID_PATTERN.test(id)) {
          throw new BadRequestError("invalid id");
        }
        const updated = await service.update(
          id,
          req.body as PaymentSplitUpdateRequest,
          operator
        );
        res.json(toResponse(updated));
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}
