import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import CameraViewer from './CameraViewer';
const BASE_URL = import.meta.env.VITE_BASE_URL as string;
type Props = {
    vehicleId: string;
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
                const res = await fetch(`${BASE_URL}/api/v1/vehicles/location/${vehicleId}`, {
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
                const body = await res.json();
                const payload = body?.data ?? body;

                const lat = Number(payload?.lat);
                const lng = Number(payload?.lng);
                const newPos: [number, number] = [lat, lng];
                setVehicleLogId((payload?.vehicleLogId ?? payload?.vehicle_log_id ?? null) as string | null);
                setTimeVehicleLog((payload?.timeVehicleLog ?? payload?.time_vehicle_log ?? null) as string | null);
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

    const cameraWsUrl = `ws://ALB-save-driving-1470058884.ap-southeast-1.elb.amazonaws.com/api/v1/ws?vehicleId=${encodeURIComponent(vehicleId)}`;

    return (
        <div className="car-map-modal">
            <div className="car-map-modal__content" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <button className="car-map-modal__close" onClick={onClose}>Đóng</button>
                    <h3>Theo dõi xe ID: {vehicleId}</h3>

                    {latestPos && (
                        <MapContainer
                            center={latestPos}
                            zoom={15}
                            style={{ width: '100%', height: 480, marginTop: 12 }}
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

                <div style={{ width: 420, minWidth: 320 }}>
                    <h4>Camera</h4>
                    <CameraViewer wsUrl={cameraWsUrl} autoStart={false} />
                </div>
            </div>
        </div>
    );
};

export default CarTrackingMap;
