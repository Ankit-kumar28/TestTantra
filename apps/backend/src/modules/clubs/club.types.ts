export interface CreateClubInput {
  name: string;
  slug: string;
  description?: string;
  collegeName: string;
  contactEmail: string;
  contactPhone?: string;
}