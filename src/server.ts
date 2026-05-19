import express, { NextFunction, Request, Response } from "express";
import pinoHttp from "pino-http";
import { logger } from "./logger";
import * as db from "./database";
import { authMiddleware } from "./auth/auth-middleware";
import { BadRequestError, NotFoundError } from "./errors";
import { earningRoutes } from "./earning/earning-controller";
import { paymentSplitRoutes } from "./paymentsplit/payment-split-controller";
import { practitionerRoutes } from "./practitioner/practitioner-controller";

export async function buildApp(): Promise<express.Express> {
  const app = express();
  app.use(express.json());
  app.use(pinoHttp({ logger }));
  app.use(authMiddleware);

  app.use("/practitioners", practitionerRoutes());
  app.use("/earnings", earningRoutes());
  app.use("/payment-splits", paymentSplitRoutes());

  app.use(
    (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
      if (err instanceof NotFoundError) {
        res.status(404).json({ error: err.message });
        return;
      }
      if (err instanceof BadRequestError) {
        res.status(400).json({ error: err.message });
        return;
      }
      logger.error({ err }, "unhandled error");
      res.status(500).json({ error: "internal server error" });
    }
  );

  return app;
}

async function main(): Promise<void> {
  await db.init();
  const app = await buildApp();
  const port = Number(process.env.PORT ?? 8080);
  app.listen(port, () => {
    logger.info(`server listening on http://localhost:${port}`);
  });
}

if (require.main === module) {
  main().catch((err) => {
    logger.error({ err }, "fatal error during startup");
    process.exit(1);
  });
}
