import React, { useState, useEffect, useCallback } from "react";
import '../styles/CreateStopForm.scss';
import { useAuth } from "../contexts/AuthContext";
import { useStop } from "../hooks/useStop";
import StopMapModal from "./StopMapModal";
import MiniMapPreview from "./MiniMapPreview";

const Base_URL = import.meta.env.VITE_BASE_URL as string;
interface CreateStopFormProps {
    routeId: string;
    onSubmit?: (data: any) => void;
    onClose?: () => void;
}

const CreateStopForm: React.FC<CreateStopFormProps> = ({ routeId, onSubmit, onClose }) => {
    const { token } = useAuth();
    const { AllStop, loading: stopLoading } = useStop();
    const [selectedStopId, setSelectedStopId] = useState<string>("");
    const [nameStop, setNameStop] = useState("");
    const [type, setType] = useState("PICKUP");
    const [exactAddress, setExactAddress] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [province, setProvince] = useState("");
    const [commune, setCommune] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [showMapModal, setShowMapModal] = useState(false);
    const [mapLat, setMapLat] = useState<number>(0);
    const [mapLng, setMapLng] = useState<number>(0);
    const [currentLat, setCurrentLat] = useState<number | null>(null);
    const [currentLng, setCurrentLng] = useState<number | null>(null);
    const [isFetchingCoords, setIsFetchingCoords] = useState(false);
    const [isCreatingStop, setIsCreatingStop] = useState(false); // Flag để phân biệt mở modal từ đâu

    const buildHeaders = () => {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "x-request-id": crypto.randomUUID(),
        };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        return headers;
    };

    // Hàm lấy tọa độ từ địa chỉ
    const fetchCoordinatesFromAddress = useCallback(async (address: string, commune: string, province: string, openModalAfterFetch = false) => {
        if (!address || !commune || !province) {
            setCurrentLat(null);
            setCurrentLng(null);
            return null;
        }

        setIsFetchingCoords(true);
        const fullAddress = `${address}, ${commune}, ${province}`;

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`);
            const data = await res.json();

            if (data && data.length > 0) {
                const latitude = parseFloat(data[0].lat);
                const longitude = parseFloat(data[0].lon);
                setCurrentLat(latitude);
                setCurrentLng(longitude);
                setLat(latitude.toString());
                setLng(longitude.toString());
                
                if (openModalAfterFetch) {
                    setMapLat(latitude);
                    setMapLng(longitude);
                    setShowMapModal(true);
                }
                
                return { lat: latitude, lng: longitude };
            } else {
                setCurrentLat(null);
                setCurrentLng(null);
                return null;
            }
        } catch (error) {
            console.error("Error fetching coordinates:", error);
            setCurrentLat(null);
            setCurrentLng(null);
            return null;
        } finally {
            setIsFetchingCoords(false);
        }
    }, []);

    // Cập nhật mini map khi lat/lng thay đổi thủ công
    useEffect(() => {
        if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            setCurrentLat(parseFloat(lat));
            setCurrentLng(parseFloat(lng));
        }
    }, [lat, lng]);

    // Tự động lấy tọa độ khi địa chỉ thay đổi (với debounce) - chỉ khi chưa có lat/lng
    useEffect(() => {
        // Nếu đã có lat/lng thì không tự động lấy từ địa chỉ
        if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            return;
        }

        if (!exactAddress || !commune || !province) {
            setCurrentLat(null);
            setCurrentLng(null);
            return;
        }

        const timer = setTimeout(() => {
            fetchCoordinatesFromAddress(exactAddress, commune, province);
        }, 1000); // Debounce 1 giây

        return () => clearTimeout(timer);
    }, [exactAddress, commune, province, fetchCoordinatesFromAddress, lat, lng]);

    // Xử lý khi chọn stop từ dropdown
    const handleStopSelect = (stopId: string) => {
        setSelectedStopId(stopId);
        if (stopId && stopId !== "") {
            const selectedStop = AllStop.find(s => s.stopId === stopId);
            if (selectedStop) {
                setNameStop(selectedStop.nameStop || "");
                setType(selectedStop.type || "PICKUP");
                setExactAddress(selectedStop.exactAddress || "");
                setProvince(selectedStop.province || "");
                setCommune(selectedStop.commune || "");
            }
        } else {
            setNameStop("");
            setExactAddress("");
            setProvince("");
            setCommune("");
            setLat("");
            setLng("");
            setCurrentLat(null);
            setCurrentLng(null);
            setType("PICKUP");
        }
    };

    // Xử lý khi click vào mini map (chỉ để xem/chỉnh sửa, chưa tạo stop)
    const handleMiniMapClick = async () => {
        setIsCreatingStop(false); // Mở modal từ mini map, chỉ để chỉnh sửa
        
        // Tọa độ Hồ Gươm (Hà Nội) - vị trí mặc định
        const hoGuomLat = 21.0285;
        const hoGuomLng = 105.8542;
        
        if (currentLat !== null && currentLng !== null) {
            // Nếu đã có tọa độ, sử dụng tọa độ đó
            setMapLat(currentLat);
            setMapLng(currentLng);
            setShowMapModal(true);
        } else if (exactAddress && commune && province) {
            // Nếu chưa có tọa độ nhưng có địa chỉ, thử lấy tọa độ trước
            const coords = await fetchCoordinatesFromAddress(exactAddress, commune, province, false);
            if (coords) {
                // Nếu lấy được tọa độ từ địa chỉ, sử dụng tọa độ đó
                setMapLat(coords.lat);
                setMapLng(coords.lng);
                setShowMapModal(true);
            } else {
                // Nếu không lấy được tọa độ, sử dụng Hồ Gươm làm mặc định
                setMapLat(hoGuomLat);
                setMapLng(hoGuomLng);
                setShowMapModal(true);
            }
        } else {
            // Nếu không có địa chỉ, sử dụng Hồ Gươm làm mặc định
            setMapLat(hoGuomLat);
            setMapLng(hoGuomLng);
            setShowMapModal(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let latitude: number;
        let longitude: number;
        
        // Nếu đã có lat/lng (từ mini map hoặc đã nhập), lưu luôn không cần mở modal
        if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
            latitude = parseFloat(lat);
            longitude = parseFloat(lng);
            // Lưu luôn với tọa độ hiện có
            await handleCreateStop(latitude, longitude);
            return;
        }

        // Nếu chưa có tọa độ, thử lấy từ địa chỉ
        const fullAddress = `${exactAddress}, ${commune}, ${province}`;

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`);
            const data = await res.json();

            if (!data || data.length === 0) {
                alert("Không tìm thấy tọa độ địa điểm! Vui lòng click vào mini map để chọn vị trí.");
                return;
            }
            latitude = parseFloat(data[0].lat);
            longitude = parseFloat(data[0].lon);
            
            // Cập nhật tọa độ và lưu luôn
            setLat(latitude.toString());
            setLng(longitude.toString());
            setCurrentLat(latitude);
            setCurrentLng(longitude);
            await handleCreateStop(latitude, longitude);
        } catch (error) {
            console.error("Error fetching coordinates:", error);
            alert("Có lỗi xảy ra khi lấy tọa độ! Vui lòng click vào mini map để chọn vị trí.");
        }
    };

    // Hàm thực sự tạo stop sau khi xác nhận trên modal
    const handleCreateStop = async (finalLat: number, finalLng: number) => {
        try {
            const result = {
                routeId,
                nameStop,
                type,
                exactAddress,
                lat: finalLat,
                lng: finalLng,
                province,
                commune,
                start,
                end
            };
            
            const fetchCreateStop = await fetch(`${Base_URL}/api/v1/routes/stop`, {
                method: "POST",
                headers: buildHeaders(),
                body: JSON.stringify(result),
            });

            const body = await fetchCreateStop.json();
            if (!fetchCreateStop.ok) {
                alert(`Tạo điểm dừng thất bại: ${body?.message || fetchCreateStop.status}`);
                return;
            }

            console.log("STOP CREATED:", result);
            alert("Tạo điểm dừng thành công!");
            if (onSubmit) {
                onSubmit(result);
            }
            if (onClose) {
                onClose();
            }
        } catch (error) {
            console.error("Error creating stop:", error);
            alert("Có lỗi xảy ra khi tạo điểm dừng!");
        }
    };

    // Hàm xử lý khi người dùng xác nhận tọa độ trên bản đồ (tạo stop)
    const handleMapConfirm = async (confirmedLat: number, confirmedLng: number) => {
        setShowMapModal(false);
        setLat(confirmedLat.toString());
        setLng(confirmedLng.toString());
        setCurrentLat(confirmedLat);
        setCurrentLng(confirmedLng);
        
        // Nếu mở modal từ nút "Tạo điểm dừng", thì tạo stop ngay
        if (isCreatingStop) {
            await handleCreateStop(confirmedLat, confirmedLng);
        }
    };

    // Hàm xử lý khi người dùng chỉ xác nhận vị trí (chỉ cập nhật tọa độ, không tạo stop)
    const handleMapConfirmPosition = (confirmedLat: number, confirmedLng: number) => {
        setShowMapModal(false);
        setLat(confirmedLat.toString());
        setLng(confirmedLng.toString());
        setCurrentLat(confirmedLat);
        setCurrentLng(confirmedLng);
        // Chỉ cập nhật tọa độ, không tạo stop
        // Mini map sẽ tự động cập nhật nhờ useEffect
    };

    // Hàm xử lý khi người dùng hủy trên bản đồ
    const handleMapCancel = () => {
        setShowMapModal(false);
    };

    return (
        <>
            <div className="stop-form-modal">
                <form className="stop-form" onSubmit={handleSubmit}>
                    <h3>Tạo điểm dừng</h3>

                    <div>
                        <label>Chọn điểm dừng có sẵn (tùy chọn)</label>
                        <select
                            value={selectedStopId}
                            onChange={(e) => handleStopSelect(e.target.value)}
                            disabled={stopLoading}
                        >
                            <option value="">-- Nhập tay --</option>
                            {AllStop.map((stop) => (
                                <option key={stop.stopId} value={stop.stopId}>
                                    {stop.nameStop} - {stop.exactAddress}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Tên điểm dừng</label>
                        <input value={nameStop} onChange={(e) => setNameStop(e.target.value)} required />
                    </div>

                    <div>
                        <label>Loại điểm dừng</label>
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="PICKUP">Điểm đón</option>
                            <option value="DROPOFF">Điểm trả</option>
                        </select>
                    </div>

                    <div>
                        <label>Địa chỉ chi tiết</label>
                        <input value={exactAddress} onChange={(e) => setExactAddress(e.target.value)} required />
                    </div>

                    <div>
                        <label>Quận/Huyện</label>
                        <input value={commune} onChange={(e) => setCommune(e.target.value)} required />
                    </div>
                    <div>
                        <label>Tỉnh/Thành phố</label>
                        <input value={province} onChange={(e) => setProvince(e.target.value)} required />
                    </div>
                    


                    <div>
                        <label>Start</label>
                        <input value={start} onChange={(e) => setStart(e.target.value)} />
                    </div>

                    <div>
                        <label>End</label>
                        <input value={end} onChange={(e) => setEnd(e.target.value)} />
                    </div>

                    <div>
                        <label>Xem trước vị trí</label>
                        <MiniMapPreview 
                            lat={currentLat} 
                            lng={currentLng} 
                            onClick={handleMiniMapClick}
                        />
                        {isFetchingCoords && (
                            <p className="stop-form__loading-text">Đang lấy tọa độ...</p>
                        )}
                    </div>

                    <div className="button-group">
                        <button type="submit" onClick={handleSubmit}>Tạo điểm dừng</button>
                        <button type="button" onClick={onClose}>Hủy</button>
                    </div>
                </form>
            </div>

            {showMapModal && (
                <StopMapModal
                    initialLat={mapLat}
                    initialLng={mapLng}
                    onConfirm={isCreatingStop ? handleMapConfirm : undefined}
                    onConfirmPosition={handleMapConfirmPosition}
                    onCancel={handleMapCancel}
                    showCreateButton={isCreatingStop}
                />
            )}
        </>
    );
};

export default CreateStopForm;

