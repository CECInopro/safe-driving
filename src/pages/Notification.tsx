import React, { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import "../styles/Notification.scss";
import { getAllNotifications, deleteNotification, type NotificationItem } from "../firebase/firebase-messaging";
import { useAuth } from "../contexts/AuthContext";
import VehicleMapModal from "../components/VehicleMapModal";
import { useVehicles } from "../hooks/useVehicles";

const BASE_URL = import.meta.env.VITE_BASE_URL as string;

type SelectedVehicle = {
    vehicleId: string;
    deviceId: string;
    plateNumber: string;
};

const Notification: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<SelectedVehicle | null>(null);
    const { token } = useAuth();
    const { vehicles } = useVehicles();

    useEffect(() => {
        const loadNotifications = () => {
            try {
                const allNotifications = getAllNotifications();
                setNotifications(allNotifications);
            } catch (error) {
                console.error("Error loading notifications:", error);
            }
        };

        loadNotifications();

        // Lắng nghe sự kiện cập nhật thông báo
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "fcm_notifications") {
                loadNotifications();
            }
        };
        const handleCustom = () => loadNotifications();

        window.addEventListener("storage", handleStorage);
        window.addEventListener("fcm_notifications_updated", handleCustom);

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("fcm_notifications_updated", handleCustom);
        };
    }, []);

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('vi-VN');
    };

    const sendDecision = async (decision: "1" | "0", notification: NotificationItem) => {
        setIsSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!token) {
            setErrorMessage("Bạn cần đăng nhập lại để phản hồi.");
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = notification.payload;
            const deviceId = payload?.data?.deviceId;
            const vehiclePlateNumber = payload?.data?.vehiclePlateNumber;
            const xRequestId = crypto.randomUUID();

            const res = await fetch(`${BASE_URL}/api/v1/verify/confirm-update-vehicle/${decision}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "xRequestId": xRequestId,
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    deviceId,
                    vehiclePlateNumber,
                }),
            });

            if (!res.ok) throw new Error(`Request failed with status ${res.status}`);


            const items = getAllNotifications();
            const updated = items.map(it =>
                it.id === notification.id ? { ...it, responded: true } : it
            );
            localStorage.setItem("fcm_notifications", JSON.stringify(updated));
            window.dispatchEvent(new Event("fcm_notifications_updated"));

            setSuccessMessage(
                decision === "1"
                    ? "Đã chấp nhận và gửi về BE."
                    : "Đã từ chối và gửi về BE."
            );
        } catch (err: any) {
            setErrorMessage(err?.message || "Có lỗi xảy ra khi gửi phản hồi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteNotification = (notificationId: string) => {
        deleteNotification(notificationId);
    };

    if (notifications.length === 0) {
        return (
            <div className="notification-container">
                <h2 className="notification-title">Thông báo</h2>
                <p>Không có thông báo để hiển thị.</p>
            </div>
        );
    }

    return (
        <div className="notification-container">
            <h2 className="notification-title">Thông báo ({notifications.length})</h2>

            {successMessage && <p className="notification-success">{successMessage}</p>}
            {errorMessage && <p className="notification-error">{errorMessage}</p>}

            <div className="notifications-list">
                {notifications.map((notification) => {
                    const payload = notification.payload;
                    const title = payload?.data?.title || payload?.notification?.title;
                    const body = payload?.data?.body || payload?.notification?.body;
                    const deviceId = payload?.data?.deviceId;
                    const vehiclePlateNumber = payload?.data?.vehiclePlateNumber || payload?.data?.plateNumber;
                    const data = payload?.data;
                    const topic = notification.topic;

                    return (
                        <div
                            key={notification.id}
                            className={`notification-item ${!notification.isRead ? 'unread' : ''} ${topic}`}
                        >
                            <div className="notification-header">
                                <div className="notification-title-section">
                                    <h3 className="notification-subtitle">{title}</h3>
                                    <span className={`topic-badge ${topic} ${topic === 'yesno' && notification.responded ? 'responded' : ''}`}>
                                        {topic === 'yesno'
                                            ? (notification.responded ? 'Đã phản hồi' : 'Cần phản hồi')
                                            : topic === 'violation'
                                                ? 'Vi phạm'
                                                : 'Thông tin'}
                                    </span>
                                </div>
                                <div className="notification-meta">
                                    <span className="notification-time">{formatTimestamp(notification.timestamp)}</span>
                                    <button className="delete-btn" onClick={() => handleDeleteNotification(notification.id)} title="Xóa thông báo">Xóa
                                    </button>
                                </div>
                            </div>

                            {/* Thông tin chi tiết được tổ chức gọn gàng */}
                            {(deviceId || vehiclePlateNumber || data?.firstName || data?.lastName || data?.email || data?.phone) && (
                                <div className="notification-details">
                                    {vehiclePlateNumber && (
                                        <div className="detail-item">
                                            <span className="detail-label">Biển số xe:</span>
                                            <span className="detail-value highlight">{vehiclePlateNumber}</span>
                                        </div>
                                    )}
                                    {deviceId && (
                                        <div className="detail-item">
                                            <span className="detail-label">Device ID:</span>
                                            <span className="detail-value">{deviceId}</span>
                                        </div>
                                    )}
                                    {(data?.firstName || data?.lastName) && (
                                        <div className="detail-item">
                                            <span className="detail-label">Tài xế:</span>
                                            <span className="detail-value">{[data?.firstName, data?.lastName].filter(Boolean).join(' ')}</span>
                                        </div>
                                    )}
                                    {data?.email && (
                                        <div className="detail-item">
                                            <span className="detail-label">Email:</span>
                                            <span className="detail-value">{data.email}</span>
                                        </div>
                                    )}
                                    {data?.phone && (
                                        <div className="detail-item">
                                            <span className="detail-label">Số điện thoại:</span>
                                            <span className="detail-value">{data.phone}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {body && !deviceId && !vehiclePlateNumber && !data?.firstName && !data?.lastName && (
                                <p className="notification-body">{body}</p>
                            )}

                            {/* Chỉ hiển thị nút Yes/No cho thông báo yesno */}
                            {topic === 'yesno' && !notification.responded && (
                                <div className="notification-actions">
                                    <button className="action-btn accept-btn" disabled={isSubmitting} onClick={() => sendDecision("1", notification)}>
                                        Chấp nhận
                                    </button>
                                    <button className="action-btn reject-btn" disabled={isSubmitting} onClick={() => sendDecision("0", notification)}>
                                        Từ chối
                                    </button>
                                </div>
                            )}

                            {/* Hiển thị nút FaEye cho thông báo violation */}
                            {topic === 'violation' && vehiclePlateNumber && (
                                <div className="notification-actions">
                                    <button 
                                        className="action-btn view-btn" 
                                        onClick={() => {
                                            // Tìm xe từ danh sách dựa trên biển số
                                            const vehicle = vehicles.find(
                                                v => v.plateNumber?.toLowerCase() === vehiclePlateNumber.toLowerCase()
                                            );
                                            
                                            // Sử dụng thông tin từ danh sách xe hoặc từ payload
                                            const finalVehicleId = payload?.data?.vehicleId || vehicle?.vehicleId || deviceId || '';
                                            const finalDeviceId = deviceId || vehicle?.deviceId || finalVehicleId;
                                            
                                            if (finalVehicleId && finalDeviceId) {
                                                setSelectedVehicle({
                                                    vehicleId: finalVehicleId,
                                                    deviceId: finalDeviceId,
                                                    plateNumber: vehiclePlateNumber,
                                                });
                                            } else {
                                                setErrorMessage("Không tìm thấy thông tin xe. Vui lòng thử lại sau.");
                                            }
                                        }}
                                        title="Xem vị trí và camera xe"
                                    >
                                        <FaEye style={{ marginRight: '8px', fontSize: '16px' }} />
                                        Xem xe
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modal hiển thị vị trí và camera xe */}
            {selectedVehicle && (
                <VehicleMapModal
                    plateNumber={selectedVehicle.plateNumber}
                    vehicleId={selectedVehicle.vehicleId}
                    deviceId={selectedVehicle.deviceId}
                    onClose={() => setSelectedVehicle(null)}
                />
            )}
        </div>
    );
};

export default Notification;
