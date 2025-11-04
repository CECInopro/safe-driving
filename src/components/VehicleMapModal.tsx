import React from 'react';
import VehicleMap from './VehicleMap';
import VehicleCamera from './VehicleCamera';

type Props = {
    vehicleId: string;
    deviceId: string;
    onClose: () => void;
};

const VehicleMapModal: React.FC<Props> = ({ vehicleId, deviceId, onClose }) => {
    return (
        <div className="car-map-modal">
            <div className="car-map-modal__content" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <button className="car-map-modal__close" onClick={onClose}>Đóng</button>
                    <h3>Theo dõi xe ID: {vehicleId}</h3>
                    <VehicleMap vehicleId={vehicleId} />
                </div>
                <VehicleCamera vehicleId={deviceId} />
            </div>
        </div>
    );
};

export default VehicleMapModal;

