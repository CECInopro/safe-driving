import { useEffect, useState } from 'react';
const BASE_URL = import.meta.env.VITE_BASE_URL as string;

export type Stop = {
    stopId: string;
    nameStop: string;
    type: string;
    exact_address: string | null;
    lat: number;
    lng: number;
    order: number;
};

export type Route = {
    routeId: string;
    routeName: string;
    code: string | null;
    distanceKm: number;
    standardDurationMin: number;
    note: string;
    isActive: boolean | null;
    stops: Stop[];
};

export const useRoute = (routeId: string | null) => {
    const [route, setRoute] = useState<Route | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!routeId) {
            setRoute(null);
            setLoading(false);
            setError(null);
            return;
        }

        const fetchRoute = async () => {
            setLoading(true);
            setError(null);
            try {

                const res = await fetch(`${BASE_URL}/api/v1/routes/${routeId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'xRequestId': crypto.randomUUID(),
                    },
                });

                if (!res.ok) {
                    throw new Error(`Fetch route failed: ${res.status}`);
                }

                const raw = await res.json();
                // Response format: { success, message, data: { routeId, ..., stop: [...] } }
                const payload = raw?.data ?? raw;

                if (!payload) {
                    throw new Error('Route data not found');
                }

                // Normalize route data
                // Note: API returns field "stop" (singular) not "stops" for single route endpoint
                const normalized: Route = {
                    routeId: payload.routeId ?? payload.id ?? payload.route_id ?? routeId,
                    routeName: payload.routeName ?? payload.route_name ?? '',
                    code: payload.code ?? null,
                    distanceKm: Number(payload.distanceKm ?? payload.distance_km ?? 0),
                    standardDurationMin: Number(payload.standardDurationMin ?? payload.standard_duration_min ?? 0),
                    note: payload.note ?? '',
                    isActive: payload.isActive ?? payload.is_active ?? null,
                    // API returns "stop" field (singular) for single route endpoint
                    stops: (payload.stop ?? payload.stops ?? []).map((s: any) => ({
                        stopId: s.stopId ?? s.stop_id ?? '',
                        nameStop: s.nameStop ?? s.name_stop ?? '',
                        type: s.type ?? '',
                        exact_address: s.exact_address ?? s.exactAddress ?? null,
                        lat: Number(s.lat ?? 0),
                        lng: Number(s.lng ?? 0),
                        order: Number(s.order ?? 0),
                    })),
                };

                setRoute(normalized);
            } catch (e: any) {
                setError(e?.message || 'Không thể tải thông tin tuyến đường');
                console.error('Fetch route error:', e);
                setRoute(null);
            } finally {
                setLoading(false);
            }
        };

        fetchRoute();
    }, [routeId]);

    return { route, loading, error };
};

