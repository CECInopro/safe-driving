import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Welcome.scss';


const Welcome: React.FC = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/login');
    };

    return (
        <div className='welcome-container'>
            <img src="/images/logo.png" alt="Logo" className="welcome-logo" />
            <h1 className='welcome-title'>Chào mừng đến với Safe-Driving</h1>
            <button className='welcome-button' onClick={handleGetStarted}>Bắt đầu</button>
        </div>
    );
}

export default Welcome;