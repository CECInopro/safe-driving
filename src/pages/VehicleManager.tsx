import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import VehicleMapModal from '../components/VehicleMapModal';
import { useVehicles, type Vehicle } from '../hooks/useVehicles';
import '../styles/VehicleManager.scss';

const VehicleManager: React.FC = () => {
    const { vehicles, loading, error } = useVehicles();
    const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null);

    return (
        <div className="car-manager">
            <h2>Quản lý xe</h2>
            <table className="car-table">
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Tên</th>
                        <th>Biển số xe</th>
                        <th>Người lái</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                        <tr><td colSpan={4}>Đang tải...</td></tr>
                    )}
                    {error && !loading && (
                        <tr><td colSpan={4} style={{ color: 'red' }}>{error}</td></tr>
                    )}
                    {!loading && !error && vehicles.length === 0 && (
                        <tr><td colSpan={4}>Không có dữ liệu</td></tr>
                    )}
                    {!loading && !error && vehicles.map((car) => (
                        <tr key={car.vehicleId}>
                            <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{car.code}</td>
                            <td>{car.name}</td>
                            <td>{car.plateNumber || '-'}</td>
                            <td>{car.driver || '-'}</td>
                            <td>
                                <FaEye style={{ cursor: 'pointer' }} onClick={() => setSelectedCar(car)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedCar && (
                <VehicleMapModal
                    plateNumber={selectedCar.plateNumber || ''}
                    vehicleId={selectedCar.vehicleId}
                    deviceId={selectedCar.deviceId}
                    onClose={() => setSelectedCar(null)}
                />
            )}
        </div>
    );
};

export default VehicleManager;