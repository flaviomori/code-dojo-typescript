import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import Decimal from "decimal.js";
import { randomUUID } from "node:crypto";
import { startTestDatabase, stopTestDatabase } from "../helpers/test-db";
import { getPool } from "../../src/database";
import { Earning } from "../../src/earning/earning";
import { EarningRepository } from "../../src/earning/earning-repository";
import { EarningService } from "../../src/earning/earning-service";

const PRACTITIONER_ID = "11111111-1111-1111-1111-111111111111";
const OTHER_PRACTITIONER_ID = "22222222-2222-2222-2222-222222222222";
const OPERATOR = { id: "99999999-9999-9999-9999-999999999999" };

describe("EarningService", () => {
  let repository: EarningRepository;
  let service: EarningService;

  beforeAll(async () => {
    await startTestDatabase();
    repository = new EarningRepository();
    service = new EarningService(repository);
  }, 120_000);

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await getPool().query("DELETE FROM earnings");
  });

  async function seedEarning(opts?: {
    amount?: Decimal;
    competencyMonth?: string;
    notes?: string | null;
  }): Promise<string> {
    const now = new Date();
    const earning: Earning = {
      id: randomUUID(),
      practitionerId: PRACTITIONER_ID,
      amount: opts?.amount ?? new Decimal("5000.00"),
      competencyMonth: opts?.competencyMonth ?? "2026-10",
      notes: opts?.notes ?? "Repasse mensal",
      updatedBy: OPERATOR.id,
      updatedAt: now,
      createdAt: now,
    };
    await repository.save(earning);
    return earning.id;
  }

  it("update changes the amount when provided", async () => {
    const id = await seedEarning({ amount: new Decimal("5000.00") });

    const result = await service.update(id, { amount: "4850.00" }, OPERATOR);

    expect(result.amount.eq("4850.00")).toBe(true);
    const persisted = await repository.findById(id);
    expect(persisted).not.toBeNull();
    expect(persisted!.amount.eq("4850.00")).toBe(true);
  });

  it("update preserves untouched fields", async () => {
    const id = await seedEarning({
      amount: new Decimal("3200.00"),
      competencyMonth: "2026-09",
      notes: "Plantão noturno",
    });

    const result = await service.update(
      id,
      { notes: "Plantão noturno - revisado" },
      OPERATOR
    );

    expect(result.amount.eq("3200.00")).toBe(true);
    expect(result.competencyMonth).toBe("2026-09");
    expect(result.notes).toBe("Plantão noturno - revisado");
  });

  it("create persists a new earning for the practitioner", async () => {
    const created = await service.create(
      {
        practitionerId: PRACTITIONER_ID,
        amount: "7200.00",
        competencyMonth: "2026-11",
        notes: "Repasse extra",
      },
      OPERATOR
    );

    expect(created.practitionerId).toBe(PRACTITIONER_ID);
    expect(created.amount.eq("7200.00")).toBe(true);
    expect(created.competencyMonth).toBe("2026-11");

    const persisted = await repository.findById(created.id);
    expect(persisted).not.toBeNull();
    expect(persisted!.amount.eq("7200.00")).toBe(true);
  });

  it("listByPractitioner returns earnings scoped to the practitioner", async () => {
    await seedEarning({
      amount: new Decimal("5000.00"),
      competencyMonth: "2026-09",
    });
    await seedEarning({
      amount: new Decimal("5100.00"),
      competencyMonth: "2026-10",
    });
    await repository.save({
      id: randomUUID(),
      practitionerId: OTHER_PRACTITIONER_ID,
      amount: new Decimal("4200.00"),
      competencyMonth: "2026-10",
      notes: null,
      updatedBy: OPERATOR.id,
      updatedAt: new Date(),
      createdAt: new Date(),
    });

    const results = await service.listByPractitioner(PRACTITIONER_ID);

    expect(results).toHaveLength(2);
    results.forEach((e) => expect(e.practitionerId).toBe(PRACTITIONER_ID));
    expect(results.some((e) => e.competencyMonth === "2026-10")).toBe(true);
  });
});
