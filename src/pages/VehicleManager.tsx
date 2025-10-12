import React, { useState } from 'react';
import { FaEye } from 'react-icons/fa';
import CarMapModal from '../components/VehicleMapModal';
import '../styles/VehicleManager.scss';

const cars = [
    { id: 1, plate: '30A-12345', driver: 'Nguyễn Văn A', lat: 21.0285, lng: 105.8542 },
    { id: 2, plate: '29B-67890', driver: 'Trần Thị B', lat: 21.0307, lng: 105.8471 },
];

const VehicleManager: React.FC = () => {
    const [selectedCar, setSelectedCar] = useState<typeof cars[0] | null>(null);

    return (
        <div className="car-manager">
            <h2>Quản lý xe</h2>
            <table className="car-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Biển số xe</th>
                        <th>Người lái</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {cars.map((car) => (
                        <tr key={car.id}>
                            <td>{car.id}</td>
                            <td>{car.plate}</td>
                            <td>{car.driver}</td>
                            <td>
                                <FaEye style={{ cursor: 'pointer' }} onClick={() => setSelectedCar(car)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedCar && (
                <CarMapModal
                    carId={selectedCar.id}
                    onClose={() => setSelectedCar(null)}
                />
            )}
        </div>
    );
};

export default VehicleManager;