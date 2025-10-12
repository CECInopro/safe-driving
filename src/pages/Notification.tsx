import React, { useEffect, useMemo, useState } from "react";
import "../styles/Notification.scss";

type NotificationData = {
    title?: string;
    body?: string;
    deviceId?: string;
    data?: Record<string, string> | undefined;
};

// const RESPONSE_ENDPOINT = "api/v1/confirm-update-vehicle/";

const Notification: React.FC = () => {
    const [notification, setNotification] = useState<NotificationData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const loadNotification = () => {
            try {
                const raw = localStorage.getItem("latest_fcm_payload");
                console.log("Loaded payload from localStorage:", raw);
                if (raw) {
                    const payload = JSON.parse(raw);
                    const title = payload?.notification?.title || payload?.data?.title;
                    const body = payload?.notification?.body || payload?.data?.body;
                    const deviceId = payload?.data?.deviceId;
                    const data = payload?.data;
                    setNotification({ title, body, deviceId, data });
                }
            } catch {
                // ignore
            }
        };

        loadNotification();

        // Lắng nghe sự kiện storage (tab khác) và custom event (tab hiện tại)
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "latest_fcm_payload") {
                loadNotification();
            }
        };
        const handleCustom = () => loadNotification();

        window.addEventListener("storage", handleStorage);
        window.addEventListener("latest_fcm_payload_updated", handleCustom);

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("latest_fcm_payload_updated", handleCustom);
        };
    }, []);

    const prettyData = useMemo(() => {
        if (!notification?.data) return null;
        try {
            return JSON.stringify(notification.data, null, 2);
        } catch {
            return null;
        }
    }, [notification]);

    const sendDecision = async (decision: "1" | "0") => {
        setIsSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            const raw = localStorage.getItem("latest_fcm_payload");
            const payload = raw ? JSON.parse(raw) : null;
            const deviceId = payload?.data?.deviceId;
            const vehiclePlateNumber = payload?.data?.vehiclePlateNumber;
            // Tạo xRequestId ngẫu nhiên hoặc lấy từ payload nếu có
            const xRequestId = crypto.randomUUID();

            const res = await fetch(`http://26.157.165.184:8080/api/v1/verify/confirm-update-vehicle/${decision}`, {
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

    if (!notification) {
        return (
            <div className="notification-container">
                <h2 className="notification-title">Thông báo</h2>
                <p>Không có thông báo để hiển thị.</p>
            </div>
        );
    }

    return (
        <div className="notification-container">
            <h2 className="notification-title">Thông báo</h2>
            {notification.title && (
                <h3 className="notification-subtitle">{notification.title}</h3>
            )}
            {notification.body && <p className="notification-body">{notification.body}</p>}
            {notification.deviceId && (
                <p className="notification-device">DeviceId: {notification.deviceId}</p>
            )}
            {prettyData && (
                <div>
                    <h4 className="notification-data-title">Dữ liệu đính kèm</h4>
                    <pre className="notification-data">{prettyData}</pre>
                </div>
            )}

            <div className="notification-actions">
                <button disabled={isSubmitting} onClick={() => sendDecision("1")}>
                    Yes
                </button>
                <button disabled={isSubmitting} onClick={() => sendDecision("0")}>
                    No
                </button>
            </div>

            {successMessage && <p className="notification-success">{successMessage}</p>}
            {errorMessage && <p className="notification-error">{errorMessage}</p>}
        </div>
    );
};

export default Notification;
