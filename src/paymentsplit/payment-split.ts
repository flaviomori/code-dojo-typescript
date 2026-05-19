import Decimal from "decimal.js";

export type PaymentSplit = {
  id: string;
  practitionerId: string;
  bankAccountId: string;
  sharePercentage: Decimal;
  procedureRef: string | null;
  notes: string | null;
  registeredBy: string;
  updatedBy: string;
  updatedAt: Date;
  createdAt: Date;
};
