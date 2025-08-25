import React from 'react';
import { FaEye } from 'react-icons/fa';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import '../styles/Home.scss';

const stats = [
    { value: '5,000', label: 'Chuyến đi thành công' },
    { value: '1000', label: 'Tổng số người dùng' },
    { value: '200', label: 'Vi phạm nồng độ cồn' },
    { value: '36', label: 'Số người dùng mới' },
];

const chartData = [
    { month: '1', users: 30 },
    { month: '2', users: 45 },
    { month: '3', users: 60 },
    { month: '4', users: 90 },
    { month: '5', users: 70 },
    { month: '6', users: 80 },
    { month: '7', users: 65 },
    { month: '8', users: 75 },
    { month: '9', users: 60 },
    { month: '10', users: 85 },
    { month: '11', users: 50 },
    { month: '12', users: 95 },
];

const violationsData = [
    { month: '1', violations: 12 },
    { month: '2', violations: 18 },
    { month: '3', violations: 24 },
    { month: '4', violations: 35 },
    { month: '5', violations: 28 },
    { month: '6', violations: 22 },
    { month: '7', violations: 26 },
    { month: '8', violations: 33 },
    { month: '9', violations: 19 },
    { month: '10', violations: 27 },
    { month: '11', violations: 15 },
    { month: '12', violations: 30 },
];

const tripsData = [
    { month: '1', trips: 120 },
    { month: '2', trips: 140 },
    { month: '3', trips: 165 },
    { month: '4', trips: 220 },
    { month: '5', trips: 210 },
    { month: '6', trips: 240 },
    { month: '7', trips: 190 },
    { month: '8', trips: 200 },
    { month: '9', trips: 230 },
    { month: '10', trips: 260 },
    { month: '11', trips: 180 },
    { month: '12', trips: 300 },
];

const Home: React.FC = () => (
    <div className="home-page">
        <h2>Welcome !</h2>
        <div className="home-stats">
            {stats.map((stat, idx) => (
                <div className="home-stat-card" key={idx}>
                    <div className="home-stat-value">
                        {stat.value} <FaEye style={{ marginLeft: 8 }} />
                    </div>
                    <div className="home-stat-label">{stat.label}</div>
                </div>
            ))}
        </div>
        <div className="home-chart-section">
            <h3>Biểu đồ người dùng mới theo tháng</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#FF7208" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>

        <div className="home-chart-section">
            <h3>Biểu đồ vi phạm theo tháng</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={violationsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="violations" stroke="#E74C3C" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>

        <div className="home-chart-section">
            <h3>Biểu đồ chuyến đi theo tháng</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tripsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="trips" stroke="#3498DB" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export default Home;