import React, { useState, useRef, useEffect } from "react";
import "../styles/CreateDriverForm.scss";
import { useMqtt } from "../hooks/useMqtt";
import { useDrivers } from "../hooks/useDrivers";

const TOPIC_PUB = "esp32/write_card";
const TOPIC_SUB = "esp32/write_status";

interface CreateDriverFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const CreateDriverForm: React.FC<CreateDriverFormProps> = ({ onSuccess, onCancel }) => {
    const { vehicles, createDriver } = useDrivers();
    const [waitingCard, setWaitingCard] = useState(false);
    const [cardMessage, setCardMessage] = useState("");
    const waitingCardRef = useRef(waitingCard);

    // Cập nhật ref khi waitingCard thay đổi
    useEffect(() => {
        waitingCardRef.current = waitingCard;
    }, [waitingCard]);

    const { isConnected, publish } = useMqtt({
        topicPub: TOPIC_PUB,
        topicSub: TOPIC_SUB,
        onMessage: (_topic, message) => {
            if (waitingCardRef.current) {
                // Chỉ hiện "thành công" khi nhận được "✅ Ghi dữ liệu thành công!" từ ESP32
                // Không phải "✅ Dữ liệu nhận thành công. Chạm thẻ để ghi!"
                if (/✅.*Ghi.*thành công|✅ Ghi dữ liệu thành công/i.test(message)) {
                    setCardMessage("✅ Ghi thẻ thành công!");
                    setTimeout(() => {
                        setWaitingCard(false);
                        setCardMessage("");
                    }, 2000);
                } else if (/❌.*Ghi.*thất bại|❌ Ghi dữ liệu thất bại/i.test(message)) {
                    setCardMessage("❌ Ghi thẻ thất bại, vui lòng thử lại.");
                } else if (message.includes("Chạm thẻ") || message.includes("chạm thẻ") || message.includes("Dữ liệu nhận thành công")) {
                    // ESP32 yêu cầu chạm thẻ hoặc xác nhận đã nhận dữ liệu
                    setCardMessage("🪪 " + message);
                } else {
                    setCardMessage(message);
                }
            }
        },
    });

    // Form state
    const [selectedVehicle, setSelectedVehicle] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState("1");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [hireDate, setHireDate] = useState("");
    const [baseSalary, setBaseSalary] = useState<string>("1500.0");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [exactAddress, setExactAddress] = useState("");
    const [commune, setCommune] = useState("");
    const [province, setProvince] = useState("");

    // ===== Submit create driver =====
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);

        // Tìm vehicleId từ biển số đã chọn
        const selectedVehicleObj = vehicles.find(
            (v) => (v.plateNumber || v.licensePlate) === selectedVehicle
        );
        const vehicleId = selectedVehicleObj?.id;

        const result = await createDriver({
            firstName,
            lastName,
            dateOfBirth,
            gender,
            email,
            phone,
            hireDate,
            baseSalary,
            vehicleId: vehicleId || undefined,
            imageFile,
            exactAddress,
            commune,
            province,
        });

        if (result.success) {
            // ===== Gửi MQTT yêu cầu ghi thẻ =====
            if (isConnected && result.data) {
                const driverId = result.data?.id || result.data?.driverId;
                if (driverId && publish(driverId.toString())) {
                    setWaitingCard(true);
                    setCardMessage("🪪 Vui lòng chạm thẻ vào đầu đọc...");
                }
            }

            // Reset form
            setFirstName("");
            setLastName("");
            setDateOfBirth("");
            setGender("1");
            setEmail("");
            setPhone("");
            setHireDate("");
            setBaseSalary("1500.0");
            setImageFile(null);
            setSelectedImageUrl(null);
            setSelectedVehicle("");
            setExactAddress("");
            setCommune("");
            setProvince("");

            if (onSuccess) {
                onSuccess();
            }
        } else {
            setFormError(result.error || "Không thể tạo tài xế");
        }

        setSubmitting(false);
    };

    return (
        <>
            <div className="driver-form-modal" onClick={onCancel}>
                <form className="driver-form" onClick={(e) => e.stopPropagation()} onSubmit={onSubmit}>
                    {formError && <div className="alert-error">{formError}</div>}
                    <div>
                        <label>Họ</label>
                        <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                    <div>
                        <label>Tên</label>
                        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div>
                        <label>Ngày sinh</label>
                        <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                    </div>
                    <div>
                        <label>Giới tính</label>
                        <select value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option value="1">Nam</option>
                            <option value="2">Nữ</option>
                            <option value="3">Khác</option>
                        </select>
                    </div>
                    <div>
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label>SĐT</label>
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div>
                        <label>Ngày tuyển</label>
                        <input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} />
                    </div>
                    <div>
                        <label>Lương cơ bản</label>
                        <input type="number" step="0.01" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} />
                    </div>

                    <div>
                        <label>Xe được gán</label>
                        <select
                            value={selectedVehicle}
                            onChange={(e) => setSelectedVehicle(e.target.value)}
                            required
                        >
                            <option value="">-- Chọn xe --</option>
                            {vehicles.map((v) => (
                                <option key={v.id} value={v.plateNumber || v.licensePlate || ""}>
                                    {v.plateNumber || v.licensePlate || `Xe ${v.id}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Địa chỉ cụ thể</label>
                        <input
                            type="text"
                            value={exactAddress}
                            onChange={(e) => setExactAddress(e.target.value)}
                            placeholder="Địa chỉ chính xác"
                        />
                    </div>
                    <div>
                        <label>Xã/Phường</label>
                        <input
                            type="text"
                            value={commune}
                            onChange={(e) => setCommune(e.target.value)}
                            placeholder="Ví dụ: Xã/Phường"
                        />
                    </div>
                    <div>
                        <label>Tỉnh</label>
                        <input
                            type="text"
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            placeholder="Tỉnh"
                        />
                    </div>

                    <div>
                        <label>Ảnh</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setImageFile(file);
                                if (file) {
                                    const previewUrl = URL.createObjectURL(file);
                                    setSelectedImageUrl(previewUrl);
                                } else {
                                    setSelectedImageUrl(null);
                                }
                            }}
                        />
                        {selectedImageUrl && (
                            <div className="image-preview">
                                <img
                                    src={selectedImageUrl}
                                    alt="Preview"
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onCancel}>Hủy</button>
                        <button type="submit" disabled={submitting}>
                            {submitting ? "Đang tạo..." : "Tạo tài xế"}
                        </button>
                    </div>
                </form>
            </div>

            {/* ===== Overlay chạm thẻ ===== */}
            {waitingCard && (
                <div className="overlay">
                    <div className="overlay-box">
                        <h3>{cardMessage}</h3>
                    </div>
                </div>
            )}
        </>
    );
};

export default CreateDriverForm;



