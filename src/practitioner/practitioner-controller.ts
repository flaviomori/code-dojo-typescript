import { NextFunction, Request, Response, Router } from "express";
import { requireAuth } from "../auth/auth-middleware";
import { BadRequestError, NotFoundError } from "../errors";
import { Practitioner } from "./practitioner";
import { PractitionerRepository } from "./practitioner-repository";

type PractitionerResponse = {
  id: string;
  fullName: string;
  crm: string;
  specialty: string;
};

function toResponse(p: Practitioner): PractitionerResponse {
  return {
    id: p.id,
    fullName: p.fullName,
    crm: p.crm,
    specialty: p.specialty,
  };
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function practitionerRoutes(): Router {
  const router = Router();
  const repository = new PractitionerRepository();

  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      requireAuth(req);
      const all = await repository.findAll();
      res.json(all.map(toResponse));
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
        const practitioner = await repository.findById(id);
        if (!practitioner) {
          throw new NotFoundError(`practitioner ${id} not found`);
        }
        res.json(toResponse(practitioner));
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}
