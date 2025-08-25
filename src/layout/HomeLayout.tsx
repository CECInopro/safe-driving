import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";


const HomeLayout: React.FC = () => (
    <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1, background: "#230505", height: "100vh", overflowY: "auto" }}>
            <Header />
            <Outlet />
        </div>
    </div>
);

export default HomeLayout;