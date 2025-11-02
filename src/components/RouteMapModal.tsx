import React from 'react';
import VehicleMap from './VehicleMap';
import { useRoute } from '../hooks/useRoute';

type Props = {
    routeId: string;
    onClose: () => void;
};

const RouteMapModal: React.FC<Props> = ({ routeId, onClose }) => {
    const { route } = useRoute(routeId);

    return (
        <div className="car-map-modal">
            <div className="car-map-modal__content">
                <div style={{ flex: 1 }}>
                    <button className="car-map-modal__close" onClick={onClose}>Đóng</button>
                    <h3>
                        Tuyến đường: {route?.routeName || `ID: ${routeId}`}
                        {route?.code && ` (${route.code})`}
                    </h3>
                    {route && route.distanceKm > 0 && (
                        <p style={{ margin: '8px 0', fontSize: 14, color: '#666' }}>
                            Quãng đường: {route.distanceKm} km
                            {route.standardDurationMin > 0 && ` • Thời gian: ${route.standardDurationMin} phút`}
                        </p>
                    )}
                    {route?.note && (
                        <p style={{ margin: '8px 0', fontSize: 14, color: '#666' }}>{route.note}</p>
                    )}
                    <VehicleMap routeId={routeId} />
                </div>
            </div>
        </div>
    );
};

export default RouteMapModal;
