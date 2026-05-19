import { randomUUID } from "node:crypto";
import Decimal from "decimal.js";
import { AuthOperator } from "../auth/auth-operator";
import { BadRequestError, NotFoundError } from "../errors";
import { PaymentSplit } from "./payment-split";
import {
  PaymentSplitCreateRequest,
  PaymentSplitUpdateRequest,
} from "./payment-split-dtos";
import { PaymentSplitRepository } from "./payment-split-repository";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class PaymentSplitService {
  constructor(private readonly repository: PaymentSplitRepository) {}

  async get(id: string): Promise<PaymentSplit> {
    const split = await this.repository.findById(id);
    if (!split) throw new NotFoundError(`payment split ${id} not found`);
    return split;
  }

  async listByPractitioner(practitionerId: string): Promise<PaymentSplit[]> {
    return this.repository.findByPractitionerId(practitionerId);
  }

  async create(
    request: PaymentSplitCreateRequest,
    operator: AuthOperator
  ): Promise<PaymentSplit> {
    const practitionerId = parseUuid(request.practitionerId, "practitionerId");
    const bankAccountId = parseUuid(request.bankAccountId, "bankAccountId");
    const share = parseDecimal(request.sharePercentage, "sharePercentage");
    const now = new Date();
    const split: PaymentSplit = {
      id: randomUUID(),
      practitionerId,
      bankAccountId,
      sharePercentage: share,
      procedureRef: request.procedureRef ?? null,
      notes: request.notes ?? null,
      registeredBy: operator.id,
      updatedBy: operator.id,
      updatedAt: now,
      createdAt: now,
    };
    return this.repository.save(split);
  }

  async update(
    id: string,
    patch: PaymentSplitUpdateRequest,
    operator: AuthOperator
  ): Promise<PaymentSplit> {
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError(`payment split ${id} not found`);

    const updated: PaymentSplit = {
      ...current,
      practitionerId: patch.practitionerId
        ? parseUuid(patch.practitionerId, "practitionerId")
        : current.practitionerId,
      bankAccountId: patch.bankAccountId
        ? parseUuid(patch.bankAccountId, "bankAccountId")
        : current.bankAccountId,
      sharePercentage: patch.sharePercentage
        ? parseDecimal(patch.sharePercentage, "sharePercentage")
        : current.sharePercentage,
      procedureRef: patch.procedureRef ?? current.procedureRef,
      notes: patch.notes ?? current.notes,
      updatedBy: operator.id,
      updatedAt: new Date(),
    };

    return this.repository.save(updated);
  }
}

function parseUuid(value: string, field: string): string {
  if (!UUID_PATTERN.test(value)) {
    throw new BadRequestError(`invalid ${field}`);
  }
  return value.toLowerCase();
}

function parseDecimal(value: string, field: string): Decimal {
  try {
    return new Decimal(value);
  } catch {
    throw new BadRequestError(`invalid ${field}`);
  }
}
