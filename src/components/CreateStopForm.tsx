import React, { useEffect, useState } from "react";
import '../styles/CreateStopForm.scss';
import { useAuth } from "../contexts/AuthContext";

const Base_URL = import.meta.env.VITE_BASE_URL as string;
interface CreateStopFormProps {
    routeId: string;
    onSubmit?: (data: any) => void;
    onClose?: () => void;
}

const CreateStopForm: React.FC<CreateStopFormProps> = ({ routeId, onSubmit, onClose }) => {
    const { token } = useAuth();
    const [nameStop, setNameStop] = useState("");
    const [type, setType] = useState("PICKUP");
    const [exactAddress, setExactAddress] = useState("");
    const [lat, setLat] = useState("");
    const [lng, setLng] = useState("");
    const [province, setProvince] = useState("");
    const [commune, setCommune] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const fullAddress = `${exactAddress}, ${commune}, ${province}`;

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}`);
            const data = await res.json();

            if (!data || data.length === 0) {
                alert("Không tìm thấy tọa độ địa điểm!");
                return;
            }
            const latitude = parseFloat(data[0].lat);
            const longitude = parseFloat(data[0].lon);
            setLat(data[0].lat);
            setLng(data[0].lon);

            const result = {
                routeId,
                nameStop,
                type,
                exactAddress,
                lat: latitude,
                lng: longitude,
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
        } catch (error) {
            console.error("Error fetching coordinates:", error);
            alert("Có lỗi xảy ra khi lấy tọa độ!");
        }
    };

    return (
        <div className="stop-form-modal">
            <form className="stop-form" onSubmit={handleSubmit}>
                <h3>Tạo điểm dừng</h3>

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

                <button type="submit" onClick={handleSubmit}>Tạo điểm dừng</button>
                <button type="button" onClick={onClose}>Hủy</button>
            </form>
        </div>
    );
};

export default CreateStopForm;

