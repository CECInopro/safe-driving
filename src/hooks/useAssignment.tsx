import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL as string;

export type Assignment = {
    assignmentId: string;
    assignmentAt: string;
    tripId: string;
    accountId: string;
    driverId: string;
    vehicleId?: string;
};

export type CreateAssignmentPayload = {
    tripId: string;
    accountId: string;
    driverId: string;
};

export type UpdateAssignmentPayload = {
    tripId: string;
    accountId: string;
    driverId: string;
};

export type AssignmentResult = {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
};

export const useAssignment = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
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

    const fetchAssignments = useCallback(async () => {
        if (!token) {
            setAssignments([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${BASE_URL}/api/v1/assignments`, {
                method: "GET",
                headers: buildHeaders(),
            });

            if (!res.ok) {
                throw new Error(`Fetch assignments failed: ${res.status}`);
            }

            const raw = await res.json();
            const payload = raw?.data ?? raw;
            const list = Array.isArray(payload)
                ? payload
                : Array.isArray(raw?.items)
                    ? raw.items
                    : payload
                        ? [payload]
                        : [];

            const normalized: Assignment[] = list
                .map((a: any) => ({
                    assignmentId: a.assignmentId ?? a.id ?? '',
                    assignmentAt: a.assignmentAt ?? a.assignment_at ?? '',
                    tripId: a.tripId ?? a.trip_id ?? '',
                    accountId: a.accountId ?? a.account_id ?? '',
                    driverId: a.driverId ?? a.driver_id ?? '',
                    vehicleId: a.vehicleId ?? a.vehicle_id ?? undefined,
                }))
                .filter((a: Assignment) => !!a.assignmentId);

            setAssignments(normalized);
        } catch (err: any) {
            console.error("Lỗi lấy danh sách assignments:", err);
            setError(err?.message ?? "Lỗi không xác định");
        } finally {
            setLoading(false);
        }
    }, [token, buildHeaders]);

    useEffect(() => {
        if (!token) {
            setAssignments([]);
            return;
        }
        fetchAssignments();
    }, [token, fetchAssignments]);

    const createAssignment = useCallback(
        async (payload: CreateAssignmentPayload): Promise<AssignmentResult> => {
            if (!token) {
                return {
                    success: false,
                    error: "Vui lòng đăng nhập để thực hiện thao tác này",
                };
            }

            try {
                const res = await fetch(`${BASE_URL}/api/v1/assignments`, {
                    method: "POST",
                    headers: buildHeaders(),
                    body: JSON.stringify({
                        tripId: payload.tripId,
                        accountId: payload.accountId,
                        driverId: payload.driverId,
                    }),
                });

                const data = await res.json();
                console.log("📦 Create assignment response:", data);

                if (!res.ok) {
                    throw new Error(data.message || "Tạo assignment thất bại");
                }

                // Refresh danh sách assignments
                await fetchAssignments();

                return {
                    success: true,
                    data: data?.data ?? data,
                };
            } catch (err: any) {
                console.error("Error creating assignment:", err);
                return {
                    success: false,
                    error: err.message || "Không thể tạo assignment",
                };
            }
        },
        [token, buildHeaders, fetchAssignments]
    );

    const updateAssignment = useCallback(
        async (
            assignmentId: string,
            payload: UpdateAssignmentPayload
        ): Promise<AssignmentResult> => {
            if (!token) {
                return {
                    success: false,
                    error: "Vui lòng đăng nhập để thực hiện thao tác này",
                };
            }

            try {
                const res = await fetch(`${BASE_URL}/api/v1/assignments/${assignmentId}`, {
                    method: "PUT",
                    headers: buildHeaders(),
                    body: JSON.stringify({
                        tripId: payload.tripId,
                        accountId: payload.accountId,
                        driverId: payload.driverId,
                    }),
                });

                const data = await res.json();
                console.log("📦 Update assignment response:", data);

                if (!res.ok) {
                    throw new Error(data.message || "Cập nhật assignment thất bại");
                }

                // Refresh danh sách assignments
                await fetchAssignments();

                return {
                    success: true,
                    data: data?.data ?? data,
                };
            } catch (err: any) {
                console.error("Error updating assignment:", err);
                return {
                    success: false,
                    error: err.message || "Không thể cập nhật assignment",
                };
            }
        },
        [token, buildHeaders, fetchAssignments]
    );

    const deleteAssignment = useCallback(
        async (assignmentId: string): Promise<AssignmentResult> => {
            if (!token) {
                return {
                    success: false,
                    error: "Vui lòng đăng nhập để thực hiện thao tác này",
                };
            }

            try {
                const res = await fetch(`${BASE_URL}/api/v1/assignments/${assignmentId}`, {
                    method: "DELETE",
                    headers: buildHeaders(),
                });

                const data = await res.json().catch(() => ({}));
                console.log("📦 Delete assignment response:", data);

                if (!res.ok) {
                    throw new Error(data.message || "Xóa assignment thất bại");
                }

                // Refresh danh sách assignments
                await fetchAssignments();

                return {
                    success: true,
                };
            } catch (err: any) {
                console.error("Error deleting assignment:", err);
                return {
                    success: false,
                    error: err.message || "Không thể xóa assignment",
                };
            }
        },
        [token, buildHeaders, fetchAssignments]
    );

    return {
        assignments,
        loading,
        error,
        fetchAssignments,
        createAssignment,
        updateAssignment,
        deleteAssignment,
    };
};
