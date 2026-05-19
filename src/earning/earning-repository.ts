import Decimal from "decimal.js";
import { getPool } from "../database";
import { Earning } from "./earning";

export class EarningRepository {
  async findById(id: string): Promise<Earning | null> {
    const result = await getPool().query(
      `SELECT id, practitioner_id, amount, competency_month, notes,
              updated_by, updated_at, created_at
       FROM earnings WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return toEarning(result.rows[0]);
  }

  async findByPractitionerId(practitionerId: string): Promise<Earning[]> {
    const result = await getPool().query(
      `SELECT id, practitioner_id, amount, competency_month, notes,
              updated_by, updated_at, created_at
       FROM earnings WHERE practitioner_id = $1
       ORDER BY competency_month DESC`,
      [practitionerId]
    );
    return result.rows.map(toEarning);
  }

  async save(earning: Earning): Promise<Earning> {
    const exists = await getPool().query(
      `SELECT 1 FROM earnings WHERE id = $1`,
      [earning.id]
    );
    if (exists.rows.length > 0) {
      await getPool().query(
        `UPDATE earnings
         SET practitioner_id = $2, amount = $3, competency_month = $4,
             notes = $5, updated_by = $6, updated_at = $7
         WHERE id = $1`,
        [
          earning.id,
          earning.practitionerId,
          earning.amount.toFixed(),
          earning.competencyMonth,
          earning.notes,
          earning.updatedBy,
          earning.updatedAt,
        ]
      );
    } else {
      await getPool().query(
        `INSERT INTO earnings
           (id, practitioner_id, amount, competency_month, notes,
            updated_by, updated_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          earning.id,
          earning.practitionerId,
          earning.amount.toFixed(),
          earning.competencyMonth,
          earning.notes,
          earning.updatedBy,
          earning.updatedAt,
          earning.createdAt,
        ]
      );
    }
    return earning;
  }
}

function toEarning(row: any): Earning {
  return {
    id: row.id,
    practitionerId: row.practitioner_id,
    amount: new Decimal(row.amount),
    competencyMonth: row.competency_month,
    notes: row.notes,
    updatedBy: row.updated_by,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}
