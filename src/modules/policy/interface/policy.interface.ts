export interface IPolicy {
  id: string;
  clientId: string | any;
  policyMode: number;
  producer: string;
  policyNumber: string;
  premiumAmountWritten?: string;
  premiumAmount: number;
  policyType: string;
  companyName: string;
  categoryName: string;
  policyStartDate: string | any;
  policyEndDate: string | any;
  csr: string;
  accountName: string;
  agencyId: string;
  isActive: boolean;
}
