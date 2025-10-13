import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type MessagePayload } from "firebase/messaging";
import type { NavigateFunction } from "react-router-dom";

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

// Lấy FCM Token
export const initNotification = async () => {
    try {
        const token = await getToken(messaging);
        console.log("FCM Token:", token);

        if (token) {
            const xRequestId = crypto.randomUUID();
            // 👇 Gửi token về server (BE)
            const res = await fetch('http://26.186.182.141:8080/api/v1/accounts/update-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "xRequestId": xRequestId,
                },
                body: JSON.stringify({
                    id: "g50e8400-e29b-41d4-a716-446655440001",
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

// Interface cho notification item
export interface NotificationItem {
    id: string;
    timestamp: number;
    payload: MessagePayload;
    isRead: boolean;
    topic: 'yesno' | 'violation' | 'info';
    responded?: boolean;
}

// Function để xác định topic của thông báo
const determineNotificationTopic = (payload: MessagePayload): 'yesno' | 'violation' | 'info' => {
    const data = (payload as any).data || {} as Record<string, string>;

    // 1) Ưu tiên topic ở cấp top-level của payload (theo yêu cầu)
    const rawTopic = (((payload as any).topic) || '').toString().trim();
    if (rawTopic) {
        const normalized = rawTopic.toLowerCase();

        // Map 2 loại topic chuẩn mà bạn yêu cầu
        if (rawTopic === 'NotificationConfirm' || normalized === 'notificationconfirm') return 'yesno';
        if (rawTopic === 'NotificationViolation' || normalized === 'notificationviolation') return 'violation';
        if (rawTopic === 'NotificationInfo' || normalized === 'notificationinfo') return 'info';

        // Map các biến thể/đồng nghĩa về 2 nhóm
        const yesNoAliases = new Set([
            'yesno', 'yes_no', 'confirm', 'confirmation', 'approval', 'approve', 'request', 'action', 'yn', 'choice', 'prompt'
        ]);
        const violationAliases = new Set([
            'violation', 'alert', 'breach', 'rule_violation', 'warning', 'incident', 'offense', 'infraction'
        ]);

        if (yesNoAliases.has(normalized)) return 'yesno';
        if (violationAliases.has(normalized)) return 'violation';

        // Nếu topic khác nhưng có pattern rõ ràng
        if (normalized.includes('violation') || normalized.includes('viol')) return 'violation';
        if (normalized.includes('confirm') || normalized.includes('approve')) return 'yesno';
    }

    // 2) Fallback đọc từ data.topic nếu có (phòng trường hợp BE đặt topic trong data)
    const rawTopicInData = (data as any).topic ? String((data as any).topic).trim() : '';
    if (rawTopicInData) {
        const normalizedInData = rawTopicInData.toLowerCase();

        // Map trực tiếp 3 topic chuẩn ở data.topic
        if (rawTopicInData === 'NotificationConfirm' || normalizedInData === 'notificationconfirm') return 'yesno';
        if (rawTopicInData === 'NotificationViolation' || normalizedInData === 'notificationviolation') return 'violation';
        if (rawTopicInData === 'NotificationInfo' || normalizedInData === 'notificationinfo') return 'info';

        const yesNoAliases = new Set([
            'yesno', 'yes_no', 'confirm', 'confirmation', 'approval', 'approve', 'request', 'action', 'yn', 'choice', 'prompt'
        ]);
        const violationAliases = new Set([
            'violation', 'alert', 'breach', 'rule_violation', 'warning', 'incident', 'offense', 'infraction'
        ]);
        if (yesNoAliases.has(normalizedInData)) return 'yesno';
        if (violationAliases.has(normalizedInData)) return 'violation';
        if (normalizedInData.includes('violation') || normalizedInData.includes('viol')) return 'violation';
        if (normalizedInData.includes('confirm') || normalizedInData.includes('approve')) return 'yesno';
    }

    // 3) Fallback heuristic khi không có topic rõ ràng
    // Nếu có deviceId và vehiclePlateNumber thì là yesno (cần phản hồi)
    if (data.deviceId && (data as any).vehiclePlateNumber) {
        return 'yesno';
    }

    // Nếu có violationType hoặc violationCode thì là violation
    if ((data as any).violationType || (data as any).violationCode) {
        return 'violation';
    }

    // Nếu có actionType
    if ((data as any).actionType === 'violation') {
        return 'violation';
    }

    if ((data as any).actionType === 'confirm' || (data as any).requiresResponse === 'true') {
        return 'yesno';
    }

    // 4) Mặc định: yesno
    return 'yesno';
};

// Thay đổi function handleForegroundMessage
export const handleForegroundMessage = (navigate: NavigateFunction) => {
    onMessage(messaging, async (payload: MessagePayload) => {
        // Sử dụng function saveNotification chung để tránh duplicate
        saveNotification(payload, 'foreground');
        navigate('/notification');
    });
};

// Thêm function để lấy tất cả thông báo
export const getAllNotifications = (): NotificationItem[] => {
    try {
        return JSON.parse(localStorage.getItem("fcm_notifications") || "[]");
    } catch {
        return [];
    }
};

// Thêm function để đánh dấu đã đọc
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

// Thêm function để xóa thông báo
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