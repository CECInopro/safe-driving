import React from 'react';
import '../styles/Login.scss';
import { useNavigate } from 'react-router-dom';
const Login: React.FC = () => {

    const navigate = useNavigate();

    return (
        <div className='welcome-container'>
            <div className='login-container'>
                <img src="/images/logo.png" alt="Logo" className="login-logo" />
                <form className='login-form'>
                    <h1 className='login-title'>Đăng nhập</h1>
                    <input type="text" placeholder="Tên đăng nhập" className='login-input' />
                    <input type="password" placeholder="Mật khẩu" className='login-input' />
                    <button type="button" className='login-forgot-password'>Quên mật khẩu?</button>
                    <button onClick={(e) => { e.preventDefault(); navigate('/home'); }} type="submit" className='login-button'>Đăng nhập</button>
                    <button onClick={() => navigate('/register')} type="button" className='login-register'>Đăng ký</button>
                </form>
            </div>
        </div>
    );
};

export default Login;