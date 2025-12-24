import React from 'react';
import '../styles/Login.scss';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError('');

        if (!username || !password) {
            setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
            return;
        }

        setLoading(true);
        try {
            const result = await login(username.trim(), password);
            if (result.success) {
                navigate('/home');
                return;
            }
            setError(result.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='welcome-container'>
            <div className='login-container'>
                <img src="/images/logo.png" alt="Logo" className="login-logo" />
                <form className='login-form'>
                    <h1 className='login-title'>Đăng nhập</h1>
                    {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
                    <input type="text" placeholder="Tên đăng nhập" className='login-input' value={username} onChange={e => setUsername(e.target.value)} />
                    <input type="password" placeholder="Mật khẩu" className='login-input' value={password} onChange={e => setPassword(e.target.value)} />
                    {/* <button type="button" className='login-forgot-password'>Quên mật khẩu?</button> */}
                    <button type="button" className='login-button' onClick={handleLogin} disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                    {/* <button onClick={() => navigate('/register')} type="button" className='login-register'>Đăng ký</button> */}
                </form>
            </div>
        </div>
    );
};

export default Login;