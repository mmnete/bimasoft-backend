
// src/enums/EntityType.ts

export type AccountStatus =
    | 'active'
    | 'inactive'
    | 'pending_approval'
    | 'suspended'
    | 'deleted';

export enum EntityType {
    INSURANCE_COMPANY = 'insurance_company',
    INSURANCE_BROKER = 'insurance_broker',
}

export interface InsuranceCompanyData {
    legalName: string;
    brelaRegistrationNumber: string;
    tinNumber: string;
    tiraLicenseNumber?: string; // Optional field
    contactEmail: string;
    contactPhone: string;
    physicalAddress: string;
    insuranceTypes?: string[]; // Optional field
    paymentMethods?: string; // Optional field
    accountStatus?: AccountStatus; // Optional field
    companyDetailsUrl?: string; // Optional field
}

export interface UserData {
    fullName: string;
    email: string;
    phoneNumber?: string;
    role: string;
    insuranceEntityId: number;
    entityType: EntityType;
    status?: string;
}

export interface InsuranceEntity {
    id?: string;
    type: string;
    legalName: string;
    brelaNumber: string;
    tinNumber: string;
    contactEmail: string;
    contactPhone: string;
    tiraLicense?: string; // Optional field
    insuranceTypes: string[]; // Array of strings
    paymentMethods: PaymentMethod[]; // Array of payment methods
    adminFullname: string;
    adminEmail: string;
    country: string;
    city: string;
    poBox?: string; // Optional field
    floorBuilding?: string; // Optional field
    street: string;
    companyDetailsUrl: string; // Optional field for company details URL
}

export interface PaymentMethod {
    method: string;
    details: {
        phone_number?: string;
        account_name?: string;
        account_number?: string;
        bank_name?: string;
    };
}

// Motor details.
export type MotorDetails = {
    make: string;
    model: string;
    vehicleType: string;
};

export type MotorResponse = {
    make: string;
    model: string;
    vehicleType: string;
    iconUrl: string; // URL of the icon based on vehicle type
    isCommercial: boolean;
};

export type VehicleType = 'Car' | 'Bike' | 'Bus' | 'Truck' | 'Van' | 'Unknown';

export const vehicleIcons: Record<VehicleType, string> = {
    Car: 'https://media.istockphoto.com/id/487808933/photo/shiny-red-sedan-in-the-outdoors.jpg?s=612x612&w=0&k=20&c=raO4oo2LV5HWQ0iUC2zOpTwcQK2iFoUIFwuVsH51MhY=',
    Bike: 'https://atlas-content-cdn.pixelsquid.com/stock-images/generic-motorcycle-8JoEyvE-600.jpg',
    Bus: 'https://img-new.cgtrader.com/items/3391235/7c40e6c98a/large/generic-bus-6x2-3d-model-max-obj-fbx-c4d-ma-blend.jpg',
    Truck: 'https://www.renderhub.com/jenek/generic-truck-4x2-with-trailer/generic-truck-4x2-with-trailer-01.jpg',
    Van: 'https://atlas-content-cdn.pixelsquid.com/stock-images/cargo-van-generic-white-mrEEZ9E-600.jpg',
    Unknown: 'https://media.istockphoto.com/id/1390785589/photo/car-in-a-studio.jpg?s=612x612&w=0&k=20&c=nfrfuGlQHS28sfnV6RGm-EGSAYuAUJ9jRsCzCsOgPo8=',
};
