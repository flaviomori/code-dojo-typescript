import { PaymentSplit } from "./payment-split";

export type PaymentSplitResponse = {
  id: string;
  practitionerId: string;
  bankAccountId: string;
  sharePercentage: string;
  procedureRef: string | null;
  notes: string | null;
  registeredBy: string;
  updatedBy: string;
  updatedAt: string;
};

export type PaymentSplitUpdateRequest = {
  practitionerId?: string;
  bankAccountId?: string;
  sharePercentage?: string;
  procedureRef?: string;
  notes?: string;
};

export type PaymentSplitCreateRequest = {
  practitionerId: string;
  bankAccountId: string;
  sharePercentage: string;
  procedureRef?: string;
  notes?: string;
};

export function toResponse(split: PaymentSplit): PaymentSplitResponse {
  return {
    id: split.id,
    practitionerId: split.practitionerId,
    bankAccountId: split.bankAccountId,
    sharePercentage: split.sharePercentage.toFixed(2),
    procedureRef: split.procedureRef,
    notes: split.notes,
    registeredBy: split.registeredBy,
    updatedBy: split.updatedBy,
    updatedAt: split.updatedAt.toISOString(),
  };
}
