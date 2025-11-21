import { useEffect, useState } from 'react';
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

export const useVehicles = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        if (!token) {
            setVehicles([]);
            return;
        }

        const fetchVehicles = async () => {
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
        };
        fetchVehicles();
    }, [token]);

    return { vehicles, loading, error };
};

