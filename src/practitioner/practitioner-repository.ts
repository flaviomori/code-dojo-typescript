import { getPool } from "../database";
import { Practitioner } from "./practitioner";

export class PractitionerRepository {
  async findById(id: string): Promise<Practitioner | null> {
    const result = await getPool().query(
      `SELECT id, full_name, crm, specialty, created_at
       FROM practitioners WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return toPractitioner(result.rows[0]);
  }

  async findAll(): Promise<Practitioner[]> {
    const result = await getPool().query(
      `SELECT id, full_name, crm, specialty, created_at
       FROM practitioners ORDER BY full_name`
    );
    return result.rows.map(toPractitioner);
  }
}

function toPractitioner(row: any): Practitioner {
  return {
    id: row.id,
    fullName: row.full_name,
    crm: row.crm,
    specialty: row.specialty,
    createdAt: row.created_at,
  };
}
