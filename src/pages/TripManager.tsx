import React, { useMemo, useState } from "react";
import { FaEye } from 'react-icons/fa';
import '../styles/TripManager.scss';
import useTrip from "../hooks/useTrip";
import TripMapModal from "../components/TripMapModal";

const TripManager: React.FC = () => {
    const [query, setQuery] = useState<string>('');
    const { tripsWithAssignment, loading, error } = useTrip();
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

    const filteredTrips = useMemo(() => {
        const q = query.toLowerCase();
        return tripsWithAssignment.filter((t) =>
            t.code.toLowerCase().includes(q) ||
            t.routeName.toLowerCase().includes(q)
        );
    }, [tripsWithAssignment, query]);
    return (
        <>
            <div className='trip-manager'>
                <div className="trip-manager__top">
                    <h2>Quản lý chuyến đi</h2>
                    <div className="trip-manager__actions">
                        <input className="trip-manager__search" placeholder="Tìm kiếm chuyến đi" value={query} onChange={(e) => setQuery(e.target.value)} />
                    </div>
                    <button className="btn btn--primary">+ Thêm</button>
                </div>
                <table className="trip-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Tên chuyến đi</th>
                            <th>Tài xế thực hiện</th>
                            <th>Xe thực hiện</th>
                            <th>Thời gian bắt đầu</th>
                            <th>Thời gian kết thúc</th>
                            <th>Trạng thái</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={8}>Đang tải...</td></tr>
                        )}
                        {error && !loading && (
                            <tr><td colSpan={8} style={{ color: 'red' }}>{error}</td></tr>
                        )}
                        {!loading && !error && filteredTrips.length === 0 && (
                            <tr><td colSpan={8}>Không có dữ liệu</td></tr>
                        )}
                        {!loading && !error && filteredTrips.map((t) => {
                            const driverName = t.assignment?.driver
                                ? `${t.assignment.driver.firstName || ''} ${t.assignment.driver.lastName || ''}`.trim() || '-'
                                : '-';
                            const vehiclePlate = t.assignment?.vehicle?.plateNumber || '-';

                            return (
                                <tr key={t.tripId}>
                                    <td>{t.code || t.tripId}</td>
                                    <td>{t.routeName}</td>
                                    <td>{driverName}</td>
                                    <td>{vehiclePlate}</td>
                                    <td>{t.startTime ? new Date(t.startTime).toLocaleString('vi-VN') : '-'}</td>
                                    <td>{t.endTime ? new Date(t.endTime).toLocaleString('vi-VN') : '-'}</td>
                                    <td>{t.isActive === 1 ? 'Đang diễn ra' : 'Đã kết thúc'}</td>
                                    <td>
                                        <FaEye
                                            style={{ cursor: 'pointer', fontSize: '18px' }}
                                            onClick={() => setSelectedTripId(t.tripId)}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {selectedTripId && (
                <TripMapModal
                    tripId={selectedTripId}
                    onClose={() => setSelectedTripId(null)}
                />
            )}
        </>
    );
}

export default TripManager;