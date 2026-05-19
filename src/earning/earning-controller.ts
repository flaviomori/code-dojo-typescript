import { NextFunction, Request, Response, Router } from "express";
import { requireAuth } from "../auth/auth-middleware";
import { BadRequestError } from "../errors";
import {
  EarningCreateRequest,
  EarningUpdateRequest,
  toResponse,
} from "./earning-dtos";
import { EarningRepository } from "./earning-repository";
import { EarningService } from "./earning-service";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function earningRoutes(): Router {
  const router = Router();
  const service = new EarningService(new EarningRepository());

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
      const earnings = await service.listByPractitioner(
        practitionerId.toLowerCase()
      );
      res.json(earnings.map(toResponse));
    } catch (err) {
      next(err);
    }
  });

  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const operator = requireAuth(req);
      const created = await service.create(
        req.body as EarningCreateRequest,
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
        const earning = await service.get(id);
        res.json(toResponse(earning));
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
          req.body as EarningUpdateRequest,
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
