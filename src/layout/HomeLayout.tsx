import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { handleForegroundMessage, handleServiceWorkerMessage } from "../firebase/firebase-messaging";


const HomeLayout: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Khởi tạo xử lý foreground message
        handleForegroundMessage(navigate);
        
        // Khởi tạo xử lý service worker message
        handleServiceWorkerMessage();
    }, [navigate]);

    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <div
                className="sidebar-backdrop"
                onClick={() => {
                    document.body.classList.remove('sidebar-open');
                }}
            />
            <div style={{ flex: 1, background: "#230505", minHeight: "100dvh", overflowY: "auto" }}>
                <Header />
                <Outlet />
            </div>
        </div>
    );
};

export default HomeLayout;