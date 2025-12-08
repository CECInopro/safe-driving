import React, { useState, useMemo } from "react";
import { useRoutes } from "../hooks/useRoutes";
import useTrip from "../hooks/useTrip";
import { useDrivers } from "../hooks/useDrivers";
import { useAccount } from "../hooks/useAccount";
import { useAssignment } from "../hooks/useAssignment";
import "../styles/CreateScheduledTripsForm.scss";

interface CreateScheduledTripsFormProps {
    routeId?: string;
    onClose?: () => void;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const CreateScheduledTripsForm: React.FC<CreateScheduledTripsFormProps> = ({ 
    routeId: initialRouteId, 
    onClose, 
    onSuccess, 
    onCancel 
}) => {
    const [routeId, setRouteId] = useState(initialRouteId || "");
    const [month, setMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [startDay, setStartDay] = useState("1");
    const [intervalDays, setIntervalDays] = useState("7");
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("17:00");
    const [autoAssign, setAutoAssign] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState("");
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const { routes, loading: routesLoading } = useRoutes();
    const { createTrip, refetch } = useTrip();
    const { drivers, loading: driversLoading } = useDrivers();
    const { accounts, loading: accountsLoading } = useAccount();
    const { createAssignment } = useAssignment();

    // Lọc accounts có role DRIVER
    const driverAccounts = accounts.filter(acc => acc.role === 'DRIVER');

    // Tính toán danh sách các ngày sẽ tạo trips
    const scheduledDates = useMemo(() => {
        if (!month || !startDay || !intervalDays) return [];

        const [year, monthNum] = month.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, parseInt(startDay));
        const interval = parseInt(intervalDays);
        const dates: Date[] = [];
        
        let currentDate = new Date(startDate);
        const lastDayOfMonth = new Date(year, monthNum, 0).getDate();

        while (currentDate.getMonth() === monthNum - 1 && currentDate.getDate() <= lastDayOfMonth) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + interval);
        }

        return dates;
    }, [month, startDay, intervalDays]);

    const formatDateTime = (date: Date, time: string) => {
        const [hours, minutes] = time.split(':');
        const dateTime = new Date(date);
        dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return dateTime.toISOString().slice(0, 19);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!routeId) {
            alert("Vui lòng chọn tuyến đường");
            return;
        }

        if (scheduledDates.length === 0) {
            alert("Không có ngày nào để tạo chuyến đi");
            return;
        }

        if (autoAssign && (!selectedDriverId || !selectedAccountId)) {
            alert("Vui lòng chọn tài xế và tài khoản để tự động gán");
            return;
        }

        setIsSubmitting(true);
        setProgress({ current: 0, total: scheduledDates.length });

        let successCount = 0;
        let failCount = 0;
        const createdTripIds: string[] = [];

        try {
            // Tạo từng trip
            for (let i = 0; i < scheduledDates.length; i++) {
                const date = scheduledDates[i];
                setProgress({ current: i + 1, total: scheduledDates.length });

                const result = await createTrip({
                    routeId,
                    plannedStartTime: formatDateTime(date, startTime),
                    plannedEndTime: formatDateTime(date, endTime),
                });

                if (result.success) {
                    successCount++;
                    const tripId = result.data?.tripId || result.data?.id;
                    if (tripId && autoAssign) {
                        createdTripIds.push(tripId);
                    }
                } else {
                    failCount++;
                }

                // Delay nhỏ để tránh quá tải server
                if (i < scheduledDates.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }

            // Tự động gán tài xế nếu được chọn
            if (autoAssign && createdTripIds.length > 0) {
                setProgress({ current: scheduledDates.length, total: scheduledDates.length + createdTripIds.length });
                
                for (let i = 0; i < createdTripIds.length; i++) {
                    const tripId = createdTripIds[i];
                    setProgress({ current: scheduledDates.length + i + 1, total: scheduledDates.length + createdTripIds.length });

                    await createAssignment({
                        tripId,
                        driverId: selectedDriverId,
                        accountId: selectedAccountId,
                    });

                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }

            // Refresh danh sách trips
            await refetch();

            alert(
                `Tạo lịch chuyến đi hoàn tất!\n` +
                `✅ Thành công: ${successCount}\n` +
                `❌ Thất bại: ${failCount}\n` +
                `${autoAssign ? `✅ Đã gán tài xế cho ${createdTripIds.length} chuyến` : ''}`
            );

            onSuccess?.();
            handleClose();
        } catch (error: any) {
            alert(error.message || "Có lỗi xảy ra khi tạo lịch chuyến đi");
        } finally {
            setIsSubmitting(false);
            setProgress({ current: 0, total: 0 });
        }
    };

    const handleClose = () => {
        if (onCancel) onCancel();
        else if (onClose) onClose();
    };

    return (
        <div className="scheduled-trips-form-modal" onClick={handleClose}>
            <form className="scheduled-trips-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <h3>Tạo lịch chuyến đi theo tháng</h3>

                <div>
                    <label>Chọn tuyến đường *</label>
                    <select
                        value={routeId}
                        onChange={(e) => setRouteId(e.target.value)}
                        disabled={routesLoading || !!initialRouteId}
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
                    <label>Chọn tháng *</label>
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Ngày bắt đầu trong tháng *</label>
                    <input
                        type="number"
                        min="1"
                        max="31"
                        value={startDay}
                        onChange={(e) => setStartDay(e.target.value)}
                        required
                    />
                    <small>Ngày đầu tiên trong tháng sẽ tạo chuyến đi</small>
                </div>

                <div>
                    <label>Khoảng cách giữa các chuyến (ngày) *</label>
                    <input
                        type="number"
                        min="1"
                        max="31"
                        value={intervalDays}
                        onChange={(e) => setIntervalDays(e.target.value)}
                        required
                    />
                    <small>Ví dụ: 7 = mỗi tuần một lần</small>
                </div>

                <div>
                    <label>Giờ bắt đầu *</label>
                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Giờ kết thúc *</label>
                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                    />
                </div>

                <div className="scheduled-trips-form__checkbox">
                    <label>
                        <input
                            type="checkbox"
                            checked={autoAssign}
                            onChange={(e) => setAutoAssign(e.target.checked)}
                        />
                        Tự động gán tài xế cho tất cả chuyến đi
                    </label>
                </div>

                {autoAssign && (
                    <>
                        <div>
                            <label>Chọn tài xế *</label>
                            <select
                                value={selectedDriverId}
                                onChange={(e) => setSelectedDriverId(e.target.value)}
                                disabled={driversLoading}
                                required={autoAssign}
                            >
                                <option value="">-- Chọn tài xế --</option>
                                {drivers.map((driver) => (
                                    <option key={driver.id} value={driver.id}>
                                        {driver.firstName || ''} {driver.lastName || ''} 
                                        {driver.phone ? ` - ${driver.phone}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label>Chọn tài khoản *</label>
                            <select
                                value={selectedAccountId}
                                onChange={(e) => setSelectedAccountId(e.target.value)}
                                disabled={accountsLoading}
                                required={autoAssign}
                            >
                                <option value="">-- Chọn tài khoản --</option>
                                {driverAccounts.map((account) => (
                                    <option key={account.accountId} value={account.accountId}>
                                        {account.username} ({account.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {scheduledDates.length > 0 && (
                    <div className="scheduled-trips-form__preview">
                        <h4>Xem trước lịch ({scheduledDates.length} chuyến):</h4>
                        <div className="preview-list">
                            {scheduledDates.map((date, index) => (
                                <div key={index} className="preview-item">
                                    <strong>{date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
                                    <span>{startTime} - {endTime}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isSubmitting && (
                    <div className="scheduled-trips-form__progress">
                        <p>Đang tạo... {progress.current}/{progress.total}</p>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="scheduled-trips-form__actions">
                    <button type="submit" disabled={isSubmitting || scheduledDates.length === 0}>
                        {isSubmitting ? "Đang tạo..." : `Tạo ${scheduledDates.length} chuyến đi`}
                    </button>
                    <button type="button" onClick={handleClose} disabled={isSubmitting}>
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateScheduledTripsForm;
