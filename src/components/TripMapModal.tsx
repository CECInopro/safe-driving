import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import useTrip from '../hooks/useTrip';
import type { TripWithAssignment, Stop } from '../hooks/useTrip';
import '../styles/TripMapModal.scss';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type Props = {
    tripId: string;
    onClose: () => void;
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

const TripMapModal: React.FC<Props> = ({ tripId, onClose }) => {
    const { tripsWithAssignment } = useTrip();
    const trip = tripsWithAssignment.find((t: TripWithAssignment) => t.tripId === tripId);

    if (!trip) {
        return (
            <div className="trip-map-modal">
                <div className="trip-map-modal__content">
                    <button className="trip-map-modal__close" onClick={onClose}>Đóng</button>
                    <div className="trip-map-modal__notfound">Không tìm thấy chuyến đi</div>
                </div>
            </div>
        );
    }

    const stops: Stop[] = trip.stop.sort((a: Stop, b: Stop) => a.order - b.order);
    const currentOrder = trip.currentOrder;
    const totalStop = trip.totalStop;

    if (stops.length === 0) {
        return (
            <div className="trip-map-modal">
                <div className="trip-map-modal__content">
                    <button className="trip-map-modal__close" onClick={onClose}>Đóng</button>
                    <div className="trip-map-modal__nodata">Không có dữ liệu điểm dừng</div>
                </div>
            </div>
        );
    }

    const avgLat = stops.reduce((sum, s) => sum + s.lat, 0) / stops.length;
    const avgLng = stops.reduce((sum, s) => sum + s.lng, 0) / stops.length;
    const center: [number, number] = [avgLat, avgLng];
    const zoom = stops.length === 1 ? 15 : stops.length <= 3 ? 12 : 10;

    // Tạo các segments với màu sắc dựa trên currentOrder
    const segments: { waypoints: L.LatLng[]; color: string }[] = [];

    for (let i = 0; i < stops.length - 1; i++) {
        const segmentWaypoints = [
            L.latLng(stops[i].lat, stops[i].lng),
            L.latLng(stops[i + 1].lat, stops[i + 1].lng)
        ];
        let color = '#3388ff';

        if (currentOrder === 0) {
            color = '#3388ff';
        } else if (currentOrder >= totalStop) {
            color = '#ff0000';
        } else {
            if (stops[i + 1].order <= currentOrder) {
                color = '#ff0000';
            } else {
                color = '#3388ff';
            }
        }

        segments.push({ waypoints: segmentWaypoints, color });
    }

    const driverName = trip.assignment?.driver
        ? `${trip.assignment.driver.firstName || ''} ${trip.assignment.driver.lastName || ''}`.trim() || 'Chưa có'
        : 'Chưa có';
    const vehiclePlate = trip.assignment?.vehicle?.plateNumber || 'Chưa có';

    return (
        <div className="trip-map-modal">
            <div className="trip-map-modal__content">
                <div>
                    <button className="trip-map-modal__close" onClick={onClose}>Đóng</button>
                    <h3 className="trip-map-modal__title">
                        Chuyến đi: {trip.routeName || `ID: ${tripId}`}
                        {trip.code && ` (${trip.code})`}
                    </h3>
                    <div className="trip-map-modal__info">
                        <div className="trip-map-modal__row">
                            <p className="trip-map-modal__distance">Quãng đường: {trip.distanceKm} km</p>
                            {trip.standardDurationMin > 0 && (
                                <p className="trip-map-modal__duration">Thời gian dự kiến: {trip.standardDurationMin} phút</p>
                            )}
                            <p className="trip-map-modal__driver">Tài xế: {driverName}</p>
                            <p className="trip-map-modal__vehicle">Xe: {vehiclePlate}</p>
                            <p className="trip-map-modal__status">Trạng thái: {currentOrder === 0 ? 'Chưa bắt đầu' : currentOrder >= totalStop ? 'Đã kết thúc' : `Đang diễn ra (đã đi qua ${currentOrder}/${totalStop} điểm dừng)`}</p>
                        </div>
                    </div>
                    <div className="trip-map-modal__legend">
                        <span className="trip-map-modal__legend-visited">● Đã đi qua</span>
                        <span className="trip-map-modal__legend-unvisited">● Chưa đi qua</span>
                    </div>
                    <MapContainer
                        center={center}
                        zoom={zoom}
                        className="trip-map-modal__map"
                        style={{ width: '100%', height: 400 }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Render các segments với màu sắc tương ứng */}
                        {segments.map((segment, index) => (
                            <RoutingSegment
                                key={index}
                                waypoints={segment.waypoints}
                                color={segment.color}
                            />
                        ))}

                        {/* Render markers cho các stops */}
                        {stops.map((stop: Stop, index: number) => {
                            const isVisited = currentOrder > 0 && stop.order <= currentOrder;
                            const isCurrent = currentOrder > 0 && stop.order === currentOrder;

                            return (
                                <Marker key={stop.stopId} position={[stop.lat, stop.lng]}>
                                    <Popup>
                                        <div className="trip-map-modal__popup">
                                            <div className="trip-map-modal__popup-title">
                                                {index + 1}. {stop.nameStop}
                                                {isCurrent && <span className="trip-map-modal__popup-current">(Đang tại đây)</span>}
                                                {isVisited && !isCurrent && <span className="trip-map-modal__popup-visited">(Đã đi qua)</span>}
                                            </div>
                                            <div className="trip-map-modal__popup-info">
                                                <strong>Loại:</strong> {stop.type}
                                            </div>
                                            <div className="trip-map-modal__popup-info">
                                                <strong>Thứ tự:</strong> {stop.order}
                                            </div>
                                            {stop.exactAddress && (
                                                <div className="trip-map-modal__popup-info">
                                                    <strong>Địa chỉ:</strong> {stop.exactAddress}
                                                </div>
                                            )}
                                            <div className="trip-map-modal__popup-info">
                                                <strong>Tọa độ:</strong> {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                                            </div>
                                            {stop.arrive && (
                                                <div className="trip-map-modal__popup-info">
                                                    <strong>Thời gian đến:</strong> {new Date(stop.arrive).toLocaleString('vi-VN')}
                                                </div>
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default TripMapModal;


