import React from 'react';
import { FaEye } from 'react-icons/fa';
import '../styles/TripManager.scss';

const trips = [
    {
        id: 1,
        driver: 'Đỗ Thành Công',
        account: 'dtcong123',
        distance: '7km',
        status: 'Đã hoàn thành',
    },
    {
        id: 2,
        driver: 'Vũ Thanh Hoàn',
        account: 'vthoan',
        distance: '8km',
        status: 'Đang thực hiện',
    },
    {
        id: 3,
        driver: 'Dương Anh Đức',
        account: 'daduc',
        distance: '36km',
        status: 'Đã hoàn thành',
    },
];

const TripManager: React.FC = () => (
    <div className="trip-manager">
        <h2>Quản lý chuyến đi</h2>
        <table className="trip-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tài xế thực hiện</th>
                    <th>Account</th>
                    <th>Quãng đường</th>
                    <th>Tình trạng</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {trips.map((trip) => (
                    <tr key={trip.id}>
                        <td>{trip.id}</td>
                        <td>{trip.driver}</td>
                        <td>{trip.account}</td>
                        <td>{trip.distance}</td>
                        <td>{trip.status}</td>
                        <td>
                            <FaEye style={{ cursor: 'pointer' }} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default TripManager;