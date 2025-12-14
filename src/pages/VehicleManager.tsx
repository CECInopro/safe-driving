import React, { useState, useMemo, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import VehicleMapModal from '../components/VehicleMapModal';
import CreateVehicleForm from '../components/CreateVehicleForm';
import { useVehicles, type Vehicle } from '../hooks/useVehicles';
import '../styles/VehicleManager.scss';

type AlertState = { type: 'success' | 'error'; message: string } | null;

const VehicleManager: React.FC = () => {
    const { vehicles, loading, error, createVehicle } = useVehicles();
    const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null);
    const [query, setQuery] = useState<string>('');
    const [alert, setAlert] = useState<AlertState>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (!alert) return;
        const timer = setTimeout(() => setAlert(null), 4000);
        return () => clearTimeout(timer);
    }, [alert]);

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        return vehicles.filter((v) => 
            v.code.toLowerCase().includes(q) ||
            v.name.toLowerCase().includes(q) ||
            (v.plateNumber && v.plateNumber.toLowerCase().includes(q)) ||
            (v.driver && v.driver.toLowerCase().includes(q))
        );
    }, [vehicles, query]);

    const handleCreateVehicle = async (payload: {
        plateNumber: string;
        vin: string;
        vehicleTypeId: number;
        odometerKm: number;
        status: string;
    }) => {
        const result = await createVehicle(payload);
        if (result.success) {
            setAlert({ type: 'success', message: 'Đã tạo xe mới.' });
        } else {
            setAlert({ type: 'error', message: result.error || 'Không thể tạo xe.' });
        }
        return result;
    };

    return (
        <div className="car-manager">
            <div className="car-manager__top">
                <h2>Quản lý xe</h2>
                <div className="car-manager__actions">
                    <input
                        className="car-manager__search"
                        placeholder="Tìm theo code, tên, biển số..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button className="btn btn--primary" onClick={() => setIsCreating(true)}>+ Thêm</button>
                </div>
            </div>

            {alert && (
                <div className={`car-manager__alert car-manager__alert--${alert.type}`}>
                    {alert.message}
                </div>
            )}
            {error && !alert && (
                <div className="car-manager__alert car-manager__alert--error">{error}</div>
            )}

            <div className="table-wrapper">
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
                            <tr><td colSpan={5}>Đang tải dữ liệu...</td></tr>
                        )}
                        {!loading && filtered.length === 0 && (
                            <tr><td colSpan={5}>Không tìm thấy xe phù hợp.</td></tr>
                        )}
                        {!loading && filtered.map((car) => (
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
            </div>
            {selectedCar && (
                <VehicleMapModal
                    plateNumber={selectedCar.plateNumber || ''}
                    vehicleId={selectedCar.vehicleId}
                    deviceId={selectedCar.deviceId}
                    onClose={() => setSelectedCar(null)}
                />
            )}
            {isCreating && (
                <CreateVehicleForm
                    onCancel={() => setIsCreating(false)}
                    onSubmit={handleCreateVehicle}
                    onSuccess={() => setIsCreating(false)}
                />
            )}
        </div>
    );
};

export default VehicleManager;