import React from 'react';
import VehicleMap from './VehicleMap';
import VehicleCamera from './VehicleCamera';

type Props = {
    plateNumber: string;
    vehicleId: string;
    deviceId: string;
    onClose: () => void;
};

const VehicleMapModal: React.FC<Props> = ({ vehicleId, deviceId, plateNumber, onClose }) => {
    return (
        <div className="car-map-modal">
            <div className="car-map-modal__content">
                <div className="car-map-modal__header">
                    <h3 className="car-map-modal__title">Theo dõi xe: {plateNumber}</h3>
                    <button className="car-map-modal__close" onClick={onClose}>Đóng</button>
                </div>
                <div className="car-map-modal__body">
                    <div className="car-map-modal__map-section">
                        <div className="car-map-modal__map-header">
                            <div className="car-map-modal__map-label">Bản đồ</div>
                        </div>
                        <div className="car-map-modal__map-container">
                            <VehicleMap vehicleId={vehicleId} />
                        </div>
                    </div>
                    <div className="car-map-modal__camera-section">
                        <VehicleCamera vehicleId={deviceId} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleMapModal;

