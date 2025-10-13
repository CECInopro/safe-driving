import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type Car = {
    id: number;
    plate: string;
    driver: string;
    lat: number;
    lng: number;
};

type Props = {
    vehicleId: string; // UUID theo tài liệu API
    onClose: () => void;
};

const CarTrackingMap: React.FC<Props> = ({ vehicleId, onClose }) => {
    const [positions, setPositions] = useState<[number, number][]>([]);
    const [vehicleLogId, setVehicleLogId] = useState<string | null>(null);
    const [timeVehicleLog, setTimeVehicleLog] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://26.186.182.141:8080/api/v1/vehicles/location/${vehicleId}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'xRequestId': crypto.randomUUID(),
                    },
                });
                if (!res.ok) {
                    console.error('Lỗi lấy vị trí xe', res.status);
                    return;
                }
                const data = await res.json();

                const lat = Number(data.lat);
                const lng = Number(data.lng);
                const newPos: [number, number] = [lat, lng];
                setVehicleLogId((data.vehicleLogId ?? data.vehicle_log_id ?? null) as string | null);
                setTimeVehicleLog((data.timeVehicleLog ?? data.time_vehicle_log ?? null) as string | null);
                if (!Number.isFinite(newPos[0]) || !Number.isFinite(newPos[1])) return;

                if (!isMounted) return;
                setPositions(prev => {
                    const last = prev[prev.length - 1];
                    if (!last || last[0] !== newPos[0] || last[1] !== newPos[1]) {
                        return [...prev, newPos];
                    }
                    return prev;
                });
            } catch (err) {
                console.error('Lỗi lấy vị trí xe', err);
            }
        }, 3000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [vehicleId]);

    const latestPos = positions[positions.length - 1];

    return (
        <div className="car-map-modal">
            <div className="car-map-modal__content">
                <button className="car-map-modal__close" onClick={onClose}>Đóng</button>
                <h3>Theo dõi xe ID: {vehicleId}</h3>

                {latestPos && (
                    <MapContainer
                        center={latestPos}
                        zoom={15}
                        style={{ width: '100%', height: 400, marginTop: 12 }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={latestPos}>
                            <Popup>
                                <div>
                                    <div>Xe ID: {vehicleId}</div>
                                    {vehicleLogId && <div>Log ID: {vehicleLogId}</div>}
                                    {timeVehicleLog && <div>Thời điểm: {new Date(timeVehicleLog).toLocaleString('vi-VN')}</div>}
                                    <div>Tọa độ: {latestPos ? `${latestPos[0]}, ${latestPos[1]}` : '-'}</div>
                                </div>
                            </Popup>
                        </Marker>


                        <Polyline positions={positions} />
                    </MapContainer>
                )}
            </div>
        </div>
    );
};

export default CarTrackingMap;
