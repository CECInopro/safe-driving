import React, { useState } from "react";
import "../styles/EditAccountForm.scss";
import { type CreateAccountPayload, type UpdateAccountResult } from "../hooks/useAccount";

interface CreateAccountFormProps {
    onSubmit: (payload: CreateAccountPayload) => Promise<UpdateAccountResult>;
    onCancel: () => void;
    onSuccess?: () => void;
}

const roleOptions = ["ADMIN", "MANAGER", "DRIVER"];

const CreateAccountForm: React.FC<CreateAccountFormProps> = ({
    onSubmit,
    onCancel,
    onSuccess,
}) => {
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("DRIVER");
    const [password, setPassword] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);

        if (!username.trim() || !password.trim()) {
            setFormError("Username và mật khẩu không được để trống.");
            setSubmitting(false);
            return;
        }

        const payload: CreateAccountPayload = {
            username: username.trim(),
            password: password.trim(),
            role: role.trim().toUpperCase(),
        };

        const result = await onSubmit(payload);
        setSubmitting(false);

        if (result.success) {
            if (onSuccess) onSuccess();
            else onCancel();
        } else {
            setFormError(result.message ?? "Không thể tạo tài khoản");
        }
    };

    return (
        <div className="account-form-modal" onClick={onCancel}>
            <form className="account-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
                <h3>Tạo tài khoản mới</h3>
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
                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-actions">
                    <button type="button" onClick={onCancel} disabled={submitting}>
                        Hủy
                    </button>
                    <button type="submit" disabled={submitting}>
                        {submitting ? "Đang tạo..." : "Tạo mới"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateAccountForm;

