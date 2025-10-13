import type { Vehicle, VehicleLocation, RawVehicleData, ApiResponse } from '../types/vehicle';
import { VehicleStatus as VehicleStatusEnum } from '../types/vehicle';

class VehicleService {
    private baseUrl = 'http://26.186.182.141:8080/api/v1';
    
    /**
     * Generate request headers with unique request ID
     */
    private getHeaders(): HeadersInit {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'xRequestId': crypto.randomUUID(),
        };
    }

    /**
     * Normalize raw vehicle data from backend to standardized format
     */
    private normalizeVehicleData(rawData: RawVehicleData): Vehicle {
        return {
            vehicleId: rawData.vehicleId || rawData.id || rawData.vehicle_id || '',
            plate: rawData.plate || rawData.plateNumber || rawData.plate_number,
            driver: rawData.driver || rawData.driverName || rawData.driver_name,
            status: this.normalizeStatus(rawData.status || rawData.vehicleStatus || rawData.vehicle_status),
            lastLocation: this.normalizeLocation(rawData),
            createdAt: rawData.createdAt || rawData.created_at,
            updatedAt: rawData.updatedAt || rawData.updated_at,
        };
    }

    /**
     * Normalize location data from various field names
     */
    private normalizeLocation(rawData: RawVehicleData): VehicleLocation | undefined {
        const lat = this.parseCoordinate(rawData.lat || rawData.latitude);
        const lng = this.parseCoordinate(rawData.lng || rawData.longitude);
        
        if (lat === null || lng === null) {
            return undefined;
        }

        return {
            lat,
            lng,
            vehicleLogId: rawData.vehicleLogId || rawData.vehicle_log_id,
            timestamp: rawData.timeVehicleLog || rawData.time_vehicle_log || rawData.timestamp,
        };
    }

    /**
     * Parse coordinate value (handle both string and number)
     */
    private parseCoordinate(value: any): number | null {
        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : null;
        }
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) ? parsed : null;
        }
        return null;
    }

    /**
     * Normalize status string to enum
     */
    private normalizeStatus(status?: string): Vehicle['status'] {
        if (!status) return undefined;
        
        const upperStatus = status.toUpperCase();
        switch (upperStatus) {
            case 'ACTIVE':
            case 'ONLINE':
            case 'RUNNING':
                return VehicleStatusEnum.ACTIVE;
            case 'INACTIVE':
            case 'OFFLINE':
            case 'STOPPED':
                return VehicleStatusEnum.INACTIVE;
            case 'MAINTENANCE':
            case 'REPAIR':
                return VehicleStatusEnum.MAINTENANCE;
            default:
                return VehicleStatusEnum.OFFLINE;
        }
    }

    /**
     * Fetch all vehicles from backend
     */
    async fetchVehicles(): Promise<Vehicle[]> {
        try {
            const response = await fetch(`${this.baseUrl}/vehicles`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch vehicles: ${response.status} ${response.statusText}`);
            }

            const data: ApiResponse<RawVehicleData> | RawVehicleData[] = await response.json();
            
            // Handle different response formats
            let rawVehicles: RawVehicleData[];
            if (Array.isArray(data)) {
                rawVehicles = data;
            } else if (data.items && Array.isArray(data.items)) {
                rawVehicles = data.items;
            } else if (data.data) {
                rawVehicles = Array.isArray(data.data) ? data.data : [data.data];
            } else {
                rawVehicles = [];
            }

            // Normalize and filter valid vehicles
            return rawVehicles
                .map(raw => this.normalizeVehicleData(raw))
                .filter(vehicle => vehicle.vehicleId); // Only include vehicles with valid ID
                
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            throw new Error(`Không thể tải danh sách xe: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Fetch real-time location for a specific vehicle
     */
    async fetchVehicleLocation(vehicleId: string): Promise<VehicleLocation | null> {
        try {
            const response = await fetch(`${this.baseUrl}/vehicles/location/${vehicleId}`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            if (!response.ok) {
                console.error(`Failed to fetch location for vehicle ${vehicleId}:`, response.status);
                return null;
            }

            const rawData: RawVehicleData = await response.json();
            const location = this.normalizeLocation(rawData);
            
            return location || null;
                
        } catch (error) {
            console.error(`Error fetching location for vehicle ${vehicleId}:`, error);
            return null;
        }
    }

    /**
     * Get vehicle by ID from the vehicles list
     */
    async getVehicleById(vehicleId: string): Promise<Vehicle | null> {
        try {
            const vehicles = await this.fetchVehicles();
            return vehicles.find(vehicle => vehicle.vehicleId === vehicleId) || null;
        } catch (error) {
            console.error(`Error getting vehicle ${vehicleId}:`, error);
            return null;
        }
    }
}

// Export singleton instance
export const vehicleService = new VehicleService();
export default vehicleService;
