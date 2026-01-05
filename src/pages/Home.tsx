import React, { useMemo } from 'react';
import { FaEye } from 'react-icons/fa';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import '../styles/Home.scss';
import { useHome } from '../hooks/useHome'



const Home: React.FC = () => {

    const { usersByMonth, tripsByMonth, violationsByMonth, loading, error } = useHome();
    const chartData = useMemo(() => {
        return usersByMonth.map(u => ({
            yearMonth: u.yearMonth,
            userCount: u.userCount,
        }))
    }, [usersByMonth])

    const tripsData = useMemo(() => {
        return tripsByMonth.map(t => ({
            yearMonth: t.yearMonth,
            completedTripCount: t.completedTripCount,
        }))
    }, [tripsByMonth]);

    const violationsData = useMemo(() => {
        return violationsByMonth.map(v => ({
            yearMonth: v.yearMonth,
            lateTripCount: v.lateTripCount,
            alcoholViolationCount: v.alcoholViolationCount,
            somnolenceViolationCount: v.somnolenceViolationCount,
            totalViolationCount: v.totalViolationCount,
        }))
    }, [violationsByMonth]);


    return (
        <div className="home-page">
            <h2>Welcome !</h2>
            {error && (
                <div>Lỗi {error}</div>
            )}
            {loading && (
                <div>Đang tải dữ liệu</div>
            )}
            {/* <div className="home-stats">
                {stats.map((stat, idx) => (
                    <div className="home-stat-card" key={idx}>
                        <div className="home-stat-value">
                            {stat.value} <FaEye style={{ marginLeft: 8 }} />
                        </div>
                        <div className="home-stat-label">{stat.label}</div>
                    </div>
                ))}
            </div> */}
            <div className="home-chart-section">
                <h3>Biểu đồ người dùng mới theo tháng</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="yearMonth" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="userCount" stroke="#FF7208" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="home-chart-section">
                <h3>Biểu đồ vi phạm theo tháng</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={violationsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="yearMonth" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="totalViolationCount" stroke="#E74C3C" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="home-chart-section">
                <h3>Biểu đồ chuyến đi theo tháng</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={tripsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="yearMonth" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="completedTripCount" stroke="#3498DB" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )

};


export default Home;