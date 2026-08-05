export type FinedPerson = {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  normalizedName?: string;
  active: boolean;
  createdAt?: unknown;
  createdBy?: string;
  updatedAt?: unknown;
};
