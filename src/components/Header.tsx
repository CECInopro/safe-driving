import React from "react";
import { useState } from "react";
import '../styles/Header.scss';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [isDrop, setIsDrop] = useState(false);
    const toggleDropdown = () => {
        setIsDrop(!isDrop);
    };

    return (
        <div className="header">
            <button
                className="header-menu-btn"
                aria-label="Toggle sidebar"
                onClick={() => {
                    document.body.classList.toggle('sidebar-open');
                }}
            >
                <span />
                <span />
                <span />
            </button>
            <input type="text" placeholder="Tìm kiếm..." className="header-search" />
            <div className="header-user">
                <img src="/images/avatar.png" alt="User Icon" className="header-user-icon" onClick={toggleDropdown} />
                {isDrop && (
                    <div className="header-dropdown">
                        <button onClick={() => navigate('/profile')} className="header-dropdown-item">Hồ sơ</button>
                        <button onClick={() => navigate('/settings')} className="header-dropdown-item">Cài đặt</button>
                        <button
                            onClick={() => {
                                logout();
                                setIsDrop(false);
                                navigate('/login', { replace: true });
                            }}
                            className="header-dropdown-item"
                        >
                            Đăng xuất
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;