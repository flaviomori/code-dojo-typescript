import Decimal from "decimal.js";

export type Earning = {
  id: string;
  practitionerId: string;
  amount: Decimal;
  competencyMonth: string;
  notes: string | null;
  updatedBy: string;
  updatedAt: Date;
  createdAt: Date;
};
