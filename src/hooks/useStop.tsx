import { useAuth } from "../contexts/AuthContext";
import { useState, useCallback, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL as string;


export type AllStop = {
    stopId: string;
    nameStop: string,
    type: string,
    province: string,
    commune: string,
    exactAddress: string,
}

export const useStop = () => {
    const { token } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [AllStop, setAllStop] = useState<AllStop[]>([]);

    const buildHeaders = useCallback(
        (extra: Record<string, string> = {}) => {
            const headers: Record<string, string> = {
                "x-request-id": crypto.randomUUID(),
                "Content-Type": "application/json",
                ...extra,
            };
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
            return headers
        },
        [token]
    );

    const fetchStop = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`${BASE_URL}/api/v1/routes/stop`, {
                method: "GET",
                headers: buildHeaders(),
            });

            if (!res.ok) {
                setError(`Failed to fetch users: ${res.status}`);
                return null;
            }
            const raw = await res.json();
            const payload = raw?.data ?? raw;

            const data = payload.map((d: any) => ({
                stopId: d.stopId,
                nameStop: d.nameStop,
                type: d.type,
                province: d.province,
                commune: d.commune,
                exactAddress: d.exactAddress,
            }))
            setAllStop(data);
            console.log(data);
            return data;
        } catch (err: any) {
            setError(err?.message);
            return;
        } finally {
            setLoading(false);
        }
    }, [token, buildHeaders]);

    useEffect(() => {
        fetchStop();
    }, [fetchStop]);
    return {
        error,
        loading,
        AllStop,
        fetchStop,
    };
}

export default useStop;