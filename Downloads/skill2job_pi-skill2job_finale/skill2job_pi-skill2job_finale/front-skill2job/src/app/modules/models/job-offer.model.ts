export interface JobOffer {
  id?: number;
  partnerId: number;
  title: string;
  description: string;
  location?: string;
  type: string; // INTERNSHIP | JOB
  mode: string; // ONSITE | REMOTE | HYBRID
  requirements?: string;
  deadline?: string; // yyyy-MM-dd
  status?: string; // OPEN | CLOSED
  // selon ton backend (partner renvoyé ou pas)
  partner?: { id: number; companyName?: string; name?: string };
  partnerName?: string;
}
