import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import '../styles/Update_Firmware.scss';

const Update_Firmware: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState("");
    const { token } = useAuth();

    const buildHeaders = () => {
        const headers: Record<string, string> = {
            "x-request-id": crypto.randomUUID(),
        };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        return headers;
    };

    const handleUpdate = async () => {
        if (!file) {
            alert("Vui lòng chọn file để cập nhật.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("description", description);

        try {
            const response = await fetch("http://ALB-2931116.ap-southeast-1.elb.amazonaws.com/api/v1/firmware", {
                method: "POST",
                headers: buildHeaders(),
                body: formData,
            });

            if (response.ok) {
                alert("Cập nhật firmware thành công!");
            } else {
                alert("Cập nhật firmware thất bại.");
            }
        } catch (error) {
            console.error("Error updating firmware:", error);
            alert("Có lỗi xảy ra khi cập nhật firmware.");
        }
    };

    return (
        <div className="update-firmware">
            <h1>Cập nhật phần mềm</h1>

            <label>Chọn file:</label>
            <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <div>
                <label>Mô tả:</label><br />
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập mô tả firmware"
                />
            </div>

            <button onClick={handleUpdate}>Cập nhật ngay</button>
        </div>
    );
};

export default Update_Firmware;
