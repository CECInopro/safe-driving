import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const BASE_URL = import.meta.env.VITE_BASE_URL as string;

export type UserByMonth = {
    yearMonth: string
    userCount: number
}

export type TripCompletedByMonth = {
    yearMonth: string
    completedTripCount: number
}

export type ViolationByMonth = {
    yearMonth: string
    lateTripCount: number
    alcoholViolationCount: number
    somnolenceViolationCount: number
    totalViolationCount: number
}

export const useHome = () => {
    const { token } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [usersByMonth, setUsersByMonth] = useState<UserByMonth[]>([]);
    const [tripsByMonth, setTripsByMonth] = useState<TripCompletedByMonth[]>([]);
    const [violationsByMonth, setViolationsByMonth] = useState<ViolationByMonth[]>([]);

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

    const fetchUseByMonth = useCallback(async (): Promise<UserByMonth[]> => {
        setLoading(true);
        setError(null);
        if (!token) {
            setLoading(false);
            return [];
        }
        try {
            const res = await fetch(`${BASE_URL}/api/v1/statistics/users/by-month`, {
                method: "GET",
                headers: buildHeaders(),
            });

            if (!res.ok) {
                setError(`Failed to fetch users: ${res.status}`);
                return [];
            }
            const raw = await res.json();
            const payload = raw?.data ?? raw;
            if (!Array.isArray(payload)) {
                setError("Invalid response format");
                return [];
            }
            const data = payload.map((u: any) => ({
                yearMonth: u.yearMonth,
                userCount: u.userCount,
            }));
            setUsersByMonth(data);
            return data;
        } catch (err: any) {
            setError(err?.message || "Failed to fetch users");
            return [];
        } finally {
            setLoading(false);
        }

    }, [token, buildHeaders])

    const fetchTripCompletedByMonth = useCallback(async (): Promise<TripCompletedByMonth[]> => {
        setLoading(true);
        setError(null);
        if (!token) {
            setLoading(false);
            return [];
        }
        try {
            const res = await fetch(`${BASE_URL}/api/v1/statistics/trips/completed/by-month`, {
                method: "GET",
                headers: buildHeaders(),
            });

            if (!res.ok) {
                setError(`Failed to fetch trips: ${res.status}`);
                return [];
            }
            const raw = await res.json();
            const payload = raw?.data ?? raw;
            if (!Array.isArray(payload)) {
                setError("Invalid response format");
                return [];
            }
            const data = payload.map((t: any) => ({
                yearMonth: t.yearMonth,
                completedTripCount: t.completedTripCount,
            }));
            setTripsByMonth(data);
            return data;
        } catch (err: any) {
            setError(err?.message || "Failed to fetch trips");
            return [];
        } finally {
            setLoading(false);
        }

    }, [token, buildHeaders])

    const fetchViolationByMonth = useCallback(async (): Promise<ViolationByMonth[]> => {
        setLoading(true);
        setError(null);
        if (!token) {
            setLoading(false);
            return [];
        }
        try {
            const res = await fetch(`${BASE_URL}/api/v1/statistics/violations/by-month`, {
                method: "GET",
                headers: buildHeaders(),
            });

            if (!res.ok) {
                setError(`Failed to fetch violations: ${res.status}`);
                return [];
            }
            const raw = await res.json();
            const payload = raw?.data ?? raw;
            if (!Array.isArray(payload)) {
                setError("Invalid response format");
                return [];
            }
            const data = payload.map((v: any) => ({
                yearMonth: v.yearMonth,
                lateTripCount: v.lateTripCount,
                alcoholViolationCount: v.alcoholViolationCount,
                somnolenceViolationCount: v.somnolenceViolationCount,
                totalViolationCount: v.totalViolationCount,
            }));
            setViolationsByMonth(data);
            return data;
        } catch (err: any) {
            setError(err?.message || "Failed to fetch violations");
            return [];
        } finally {
            setLoading(false);
        }

    }, [token, buildHeaders])

    useEffect(() => {
        fetchUseByMonth();
        fetchTripCompletedByMonth();
        fetchViolationByMonth();
    }, [fetchUseByMonth, fetchTripCompletedByMonth, fetchViolationByMonth]);

    return {
        fetchTripCompletedByMonth,
        fetchUseByMonth,
        fetchViolationByMonth,
        usersByMonth,
        tripsByMonth,
        violationsByMonth,
        error,
        loading,
    };
}

export default useHome;