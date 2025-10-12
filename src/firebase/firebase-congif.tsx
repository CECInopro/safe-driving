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
            const res = await fetch('http://26.157.165.184:8080/api/v1/accounts/update-token', {
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

// Lưu payload và điều hướng sang trang thông báo
export const handleForegroundMessage = (navigate: NavigateFunction) => {
    onMessage(messaging, async (payload: MessagePayload) => {
        try {
            localStorage.setItem("latest_fcm_payload", JSON.stringify(payload));
            console.log("Saved payload to localStorage:", payload);
            window.dispatchEvent(new Event("latest_fcm_payload_updated"));
        } catch {
            // ignore
        }
        navigate('/notification');
    });
};


// onMessage(messaging, async (payload: MessagePayload) => {
//     try {
//         localStorage.setItem("latest_fcm_payload", JSON.stringify(payload));
//         console.log("Saved payload to localStorage:", payload);
//     } catch {
//         console.error("Failed to save payload to localStorage");
//         // ignore
//     }

//     // Lấy title/body từ notification hoặc data
//     const title = payload?.notification?.title || payload?.data?.title;
//     const body = payload?.notification?.body || payload?.data?.body;
//     const deviceId = payload?.data?.deviceId;

//     if (title && body) {
//         const extra = deviceId ? `\nDeviceId: ${deviceId}` : "";
//         alert(`${title}: ${body}${extra}`);
//     }

//     console.log("Thông báo mới:", payload);

// });