import Decimal from "decimal.js";
import { getPool } from "../database";
import { PaymentSplit } from "./payment-split";

export class PaymentSplitRepository {
  async findById(id: string): Promise<PaymentSplit | null> {
    const result = await getPool().query(
      `SELECT id, practitioner_id, bank_account_id, share_percentage,
              procedure_ref, notes, registered_by, updated_by,
              updated_at, created_at
       FROM payment_splits WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return toPaymentSplit(result.rows[0]);
  }

  async findByPractitionerId(practitionerId: string): Promise<PaymentSplit[]> {
    const result = await getPool().query(
      `SELECT id, practitioner_id, bank_account_id, share_percentage,
              procedure_ref, notes, registered_by, updated_by,
              updated_at, created_at
       FROM payment_splits WHERE practitioner_id = $1
       ORDER BY created_at DESC`,
      [practitionerId]
    );
    return result.rows.map(toPaymentSplit);
  }

  async save(split: PaymentSplit): Promise<PaymentSplit> {
    const exists = await getPool().query(
      `SELECT 1 FROM payment_splits WHERE id = $1`,
      [split.id]
    );
    if (exists.rows.length > 0) {
      await getPool().query(
        `UPDATE payment_splits
         SET practitioner_id = $2, bank_account_id = $3, share_percentage = $4,
             procedure_ref = $5, notes = $6, updated_by = $7, updated_at = $8
         WHERE id = $1`,
        [
          split.id,
          split.practitionerId,
          split.bankAccountId,
          split.sharePercentage.toFixed(),
          split.procedureRef,
          split.notes,
          split.updatedBy,
          split.updatedAt,
        ]
      );
    } else {
      await getPool().query(
        `INSERT INTO payment_splits
           (id, practitioner_id, bank_account_id, share_percentage,
            procedure_ref, notes, registered_by, updated_by,
            updated_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          split.id,
          split.practitionerId,
          split.bankAccountId,
          split.sharePercentage.toFixed(),
          split.procedureRef,
          split.notes,
          split.registeredBy,
          split.updatedBy,
          split.updatedAt,
          split.createdAt,
        ]
      );
    }
    return split;
  }
}

function toPaymentSplit(row: any): PaymentSplit {
  return {
    id: row.id,
    practitionerId: row.practitioner_id,
    bankAccountId: row.bank_account_id,
    sharePercentage: new Decimal(row.share_percentage),
    procedureRef: row.procedure_ref,
    notes: row.notes,
    registeredBy: row.registered_by,
    updatedBy: row.updated_by,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}
