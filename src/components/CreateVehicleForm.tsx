import React, { useState } from "react";
import "../styles/CreateVehicleForm.scss";
import { VehicleTypes } from "../hooks/useVehicles";

interface CreateVehicleFormProps {
    onSubmit: (payload: {
        plateNumber: string;
        vin: string;
        vehicleTypeId: number;
        odometerKm: number;
        status: string;
    }) => Promise<{ success: boolean; data?: any; error?: string }>;
    onCancel: () => void;
    onSuccess?: () => void;
}

const statusOptions = ["AVAILABLE", "IN_USE", "MAINTENANCE", "UNAVAILABLE"];

const CreateVehicleForm: React.FC<CreateVehicleFormProps> = ({
    onSubmit,
    onCancel,
    onSuccess,
}) => {
    const [plateNumber, setPlateNumber] = useState("");
    const [vin, setVin] = useState("");
    const [vehicleTypeId, setVehicleTypeId] = useState<number | undefined>(undefined);
    const [odometerKm, setOdometerKm] = useState("");
    const [status, setStatus] = useState("AVAILABLE");
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);

        if (!plateNumber.trim() || !vin.trim() || !vehicleTypeId || !odometerKm.trim()) {
            setFormError("Vui lòng điền đầy đủ các trường bắt buộc.");
            setSubmitting(false);
            return;
        }

        const payload = {
            plateNumber: plateNumber.trim(),
            vin: vin.trim(),
            vehicleTypeId: vehicleTypeId,
            odometerKm: Number(odometerKm),
            status: status,
        };

        const result = await onSubmit(payload);
        setSubmitting(false);

        if (result.success) {
            if (onSuccess) onSuccess();
            else onCancel();
        } else {
            setFormError(result.error ?? "Không thể tạo xe");
        }
    };

    return (
        <div className="vehicle-form-modal" onClick={onCancel}>
            <form className="vehicle-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <h3>Tạo xe mới</h3>
                {formError && <div className="vehicle-form__alert">{formError}</div>}
                <div>
                    <label>Biển số xe *</label>
                    <input
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        placeholder="Ví dụ: 51A12333"
                        required
                    />
                </div>
                <div>
                    <label>VIN (Số khung) *</label>
                    <input
                        value={vin}
                        onChange={(e) => setVin(e.target.value)}
                        placeholder="Nhập số VIN"
                        required
                    />
                </div>
                <div>
                    <label>Loại xe *</label>
                    <select
                        value={vehicleTypeId || ""}
                        onChange={(e) => setVehicleTypeId(e.target.value ? Number(e.target.value) : undefined)}
                        required
                    >
                        <option value="">-- Chọn loại xe --</option>
                        {VehicleTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name} ({type.code})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Số km đồng hồ (km) *</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={odometerKm}
                        onChange={(e) => setOdometerKm(e.target.value)}
                        placeholder="Ví dụ: 100"
                        required
                    />
                </div>
                <div>
                    <label>Trạng thái *</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                    >
                        {statusOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-actions">
                    <button type="button" onClick={onCancel} disabled={submitting}>
                        Hủy
                    </button>
                    <button type="submit" disabled={submitting}>
                        {submitting ? "Đang tạo..." : "Tạo mới"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateVehicleForm;

