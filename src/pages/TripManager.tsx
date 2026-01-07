import React, { useMemo, useState } from "react";
import { FaEye, FaUserPlus } from 'react-icons/fa';
import '../styles/TripManager.scss';
import useTrip from "../hooks/useTrip";
import TripMapModal from "../components/TripMapModal";
import CreateTripForm from "../components/CreateTripForm";
import AssignDriverForm from "../components/AssignDriverForm";
// import CreateScheduledTripsForm from "../components/CreateScheduledTripsForm";

const TripManager: React.FC = () => {
    const [query, setQuery] = useState<string>('');
    const { tripsWithAssignment, loading, error, refetch } = useTrip();
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
    const [selectedTripForAssignment, setSelectedTripForAssignment] = useState<{
        tripId: string;
        tripCode?: string;
        routeName?: string;
    } | null>(null);

    const filteredTrips = useMemo(() => {
        const q = query.toLowerCase();
        return tripsWithAssignment.filter((t) =>
            (t.code?.toLowerCase().includes(q) ?? false) ||
            (t.routeName?.toLowerCase().includes(q) ?? false)
        );
    }, [tripsWithAssignment, query]);

    const getTripStatus = (trip: any) => {
        const currentOrder = trip.currentOrder || 0;
        const totalStop = trip.totalStop || 0;

        if (currentOrder === 0) return 'Chưa bắt đầu';
        if (currentOrder >= totalStop) return 'Đã kết thúc';
        return `Đang diễn ra`;
    };

    return (
        <>
            <div className='trip-manager'>
                <div className="trip-manager__top">
                    <h2>Quản lý chuyến đi</h2>
                    <div className="trip-manager__actions">
                        <input
                            className="trip-manager__search"
                            placeholder="Tìm kiếm chuyến đi"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn--primary" onClick={() => setShowCreateForm(true)}>+ Thêm</button>
                        {/* <button className="btn btn--secondary" onClick={() => setShowScheduledForm(true)}>📅 Tạo theo lịch</button> */}
                    </div>
                </div>
                <div className="trip-table-wrapper">
                    <table className="trip-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Tên chuyến đi</th>
                                <th>Tài xế thực hiện</th>
                                <th>Xe thực hiện</th>
                                <th>Dự kiến bắt đầu</th>
                                <th>Dự kiến kết thúc</th>
                                <th>Thực tế bắt đầu</th>
                                <th>Thực tế kết thúc</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr><td colSpan={10}>Đang tải...</td></tr>
                            )}
                            {error && !loading && (
                                <tr><td colSpan={10} style={{ color: 'red' }}>{error}</td></tr>
                            )}
                            {!loading && !error && filteredTrips.length === 0 && (
                                <tr><td colSpan={10}>Không có dữ liệu</td></tr>
                            )}
                            {!loading && !error && filteredTrips.map((t) => {
                                const driverName = t.assignment?.driver
                                    ? `${t.assignment.driver.firstName || ''} ${t.assignment.driver.lastName || ''}`.trim() || '-'
                                    : '-';
                                const vehiclePlate = t.assignment?.vehicle?.plateNumber || '-';

                                const status = getTripStatus(t);
                                const statusClass = status.startsWith('Chưa bắt đầu') ? 'status-pending'
                                    : status.startsWith('Đang diễn ra') ? 'status-active'
                                        : 'status-completed';

                                return (
                                    <tr key={t.tripId}>
                                        <td>{t.code || t.tripId}</td>
                                        <td>{t.routeName}</td>
                                        <td>{driverName}</td>
                                        <td>{vehiclePlate}</td>
                                        <td>{t.plannedStartTime ? new Date(t.plannedStartTime).toLocaleString('vi-VN') : '-'}</td>
                                        <td>{t.plannedEndTime ? new Date(t.plannedEndTime).toLocaleString('vi-VN') : '-'}</td>
                                        <td>{t.startTime ? new Date(t.startTime).toLocaleString('vi-VN') : '-'}</td>
                                        <td>{t.endTime ? new Date(t.endTime).toLocaleString('vi-VN') : '-'}</td>
                                        <td>
                                            <span className={`trip-status ${statusClass}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <FaEye
                                                    style={{ cursor: 'pointer', fontSize: '18px' }}
                                                    onClick={() => setSelectedTripId(t.tripId)}
                                                    title="Xem chi tiết"
                                                />
                                                {!t.assignment && (
                                                    <FaUserPlus
                                                        style={{ cursor: 'pointer', fontSize: '18px', color: '#1976d2' }}
                                                        onClick={() => setSelectedTripForAssignment({
                                                            tripId: t.tripId,
                                                            tripCode: t.code,
                                                            routeName: t.routeName,
                                                        })}
                                                        title="Gán tài xế"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedTripId && (
                <TripMapModal
                    tripId={selectedTripId}
                    onClose={() => setSelectedTripId(null)}
                />
            )}

            {showCreateForm && (
                <CreateTripForm
                    onClose={() => setShowCreateForm(false)}
                    onSuccess={() => {
                        setShowCreateForm(false);
                        refetch();
                    }}
                    onCancel={() => setShowCreateForm(false)}
                />
            )}

            {selectedTripForAssignment && (
                <AssignDriverForm
                    tripId={selectedTripForAssignment.tripId}
                    tripCode={selectedTripForAssignment.tripCode}
                    routeName={selectedTripForAssignment.routeName}
                    onClose={() => setSelectedTripForAssignment(null)}
                    onSuccess={() => setSelectedTripForAssignment(null)}
                    onCancel={() => setSelectedTripForAssignment(null)}
                />
            )}

            {/* {showScheduledForm && (
                <CreateScheduledTripsForm
                    onClose={() => setShowScheduledForm(false)}
                    onSuccess={() => {
                        setShowScheduledForm(false);
                        refetch();
                    }}
                    onCancel={() => setShowScheduledForm(false)}
                />
            )} */}
        </>
    );
}

export default TripManager;