import React from 'react';
import RouteMap from './RouteMap';
import { useRoute } from '../hooks/useRoute';
import '../styles/RouteMapModal.scss';

type Props = {
    routeId: string;
    onClose: () => void;
};

const RouteMapModal: React.FC<Props> = ({ routeId, onClose }) => {
    const { route, loading, error } = useRoute(routeId);

    if (loading) {
        return (
            <div className="route-map-modal">
                <div className="route-map-modal__content">
                    <button className="route-map-modal__close" onClick={onClose}>Đóng</button>
                    <div className="route-map-modal__notfound">Đang tải...</div>
                </div>
            </div>
        );
    }

    if (error || !route) {
        return (
            <div className="route-map-modal">
                <div className="route-map-modal__content">
                    <button className="route-map-modal__close" onClick={onClose}>Đóng</button>
                    <div className="route-map-modal__notfound">
                        {error || 'Không tìm thấy tuyến đường'}
                    </div>
                </div>
            </div>
        );
    }

    if (route.stops.length === 0) {
        return (
            <div className="route-map-modal">
                <div className="route-map-modal__content">
                    <button className="route-map-modal__close" onClick={onClose}>Đóng</button>
                    <div className="route-map-modal__nodata">Không có dữ liệu điểm dừng</div>
                </div>
            </div>
        );
    }

    return (
        <div className="route-map-modal">
            <div className="route-map-modal__content">
                <div>
                    <button className="route-map-modal__close" onClick={onClose}>Đóng</button>
                    <h3 className="route-map-modal__title">
                        Tuyến đường: {route.routeName || `ID: ${routeId}`}
                        {route.code && ` (${route.code})`}
                    </h3>
                    <div className="route-map-modal__info">
                        <div className="route-map-modal__row">
                            <p className="route-map-modal__distance">Quãng đường: {route.distanceKm} km</p>
                            {route.standardDurationMin > 0 && (
                                <p className="route-map-modal__duration">Thời gian dự kiến: {route.standardDurationMin} phút</p>
                            )}
                        </div>
                    </div>
                    <RouteMap 
                        routeId={routeId} 
                        className="route-map-modal__map"
                        style={{ width: '100%', height: 400 }}
                    />
                </div>
            </div>
        </div>
    );
};

export default RouteMapModal;
