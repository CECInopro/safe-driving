// Standardized vehicle data types
export interface Vehicle {
    vehicleId: string;
    plate?: string;
    driver?: string;
    status?: VehicleStatus;
    lastLocation?: VehicleLocation;
    createdAt?: string;
    updatedAt?: string;
}

export interface VehicleLocation {
    lat: number;
    lng: number;
    vehicleLogId?: string;
    timestamp?: string;
    speed?: number;
    direction?: number;
}

export const VehicleStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    MAINTENANCE: 'MAINTENANCE',
    OFFLINE: 'OFFLINE'
} as const;

export type VehicleStatus = typeof VehicleStatus[keyof typeof VehicleStatus];

// Raw data types from backend (various possible formats)
export interface RawVehicleData {
    // Possible field names from backend
    vehicleId?: string;
    id?: string;
    vehicle_id?: string;
    
    plate?: string;
    plateNumber?: string;
    plate_number?: string;
    
    driver?: string;
    driverName?: string;
    driver_name?: string;
    
    status?: string;
    vehicleStatus?: string;
    vehicle_status?: string;
    
    // Location data
    lat?: number | string;
    lng?: number | string;
    longitude?: number | string;
    latitude?: number | string;
    
    // Log data
    vehicleLogId?: string;
    vehicle_log_id?: string;
    timeVehicleLog?: string;
    time_vehicle_log?: string;
    timestamp?: string;
    
    // Additional fields
    createdAt?: string;
    created_at?: string;
    updatedAt?: string;
    updated_at?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
    data?: T;
    items?: T[];
    success?: boolean;
    message?: string;
    error?: string;
}
