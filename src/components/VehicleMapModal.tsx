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
    carId: number;
    onClose: () => void;
};

const CarTrackingMap: React.FC<Props> = ({ carId, onClose }) => {
    const [positions, setPositions] = useState<[number, number][]>([]);

    // 🛰️ Giả lập gọi API liên tục để lấy tọa độ xe
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/cars/${carId}/location`);
                const data = await res.json();

                const newPos: [number, number] = [data.lat, data.lng];

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

        return () => clearInterval(interval);
    }, [carId]);

    const latestPos = positions[positions.length - 1];

    return (
        <div className="car-map-modal">
            <div className="car-map-modal__content">
                <button className="car-map-modal__close" onClick={onClose}>Đóng</button>
                <h3>Theo dõi xe ID: {carId}</h3>

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
                            <Popup>Xe ID: {carId}</Popup>
                        </Marker>


                        <Polyline positions={positions} />
                    </MapContainer>
                )}
            </div>
        </div>
    );
};

export default CarTrackingMap;
