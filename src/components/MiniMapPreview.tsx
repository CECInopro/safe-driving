import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/MiniMapPreview.scss';

// Fix default marker icon issue with Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type MiniMapPreviewProps = {
    lat: number | null;
    lng: number | null;
    onClick?: () => void;
};

// Component để cập nhật center của map khi position thay đổi
const MapUpdater: React.FC<{ position: [number, number] | null; zoom: number }> = ({ position, zoom }) => {
    const map = useMap();
    
    useEffect(() => {
        if (position) {
            map.setView(position, zoom);
        }
    }, [map, position, zoom]);
    
    return null;
};

const MiniMapPreview: React.FC<MiniMapPreviewProps> = ({ lat, lng, onClick }) => {
    const [position, setPosition] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
            setPosition([lat, lng]);
        } else {
            setPosition(null);
        }
    }, [lat, lng]);

    // Default center (Vietnam)
    const defaultCenter: [number, number] = [10.8231, 106.6297];
    const center = position || defaultCenter;
    // Zoom out để hiển thị rộng hơn và cụ thể hơn
    const zoom = position ? 12 : 6;

    return (
        <div 
            className={`mini-map-preview ${position ? 'mini-map-preview--has-position' : 'mini-map-preview--no-position'}`}
            onClick={onClick}
        >
            <div className="mini-map-preview__map">
                {position ? (
                    <MapContainer
                        center={center}
                        zoom={zoom}
                        style={{ width: '100%', height: '100%' }}
                        zoomControl={false}
                        dragging={false}
                        touchZoom={false}
                        doubleClickZoom={false}
                        scrollWheelZoom={false}
                        boxZoom={false}
                        keyboard={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapUpdater position={position} zoom={zoom} />
                        <Marker position={position} />
                    </MapContainer>
                ) : (
                    <MapContainer
                        center={center}
                        zoom={zoom}
                        style={{ width: '100%', height: '100%' }}
                        zoomControl={false}
                        dragging={false}
                        touchZoom={false}
                        doubleClickZoom={false}
                        scrollWheelZoom={false}
                        boxZoom={false}
                        keyboard={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </MapContainer>
                )}
            </div>
            <div className="mini-map-preview__overlay">
                <div className="mini-map-preview__hint">
                    {position ? (
                        <>
                            <span className="mini-map-preview__hint-text">Click để chỉnh sửa vị trí</span>
                            <span className="mini-map-preview__coord">
                                {lat?.toFixed(6)}, {lng?.toFixed(6)}
                            </span>
                        </>
                    ) : (
                        <span className="mini-map-preview__hint-text">Nhập địa chỉ để xem vị trí</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MiniMapPreview;

