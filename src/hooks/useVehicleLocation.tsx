import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const BASE_URL = import.meta.env.VITE_BASE_URL as string;

export type VehicleLocation = {
    position: [number, number];
    vehicleLogId: string | null;
    timeVehicleLog: string | null;
};

export const useVehicleLocation = (vehicleId: string, intervalMs: number = 3000) => {
    const [positions, setPositions] = useState<[number, number][]>([]);
    const [vehicleLogId, setVehicleLogId] = useState<string | null>(null);
    const [timeVehicleLog, setTimeVehicleLog] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        if (!token) {
            setPositions([]);
            setVehicleLogId(null);
            setTimeVehicleLog(null);
            setError(null);
            return;
        }

        let isMounted = true;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/v1/vehicles/location/${vehicleId}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'xRequestId': crypto.randomUUID(),
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    },
                });
                if (!res.ok) {
                    const errorMsg = `Lỗi lấy vị trí xe: ${res.status}`;
                    console.error(errorMsg);
                    setError(errorMsg);
                    return;
                }
                const body = await res.json();
                const payload = body?.data ?? body;

                const lat = Number(payload?.lat);
                const lng = Number(payload?.lng);
                const newPos: [number, number] = [lat, lng];
                setVehicleLogId((payload?.vehicleLogId ?? payload?.vehicle_log_id ?? null) as string | null);
                setTimeVehicleLog((payload?.timeVehicleLog ?? payload?.time_vehicle_log ?? null) as string | null);

                if (!Number.isFinite(newPos[0]) || !Number.isFinite(newPos[1])) return;

                if (!isMounted) return;
                setError(null);
                setPositions(prev => {
                    const last = prev[prev.length - 1];
                    if (!last || last[0] !== newPos[0] || last[1] !== newPos[1]) {
                        return [...prev, newPos];
                    }
                    return prev;
                });
            } catch (err: any) {
                const errorMsg = err?.message || 'Lỗi lấy vị trí xe';
                console.error(errorMsg, err);
                setError(errorMsg);
            }
        }, intervalMs);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [vehicleId, intervalMs, token]);

    const latestPosition = positions[positions.length - 1];
    const location: VehicleLocation | null = latestPosition
        ? {
            position: latestPosition,
            vehicleLogId,
            timeVehicleLog,
        }
        : null;

    return {
        positions,
        location,
        error,
    };
};

