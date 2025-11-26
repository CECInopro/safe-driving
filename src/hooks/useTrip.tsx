import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL as string;

export type Stop = {
    stopId: string;
    nameStop: string;
    type: string;
    exactAddress: string;
    commune: string;
    province: string;
    lat: number;
    lng: number;
    order: number;
    arrive: string | null;
};

export type Trip = {
    tripId: string;
    currentOrder: number;
    startTime: string;
    endTime: string;
    plannedStartTime: string;
    plannedEndTime: string;
    routeId: string;
    routeName: string;
    code: string;
    distanceKm: number;
    standardDurationMin: number;
    note: string;
    isActive: number;
    totalStop: number;
    stop: Stop[];
};

export type Assignment = {
    assignmentId: string;
    assignmentAt: string;
    tripId: string;
    accountId: string;
    driverId: string;
    vehicleId: string;
};

export type DriverInfo = {
    id: string;
    driverId?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
};

export type VehicleInfo = {
    vehicleId: string;
    plateNumber?: string;
    name?: string;
    code?: string;
};

export type AccountInfo = {
    accountId: string;
    username?: string;
    role?: string;
    status?: string;
};

export type TripWithAssignment = Trip & {
    assignment?: {
        assignmentId: string;
        assignmentAt: string;
        driver?: DriverInfo;
        vehicle?: VehicleInfo;
        account?: AccountInfo;
    };
};

const useTrip = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [tripsWithAssignment, setTripsWithAssignment] = useState<TripWithAssignment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const buildHeaders = useCallback(() => {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "x-request-id": crypto.randomUUID(),
        };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        return headers;
    }, [token]);

    const fetchDriver = useCallback(async (driverId: string): Promise<DriverInfo | null> => {
        if (!token || !driverId) return null;
        try {
            const res = await fetch(`${BASE_URL}/api/v1/drivers/${driverId}`, {
                method: "GET",
                headers: buildHeaders(),
            });
            if (!res.ok) return null;
            const raw = await res.json();
            const data = raw?.data ?? raw;
            return {
                id: data?.id ?? data?.driverId ?? driverId,
                driverId: data?.driverId ?? data?.driver_id ?? driverId,
                firstName: data?.firstName ?? data?.first_name,
                lastName: data?.lastName ?? data?.last_name,
                phone: data?.phone,
                email: data?.email,
            };
        } catch {
            return null;
        }
    }, [token, buildHeaders]);

    const fetchVehicle = useCallback(async (vehicleId: string): Promise<VehicleInfo | null> => {
        if (!token || !vehicleId) return null;
        try {
            // Try single vehicle endpoint first
            let res = await fetch(`${BASE_URL}/api/v1/vehicles/${vehicleId}`, {
                method: "GET",
                headers: buildHeaders(),
            });
            
            if (res.ok) {
                const raw = await res.json();
                const data = raw?.data ?? raw;
                return {
                    vehicleId: data?.vehicleId ?? vehicleId,
                    plateNumber: data?.plateNumber ?? data?.plate_number,
                    name: data?.name,
                    code: data?.code,
                };
            }

            // Fallback: fetch all vehicles and find by ID
            res = await fetch(`${BASE_URL}/api/v1/vehicles`, {
                method: "GET",
                headers: buildHeaders(),
            });
            if (!res.ok) return null;
            const raw = await res.json();
            const list = Array.isArray(raw) 
                ? raw 
                : Array.isArray(raw?.data) 
                    ? raw.data 
                    : Array.isArray(raw?.items) 
                        ? raw.items 
                        : [];
            
            const vehicle = list.find((v: any) => 
                (v.vehicleId === vehicleId) || (v.id === vehicleId)
            );
            
            if (!vehicle) return null;
            
            return {
                vehicleId: vehicle.vehicleId ?? vehicle.id ?? vehicleId,
                plateNumber: vehicle.plateNumber ?? vehicle.plate_number,
                name: vehicle.name,
                code: vehicle.code,
            };
        } catch {
            return null;
        }
    }, [token, buildHeaders]);

    const fetchAccount = useCallback(async (accountId: string): Promise<AccountInfo | null> => {
        if (!token || !accountId) return null;
        try {
            const res = await fetch(`${BASE_URL}/api/v1/accounts/${accountId}`, {
                method: "GET",
                headers: buildHeaders(),
            });
            if (!res.ok) return null;
            const raw = await res.json();
            const data = raw?.data ?? raw;
            return {
                accountId: data?.accountId ?? accountId,
                username: data?.username,
                role: data?.role,
                status: data?.status,
            };
        } catch {
            return null;
        }
    }, [token, buildHeaders]);

    const fetchAssignments = useCallback(async (): Promise<Assignment[]> => {
        if (!token) return [];
        try {
            const res = await fetch(`${BASE_URL}/api/v1/assignments`, {
                method: "GET",
                headers: buildHeaders(),
            });
            if (!res.ok) return [];
            const raw = await res.json();
            const payload = raw?.data ?? raw;
            if (!Array.isArray(payload)) return [];
            return payload.map((a: any) => ({
                assignmentId: a.assignmentId,
                assignmentAt: a.assignmentAt,
                tripId: a.tripId,
                accountId: a.accountId,
                driverId: a.driverId,
                vehicleId: a.vehicleId,
            }));
        } catch {
            return [];
        }
    }, [token, buildHeaders]);

    const fetchTrips = useCallback(async () => {
        if (!token) {
            setTrips([]);
            setTripsWithAssignment([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Fetch trips
            const res = await fetch(`${BASE_URL}/api/v1/trips`, {
                method: "GET",
                headers: buildHeaders(),
            });
            if (!res.ok) {
                throw new Error(`Error fetching trips: ${res.statusText}`);
            }
            const raw = await res.json();
            const payload = raw?.data ?? raw;
            if (!payload) {
                throw new Error("No trip data found");
            }

            const normalized: Trip[] = payload.map((t: any) => ({
                tripId: t.tripId,
                currentOrder: Number(t.currentOrder),
                startTime: t.startTime,
                endTime: t.endTime,
                plannedStartTime: t.plannedStartTime,
                plannedEndTime: t.plannedEndTime,
                routeId: t.routeId,
                routeName: t.routeName,
                code: t.code,
                distanceKm: Number(t.distanceKm),
                standardDurationMin: Number(t.standardDurationMin),
                note: t.note,
                isActive: Number(t.isActive),
                totalStop: Number(t.totalStop),
                stop: Array.isArray(t.stop) ? t.stop.map((s: any) => ({
                    stopId: s.stopId,
                    nameStop: s.nameStop,
                    type: s.type,
                    exactAddress: s.exactAddress,
                    commune: s.commune,
                    province: s.province,
                    lat: Number(s.lat),
                    lng: Number(s.lng),
                    order: Number(s.order),
                    arrive: s.arrive ?? null,
                })) : [],
            }));
            setTrips(normalized);

            // Fetch assignments and enrich trips
            const assignments = await fetchAssignments();
            const assignmentMap = new Map<string, Assignment>();
            assignments.forEach((a) => {
                assignmentMap.set(a.tripId, a);
            });

            // Enrich trips with assignment data
            const enriched: TripWithAssignment[] = await Promise.all(
                normalized.map(async (trip) => {
                    const assignment = assignmentMap.get(trip.tripId);
                    if (!assignment) {
                        return { ...trip };
                    }

                    // Fetch driver, vehicle, account in parallel
                    const [driver, vehicle, account] = await Promise.all([
                        fetchDriver(assignment.driverId),
                        fetchVehicle(assignment.vehicleId),
                        fetchAccount(assignment.accountId),
                    ]);

                    return {
                        ...trip,
                        assignment: {
                            assignmentId: assignment.assignmentId,
                            assignmentAt: assignment.assignmentAt,
                            driver: driver ?? undefined,
                            vehicle: vehicle ?? undefined,
                            account: account ?? undefined,
                        },
                    };
                })
            );

            setTripsWithAssignment(enriched);

        } catch (err: any) {
            setError(err.message || "Unknown error");
        } finally {
            setLoading(false);
        }
    }, [token, buildHeaders, fetchAssignments, fetchDriver, fetchVehicle, fetchAccount]);

    useEffect(() => {
        fetchTrips();
    }, [fetchTrips]);

    return { 
        trips, 
        tripsWithAssignment, 
        loading, 
        error,
        refetch: fetchTrips 
    };
};

export default useTrip;