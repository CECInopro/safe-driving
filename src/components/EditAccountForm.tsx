import React, { useState } from "react";
import "../styles/EditAccountForm.scss";
import { type Account, type UpdateAccountPayload, type UpdateAccountResult } from "../hooks/useAccount";

interface EditAccountFormProps {
    account: Account;
    onSubmit: (payload: UpdateAccountPayload) => Promise<UpdateAccountResult>;
    onCancel: () => void;
    onSuccess?: () => void;
}

const roleOptions = ["ADMIN", "MANAGER", "DRIVER"];
const statusOptions = ["ACTIVE", "INACTIVE"];

const EditAccountForm: React.FC<EditAccountFormProps> = ({
    account,
    onSubmit,
    onCancel,
    onSuccess,
}) => {
    const [username, setUsername] = useState(account.username || "");
    const [role, setRole] = useState(account.role || "DRIVER");
    const [status, setStatus] = useState(account.status || "ACTIVE");
    const [password, setPassword] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);

        const payload: UpdateAccountPayload = {
            username: username.trim(),
            role: role.trim().toUpperCase(),
            status: status.trim().toUpperCase(),
        };

        if (!password.trim()) {
            setFormError("Mật khẩu không được để trống.");
            setSubmitting(false);
            return;
        }

        payload.password = password.trim();

        const result = await onSubmit(payload);
        setSubmitting(false);

        if (result.success) {
            if (onSuccess) onSuccess();
            else onCancel();
        } else {
            setFormError(result.message ?? "Không thể cập nhật tài khoản");
        }
    };

    return (
        <div className="account-form-modal" onClick={onCancel}>
            <form className="account-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <h3>Cập nhật tài khoản</h3>
                {formError && <div className="account-form__alert">{formError}</div>}
                <div>
                    <label>Username</label>
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        {roleOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Trạng thái</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        {statusOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Mật khẩu (bắt buộc)</label>
                    <input
                        type="password"
                        value={password}
                        placeholder="Nhập mật khẩu mới"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-actions">
                    <button type="button" onClick={onCancel} disabled={submitting}>
                        Hủy
                    </button>
                    <button type="submit" disabled={submitting}>
                        {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditAccountForm;

