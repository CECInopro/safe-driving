import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/StopMapModal.scss';

// Fix default marker icon issue with Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type StopMapModalProps = {
    initialLat: number;
    initialLng: number;
    onConfirm?: (lat: number, lng: number) => void; // Callback để tạo stop (tùy chọn)
    onConfirmPosition?: (lat: number, lng: number) => void; // Callback để chỉ cập nhật tọa độ, không tạo stop
    onCancel: () => void;
    showCreateButton?: boolean; // Có hiển thị nút "Tạo điểm dừng" không
};

// Component để xử lý click trên bản đồ
const MapClickHandler: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Component để cập nhật center của map khi marker di chuyển
const MapUpdater: React.FC<{ position: [number, number] }> = ({ position }) => {
    const map = useMap();
    
    useEffect(() => {
        map.setView(position, map.getZoom());
    }, [map, position]);
    
    return null;
};

const StopMapModal: React.FC<StopMapModalProps> = ({ initialLat, initialLng, onConfirm, onConfirmPosition, onCancel, showCreateButton = false }) => {
    const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);


    // Cập nhật position khi initialLat/initialLng thay đổi
    useEffect(() => {
        setPosition([initialLat, initialLng]);
    }, [initialLat, initialLng]);

    // Xử lý khi click vào bản đồ
    const handleMapClick = (lat: number, lng: number) => {
        setPosition([lat, lng]);
    };

    // Xử lý khi kéo marker
    const handleMarkerDragEnd = (e: L.DragEndEvent) => {
        const newPosition: [number, number] = [e.target.getLatLng().lat, e.target.getLatLng().lng];
        setPosition(newPosition);
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm(position[0], position[1]);
        }
    };

    const handleConfirmPosition = () => {
        if (onConfirmPosition) {
            onConfirmPosition(position[0], position[1]);
        }
    };

    return (
        <div className="stop-map-modal">
            <div className="stop-map-modal__content">
                <button className="stop-map-modal__close" onClick={onCancel}>
                    ✕
                </button>
                <h3 className="stop-map-modal__title">Chọn vị trí điểm dừng</h3>
                <p className="stop-map-modal__instruction">
                    Click vào bản đồ hoặc kéo marker để thay đổi vị trí
                </p>
                
                <div className="stop-map-modal__coordinates">
                    <div className="stop-map-modal__coord-item">
                        <span className="stop-map-modal__coord-label">Latitude:</span>
                        <span className="stop-map-modal__coord-value">{position[0].toFixed(6)}</span>
                    </div>
                    <div className="stop-map-modal__coord-item">
                        <span className="stop-map-modal__coord-label">Longitude:</span>
                        <span className="stop-map-modal__coord-value">{position[1].toFixed(6)}</span>
                    </div>
                </div>

                <div className="stop-map-modal__map">
                    <MapContainer
                        center={position}
                        zoom={15}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapUpdater position={position} />
                        <MapClickHandler onMapClick={handleMapClick} />
                        <Marker
                            position={position}
                            draggable={true}
                            eventHandlers={{
                                dragend: handleMarkerDragEnd,
                            }}
                        />
                    </MapContainer>
                </div>

                <div className="stop-map-modal__buttons">
                    {onConfirmPosition && (
                        <button 
                            type="button" 
                            className="stop-map-modal__button stop-map-modal__button--confirm-position"
                            onClick={handleConfirmPosition}
                        >
                            Xác nhận
                        </button>
                    )}
                    {showCreateButton && onConfirm && (
                        <button 
                            type="button" 
                            className="stop-map-modal__button stop-map-modal__button--confirm"
                            onClick={handleConfirm}
                        >
                            Tạo điểm dừng
                        </button>
                    )}
                    <button 
                        type="button" 
                        className="stop-map-modal__button stop-map-modal__button--cancel"
                        onClick={onCancel}
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StopMapModal;

