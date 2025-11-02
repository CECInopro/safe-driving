import { useEffect, useState } from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL as string;

export type Vehicle = {
    vehicleId: string;
    plateNumber?: string;
    fullName?: string;
};

export const useVehicles = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVehicles = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${BASE_URL}/api/v1/vehicles`, {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                        'xRequestId': crypto.randomUUID(),
                    },
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
                    vehicleId: v.vehicleId ?? v.id ?? v.vehicle_id,
                    plateNumber: v.plateNumber ?? v.plate ?? v.plate_number,
                    fullName: v.fullName ?? v.full_name ?? v.fullname ?? v.fullName ?? v.fullName,
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
    }, []);

    return { vehicles, loading, error };
};

