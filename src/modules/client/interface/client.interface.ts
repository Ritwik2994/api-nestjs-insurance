export interface IClient {
  id: string;
  agentId: string | any;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  city: string;
  userType: string;
  dob: string | any;
  location: ILocation;
  isActive: boolean;
}

export interface ILocation {
  address: string;
  city: string;
  state: string;
  zip: string;
}
