import React from 'react';
import CameraViewer from './CameraViewer';

type Props = {
    vehicleId: string;
};

const VehicleCamera: React.FC<Props> = ({ vehicleId }) => {
    const cameraWsUrl = `ws://ALB-2931116.ap-southeast-1.elb.amazonaws.com/api/v1/ws?vehicleId=${encodeURIComponent(vehicleId)}`;

    return (
        <div className="vehicle-camera">
            <CameraViewer wsUrl={cameraWsUrl} autoStart={false} />
        </div>
    );
};

export default VehicleCamera;

