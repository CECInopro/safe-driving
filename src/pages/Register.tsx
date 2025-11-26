import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Register.scss';
const Register: React.FC = () => {
    const roleOptions = ["ADMIN", "MANAGER", "DRIVER"];
    const navigate = useNavigate();
    const [role, setRole] = useState("DRIVER");
    return (
        <div className='welcome-container'>
            <div className='register-container'>
                <img src="/images/logo.png" alt="Logo" className="register-logo" />
                <form className='register-form'>
                    <h1 className='register-title'>Đăng ký</h1>
                    <input type="text" placeholder="Tên đăng nhập" className='register-input' />
                    <input type="password" placeholder="Mật khẩu" className='register-input' />
                    <input type="password" placeholder="Xác nhận mật khẩu" className='register-input' />
                    <select className="register-input" value={role} onChange={(e) => setRole(e.target.value)}>
                        {roleOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <button type="submit" className='register-button'>Đăng ký</button>
                    <button onClick={() => navigate('/login')} type="button" className='register-login'>Đăng nhập</button>
                </form>
            </div>
        </div>
    );
}
export default Register;