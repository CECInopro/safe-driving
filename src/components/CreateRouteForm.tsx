import React from 'react';
import { useState } from 'react';
import { useRoutes } from '../hooks/useRoutes';
import "../styles/CreateRouteForm.scss";

interface CreateRouteFormProps { 
    onClose?: () => void;
    onSuccess?: () => void;
    onCancel?: () => void;
}
const CreateRouteForm: React.FC<CreateRouteFormProps> = ({ onClose, onSuccess, onCancel }) => {
    const { createRoute } = useRoutes();
    const [routeName, setRouteName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [code, setCode] = useState("");
    const [distanceKm, setDistanceKm] = useState("");
    const [standardDurationMin, setStandardDurationMin] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await createRoute({
                routeName: routeName.trim(),
                code: code.trim(),
                distanceKm: parseFloat(distanceKm),
                standardDurationMin: parseInt(standardDurationMin, 10),
            });
            if (result.success) {
                alert("Tạo tuyến đường thành công!");
                if (onSuccess) onSuccess();
                else if (onClose) onClose();
            } else {
                alert(result.error || "Không thể tạo tuyến đường");
            }
        } catch (error) {
            console.error("Create route error:", error);
            alert("Đã xảy ra lỗi khi tạo tuyến đường");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="route-form-modal" >
            <form className='route-form' onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <div>
                    <label> Tên tuyến đường:</label>
                    <input type="text" value={routeName} required onChange={(e) => setRouteName(e.target.value)} />
                </div>
                <div>
                    <label> Mã tuyến đường:</label>
                    <input type="text" value={code} required onChange={(e) => setCode(e.target.value)} />
                </div>
                <div>
                    <label> Chiều dài (km):</label>
                    <input type="number" value={distanceKm} required onChange={(e) => setDistanceKm(e.target.value)} />
                </div>
                <div>
                    <label> Thời gian tiêu chuẩn (phút):</label>
                    <input type="number" value={standardDurationMin} required onChange={(e) => setStandardDurationMin(e.target.value)} />
                </div>

                <div className="route-form__actions">
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Đang tạo..." : "Tạo tuyến đường"}
                    </button>
                    <button type="button" onClick={onCancel} disabled={isSubmitting}>
                        Hủy
                    </button>
                </div>

            </form>
        </div>
    )
}


export default CreateRouteForm;