import React, { useState, useEffect } from "react";
import { useDrivers } from "../hooks/useDrivers";
import { useAccount } from "../hooks/useAccount";
import { useAssignment } from "../hooks/useAssignment";
import useTrip from "../hooks/useTrip";
import "../styles/AssignDriverForm.scss";

interface AssignDriverFormProps {
    tripId: string;
    tripCode?: string;
    routeName?: string;
    onClose?: () => void;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const AssignDriverForm: React.FC<AssignDriverFormProps> = ({ 
    tripId,
    tripCode,
    routeName,
    onClose, 
    onSuccess, 
    onCancel 
}) => {
    const [driverId, setDriverId] = useState("");
    const [accountId, setAccountId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { drivers, loading: driversLoading } = useDrivers();
    const { accounts, loading: accountsLoading } = useAccount();
    const { createAssignment } = useAssignment();
    const { refetch } = useTrip();

    // Lọc accounts có role DRIVER
    const driverAccounts = accounts.filter(acc => acc.role === 'DRIVER');

    // Tự động tìm account khi chọn driver (nếu driverId trùng với accountId)
    useEffect(() => {
        if (driverId && driverAccounts.length > 0) {
            // Thử tìm account có accountId trùng với driverId
            const matchedAccount = driverAccounts.find(
                acc => acc.accountId === driverId || acc.username === driverId
            );
            if (matchedAccount) {
                setAccountId(matchedAccount.accountId);
            }
        }
    }, [driverId, driverAccounts]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!driverId) {
            alert("Vui lòng chọn tài xế");
            return;
        }

        if (!accountId) {
            alert("Vui lòng chọn tài khoản");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createAssignment({
                tripId,
                driverId,
                accountId,
            });

            if (result.success) {
                alert("Gán tài xế thành công!");
                // Refresh trips để cập nhật assignment
                refetch();
                onSuccess?.();
                handleClose();
            } else {
                alert(result.error || "Gán tài xế thất bại");
            }
        } catch (error: any) {
            alert(error.message || "Có lỗi xảy ra khi gán tài xế");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (onCancel) onCancel();
        else if (onClose) onClose();
    };

    const selectedDriver = drivers.find(d => d.id === driverId);

    return (
        <div className="assign-form-modal" onClick={handleClose}>
            <form className="assign-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <h3>Gán tài xế cho chuyến đi</h3>

                <div className="assign-form__info">
                    <p><strong>Mã chuyến:</strong> {tripCode || tripId}</p>
                    {routeName && <p><strong>Tuyến đường:</strong> {routeName}</p>}
                </div>

                <div>
                    <label>Chọn tài xế *</label>
                    <select
                        value={driverId}
                        onChange={(e) => setDriverId(e.target.value)}
                        disabled={driversLoading}
                        required
                    >
                        <option value="">-- Chọn tài xế --</option>
                        {drivers.map((driver) => (
                            <option key={driver.id} value={driver.id}>
                                {driver.firstName || ''} {driver.lastName || ''} 
                                {driver.phone ? ` - ${driver.phone}` : ''}
                                {driver.email ? ` (${driver.email})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Chọn tài khoản *</label>
                    <select
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        disabled={accountsLoading}
                        required
                    >
                        <option value="">-- Chọn tài khoản --</option>
                        {driverAccounts.map((account) => (
                            <option key={account.accountId} value={account.accountId}>
                                {account.username} ({account.role})
                                {account.status ? ` - ${account.status}` : ''}
                            </option>
                        ))}
                    </select>
                    {driverAccounts.length === 0 && !accountsLoading && (
                        <p className="assign-form__hint">Không có tài khoản DRIVER nào</p>
                    )}
                </div>

                {selectedDriver && (
                    <div className="assign-form__driver-info">
                        <p><strong>Thông tin tài xế:</strong></p>
                        <p>Tên: {selectedDriver.firstName} {selectedDriver.lastName}</p>
                        {selectedDriver.phone && <p>SĐT: {selectedDriver.phone}</p>}
                        {selectedDriver.email && <p>Email: {selectedDriver.email}</p>}
                    </div>
                )}

                <div className="assign-form__actions">
                    <button type="submit" disabled={isSubmitting || !driverId || !accountId}>
                        {isSubmitting ? "Đang gán..." : "Gán tài xế"}
                    </button>
                    <button type="button" onClick={handleClose} disabled={isSubmitting}>
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AssignDriverForm;
