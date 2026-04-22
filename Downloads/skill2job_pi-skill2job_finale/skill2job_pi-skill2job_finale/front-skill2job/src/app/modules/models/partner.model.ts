export interface Partner {
  id?: number;
  employerId?: number; // renvoyé par backend
  companyName: string;
  industry: string;
  companyEmail: string;
  phone: string;
  address: string;
  website?: string;
  description?: string;
  status?: string; // PENDING | APPROVED | REJECTED
  createdAt?: string;
  updatedAt?: string;
}
