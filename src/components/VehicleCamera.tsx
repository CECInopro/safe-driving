import React from 'react';
import CameraViewer from './CameraViewer';

type Props = {
    vehicleId: string;
};

const VehicleCamera: React.FC<Props> = ({ vehicleId }) => {
    const cameraWsUrl = `ws://ALB3-1825307273.ap-southeast-1.elb.amazonaws.com/api/v1/ws?vehicleId=${encodeURIComponent(vehicleId)}`;

    return (
        <div style={{ width: 420, minWidth: 320 }}>
            <h4>Camera</h4>
            <CameraViewer wsUrl={cameraWsUrl} autoStart={false} />
        </div>
    );
};

export default VehicleCamera;

