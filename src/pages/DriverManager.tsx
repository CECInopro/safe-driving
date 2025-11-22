import React, { useState, useRef, useEffect } from "react";
import "../styles/DriverManager.scss";
import { useDrivers, type Driver } from "../hooks/useDrivers";
import CreateDriverForm from "../components/CreateDriverForm";
import EditDriverForm from "../components/EditDriverForm";
import { useMqtt } from "../hooks/useMqtt";

const TOPIC_PUB = "esp32/write";
const TOPIC_SUB = "esp32/status";

const DriverManager: React.FC = () => {
    // Hooks
    const { drivers, vehicles, loading, error, updateDriver, deleteDriver } = useDrivers();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
    const [deletingDriverId, setDeletingDriverId] = useState<string | null>(null);
    const [scanningDriverId, setScanningDriverId] = useState<string | null>(null);
    const [cardMessage, setCardMessage] = useState("");
    const scanningRef = useRef(false);

    // Cập nhật ref khi scanningDriverId thay đổi
    useEffect(() => {
        scanningRef.current = scanningDriverId !== null;
    }, [scanningDriverId]);

    const { isConnected, publish } = useMqtt({
        topicPub: TOPIC_PUB,
        topicSub: TOPIC_SUB,
        onMessage: (_topic, message) => {
            console.log("📩 Nhận message từ MQTT:", message);
            if (scanningRef.current) {
                // Chỉ hiện "thành công" khi nhận được "✅ Ghi dữ liệu thành công!" từ ESP32
                // Không phải "✅ Dữ liệu nhận thành công. Chạm thẻ để ghi!"
                if (/✅.*Ghi.*thành công|✅ Ghi dữ liệu thành công/i.test(message)) {
                    setCardMessage("✅ Quét thẻ thành công!");
                    setTimeout(() => {
                        setScanningDriverId(null);
                        setCardMessage("");
                    }, 2000);
                } else if (/❌.*Ghi.*thất bại|❌ Ghi dữ liệu thất bại/i.test(message)) {
                    setCardMessage("❌ Quét thẻ thất bại, vui lòng thử lại.");
                } else if (message.includes("Chạm thẻ") || message.includes("chạm thẻ") || message.includes("Dữ liệu nhận thành công")) {
                    // ESP32 yêu cầu chạm thẻ hoặc xác nhận đã nhận dữ liệu
                    setCardMessage("🪪 " + message);
                } else {
                    // Hiển thị các message khác
                    setCardMessage(message);
                }
            }
        },
    });

    const handleDelete = async (driverId: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa tài xế này?")) {
            return;
        }

        setDeletingDriverId(driverId);
        const result = await deleteDriver(driverId);

        if (result.success) {
            setSuccessMessage("Xóa tài xế thành công.");
            setTimeout(() => setSuccessMessage(null), 3000);
        } else {
            alert(result.error || "Không thể xóa tài xế");
        }

        setDeletingDriverId(null);
    };

    const handleUpdate = async (driverId: string, driverData: {
        firstName?: string;
        lastName?: string;
        dateOfBirth?: string;
        gender?: string;
        email?: string;
        phone?: string;
        hireDate?: string;
        baseSalary?: string;
        vehicleId?: string;
        imageFile?: File | null;
        currentImageUrl?: string;
    }) => {
        const result = await updateDriver(driverId, driverData);

        if (result.success) {
            setSuccessMessage("Cập nhật tài xế thành công.");
            setTimeout(() => setSuccessMessage(null), 3000);
            setEditingDriver(null);
        } else {
            alert(result.error || "Không thể cập nhật tài xế");
        }
    };
    const getCurrentVehicle = (driver: Driver) => {
        if (!driver.vehicleId) return null;
        return vehicles.find(v => v.id === driver.vehicleId);
    };

    // Xử lý quét thẻ
    const handleScanCard = (driverId: string) => {
        console.log("🔍 handleScanCard called with driverId:", driverId);
        console.log("🔍 isConnected:", isConnected);
        console.log("🔍 TOPIC_PUB:", TOPIC_PUB);

        if (!isConnected) {
            alert("MQTT chưa kết nối. Vui lòng thử lại sau.");
            return;
        }

        const result = publish(driverId);
        console.log("🔍 publish result:", result);

        if (result) {
            console.log("📤 Đã gửi driverId cho MQTT:", driverId, "vào topic:", TOPIC_PUB);
            setScanningDriverId(driverId);
            setCardMessage("🪪 Vui lòng quét thẻ trên màn hình...");
        } else {
            alert("Không thể gửi yêu cầu quét thẻ. Vui lòng thử lại.");
        }
    };

    return (
        <div className="driver-manager">
            <h2>Quản lý tài xế</h2>
            <button onClick={() => setShowForm(true)}>Tạo tài xế mới</button>

            {successMessage && <div className="alert-success">{successMessage}</div>}
            {error && !showForm && <div className="alert-error">{error}</div>}

            {/* ===== Form tạo tài xế ===== */}
            {showForm && (
                <CreateDriverForm
                    onSuccess={() => {
                        setShowForm(false);
                        setSuccessMessage("Tạo tài xế thành công.");
                        setTimeout(() => setSuccessMessage(null), 3000);
                    }}
                    onCancel={() => setShowForm(false)}
                />
            )}
            <table className="driver-table">
                <thead>
                    <tr>
                        <th>Ảnh</th>
                        <th>Họ tên</th>
                        <th>Xe đang lái</th>
                        <th>Email</th>
                        <th>SĐT</th>
                        <th>Ngày sinh</th>
                        <th>Ngày tuyển</th>
                        <th>Lương</th>
                        <th>Địa chỉ chính xác</th>
                        <th>Phường/Xã</th>
                        <th>Tỉnh</th>
                        <th>Hoạt động</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && <tr><td colSpan={8}>Đang tải...</td></tr>}
                    {!loading && drivers.length === 0 && <tr><td colSpan={8}>Không có dữ liệu</td></tr>}
                    {!loading && drivers.map((d) => {
                        const currentVehicle = getCurrentVehicle(d);
                        return (
                            <tr key={d.id}>
                                <td>{d.urlImage ? <img src={d.urlImage} alt="avatar" width={50} height={50} /> : "No img"}</td>
                                <td>{[d.lastName, d.firstName].filter(Boolean).join(" ")}</td>
                                <td>
                                    {currentVehicle
                                        ? (currentVehicle.plateNumber || currentVehicle.licensePlate || `Xe ${currentVehicle.id}`)
                                        : "Chưa gán xe"}
                                </td>
                                <td>{d.email}</td>
                                <td>{d.phone}</td>
                                <td>{d.dateOfBirth}</td>
                                <td>{d.hireDate}</td>
                                <td>{d.baseSalary}</td>
                                <td>{d.exactAddress || "-"}</td>
                                <td>{d.commune || "-"}</td>
                                <td>{d.province || "-"}</td>
                                <td>
                                    <button
                                        className="btn btn--small"
                                        onClick={() => setEditingDriver(d)}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="btn btn--small btn--danger"
                                        style={{ marginLeft: 8 }}
                                        onClick={() => handleDelete(d.id)}
                                        disabled={deletingDriverId === d.id}
                                    >
                                        {deletingDriverId === d.id ? "Đang xóa..." : "Xóa"}
                                    </button>
                                    <button
                                        className="btn btn--small"
                                        style={{ marginLeft: 8 }}
                                        onClick={() => handleScanCard(d.id)}
                                        disabled={scanningDriverId === d.id}
                                    >
                                        Quét thẻ
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* ===== Form sửa tài xế ===== */}
            {editingDriver && (
                <EditDriverForm
                    driver={editingDriver}
                    vehicles={vehicles}
                    onSuccess={() => {
                        setEditingDriver(null);
                    }}
                    onCancel={() => setEditingDriver(null)}
                    onUpdate={handleUpdate}
                />
            )}

            {/* ===== Overlay quét thẻ ===== */}
            {scanningDriverId && (
                <div className="overlay">
                    <div className="overlay-box">
                        <h3>{cardMessage || "🪪 Vui lòng quét thẻ trên màn hình..."}</h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverManager;
