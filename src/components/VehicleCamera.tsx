import React from 'react';
import CameraViewer from './CameraViewer';

type Props = {
    vehicleId: string;
};

const VehicleCamera: React.FC<Props> = ({ vehicleId }) => {
    const cameraWsUrl = `ws://26.157.165.184:8080/api/v1/ws?vehicleId=${encodeURIComponent(vehicleId)}`;

    return (
        <div className="vehicle-camera">
            <CameraViewer wsUrl={cameraWsUrl} autoStart={false} />
        </div>
    );
};

export default VehicleCamera;

