import React from 'react';
import VehicleLocationMap from './VehicleLocationMap';
import RouteMap from './RouteMap';

type WrapperProps = {
    vehicleId?: string;
    routeId?: string;
};

// Wrapper giữ lại API cũ (truyền vehicleId hoặc routeId)
const VehicleMap: React.FC<WrapperProps> = ({ vehicleId, routeId }) => {
    if (vehicleId) {
        return <VehicleLocationMap vehicleId={vehicleId} />;
    }

    if (routeId) {
        return <RouteMap routeId={routeId} />;
    }

    return null;
};

export default VehicleMap;

