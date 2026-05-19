import { randomUUID } from "node:crypto";
import Decimal from "decimal.js";
import { AuthOperator } from "../auth/auth-operator";
import { BadRequestError, NotFoundError } from "../errors";
import { Earning } from "./earning";
import {
  EarningCreateRequest,
  EarningUpdateRequest,
} from "./earning-dtos";
import { EarningRepository } from "./earning-repository";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class EarningService {
  constructor(private readonly repository: EarningRepository) {}

  async get(id: string): Promise<Earning> {
    const earning = await this.repository.findById(id);
    if (!earning) throw new NotFoundError(`earning ${id} not found`);
    return earning;
  }

  async listByPractitioner(practitionerId: string): Promise<Earning[]> {
    return this.repository.findByPractitionerId(practitionerId);
  }

  async create(
    request: EarningCreateRequest,
    operator: AuthOperator
  ): Promise<Earning> {
    const practitionerId = parseUuid(request.practitionerId, "practitionerId");
    const amount = parseAmount(request.amount);
    const now = new Date();
    const earning: Earning = {
      id: randomUUID(),
      practitionerId,
      amount,
      competencyMonth: request.competencyMonth,
      notes: request.notes ?? null,
      updatedBy: operator.id,
      updatedAt: now,
      createdAt: now,
    };
    return this.repository.save(earning);
  }

  async update(
    id: string,
    patch: EarningUpdateRequest,
    operator: AuthOperator
  ): Promise<Earning> {
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError(`earning ${id} not found`);

    const updated: Earning = {
      ...current,
      practitionerId: patch.practitionerId
        ? parseUuid(patch.practitionerId, "practitionerId")
        : current.practitionerId,
      amount: patch.amount ? parseAmount(patch.amount) : current.amount,
      competencyMonth: patch.competencyMonth ?? current.competencyMonth,
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

function parseAmount(value: string): Decimal {
  try {
    return new Decimal(value);
  } catch {
    throw new BadRequestError("invalid amount");
  }
}
