export type StoreLocation = {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
};

export type Store = {
  _id?: string;
  name: string;
  slug: string;
  addressLine1: string;
  suburb: string;
  city: string;
  province: string;
  postalCode?: string;
  phone?: string;
  hasATM: boolean;
  isActive: boolean;
  services: string[];
  location: StoreLocation;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreFormValues = {
  name: string;
  slug: string;
  addressLine1: string;
  suburb: string;
  city: string;
  province: string;
  postalCode?: string;
  phone?: string;
  hasATM: boolean;
  isActive: boolean;
  services: string[];
  longitude: number;
  latitude: number;
};

export type StoreFilters = {
  province?: string;
  city?: string;
  town?: string;
  suburb?: string;
  atm?: string;
  lat?: string;
  lng?: string;
  radius?: string;
};
