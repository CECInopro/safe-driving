import React, { useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import CarMapModal from '../components/VehicleMapModal';
import '../styles/VehicleManager.scss';
const BASE_URL = import.meta.env.VITE_BASE_URL as string;
type Vehicle = {
    vehicleId: string;
    plateNumber?: string;
    fullName?: string;
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
                const res = await fetch(`${BASE_URL}/api/v1/vehicles`, {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json',
                        'xRequestId': crypto.randomUUID(),
                    },
                });
                if (!res.ok) throw new Error(`Fetch vehicles failed: ${res.status}`);
                const raw = await res.json();

                const list = Array.isArray(raw)
                    ? raw
                    : Array.isArray(raw?.data)
                        ? raw.data
                        : Array.isArray(raw?.items)
                            ? raw.items
                            : [];

                const normalized: Vehicle[] = list.map((v: any) => ({
                    vehicleId: v.vehicleId ?? v.id ?? v.vehicle_id,
                    plateNumber: v.plateNumber ?? v.plate ?? v.plate_number,
                    fullName: v.fullName ?? v.full_name ?? v.fullname ?? v.fullName ?? v.fullName,
                })).filter((v: Vehicle) => !!v.vehicleId);

                const uniqueVehicles = Array.from(
                    new Map(normalized.map(v => [v.vehicleId, v])).values()
                );

                setVehicles(uniqueVehicles);
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
                            <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}>{car.vehicleId}</td>
                            <td>{car.plateNumber || '-'}</td>
                            <td>{car.fullName || '-'}</td>
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