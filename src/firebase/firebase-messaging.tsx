import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type MessagePayload } from "firebase/messaging";
import type { NavigateFunction } from "react-router-dom";
import { AUTH_STORAGE_KEY } from "../contexts/AuthContext";
const BASE_URL = import.meta.env.VITE_BASE_URL as string;

// Interface cho notification item
export interface NotificationItem {
    id: string;
    timestamp: number;
    payload: MessagePayload;
    isRead: boolean;
    topic: 'yesno' | 'violation' | 'info';
    responded?: boolean;
}

//config firebase
const firebaseConfig = {
    apiKey: "AIzaSyDKCzk80RBsZ9yoTWKVL5ILYgH0ww5jfbE",
    authDomain: "fcm-driver-management.firebaseapp.com",
    projectId: "fcm-driver-management",
    storageBucket: "fcm-driver-management.appspot.com",
    messagingSenderId: "403802560323",
    appId: "1:403802560323:web:71f20afb4d178abf1c81f6",
    measurementId: "G-QC28PSJBZN"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Lấy FCM token 
export const initNotification = async () => {
    try {
        const token = await getToken(messaging);
        console.log("FCM Token:", token);

        if (token) {
            const xRequestId = crypto.randomUUID();
            //  Gửi token về server (BE)
            let authToken: string | null = null;
            try {
                const stored = localStorage.getItem(AUTH_STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    authToken = parsed?.token ?? null;
                }
                console.log("Đã lấy token đăng nhập từ localStorage.");
            } catch (error) {
                console.warn("Không thể đọc token đăng nhập:", error);
            }

            const accountId = "g50e8400-e29b-41d4-a716-446655440001";
            const res = await fetch(`${BASE_URL}/api/v1/accounts/${accountId}/token`, {
                method: 'PATCH',
                cache: "no-store",
                headers: {
                    'Content-Type': 'application/json',
                    "x-request-id": xRequestId,
                    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
                },
                body: JSON.stringify({
                    token: token
                }),
            });

            if (!res.ok) {
                throw new Error(`Gửi token thất bại: ${res.status}`);
            }

            console.log("Gửi token thành công!");
        }
    } catch (err) {
        console.error("Lỗi khi lấy hoặc gửi token:", err);
    }
};

// Function để xác định topic của thông báo
const determineNotificationTopic = (payload: MessagePayload): 'yesno' | 'violation' | 'info' => {
    const data = (payload as any).data || {};

    // Kiểm tra topic ở cấp top-level của payload
    const rawTopic = ((payload as any).topic || '').toString().trim();
    if (rawTopic === 'NotificationConfirm') return 'yesno';
    if (rawTopic === 'NotificationViolation') return 'violation';
    if (rawTopic === 'NotificationInfo') return 'info';

    // Fallback: kiểm tra topic trong data
    const rawTopicInData = (data.topic || '').toString().trim();
    if (rawTopicInData === 'NotificationConfirm') return 'yesno';
    if (rawTopicInData === 'NotificationViolation') return 'violation';
    if (rawTopicInData === 'NotificationInfo') return 'info';

    return 'info';
};

// Lắng nghe thông báo khi app đang ở foreground
export const handleForegroundMessage = (navigate: NavigateFunction) => {
    onMessage(messaging, async (payload: MessagePayload) => {
        // Sử dụng function saveNotification chung để tránh duplicate
        saveNotification(payload, 'foreground');
        navigate('/notification');
    });
};

//  Function để lấy tất cả thông báo
export const getAllNotifications = (): NotificationItem[] => {
    try {
        return JSON.parse(localStorage.getItem("fcm_notifications") || "[]");
    } catch {
        return [];
    }
};

// Function để đánh dấu đã đọc
export const markNotificationAsRead = (notificationId: string) => {
    try {
        const notifications = getAllNotifications();
        const updatedNotifications = notifications.map(notification =>
            notification.id === notificationId
                ? { ...notification, isRead: true }
                : notification
        );
        localStorage.setItem("fcm_notifications", JSON.stringify(updatedNotifications));
        window.dispatchEvent(new Event("fcm_notifications_updated"));
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
};

// Function để xóa thông báo
export const deleteNotification = (notificationId: string) => {
    try {
        const notifications = getAllNotifications();
        const updatedNotifications = notifications.filter(
            notification => notification.id !== notificationId
        );
        localStorage.setItem("fcm_notifications", JSON.stringify(updatedNotifications));
        window.dispatchEvent(new Event("fcm_notifications_updated"));

    } catch (error) {
        console.error("Error deleting notification:", error);
    }
};

// Function để lưu thông báo (dùng chung cho cả foreground và background)
const saveNotification = (payload: MessagePayload, source: 'foreground' | 'background') => {
    try {
        const messageId = payload.messageId || `${payload.data?.deviceId}_${Date.now()}`;
        const topic = determineNotificationTopic(payload);

        // Lấy danh sách thông báo hiện tại
        const existingNotifications = JSON.parse(
            localStorage.getItem("fcm_notifications") || "[]"
        ) as NotificationItem[];

        // Kiểm tra xem thông báo đã tồn tại chưa (dựa trên messageId)
        const existingNotification = existingNotifications.find(
            notification => notification.payload.messageId === messageId
        );

        if (existingNotification) {
            console.log("Notification already exists, skipping duplicate:", messageId);
            return;
        }

        // Tạo thông báo mới
        const newNotification: NotificationItem = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            payload,
            isRead: false,
            topic,
            responded: false
        };

        // Thêm vào đầu mảng
        const updatedNotifications = [newNotification, ...existingNotifications];
        const limitedNotifications = updatedNotifications.slice(0, 100);

        localStorage.setItem("fcm_notifications", JSON.stringify(limitedNotifications));
        console.log(`Saved ${source} notification to array:`, newNotification);

        window.dispatchEvent(new Event("fcm_notifications_updated"));
    } catch (error) {
        console.error(`Error saving ${source} notification:`, error);
    }
};

// Function để lắng nghe message từ service worker
export const handleServiceWorkerMessage = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.action === 'save_notification') {
                if (event.data.type === 'FCM_BACKGROUND_MESSAGE' || event.data.type === 'FCM_NOTIFICATION_CLICK') {
                    saveNotification(event.data.payload, 'background');
                }
            }
        });
    }
};