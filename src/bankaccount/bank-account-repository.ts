import { getPool } from "../database";
import { BankAccount } from "./bank-account";

export class BankAccountRepository {
  async findById(id: string): Promise<BankAccount | null> {
    const result = await getPool().query(
      `SELECT id, practitioner_id, bank_code, agency, account_number, created_at
       FROM bank_accounts WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) return null;
    return toBankAccount(result.rows[0]);
  }

  async findByPractitioner(practitionerId: string): Promise<BankAccount[]> {
    const result = await getPool().query(
      `SELECT id, practitioner_id, bank_code, agency, account_number, created_at
       FROM bank_accounts WHERE practitioner_id = $1`,
      [practitionerId]
    );
    return result.rows.map(toBankAccount);
  }
}

function toBankAccount(row: any): BankAccount {
  return {
    id: row.id,
    practitionerId: row.practitioner_id,
    bankCode: row.bank_code,
    agency: row.agency,
    accountNumber: row.account_number,
    createdAt: row.created_at,
  };
}
