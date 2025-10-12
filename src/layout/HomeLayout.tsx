import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { handleForegroundMessage } from "../firebase/firebase-congif";


const HomeLayout: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        handleForegroundMessage(navigate);
    }, [navigate]);

    // Lắng nghe thông điệp từ Service Worker (background/click)
    useEffect(() => {
        const handler = (event: MessageEvent) => {
            const data = event?.data;
            if (!data || !data.type) return;
            if (data.type === 'FCM_BACKGROUND_MESSAGE' || data.type === 'FCM_NOTIFICATION_CLICK') {
                try {
                    localStorage.setItem('latest_fcm_payload', JSON.stringify(data.payload));
                    window.dispatchEvent(new Event("latest_fcm_payload_updated"));
                    console.log("Saved payload to localStorage from SW message:", data.payload);
                } catch { }
                navigate('/notification');
            }
        };
        navigator.serviceWorker?.addEventListener('message', handler as any);
        return () => {
            try { navigator.serviceWorker?.removeEventListener('message', handler as any); } catch { }
        };
    }, [navigate]);

    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <div style={{ flex: 1, background: "#230505", height: "100vh", overflowY: "auto" }}>
                <Header />
                <Outlet />
            </div>
        </div>
    );
};

export default HomeLayout;