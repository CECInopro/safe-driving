import React from "react";
import '../styles/Sidebar.scss';
import { useNavigate } from "react-router-dom";
import { useState } from "react";
const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const [isDrop, setIsDrop] = useState(false);

    const toggleDropdown = () => {
        setIsDrop(!isDrop);
    };
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <img src="/images/logo.png" alt="Logo" className="sidebar-logo-image" />
            </div>
            <nav>
                <ul>
                    <li>Trang chủ</li>
                    <li onClick={toggleDropdown}>Quản lý
                        {isDrop && (
                            <ul className="sidebar-dropdown">
                                <li onClick={() => navigate('/user-manager')}>Quản lý người dùng</li>
                                <li onClick={() => navigate('/trip-manager')}>Quản lý chuyến đi</li>
                                <li onClick={() => navigate('/vihicle-manager')}>Quản lý xe</li>
                            </ul>
                        )}
                    </li>

                </ul>
            </nav>
        </aside>
    );
}
export default Sidebar;