import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Register.scss';
const Register: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className='welcome-container'>
            <div className='register-container'>
                <img src="/images/logo.png" alt="Logo" className="register-logo" />
                <form className='register-form'>
                    <h1 className='register-title'>Đăng ký</h1>
                    <input type="text" placeholder="Tên đăng nhập" className='register-input' />
                    <input type="email" placeholder="Email" className='register-input' />
                    <input type="password" placeholder="Mật khẩu" className='register-input' />
                    <input type="password" placeholder="Xác nhận mật khẩu" className='register-input' />
                    
                    <button type="submit" className='register-button'>Đăng ký</button>
                    <button onClick={() => navigate('/login')} type="button" className='register-login'>Đăng nhập</button>
                </form>
            </div>
        </div>
    );
}
export default Register;