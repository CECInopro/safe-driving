import { useCallback, useEffect, useState } from 'react';
import { type Route } from './useRoute';
import { useAuth } from '../contexts/AuthContext';
const BASE_URL = import.meta.env.VITE_BASE_URL as string;


export const useRoutes = () => {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const builderHeaders = useCallback((): Record<string, string> => {
        const headers: Record<string, string> = {
            'Accept': 'application/json',
            'xRequestId': crypto.randomUUID(),
        };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return headers;
    }, [token]);

    const fetchRoutes = async () => {
        if (!token) return;
        try {
            setLoading(true);
            setError(null);
            const headers = builderHeaders();
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
                routeId: r.routeId,
                routeName: r.routeName,
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
    }

    const createRoute = async (routeData: {
        routeName: string;
        code: string;
        distanceKm: number;
        standardDurationMin: number;
    }): Promise<{ success: boolean; data?: any; error?: string }> => {
        if (!token) {
            return {
                success: false,
                error: "Vui long đăng nhập để thực hiện thao tác này."
            };
        }
        try {
            const form = new FormData();
            form.append('routeName', routeData.routeName);
            form.append('code', routeData.code);
            form.append('distanceKm', routeData.distanceKm.toString());
            form.append('standardDurationMin', routeData.standardDurationMin.toString());
            const headers = builderHeaders();
            const res = await fetch(`${BASE_URL}/api/v1/routes`, {
                method: 'POST',
                headers,
                body: form,
            });

            if (!res.ok) {
                console.error('Create route failed:', res.status, await res.text());
                throw new Error(`Create route failed: ${res.status}`);
            }
            const raw = await res.json();
            await fetchRoutes();
            return {
                success: true,
                data: raw
            };
        } catch (e: any) {
            console.error('Create route error:', e);
            return {
                success: false,
                error: e?.message || 'Không thể tạo tuyến đường mới'
            };
        }
    };
    useEffect(() => {
        if (!token) {
            setRoutes([]);
            return;
        }
        void fetchRoutes();
    }, [fetchRoutes, token]);

    return {
        routes,
        loading,
        error
    };
};


