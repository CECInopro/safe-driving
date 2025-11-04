import React, { useState, useRef, useEffect } from "react";
import "../styles/DriverManager.scss";
import { useMqtt } from "../hooks/useMqtt";
import { useDrivers } from "../hooks/useDrivers";

const TOPIC_PUB = "esp32/write_card";
const TOPIC_SUB = "esp32/write_status";

const DriverManager: React.FC = () => {
    // Hooks
    const { drivers, vehicles, loading, error, createDriver } = useDrivers();
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
                if (/WRITE_SUCCESS|OK/i.test(message)) {
                    setCardMessage("✅ Ghi thẻ thành công!");
                    setTimeout(() => {
                        setWaitingCard(false);
                        setCardMessage("");
                    }, 2000);
                } else if (/WRITE_FAIL|ERROR/i.test(message)) {
                    setCardMessage("❌ Ghi thẻ thất bại, vui lòng thử lại.");
                } else {
                    setCardMessage(message);
                }
            }
        },
    });

    // Local state
    const [selectedVehicle, setSelectedVehicle] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState("Male");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [hireDate, setHireDate] = useState("");
    const [baseSalary, setBaseSalary] = useState<string>("1500.0");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

    // ===== Submit create driver =====
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);

        const result = await createDriver({
            firstName,
            lastName,
            dateOfBirth,
            gender,
            email,
            phone,
            hireDate,
            baseSalary,
            plateNumber: selectedVehicle,
            imageFile,
        });

        if (result.success) {
            setSuccessMessage("Tạo tài xế thành công.");

            // ===== Gửi MQTT yêu cầu ghi thẻ =====
            if (isConnected && result.data) {
                const driverId = result.data?.id || result.data?.driverId;
                if (driverId && publish(driverId.toString())) {
                    setWaitingCard(true);
                    setCardMessage("🪪 Vui lòng chạm thẻ vào đầu đọc...");
                }
            }

            // Reset form
            setShowForm(false);
            setFirstName("");
            setLastName("");
            setDateOfBirth("");
            setGender("Male");
            setEmail("");
            setPhone("");
            setHireDate("");
            setBaseSalary("1500.0");
            setImageFile(null);
            setSelectedImageUrl(null);
            setSelectedVehicle("");
        } else {
            setFormError(result.error || "Không thể tạo tài xế");
        }

        setSubmitting(false);
    };

    // ===== UI =====
    return (
        <div className="driver-manager">
            <h2>Quản lý tài xế</h2>
            <button onClick={() => setShowForm(true)}>Tạo tài xế mới</button>

            {successMessage && <div className="alert-success">{successMessage}</div>}
            {error && !showForm && <div className="alert-error">{error}</div>}
            {formError && showForm && <div className="alert-error">{formError}</div>}

            {/* ===== Form tạo tài xế ===== */}
            {showForm && (
                <div className="driver-form-modal" onClick={() => setShowForm(false)}>
                    <form className="driver-form" onClick={(e) => e.stopPropagation()} onSubmit={onSubmit}>
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
                                <option value="Male">Nam</option>
                                <option value="Female">Nữ</option>
                                <option value="Other">Khác</option>
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
                            <button type="button" onClick={() => setShowForm(false)}>Hủy</button>
                            <button type="submit" disabled={submitting}>
                                {submitting ? "Đang tạo..." : "Tạo tài xế"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ===== Bảng danh sách ===== */}
            <table className="driver-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Ảnh</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>SĐT</th>
                        <th>Ngày sinh</th>
                        <th>Ngày tuyển</th>
                        <th>Lương</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && <tr><td colSpan={8}>Đang tải...</td></tr>}
                    {!loading && drivers.length === 0 && <tr><td colSpan={8}>Không có dữ liệu</td></tr>}
                    {!loading && drivers.map((d) => (
                        <tr key={d.id}>
                            <td>{d.id}</td>
                            <td>{d.imageUrl ? <img src={d.imageUrl} alt="avatar" width={50} height={50} /> : "No img"}</td>
                            <td>{[d.lastName, d.firstName].filter(Boolean).join(" ")}</td>
                            <td>{d.email}</td>
                            <td>{d.phone}</td>
                            <td>{d.dateOfBirth}</td>
                            <td>{d.hireDate}</td>
                            <td>{d.baseSalary}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ===== Overlay chạm thẻ ===== */}
            {waitingCard && (
                <div className="overlay">
                    <div className="overlay-box">
                        <h3>{cardMessage}</h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverManager;
