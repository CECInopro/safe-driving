import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import '../styles/VehicleMap.scss';
import { useVehicleLocation } from '../hooks/useVehicleLocation';

// Fix default marker icon issue with Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type VehicleMapProps = {
    vehicleId: string;
};

type RoutingProps = {
    waypoints: L.LatLng[];
};

const Routing: React.FC<RoutingProps> = ({ waypoints }) => {
    const map = useMap();
    const routingControlRef = useRef<L.Routing.Control | null>(null);

    useEffect(() => {
        if (!map || waypoints.length < 2) return;
        
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
            routingControlRef.current = null;
        }

        routingControlRef.current = L.Routing.control({
            waypoints,
            routeWhileDragging: false,
            showAlternatives: false,
            lineOptions: {
                styles: [
                    {
                        color: '#3388ff',
                        weight: 4,
                        opacity: 0.7,
                    },
                ],
                extendToWaypoints: true,
                missingRouteTolerance: 0,
            },
            addWaypoints: false,
            fitSelectedRoutes: true,
            show: true,
            collapsible: true,
        }).addTo(map);

        return () => {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
                routingControlRef.current = null;
            }
        };
    }, [map, waypoints]);

    return null;
};

const VehicleLocationMap: React.FC<VehicleMapProps> = ({ vehicleId }) => {
    const vehicleData = useVehicleLocation(vehicleId);
    const vehicleMarkerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (vehicleMarkerRef.current && vehicleData?.location) {
            vehicleMarkerRef.current.openPopup();
        }
    }, [vehicleData?.location]);

    const { positions, location, error } = vehicleData;

    if (!location) {
        return (
            <div className="vehicle-map-loading">
                {error ? (
                    <div className="vehicle-map-error">{error}</div>
                ) : (
                    <div>Đang tải vị trí...</div>
                )}
            </div>
        );
    }

    return (
        <MapContainer
            center={location.position}
            zoom={15}
            className="vehicle-map"
            style={{ width: '100%', height: 480 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={location.position} ref={vehicleMarkerRef}>
                <Popup>
                    <div>
                        <div>Xe: {vehicleId}</div>
                        {location.vehicleLogId && <div>Log ID: {location.vehicleLogId}</div>}
                        {location.timeVehicleLog && (
                            <div>Thời điểm: {new Date(location.timeVehicleLog).toLocaleString('vi-VN')}</div>
                        )}
                        <div>
                            Tọa độ: {location.position[0]}, {location.position[1]}
                        </div>
                    </div>
                </Popup>
            </Marker>

            {positions && positions.length > 0 && (
                <Routing waypoints={positions.map((pos) => L.latLng(pos[0], pos[1]))} />
            )}
        </MapContainer>
    );
};

export default VehicleLocationMap;


