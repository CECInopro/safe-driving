import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL as string;
const ARDUINO_URL = import.meta.env.VITE_ARDUINO_URL as string | undefined;

export type Driver = {
    id: string;
    driverId?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    email?: string;
    phone?: string;
    hireDate?: string;
    urlImage?: string;
    exactAddress?: string;
    commune?: string;
    province?: string;
    vehicleId?: string;
    licenseClassId?: number;
};

export type Vehicle = {
    id: string;
    licensePlate?: string;
    plateNumber?: string;
    brand?: string;
    model?: string;
    vehicleTypeId?: number;
};

export type license_type = {
    id: number;
    code: string;
    name: string;
    capacity: number;
}

const normalizeDriver = (d: any): Driver | null => {
    const id = d?.id ?? d?.driverId ?? d?.driver_id;
    if (!id) return null;
    return {
        id,
        driverId: d?.driverId ?? d?.driver_id ?? id,
        firstName: d?.firstName ?? d?.first_name,
        lastName: d?.lastName ?? d?.last_name,
        dateOfBirth: d?.dateOfBirth ?? d?.date_of_birth,
        gender: d?.gender,
        email: d?.email,
        phone: d?.phone,
        hireDate: d?.hireDate ?? d?.hire_date,
        urlImage: d?.urlImage ?? d?.url_image,
        exactAddress: d?.exactAddress ?? d?.exact_address,
        commune: d?.commune,
        province: d?.province,
        vehicleId: d?.vehicleId ?? d?.vehicle_id ?? d?.currentVehicleId ?? d?.current_vehicle_id,
        licenseClassId: d?.licenseClassId ?? d?.license_class_id,
    };
};

const normalizeVehicle = (v: any): Vehicle | null => {
    const id = v?.id ?? v?.vehicleId;
    if (!id) return null;
    return {
        id,
        licensePlate: v?.licensePlate ?? v?.plateNumber,
        plateNumber: v?.plateNumber ?? v?.licensePlate,
        brand: v?.brand,
        model: v?.model,
        vehicleTypeId: v?.vehicleTypeId ?? v?.vehicle_type_id ?? v?.typeId,
    };
};

export const useDrivers = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const buildHeaders = useCallback(
        (extra: Record<string, string> = {}) => {
            const headers: Record<string, string> = {
                "x-request-id": crypto.randomUUID(),
                ...extra,
            };
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
            return headers;
        },
        [token]
    );

    const fetchDrivers = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${BASE_URL}/api/v1/drivers`, {
                headers: buildHeaders({ "Accept": "application/json" }),
            });
            const data = await res.json();
            const payload = data?.data ?? data?.items ?? data;
            const list = (Array.isArray(payload) ? payload : [payload])
                .map(normalizeDriver)
                .filter(Boolean) as Driver[];
            const uniq = Array.from(new Map(list.map((d) => [d.id, d])).values());
            setDrivers(uniq);
        } catch (e: any) {
            console.error(e);
            setError("Không thể tải danh sách tài xế");
        } finally {
            setLoading(false);
        }
    }, [buildHeaders, token]);

    const fetchVehicles = useCallback(async () => {
        if (!token) return;

        try {
            const res = await fetch(`${BASE_URL}/api/v1/vehicles`, {
                headers: buildHeaders({ "Accept": "application/json" }),
            });
            const data = await res.json();
            const payload = data?.data ?? data?.items ?? data;
            const list = (Array.isArray(payload) ? payload : [payload])
                .map(normalizeVehicle)
                .filter(Boolean) as Vehicle[];
            setVehicles(list);
        } catch (e) {
            console.error("Lỗi khi tải danh sách xe:", e);
        }
    }, [buildHeaders, token]);

    const createDriver = async (driverData: {
        firstName: string;
        lastName: string;
        dateOfBirth?: string;
        gender?: string;
        email?: string;
        phone?: string;
        hireDate?: string;
        vehicleId?: string;
        imageFile?: File | null;
        exactAddress?: string;
        commune?: string;
        province?: string;
        licenseClassId?: number;
    }): Promise<{ success: boolean; data?: any; error?: string }> => {
        if (!token) {
            return {
                success: false,
                error: "Vui lòng đăng nhập để thực hiện thao tác này",
            };
        }

        try {
            const form = new FormData();
            form.append("firstName", driverData.firstName);
            form.append("lastName", driverData.lastName);
            if (driverData.dateOfBirth) form.append("dateOfBirth", driverData.dateOfBirth);
            if (driverData.gender) form.append("gender", driverData.gender);
            if (driverData.email) form.append("email", driverData.email);
            if (driverData.phone) form.append("phone", driverData.phone);
            if (driverData.hireDate) form.append("hireDate", driverData.hireDate);
            if (driverData.vehicleId) form.append("vehicleId", driverData.vehicleId);
            if (driverData.imageFile) {
                form.append("image", driverData.imageFile, driverData.imageFile.name);
            }
            if (driverData.exactAddress) form.append("exactAddress", driverData.exactAddress);
            if (driverData.commune) form.append("commune", driverData.commune);
            if (driverData.province) form.append("province", driverData.province);
            if (driverData.licenseClassId) {
                form.append("licenseClassId", String(driverData.licenseClassId));
            }

            const debugPayload = Object.fromEntries(form.entries());
            console.log("Driver form payload:", debugPayload);

            const headers: Record<string, string> = {
                "x-request-id": "111",
                "Authorization": `Bearer ${token}`,
            };

            const res = await fetch(`${BASE_URL}/api/v1/drivers`, {
                method: "POST",
                headers,
                body: form,
            });

            const data = await res.json();
            console.log("📦 Server response:", data);

            if (!res.ok) {
                console.error("Create driver failed. Payload:", debugPayload);
                throw new Error(data.message || "Tạo tài xế thất bại");
            }

            await fetchDrivers();

            return {
                success: true,
                data: data.data || data,
            };
        } catch (e: any) {
            console.error("Lỗi khi tạo tài xế:", e);
            return {
                success: false,
                error: e.message || "Không thể tạo tài xế",
            };
        }
    };
    const updateDriver = async (
        driverId: string,
        driverData: {
            firstName?: string;
            lastName?: string;
            dateOfBirth?: string;
            gender?: string;
            email?: string;
            phone?: string;
            hireDate?: string;
            vehicleId?: string;
            imageFile?: File | null;
            currentImageUrl?: string;
            exactAddress?: string;
            commune?: string;
            province?: string;
            licenseClassId?: number;

        }
    ): Promise<{ success: boolean; data?: any; error?: string }> => {
        if (!token) {
            return {
                success: false,
                error: "Vui lòng đăng nhập để thực hiện thao tác này",
            };
        }

        try {
            const form = new FormData();

            if (driverData.firstName) form.append("firstName", driverData.firstName);
            if (driverData.lastName) form.append("lastName", driverData.lastName);
            if (driverData.dateOfBirth) form.append("dateOfBirth", driverData.dateOfBirth);
            if (driverData.gender) form.append("gender", driverData.gender);
            if (driverData.email) form.append("email", driverData.email);
            if (driverData.phone) form.append("phone", driverData.phone);
            if (driverData.hireDate) form.append("hireDate", driverData.hireDate);
            if (driverData.vehicleId) form.append("vehicleId", driverData.vehicleId);
            if (driverData.currentImageUrl) form.append("currentImageUrl", driverData.currentImageUrl);
            if (driverData.imageFile) {
                form.append("image", driverData.imageFile, driverData.imageFile.name);
            }
            if (driverData.exactAddress) form.append("exactAddress", driverData.exactAddress);
            if (driverData.commune) form.append("commune", driverData.commune);
            if (driverData.province) form.append("province", driverData.province);
            if (driverData.licenseClassId) {
                form.append("licenseClassId", String(driverData.licenseClassId));
            }

            const headers: Record<string, string> = {
                "x-request-id": crypto.randomUUID(),
                "Authorization": `Bearer ${token}`,
            };

            console.log("🔍 PUT URL:", `${BASE_URL}/api/v1/drivers/${driverId}`);
            console.log("🔍 PUT Headers:", headers);
            console.log("🔍 PUT Token exists:", !!token);
            console.log("🔍 PUT Token length:", token?.length || 0);

            const res = await fetch(`${BASE_URL}/api/v1/drivers/${driverId}`, {
                method: "PUT",
                headers,
                body: form,
            });

            const data = await res.json();
            console.log("📦 PUT Response:", data);

            if (!res.ok) {
                throw new Error(data.message || "Cập nhật tài xế thất bại");
            }

            await fetchDrivers();

            return {
                success: true,
                data: data.data || data,
            };
        } catch (e: any) {
            console.error("Lỗi PUT driver:", e);
            return {
                success: false,
                error: e.message || "Không thể cập nhật tài xế",
            };
        }
    };

    const deleteDriver = async (driverId: string): Promise<{ success: boolean; error?: string }> => {
        if (!token) {
            return {
                success: false,
                error: "Vui lòng đăng nhập để thực hiện thao tác này",
            };
        }

        try {
            const headers: Record<string, string> = buildHeaders();
            const res = await fetch(`${BASE_URL}/api/v1/drivers/${driverId}`, {
                method: "DELETE",
                headers,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Xóa tài xế thất bại");
            }

            await fetchDrivers();

            return {
                success: true,
            };
        } catch (e: any) {
            console.error("Lỗi khi xóa tài xế:", e);
            return {
                success: false,
                error: e.message || "Không thể xóa tài xế",
            };
        }
    };

    useEffect(() => {
        if (!token) {
            setDrivers([]);
            setVehicles([]);
            setLoading(false);
            return;
        }
        fetchDrivers();
        fetchVehicles();
    }, [fetchDrivers, fetchVehicles, token]);

    const fetchAccount = useCallback(
        async (accountId: string) => {
            if (!token) throw new Error("Vui lòng đăng nhập để quét thẻ");

            const res = await fetch(`${BASE_URL}/api/v1/drivers/${accountId}`, {
                headers: {
                    "Accept": "application/json",
                    "x-request-id": "111",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const body = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(body?.message || "Không thể lấy thông tin tài khoản");
            }

            return body?.data ?? body;
        },
        [token]
    );

    const sendToArduino = useCallback(async (payload: { accountId: string; driverId: string }) => {
        if (!ARDUINO_URL) {
            console.warn("VITE_ARDUINO_URL chưa cấu hình. Payload:", payload);
            return false;
        }

        const res = await fetch(ARDUINO_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
            throw new Error(body?.message || "Không gửi được dữ liệu sang Arduino");
        }

        return true;
    }, []);

    const scanDriverCard = useCallback(
        async (driver: Driver): Promise<{ accountId: string; forwarded: boolean }> => {
            const accountId = driver.driverId || driver.id;
            if (!accountId) {
                throw new Error("Không tìm thấy ID tài khoản của tài xế");
            }

            const account = await fetchAccount(accountId);
            const payloadId = account?.id ?? account?.accountId ?? accountId;

            const forwarded = await sendToArduino({
                accountId: payloadId,
                driverId: driver.id,
            });

            return {
                accountId: payloadId,
                forwarded,
            };
        },
        [fetchAccount, sendToArduino]
    );

    return {
        drivers,
        vehicles,
        loading,
        error,
        fetchDrivers,
        fetchVehicles,
        createDriver,
        updateDriver,
        deleteDriver,
        scanDriverCard,
    };
};

