import React from "react";
import '../styles/Sidebar.scss';
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Sidebar: React.FC = () => {
	const navigate = useNavigate();
	const [isDrop, setIsDrop] = useState(false);
	const { isAdmin } = useAuth();

	const toggleDropdown = () => {
		setIsDrop(!isDrop);
	};

	return (
		<aside className="sidebar">
			<button
				className="sidebar-close-btn"
				aria-label="Đóng menu"
				onClick={() => document.body.classList.remove('sidebar-open')}
			>
				<span />
				<span />
			</button>
			<div className="sidebar-logo" onClick={() => { navigate('/home'); document.body.classList.remove('sidebar-open'); }}>
				<img src="/images/logo.png" alt="Logo" className="sidebar-logo-image" />
			</div>
			<nav>
				<ul>
					<li onClick={() => { navigate('/home'); document.body.classList.remove('sidebar-open'); }}>Trang chủ</li>
					<li onClick={toggleDropdown}>Quản lý
						{isDrop && (
							<ul className="sidebar-dropdown">
								{isAdmin && <li onClick={() => { navigate('/user-manager'); document.body.classList.remove('sidebar-open'); }}>Quản lý người dùng</li>}
								<li onClick={() => { navigate('/driver-manager'); document.body.classList.remove('sidebar-open'); }}>Quản lý tài xế</li>
								<li onClick={() => { navigate('/route-manager'); document.body.classList.remove('sidebar-open'); }}>Quản lý đường đi</li>
								<li onClick={() => { navigate('/trip-manager'); document.body.classList.remove('sidebar-open'); }}>Quản lý chuyến đi</li>
								<li onClick={() => { navigate('/vehicle-manager'); document.body.classList.remove('sidebar-open'); }}>Quản lý xe</li>
							</ul>
						)}
					</li>
					<li onClick={() => { navigate('/notification'); document.body.classList.remove('sidebar-open'); }}>Thông báo</li>
					<li onClick={() => { navigate('/update-firmware'); document.body.classList.remove('sidebar-open'); }}>Cập nhật phần mềm</li>

				</ul>
			</nav>
		</aside>
	);
}
export default Sidebar;