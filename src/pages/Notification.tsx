import React, { useEffect, useState } from "react";
import "../styles/Notification.scss";
import { getAllNotifications, deleteNotification, type NotificationItem } from "../firebase/firebase-messaging";

const BASE_URL = import.meta.env.VITE_BASE_URL as string;
const Notification: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
                },
                body: JSON.stringify({
                    deviceId,
                    vehiclePlateNumber,
                }),
            });

            if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

            // Đánh dấu đã phản hồi thành công: cập nhật localStorage để ẩn nút Yes/No
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
                    const title = payload?.notification?.title || payload?.data?.title;
                    const body = payload?.notification?.body || payload?.data?.body;
                    const deviceId = payload?.data?.deviceId;
                    const data = payload?.data;
                    const prettyData = data ? JSON.stringify(data, null, 2) : null;
                    // Lấy topic từ notification
                    const topic = notification.topic;

                    return (
                        <div
                            key={notification.id}
                            className={`notification-item ${!notification.isRead ? 'unread' : ''} ${topic}`}
                        >
                            <div className="notification-header">
                                <div className="notification-title-section">
                                    <h3 className="notification-subtitle">{title}</h3>
                                    <span className={`topic-badge ${topic}`}>
                                        {topic === 'yesno' ? 'Cần phản hồi' : topic === 'violation' ? 'Vi phạm' : 'Thông tin'}
                                    </span>
                                </div>
                                <div className="notification-meta">
                                    <span className="notification-time">
                                        {formatTimestamp(notification.timestamp)}
                                    </span>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteNotification(notification.id)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                            {body && <p className="notification-body">{body}</p>}
                            {deviceId && (
                                <p className="notification-device">DeviceId: {deviceId}</p>
                            )}
                            {prettyData && (
                                <div>
                                    <h4 className="notification-data-title">Dữ liệu đính kèm</h4>
                                    <pre className="notification-data">{prettyData}</pre>
                                </div>
                            )}
                            {/* Chỉ hiển thị nút Yes/No cho thông báo yesno */}
                            {topic === 'yesno' && !notification.responded && (
                                <div className="notification-actions">
                                    <button
                                        disabled={isSubmitting}
                                        onClick={() => sendDecision("1", notification)}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        disabled={isSubmitting}
                                        onClick={() => sendDecision("0", notification)}
                                    >
                                        No
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Notification;
