import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import '../styles/VehicleMap.scss';
import { useVehicleLocation } from '../hooks/useVehicleLocation';
import { useRoute, type Stop } from '../hooks/useRoute';

// Fix default marker icon issue with Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type VehicleMapProps = {
    vehicleId: string;
    routeId?: never;
};

type RouteMapProps = {
    vehicleId?: never;
    routeId: string;
};

type Props = VehicleMapProps | RouteMapProps;

type RoutingProps = {
    waypoints: L.LatLng[];
};

const Routing: React.FC<RoutingProps> = ({ waypoints }) => {
    const map = useMap();
    const routingControlRef = useRef<L.Routing.Control | null>(null);

    useEffect(() => {
        if (!map || waypoints.length < 2) return;

        // Xóa routing control cũ nếu có
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
            routingControlRef.current = null;
        }

        // Tạo routing control mới
        routingControlRef.current = L.Routing.control({
            waypoints: waypoints,
            routeWhileDragging: false,
            showAlternatives: false,
            lineOptions: {
                styles: [
                    {
                        color: '#3388ff',
                        weight: 4,
                        opacity: 0.7
                    }
                ],
                extendToWaypoints: true,
                missingRouteTolerance: 0
            },
            // Ẩn control panel (có thể bật lại nếu muốn)
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

const VehicleMap: React.FC<Props> = ({ vehicleId, routeId }) => {
    const vehicleData = useVehicleLocation(vehicleId || '');
    const routeData = useRoute(routeId || null);
    const vehicleMarkerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (vehicleId && vehicleMarkerRef.current && vehicleData?.location) {
            vehicleMarkerRef.current.openPopup();
        }
    }, [vehicleId, vehicleData?.location]);

    // Handle vehicle mode
    if (vehicleId) {
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

                <Marker
                    position={location.position}
                    ref={vehicleMarkerRef}
                >
                    <Popup>
                        <div>
                            <div>Xe: {vehicleId}</div>
                            {location.vehicleLogId && <div>Log ID: {location.vehicleLogId}</div>}
                            {location.timeVehicleLog && (
                                <div>Thời điểm: {new Date(location.timeVehicleLog).toLocaleString('vi-VN')}</div>
                            )}
                            <div>Tọa độ: {location.position[0]}, {location.position[1]}</div>
                        </div>
                    </Popup>
                </Marker>

                {/* Polyline positions for vehicle mode */}
                {positions && positions.length > 0 && (
                    <Routing waypoints={positions.map(pos => L.latLng(pos[0], pos[1]))} />
                )}
            </MapContainer>
        );
    }

    // Handle route mode
    if (routeId) {
        const { route, loading, error } = routeData;

        if (loading) {
            return (
                <div className="vehicle-map-loading">
                    <div>Đang tải thông tin tuyến đường...</div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="vehicle-map-loading">
                    <div className="vehicle-map-error">{error}</div>
                </div>
            );
        }

        if (!route || route.stops.length === 0) {
            return (
                <div className="vehicle-map-empty">
                    <div>Không có dữ liệu điểm dừng</div>
                </div>
            );
        }

        const stops = route.stops.sort((a: Stop, b: Stop) => a.order - b.order);
        const avgLat = stops.reduce((sum: number, s: Stop) => sum + s.lat, 0) / stops.length;
        const avgLng = stops.reduce((sum: number, s: Stop) => sum + s.lng, 0) / stops.length;
        const center: [number, number] = [avgLat, avgLng];

        const waypoints: L.LatLng[] = stops.map((s: Stop) =>
            L.latLng(s.lat, s.lng)
        );

        const zoom = stops.length === 1 ? 15 : stops.length <= 3 ? 12 : 10;

        return (
            <MapContainer
                center={center}
                zoom={zoom}
                className="vehicle-map"
                style={{ width: '100%', height: 480 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Routing waypoints={waypoints} />
                {stops.map((stop: Stop, index: number) => (
                    <Marker key={stop.stopId} position={[stop.lat, stop.lng]}>
                        <Popup>
                            <div className="vehicle-map-popup">
                                <div className="popup-title">
                                    {index + 1}. {stop.nameStop}
                                </div>
                                <div className="popup-info">
                                    <strong>Loại:</strong> {stop.type}
                                </div>
                                <div className="popup-info">
                                    <strong>Thứ tự:</strong> {stop.order}
                                </div>
                                {stop.exact_address && (
                                    <div className="popup-info">
                                        <strong>Địa chỉ:</strong> {stop.exact_address}
                                    </div>
                                )}
                                <div className="popup-info">
                                    <strong>Tọa độ:</strong> {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        );
    }

    return null;
};

export default VehicleMap;

