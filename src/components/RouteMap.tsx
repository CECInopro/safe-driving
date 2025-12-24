import React, { useEffect, useRef } from 'react';
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
    className?: string;
    style?: React.CSSProperties;
};

type RoutingSegmentProps = {
    waypoints: L.LatLng[];
    color: string;
};

const RoutingSegment: React.FC<RoutingSegmentProps> = ({ waypoints, color }) => {
    const map = useMap();
    const routingControlRef = useRef<L.Routing.Control | null>(null);

    useEffect(() => {
        if (!map || waypoints.length < 2) return;

        // Xóa routing control cũ nếu có
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
            routingControlRef.current = null;
        }

        // Tạo routing control mới với màu tương ứng
        routingControlRef.current = L.Routing.control({
            waypoints: waypoints,
            router: L.Routing.osrmv1({
                serviceUrl: 'http://localhost:5001/route/v1',
                profile: 'driving',
            }),
            draggableWaypoints: false,
            routeWhileDragging: false,
            showAlternatives: false,
            lineOptions: {
                styles: [
                    {
                        color: color,
                        weight: 4,
                        opacity: 0.7
                    }
                ],
                extendToWaypoints: true,
                missingRouteTolerance: 0
            },
            addWaypoints: false,
            fitSelectedRoutes: true,
            show: true,
            collapsible: true,
        } as any).addTo(map);

        return () => {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
                routingControlRef.current = null;
            }
        };
    }, [map, waypoints, color]);

    return null;
};

const RouteMap: React.FC<RouteMapProps> = ({ routeId, className = 'vehicle-map', style = { width: '100%', height: 480 } }) => {
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
    const zoom = stops.length === 1 ? 15 : stops.length <= 3 ? 12 : 10;

    // Tạo các segments với màu xanh (vì route không có trạng thái visited/unvisited)
    const segments: { waypoints: L.LatLng[]; color: string }[] = [];

    for (let i = 0; i < stops.length - 1; i++) {
        const segmentWaypoints = [
            L.latLng(stops[i].lat, stops[i].lng),
            L.latLng(stops[i + 1].lat, stops[i + 1].lng)
        ];
        segments.push({ waypoints: segmentWaypoints, color: '#3388ff' });
    }

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            className={className}
            style={style}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render các segments */}
            {segments.map((segment, index) => (
                <RoutingSegment
                    key={index}
                    waypoints={segment.waypoints}
                    color={segment.color}
                />
            ))}

            {/* Render markers cho các stops */}
            {stops.map((stop: Stop, index: number) => {
                const isRouteMapModal = className.includes('route-map-modal');
                const popupClass = isRouteMapModal ? 'route-map-modal__popup' : 'vehicle-map-popup';
                const titleClass = isRouteMapModal ? 'route-map-modal__popup-title' : 'popup-title';
                const infoClass = isRouteMapModal ? 'route-map-modal__popup-info' : 'popup-info';

                return (
                    <Marker key={stop.stopId} position={[stop.lat, stop.lng]}>
                        <Popup>
                            <div className={popupClass}>
                                <div className={titleClass}>
                                    {index + 1}. {stop.nameStop}
                                </div>
                                <div className={infoClass}>
                                    <strong>Loại:</strong> {stop.type}
                                </div>
                                <div className={infoClass}>
                                    <strong>Thứ tự:</strong> {stop.order}
                                </div>
                                {stop.exact_address && (
                                    <div className={infoClass}>
                                        <strong>Địa chỉ:</strong> {stop.exact_address}
                                    </div>
                                )}
                                <div className={infoClass}>
                                    <strong>Tọa độ:</strong> {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};

export default RouteMap;


