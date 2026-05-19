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
import { PaymentSplit } from "../../src/paymentsplit/payment-split";
import { PaymentSplitRepository } from "../../src/paymentsplit/payment-split-repository";
import { PaymentSplitService } from "../../src/paymentsplit/payment-split-service";

const PRACTITIONER_ID = "11111111-1111-1111-1111-111111111111";
const OTHER_PRACTITIONER_ID = "22222222-2222-2222-2222-222222222222";
const BANK_ACCOUNT_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const OTHER_BANK_ACCOUNT_ID = "dddddddd-dddd-dddd-dddd-dddddddddddd";
const OPERATOR = { id: "99999999-9999-9999-9999-999999999999" };

describe("PaymentSplitService", () => {
  let repository: PaymentSplitRepository;
  let service: PaymentSplitService;

  beforeAll(async () => {
    await startTestDatabase();
    repository = new PaymentSplitRepository();
    service = new PaymentSplitService(repository);
  }, 120_000);

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await getPool().query("DELETE FROM payment_splits");
  });

  async function seedSplit(opts?: {
    sharePercentage?: Decimal;
    procedureRef?: string | null;
    notes?: string | null;
  }): Promise<string> {
    const now = new Date();
    const split: PaymentSplit = {
      id: randomUUID(),
      practitionerId: PRACTITIONER_ID,
      bankAccountId: BANK_ACCOUNT_ID,
      sharePercentage: opts?.sharePercentage ?? new Decimal("60.00"),
      procedureRef:
        opts?.procedureRef === undefined
          ? "Cirurgia cardiovascular #2026-10-014"
          : opts.procedureRef,
      notes: opts?.notes ?? null,
      registeredBy: OPERATOR.id,
      updatedBy: OPERATOR.id,
      updatedAt: now,
      createdAt: now,
    };
    await repository.save(split);
    return split.id;
  }

  it("update changes the share percentage when provided", async () => {
    const id = await seedSplit({ sharePercentage: new Decimal("60.00") });

    const result = await service.update(
      id,
      { sharePercentage: "40.00" },
      OPERATOR
    );

    expect(result.sharePercentage.eq("40.00")).toBe(true);
    const persisted = await repository.findById(id);
    expect(persisted).not.toBeNull();
    expect(persisted!.sharePercentage.eq("40.00")).toBe(true);
  });

  it("update preserves untouched fields", async () => {
    const id = await seedSplit({
      sharePercentage: new Decimal("55.50"),
      procedureRef: "Consulta ambulatorial #2026-09-002",
      notes: null,
    });

    const result = await service.update(
      id,
      { notes: "Revisado pelo financeiro" },
      OPERATOR
    );

    expect(result.sharePercentage.eq("55.50")).toBe(true);
    expect(result.procedureRef).toBe("Consulta ambulatorial #2026-09-002");
    expect(result.notes).toBe("Revisado pelo financeiro");
  });

  it("create persists a new payment split for the practitioner", async () => {
    const created = await service.create(
      {
        practitionerId: PRACTITIONER_ID,
        bankAccountId: BANK_ACCOUNT_ID,
        sharePercentage: "72.50",
        procedureRef: "Procedimento eletivo #2026-11-007",
      },
      OPERATOR
    );

    expect(created.practitionerId).toBe(PRACTITIONER_ID);
    expect(created.bankAccountId).toBe(BANK_ACCOUNT_ID);
    expect(created.sharePercentage.eq("72.50")).toBe(true);

    const persisted = await repository.findById(created.id);
    expect(persisted).not.toBeNull();
    expect(persisted!.sharePercentage.eq("72.50")).toBe(true);
  });

  it("listByPractitioner returns payment splits scoped to the practitioner", async () => {
    await seedSplit({ sharePercentage: new Decimal("60.00") });
    await seedSplit({
      sharePercentage: new Decimal("40.00"),
      procedureRef: "Outra cirurgia",
    });
    await repository.save({
      id: randomUUID(),
      practitionerId: OTHER_PRACTITIONER_ID,
      bankAccountId: OTHER_BANK_ACCOUNT_ID,
      sharePercentage: new Decimal("100.00"),
      procedureRef: "Procedimento de outro prestador",
      notes: null,
      registeredBy: OPERATOR.id,
      updatedBy: OPERATOR.id,
      updatedAt: new Date(),
      createdAt: new Date(),
    });

    const results = await service.listByPractitioner(PRACTITIONER_ID);

    expect(results).toHaveLength(2);
    results.forEach((s) => expect(s.practitionerId).toBe(PRACTITIONER_ID));
  });
});
