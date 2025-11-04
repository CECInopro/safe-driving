import { useState, useEffect, useCallback } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL as string;

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
    baseSalary?: number | string;
    imageUrl?: string;
};

export type Vehicle = {
    id: string;
    licensePlate?: string;
    plateNumber?: string;
    brand?: string;
    model?: string;
};

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
        baseSalary: d?.baseSalary ?? d?.base_salary,
        imageUrl: d?.imageUrl ?? d?.image_url,
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
    };
};

export const useDrivers = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDrivers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${BASE_URL}/api/v1/drivers`);
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
    }, []);

    const fetchVehicles = useCallback(async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/v1/vehicles`);
            const data = await res.json();
            const payload = data?.data ?? data?.items ?? data;
            const list = (Array.isArray(payload) ? payload : [payload])
                .map(normalizeVehicle)
                .filter(Boolean) as Vehicle[];
            setVehicles(list);
        } catch (e) {
            console.error("❌ Lỗi khi tải danh sách xe:", e);
        }
    }, []);

    const createDriver = async (driverData: {
        firstName: string;
        lastName: string;
        dateOfBirth?: string;
        gender?: string;
        email?: string;
        phone?: string;
        hireDate?: string;
        baseSalary?: string;
        plateNumber?: string;
        imageFile?: File | null;
    }): Promise<{ success: boolean; data?: any; error?: string }> => {
        try {
            const form = new FormData();
            form.append("firstName", driverData.firstName);
            form.append("lastName", driverData.lastName);
            if (driverData.dateOfBirth) form.append("dateOfBirth", driverData.dateOfBirth);
            if (driverData.gender) form.append("gender", driverData.gender);
            if (driverData.email) form.append("email", driverData.email);
            if (driverData.phone) form.append("phone", driverData.phone);
            if (driverData.hireDate) form.append("hireDate", driverData.hireDate);
            if (driverData.baseSalary) form.append("baseSalary", driverData.baseSalary);
            if (driverData.plateNumber) form.append("plateNumber", driverData.plateNumber);
            if (driverData.imageFile) {
                form.append("image", driverData.imageFile, driverData.imageFile.name);
            }

            const res = await fetch(`${BASE_URL}/api/v1/drivers`, {
                method: "POST",
                body: form,
            });

            const data = await res.json();
            console.log("📦 Server response:", data);

            if (!res.ok) {
                throw new Error(data.message || "Tạo tài xế thất bại");
            }

            await fetchDrivers();

            return {
                success: true,
                data: data.data || data,
            };
        } catch (e: any) {
            console.error("❌ Lỗi khi tạo tài xế:", e);
            return {
                success: false,
                error: e.message || "Không thể tạo tài xế",
            };
        }
    };

    useEffect(() => {
        fetchDrivers();
        fetchVehicles();
    }, [fetchDrivers, fetchVehicles]);

    return {
        drivers,
        vehicles,
        loading,
        error,
        fetchDrivers,
        fetchVehicles,
        createDriver,
    };
};

