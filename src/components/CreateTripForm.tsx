import React, { useState } from "react";
import { useRoutes } from "../hooks/useRoutes";
import useTrip from "../hooks/useTrip";
import "../styles/CreateTripForm.scss";

interface CreateTripFormProps {
    routeId?: string; // Thêm optional routeId prop
    onSubmit?: (data: any) => void;
    onClose?: () => void;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const CreateTripForm: React.FC<CreateTripFormProps> = ({ routeId: initialRouteId, onSubmit, onClose, onSuccess, onCancel }) => {
    const [routeId, setRouteId] = useState(initialRouteId || "");
    const [plannedStartTime, setPlannedStartTime] = useState("");
    const [plannedEndTime, setPlannedEndTime] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { routes, loading: routesLoading } = useRoutes();
    const { createTrip } = useTrip(); 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!routeId) {
            alert("Vui lòng chọn tuyến đường");
            return;
        }

        if (!plannedStartTime) {
            alert("Vui lòng chọn thời gian bắt đầu dự kiến");
            return;
        }

        if (!plannedEndTime) {
            alert("Vui lòng chọn thời gian kết thúc dự kiến");
            return;
        }

        const formatDateTime = (dateTime: string) => {
            if (dateTime.includes('T')) {
                if (dateTime.split(':').length === 2) {
                    return dateTime + ':00';
                }
                return dateTime.slice(0, 19);
            }
            const date = new Date(dateTime);
            return date.toISOString().slice(0, 19);
        };

        setIsSubmitting(true);
        try {
            const result = await createTrip({
                routeId,
                plannedStartTime: formatDateTime(plannedStartTime),
                plannedEndTime: formatDateTime(plannedEndTime),
            });

            if (result.success) {
                alert("Tạo chuyến đi thành công!");
                console.log("Created trip:", result.data);
                onSubmit?.({ routeId, plannedStartTime, plannedEndTime });
                onSuccess?.();
                handleClose();
            } else {
                alert(result.error || "Tạo chuyến đi thất bại");
            }
        } catch (error: any) {
            alert(error.message || "Có lỗi xảy ra khi tạo chuyến đi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (onCancel) onCancel();
        else if (onClose) onClose();
    };

    return (
        <div className="trip-form-modal" onClick={handleClose}>
            <form className="trip-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <h3>Tạo chuyến đi mới</h3>

                <div>
                    <label>Chọn tuyến đường *</label>
                    <select
                        value={routeId}
                        onChange={(e) => setRouteId(e.target.value)}
                        disabled={routesLoading || !!initialRouteId} // Disable if initialRouteId is provided
                        required
                    >
                        <option value="">-- Chọn tuyến đường --</option>
                        {routes.map((route) => (
                            <option key={route.routeId} value={route.routeId}>
                                {route.routeName} {route.code ? `(${route.code})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Thời gian bắt đầu dự kiến *</label>
                    <input
                        type="datetime-local"
                        value={plannedStartTime}
                        onChange={(e) => setPlannedStartTime(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Thời gian kết thúc dự kiến *</label>
                    <input
                        type="datetime-local"
                        value={plannedEndTime}
                        onChange={(e) => setPlannedEndTime(e.target.value)}
                        required
                    />
                </div>

                <div className="trip-form__actions">
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Đang tạo..." : "Tạo chuyến đi"}
                    </button>
                    <button type="button" onClick={handleClose} disabled={isSubmitting}>
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTripForm;
