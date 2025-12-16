import React, { useState, useMemo } from 'react';
import { FaEye, FaPlus } from 'react-icons/fa';
import RouteMapModal from '../components/RouteMapModal';
import { useRoutes } from '../hooks/useRoutes';
import CreateStopForm from '../components/CreateStopForm';
import CreateRouteForm from '../components/CreateRouteForm';
import '../styles/RouteManager.scss';

const RouteManager: React.FC = () => {
    const { routes, loading, error } = useRoutes();
    const [openCreateStopForm, setOpenCreateStopForm] = useState(false);
    const [isCreatingRoute, setIsCreatingRoute] = useState(false);
    const [query, setQuery] = useState<string>('');
    const [routeIdForCreateStop, setRouteIdForCreateStop] = useState<string | null>(null);
    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

    const filteredRoutes = useMemo(() => {
        const q = query.toLowerCase();
        return routes.filter((r) =>
            r.routeName.toLowerCase().includes(q)
        );
    }, [routes, query]);

    const handleCloseCreateStopForm = () => {
        setOpenCreateStopForm(false);
        setRouteIdForCreateStop(null);
    };

    return (
        <div className="route-manager">
            <div className="route-manager__top">
                <h2>Quản lý chuyến đi</h2>
                <div className="route-manager-actions">
                    <input 
                        type="text" 
                        className="route-manager__search" 
                        placeholder="Tìm kiếm" 
                        value={query} 
                        onChange={(e) => setQuery(e.target.value)} 
                    />
                    <button
                        className="btn btn--primary"
                        type="button"
                        onClick={() => setIsCreatingRoute(true)}
                    >
                        + Thêm
                    </button>
                </div>
            </div>

            <div className="table-wrapper">
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
                        {!loading && !error && filteredRoutes.length === 0 && (
                            <tr><td colSpan={4}>Không có dữ liệu</td></tr>
                        )}
                        {!loading && !error && filteredRoutes.map((route) => (
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
                                            setOpenCreateStopForm(true);
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
            {openCreateStopForm && routeIdForCreateStop && (
                <CreateStopForm
                    routeId={routeIdForCreateStop}
                    onClose={handleCloseCreateStopForm}
                />
            )}
            {isCreatingRoute && (
                <CreateRouteForm
                    onCancel={() => setIsCreatingRoute(false)}
                    onSuccess={() => setIsCreatingRoute(false)}
                />
            )}
        </div>
    );
};

export default RouteManager;