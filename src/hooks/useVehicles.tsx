import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const BASE_URL = import.meta.env.VITE_BASE_URL as string;

export type Vehicle = {
    vehicleId: string;
    deviceId: string;
    code: string;
    name: string;
    driver: string;
    plateNumber?: string;
};

export type Vehicle_type = {
    id: number;
    code: string;
    name: string;
    description: string;
    capacity: number;
}


export const VehicleTypes: Vehicle_type[] = [
    {
        id: 1,
        code: "TRUCK_S",
        name: "Xe Tải Nhẹ",
        description: "Xe tải có khối lượng thiết kế từ 3.500 kg đến 7.500 kg (phù hợp với C1)",
        capacity: 7500
    },
    {
        id: 2,
        code: "TRUCK_L",
        name: "Xe Tải Nặng",
        description: "Xe tải có khối lượng thiết kế trên 7.500 kg (phù hợp với C)",
        capacity: 99999
    },
    {
        id: 3,
        code: "TRACTOR",
        name: "Đầu Kéo/Container",
        description: "Xe đầu kéo rơ moóc/sơ mi rơ moóc (phù hợp với CE)",
        capacity: 0
    }
];


export const useVehicles = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const fetchVehicles = useCallback(async () => {
        if (!token) {
            setVehicles([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const headers: Record<string, string> = {
                'Content-type': 'application/json',
                'xRequestId': crypto.randomUUID(),
            };
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
            const res = await fetch(`${BASE_URL}/api/v1/vehicles`, {
                method: 'GET',
                headers,
            });
            if (!res.ok) throw new Error(`Fetch vehicles failed: ${res.status}`);
            const raw = await res.json();

            const list = Array.isArray(raw)
                ? raw
                : Array.isArray(raw?.data)
                    ? raw.data
                    : Array.isArray(raw?.items)
                        ? raw.items
                        : [];

            const normalized: Vehicle[] = list.map((v: any) => ({
                vehicleId: v.vehicleId,
                deviceId: v.deviceId || '',
                plateNumber: v.plateNumber,
                name: v.name,
                code: v.code,
                driver: Array.isArray(v.drivers) && v.drivers.length > 0 ? v.drivers[0].fullName : `${v.driverFirstName || ''} ${v.driverLastName || ''}`.trim(),
            })).filter((v: Vehicle) => !!v.vehicleId);

            const uniqueVehicles = Array.from(
                new Map(normalized.map(v => [v.vehicleId, v])).values()
            );

            setVehicles(uniqueVehicles);
        } catch (e: any) {
            setError(e?.message || 'Không thể tải danh sách xe');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    const createVehicle = async (vehicleData: {
        plateNumber: string;
        vin: string;
        vehicleTypeId: number;
        odometerKm: number;
        status: string;
    }): Promise<{ success: boolean; data?: any; error?: string }> => {
        if (!token) {
            return {
                success: false,
                error: 'Vui lòng đăng nhập để thực hiện thao tác này',
            };
        }

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-request-id': crypto.randomUUID(),
                'Authorization': `Bearer ${token}`,
            };

            const body = JSON.stringify({
                plateNumber: vehicleData.plateNumber,
                vin: vehicleData.vin,
                vehicleTypeId: vehicleData.vehicleTypeId,
                odometerKm: vehicleData.odometerKm,
                status: vehicleData.status,
            });

            console.log('Request payload:', body);

            const res = await fetch(`${BASE_URL}/api/v1/vehicles`, {
                method: 'POST',
                headers,
                body,
            });

            const data = await res.json();
            console.log('Server response:', data);

            if (!res.ok) {
                throw new Error(data.message || 'Tạo xe thất bại');
            }

            await fetchVehicles();

            return {
                success: true,
                data: data.data || data,
            };
        } catch (e: any) {
            console.error('Lỗi khi tạo xe:', e);
            return {
                success: false,
                error: e.message || 'Không thể tạo xe',
            };
        }
    };

    return { vehicles, loading, error, fetchVehicles, createVehicle };
};

