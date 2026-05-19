import { Earning } from "./earning";

export type EarningResponse = {
  id: string;
  practitionerId: string;
  amount: string;
  competencyMonth: string;
  notes: string | null;
  updatedBy: string;
  updatedAt: string;
};

export type EarningUpdateRequest = {
  practitionerId?: string;
  amount?: string;
  competencyMonth?: string;
  notes?: string;
};

export type EarningCreateRequest = {
  practitionerId: string;
  amount: string;
  competencyMonth: string;
  notes?: string;
};

export function toResponse(earning: Earning): EarningResponse {
  return {
    id: earning.id,
    practitionerId: earning.practitionerId,
    amount: earning.amount.toFixed(2),
    competencyMonth: earning.competencyMonth,
    notes: earning.notes,
    updatedBy: earning.updatedBy,
    updatedAt: earning.updatedAt.toISOString(),
  };
}
