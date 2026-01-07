import React, { useState, useRef, useEffect, useMemo } from "react";
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
    const [query, setQuery] = useState<string>("");

    // Cập nhật ref khi scanningDriverId thay đổi
    useEffect(() => {
        scanningRef.current = scanningDriverId !== null;
    }, [scanningDriverId]);

    // useEffect(() => {
    //     if (!scanningDriverId) return;

    //     const timeout = setTimeout(() => {
    //         setScanningDriverId(null);
    //         setCardMessage("Hết thời gian quét thẻ");
    //     }, 10000); // 10s

    //     return () => clearTimeout(timeout);
    // }, [scanningDriverId]);

    const { isConnected, publish } = useMqtt({
        topicPub: TOPIC_PUB,
        topicSub: TOPIC_SUB,
        onMessage: (_topic, message) => {
            console.log("Nhận message từ MQTT:", message);
            if (scanningRef.current) {
                if (/Ghi dữ liệu thành công/i.test(message)) {
                    setCardMessage("Quét thẻ thành công!");
                    setTimeout(() => {
                        setScanningDriverId(null);
                        setCardMessage("");
                    }, 2000);
                } else if (/.*Ghi.*thất bại|Ghi dữ liệu thất bại/i.test(message)) {
                    setCardMessage("Quét thẻ thất bại, vui lòng thử lại.");
                } else if (message.includes("Chạm thẻ") || message.includes("chạm thẻ") || message.includes("Dữ liệu nhận thành công")) {
                    // ESP32 yêu cầu chạm thẻ hoặc xác nhận đã nhận dữ liệu
                    setCardMessage("" + message);
                } else {
                    // Hiển thị các message khác
                    setCardMessage(message);
                }
            }
        },
    });

    const getCurrentVehicle = (driver: Driver) => {
        if (!driver.vehicleId) return null;
        return vehicles.find(v => v.id === driver.vehicleId);
    };

    const filteredDrivers = useMemo(() => {
        const q = query.toLowerCase();
        return drivers.filter((d) => {
            const fullName = [d.lastName, d.firstName].filter(Boolean).join(" ").toLowerCase();
            const email = (d.email || "").toLowerCase();
            const phone = (d.phone || "").toLowerCase();
            const currentVehicle = getCurrentVehicle(d);
            const vehicleText = currentVehicle
                ? (currentVehicle.plateNumber || currentVehicle.licensePlate || `Xe ${currentVehicle.id}`).toLowerCase()
                : "";

            return (
                fullName.includes(q) ||
                email.includes(q) ||
                phone.includes(q) ||
                vehicleText.includes(q)
            );
        });
    }, [drivers, query, vehicles]);

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
        vehicleId?: string;
        imageFile?: File | null;
        currentImageUrl?: string;
        licenseClassId?: number;
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

    // Xử lý quét thẻ
    const handleScanCard = (driverId: string) => {
        console.log(" handleScanCard called with driverId:", driverId);
        console.log(" isConnected:", isConnected);
        console.log(" TOPIC_PUB:", TOPIC_PUB);

        if (!isConnected) {
            alert("MQTT chưa kết nối. Vui lòng thử lại sau.");
            return;
        }

        const result = publish(driverId);
        console.log("publish result:", result);

        if (result) {
            console.log("Đã gửi driverId cho MQTT:", driverId, "vào topic:", TOPIC_PUB);
            setScanningDriverId(driverId);
            setCardMessage("Vui lòng quét thẻ trên màn hình...");
        } else {
            alert("Không thể gửi yêu cầu quét thẻ. Vui lòng thử lại.");
        }
    };

    return (
        <div className="driver-manager">
            <div className="driver-manager__top">
                <h2>Quản lý tài xế</h2>
                <div className="driver-manager__actions">
                    <input
                        className="driver-manager__search"
                        placeholder="Tìm theo tên, email, SĐT, xe..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button
                        className="btn btn--primary"
                        type="button"
                        onClick={() => setShowForm(true)}
                    >
                        + Thêm
                    </button>
                </div>
            </div>

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

            <div className="table-wrapper">
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
                            <th>Hoạt động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={8}>Đang tải...</td></tr>}
                        {!loading && filteredDrivers.length === 0 && <tr><td colSpan={8}>Không có dữ liệu</td></tr>}
                        {!loading && filteredDrivers.map((d) => {
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
            </div>

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
                        <h3>{cardMessage || " Vui lòng quét thẻ ..."}</h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverManager;
