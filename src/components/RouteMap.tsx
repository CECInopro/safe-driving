import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import '../styles/VehicleMap.scss';
import { useRoute, type Stop } from '../hooks/useRoute';

// Fix default marker icon issue with Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type RouteMapProps = {
    routeId: string;
};

type RoutingProps = {
    waypoints: L.LatLng[];
};

const Routing: React.FC<RoutingProps> = ({ waypoints }) => {
    const map = useMap();
    const routingControlRef = React.useRef<L.Routing.Control | null>(null);

    React.useEffect(() => {
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

const RouteMap: React.FC<RouteMapProps> = ({ routeId }) => {
    const { route, loading, error } = useRoute(routeId);

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

    const waypoints: L.LatLng[] = stops.map((s: Stop) => L.latLng(s.lat, s.lng));

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
};

export default RouteMap;


