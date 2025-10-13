import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { VehicleLocation } from '../types/vehicle';
import { vehicleService } from '../services/vehicleService';

type Props = {
    vehicleId: string; 
    onClose: () => void;
};

const CarTrackingMap: React.FC<Props> = ({ vehicleId, onClose }) => {
    const [positions, setPositions] = useState<[number, number][]>([]);
    const [currentLocation, setCurrentLocation] = useState<VehicleLocation | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const interval = setInterval(async () => {
            try {
                const location = await vehicleService.fetchVehicleLocation(vehicleId);
                
                if (!isMounted) return;
                
                if (location) {
                    setCurrentLocation(location);
                    setError(null);
                    
                    const newPos: [number, number] = [location.lat, location.lng];
                    
                    // Only add new position if it's different from the last one
                    setPositions(prev => {
                        const last = prev[prev.length - 1];
                        if (!last || last[0] !== newPos[0] || last[1] !== newPos[1]) {
                            return [...prev, newPos];
                        }
                        return prev;
                    });
                } else {
                    setError('Không thể lấy vị trí xe');
                }
            } catch (err) {
                if (!isMounted) return;
                console.error('Lỗi lấy vị trí xe', err);
                setError('Lỗi kết nối đến server');
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

                {error && (
                    <div style={{ color: 'red', marginBottom: '12px', padding: '8px', background: '#ffe6e6', borderRadius: '4px' }}>
                        {error}
                    </div>
                )}

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
                                    <div><strong>Xe ID:</strong> {vehicleId}</div>
                                    {currentLocation?.vehicleLogId && (
                                        <div><strong>Log ID:</strong> {currentLocation.vehicleLogId}</div>
                                    )}
                                    {currentLocation?.timestamp && (
                                        <div><strong>Thời điểm:</strong> {new Date(currentLocation.timestamp).toLocaleString('vi-VN')}</div>
                                    )}
                                    <div><strong>Tọa độ:</strong> {latestPos[0].toFixed(6)}, {latestPos[1].toFixed(6)}</div>
                                    {currentLocation?.speed && (
                                        <div><strong>Tốc độ:</strong> {currentLocation.speed} km/h</div>
                                    )}
                                    {currentLocation?.direction && (
                                        <div><strong>Hướng:</strong> {currentLocation.direction}°</div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>

                        {positions.length > 1 && (
                            <Polyline 
                                positions={positions} 
                                color="#0099ff"
                                weight={3}
                                opacity={0.7}
                            />
                        )}
                    </MapContainer>
                )}

                {!latestPos && !error && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        Đang tải vị trí xe...
                    </div>
                )}
            </div>
        </div>
    );
};

export default CarTrackingMap;
