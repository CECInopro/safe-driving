import React, { useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import CarMapModal from '../components/VehicleMapModal';
import '../styles/VehicleManager.scss';

type Vehicle = {
    vehicleId: string;
    plate?: string;
    driver?: string;
};

const VehicleManager: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null);

    useEffect(() => {
        const fetchVehicles = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('http://26.186.182.141:8080/api/v1/vehicles', {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                        'xRequestId': crypto.randomUUID(),
                    },
                });
                if (!res.ok) throw new Error(`Fetch vehicles failed: ${res.status}`);
                const data = await res.json();
                const normalized: Vehicle[] = (Array.isArray(data) ? data : data?.items || []).map((v: any) => ({
                    vehicleId: v.vehicleId || v.id || v.vehicle_id,
                    plate: v.plate || v.plateNumber || v.plate_number,
                    driver: v.driver || v.driverName || v.driver_name,
                })).filter((v: Vehicle) => !!v.vehicleId);
                setVehicles(normalized);
            } catch (e: any) {
                setError(e?.message || 'Không thể tải danh sách xe');
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();
    }, []);

    return (
        <div className="car-manager">
            <h2>Quản lý xe</h2>
            <table className="car-table">
                <thead>
                    <tr>
                        <th>Vehicle ID</th>
                        <th>Biển số xe</th>
                        {/* <th>Người lái</th> */}
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
                            <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{car.vehicleId}</td>
                            <td>{car.plate || '-'}</td>
                            {/* <td>{car.driver || '-'}</td> */}
                            <td>
                                <FaEye style={{ cursor: 'pointer' }} onClick={() => setSelectedCar(car)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {selectedCar && (
                <CarMapModal
                    vehicleId={selectedCar.vehicleId}
                    onClose={() => setSelectedCar(null)}
                />
            )}
        </div>
    );
};

export default VehicleManager;