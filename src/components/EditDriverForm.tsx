import React, { useState } from "react";
import "../styles/EditDriverForm.scss";
import { type Driver, type Vehicle } from "../hooks/useDrivers";

interface EditDriverFormProps {
    driver: Driver;
    vehicles: Vehicle[];
    onSuccess?: () => void;
    onCancel?: () => void;
    onUpdate: (driverId: string, driverData: {
        firstName?: string;
        lastName?: string;
        dateOfBirth?: string;
        gender?: string;
        email?: string;
        phone?: string;
        hireDate?: string;
        baseSalary?: string;
        vehicleId?: string;
        imageFile?: File | null;
        currentImageUrl?: string;
        exactAddress?: string;
        commune?: string;
        province?: string;
    }) => Promise<void>;
}

const EditDriverForm: React.FC<EditDriverFormProps> = ({
    driver,
    vehicles,
    onSuccess,
    onCancel,
    onUpdate
}) => {
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const getVehicleIdByPlateNumber = (plateNumber: string): string | undefined => {
        const vehicle = vehicles.find(
            (v) => v.plateNumber === plateNumber || v.licensePlate === plateNumber
        );
        return vehicle?.id;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);

        const formData = new FormData(e.currentTarget);
        const vehiclePlate = formData.get("vehicle") as string | null;
        const vehicleId = vehiclePlate ? getVehicleIdByPlateNumber(vehiclePlate) : undefined;

        const imageFile = formData.get("image") as File | null;
        const updateData: {
            firstName?: string;
            lastName?: string;
            dateOfBirth?: string;
            gender?: string;
            email?: string;
            phone?: string;
            hireDate?: string;
            baseSalary?: string;
            vehicleId?: string;
            imageFile?: File | null;
            currentImageUrl?: string;
            exactAddress?: string;
            commune?: string;
            province?: string;
        } = {};

        const firstName = formData.get("firstName") as string | null;
        const lastName = formData.get("lastName") as string | null;
        const dateOfBirth = formData.get("dateOfBirth") as string | null;
        const gender = formData.get("gender") as string | null;
        const email = formData.get("email") as string | null;
        const phone = formData.get("phone") as string | null;
        const hireDate = formData.get("hireDate") as string | null;
        const baseSalary = formData.get("baseSalary") as string | null;
        const exactAddress = formData.get("exactAddress") as string | null;
        const commune = formData.get("commune") as string | null;
        const province = formData.get("province") as string | null;

        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
        if (gender) updateData.gender = gender;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (hireDate) updateData.hireDate = hireDate;
        if (baseSalary) updateData.baseSalary = baseSalary;
        if (vehicleId) updateData.vehicleId = vehicleId;
        if (imageFile && imageFile.size > 0) updateData.imageFile = imageFile;
        if (driver.urlImage) updateData.currentImageUrl = driver.urlImage;
        if (exactAddress) updateData.exactAddress = exactAddress;
        if (commune) updateData.commune = commune;
        if (province) updateData.province = province;

        try {
            await onUpdate(driver.id, updateData);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            setFormError(error.message || "Không thể cập nhật tài xế");
        } finally {
            setSubmitting(false);
        }
    };

    const currentVehiclePlate = driver.vehicleId
        ? vehicles.find(v => v.id === driver.vehicleId)?.plateNumber ||
        vehicles.find(v => v.id === driver.vehicleId)?.licensePlate ||
        ""
        : "";

    return (
        <div className="driver-form-modal" onClick={onCancel}>
            <form
                className="driver-form"
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                {formError && <div className="alert-error">{formError}</div>}
                <div>
                    <label>Họ</label>
                    <input
                        name="lastName"
                        defaultValue={driver.lastName || ""}
                        required
                    />
                </div>
                <div>
                    <label>Tên</label>
                    <input
                        name="firstName"
                        defaultValue={driver.firstName || ""}
                        required
                    />
                </div>
                <div>
                    <label>Ngày sinh</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        defaultValue={driver.dateOfBirth || ""}
                    />
                </div>
                <div>
                    <label>Giới tính</label>
                    <select name="gender" defaultValue={driver.gender || "1"}>
                        <option value="1">Nam</option>
                        <option value="2">Nữ</option>
                        <option value="3">Khác</option>
                    </select>
                </div>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        defaultValue={driver.email || ""}
                    />
                </div>
                <div>
                    <label>SĐT</label>
                    <input
                        name="phone"
                        defaultValue={driver.phone || ""}
                    />
                </div>
                <div>
                    <label>Ngày tuyển</label>
                    <input
                        type="date"
                        name="hireDate"
                        defaultValue={driver.hireDate || ""}
                    />
                </div>
                <div>
                    <label>Lương cơ bản</label>
                    <input
                        type="number"
                        step="0.01"
                        name="baseSalary"
                        defaultValue={driver.baseSalary?.toString() || ""}
                    />
                </div>
                <div>
                    <label>Xe được gán</label>
                    <select name="vehicle" defaultValue={currentVehiclePlate}>
                        <option value="">-- Chọn xe --</option>
                        {vehicles.map((v) => (
                            <option
                                key={v.id}
                                value={v.plateNumber || v.licensePlate || ""}
                            >
                                {v.plateNumber || v.licensePlate || `Xe ${v.id}`}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Địa chỉ chính xác</label>
                    <input
                        name="exactAddress"
                        defaultValue={driver.exactAddress || ""}
                    />
                </div>
                <div>
                    <label>Phường/Xã</label>
                    <input
                        name="commune"
                        defaultValue={driver.commune || ""}
                    />
                </div>
                <div>
                    <label>Tỉnh</label>
                    <input
                        name="province"
                        defaultValue={driver.province || ""}
                    />
                </div>
                <div>
                    <label>Ảnh hiện tại</label>
                    {driver.urlImage && (
                        <img
                            src={driver.urlImage}
                            alt="Current"
                            style={{ width: 100, height: 100, objectFit: "cover", marginBottom: 10 }}
                        />
                    )}
                    <input type="file" name="image" accept="image/*" />
                </div>
                <div className="form-actions">
                    <button type="button" onClick={onCancel}>Hủy</button>
                    <button type="submit" disabled={submitting}>
                        {submitting ? "Đang cập nhật..." : "Cập nhật"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditDriverForm;

