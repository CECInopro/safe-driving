import { useEffect, useState } from 'react';
import { type Route } from './useRoute';
import { useAuth } from '../contexts/AuthContext';
const BASE_URL = import.meta.env.VITE_BASE_URL as string;

export const useRoutes = () => {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    useEffect(() => {
        if (!token) {
            setRoutes([]);
            return;
        }

        const fetchRoutes = async () => {
            setLoading(true);
            setError(null);
            try {
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'xRequestId': crypto.randomUUID(),
                };
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }
                const res = await fetch(`${BASE_URL}/api/v1/routes`, {
                    method: 'GET',
                    headers,
                });
                if (!res.ok) throw new Error(`Fetch routes failed: ${res.status}`);
                const raw = await res.json();
                const payload = raw?.data ?? raw;
                console.log('Fetched routes payload:', payload);
                const list = Array.isArray(payload)
                    ? payload
                    : payload ? [payload] : [];

                const normalized: Route[] = list.map((r: any) => ({
                    routeId: r.routeId ?? r.id ?? r.route_id ?? '',
                    routeName: r.routeName ?? r.route_name ?? '',
                    code: r.code ?? null,
                    distanceKm: Number(r.distanceKm ?? r.distance_km ?? 0),
                    standardDurationMin: Number(r.standardDurationMin ?? r.standard_duration_min ?? 0),
                    note: r.note ?? '',
                    isActive: r.isActive ?? r.is_active ?? null,
                    stops: [],
                })).filter((r: Route) => !!r.routeId);

                const uniqueRoutes = Array.from(
                    new Map(normalized.map(r => [r.routeId, r])).values()
                );

                setRoutes(uniqueRoutes);
            } catch (e: any) {
                setError(e?.message || 'Không thể tải danh sách tuyến đường');
                console.error('Fetch routes error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchRoutes();
    }, [token]);

    return { routes, loading, error };
};


