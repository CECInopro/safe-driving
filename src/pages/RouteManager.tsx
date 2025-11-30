import React, { useState } from 'react';
import { FaEye, FaPlus } from 'react-icons/fa';
import RouteMapModal from '../components/RouteMapModal';
import { useRoutes } from '../hooks/useRoutes';
import CreateStopForm from '../components/CreateStopForm';
import '../styles/RouteManager.scss';

const RouteManager: React.FC = () => {
    const { routes, loading, error } = useRoutes();
    const [openCreateForm, setOpenCreateForm] = useState(false);
    const [routeIdForCreateStop, setRouteIdForCreateStop] = useState<string | null>(null);
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

    return (
        <>
            <div className="route-manager">
                <h2>Quản lý chuyến đi</h2>
                <table className="route-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Tên chuyến đi</th>
                            <th>Quãng đường</th>
                            <th>Stop</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={4}>Đang tải...</td></tr>
                        )}
                        {error && !loading && (
                            <tr><td colSpan={4} style={{ color: 'red' }}>{error}</td></tr>
                        )}
                        {!loading && !error && routes.length === 0 && (
                            <tr><td colSpan={4}>Không có dữ liệu</td></tr>
                        )}
                        {!loading && !error && routes.map((route) => (
                            <tr key={route.routeId}>
                                <td>{route.code || route.routeId}</td>
                                <td>{route.routeName}</td>
                                <td>{route.distanceKm > 0 ? `${route.distanceKm} km` : '-'}</td>
                                <td>
                                    <FaEye
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setSelectedRouteId(route.routeId)}
                                    />
                                    <FaPlus
                                        style={{ cursor: 'pointer', marginLeft: 16 }}
                                        onClick={() => {
                                            setRouteIdForCreateStop(route.routeId);
                                            setOpenCreateForm(true);
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedRouteId && (
                <RouteMapModal
                    routeId={selectedRouteId}
                    onClose={() => setSelectedRouteId(null)}
                />
            )}
            {openCreateForm && routeIdForCreateStop && (
                <CreateStopForm
                    routeId={routeIdForCreateStop}
                    onClose={() => setOpenCreateForm(false)}
                />
            )}
        </>
    );
};

export default RouteManager;