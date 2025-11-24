import { useEffect, useMemo, useState } from 'react';
import '../styles/UserManager.scss';
import { useAccount, type Account, type UpdateAccountPayload, type UpdateAccountResult, type CreateAccountPayload } from '../hooks/useAccount';
import EditAccountForm from '../components/EditAccountForm';
import CreateAccountForm from '../components/CreateAccountForm';

type AlertState = { type: 'success' | 'error'; message: string } | null;

const UserManager = () => {
    const { accounts, loading, error, updateAccount, deleteAccount, createAccount } = useAccount();
    const [query, setQuery] = useState<string>('');
    const [alert, setAlert] = useState<AlertState>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (!alert) return;
        const timer = setTimeout(() => setAlert(null), 4000);
        return () => clearTimeout(timer);
    }, [alert]);

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        return accounts.filter((a) => a.username.toLowerCase().includes(q));
    }, [accounts, query]);

    const handleEdit = (account: Account) => {
        setEditingAccount(account);
    };

    const handleCreateAccount = async (payload: CreateAccountPayload) => {
        const result = await createAccount(payload);
        if (result.success) {
            setAlert({ type: 'success', message: 'Đã tạo tài khoản mới.' });
        }
        return result;
    };

    const submitAccountChanges = async (payload: UpdateAccountPayload): Promise<UpdateAccountResult> => {
        if (!editingAccount) {
            return { success: false, message: "Không tìm thấy tài khoản cần cập nhật." };
        }
        const result = await updateAccount(editingAccount.accountId, payload);
        if (result.success) {
            setAlert({ type: 'success', message: 'Cập nhật tài khoản thành công.' });
        }
        return result;
    };

    const handleEditSuccess = () => {
        setEditingAccount(null);
    };

    const handleDelete = async (account: Account) => {
        if (!window.confirm(`Bạn có chắc muốn xóa tài khoản "${account.username}"?`)) {
            return;
        }

        setDeletingId(account.accountId);
        const result = await deleteAccount(account.accountId);
        setDeletingId(null);
        setAlert({
            type: result.success ? 'success' : 'error',
            message: result.success ? 'Đã xóa tài khoản.' : (result.message ?? 'Không thể xóa tài khoản.'),
        });
    };

    return (
        <div className="user-manager">
            <div className="user-manager__top">
                <h2>Quản lý người dùng</h2>
                <div className="user-manager__actions">
                    <input
                        className="user-manager__search"
                        placeholder="Tìm theo tên, email, username..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button className="btn btn--primary" onClick={() => setIsCreating(true)}>+ Thêm</button>
                </div>
            </div>

            {alert && (
                <div className={`user-manager__alert user-manager__alert--${alert.type}`}>
                    {alert.message}
                </div>
            )}
            {error && !alert && (
                <div className="user-manager__alert user-manager__alert--error">{error}</div>
            )}

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Password</th>
                            <th>Role</th>
                            <th className="actions-column">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={4}>Đang tải dữ liệu...</td>
                            </tr>
                        )}
                        {!loading && filtered.length === 0 && (
                            <tr>
                                <td colSpan={4}>Không tìm thấy tài khoản phù hợp.</td>
                            </tr>
                        )}
                        {!loading && filtered.map((a) => (
                            <tr key={a.accountId}>
                                <td>{a.username}</td>
                                <td>{a.password}</td>
                                <td>{a.role}</td>
                                <td className="actions-column">
                                    <button
                                        className="btn btn--small"
                                        onClick={() => handleEdit(a)}
                                        disabled={deletingId === a.accountId}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="btn btn--small btn--danger"
                                        onClick={() => handleDelete(a)}
                                        disabled={deletingId === a.accountId}
                                    >
                                        {deletingId === a.accountId ? 'Đang xóa...' : 'Xóa'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {editingAccount && (
                <EditAccountForm
                    account={editingAccount}
                    onCancel={() => setEditingAccount(null)}
                    onSubmit={submitAccountChanges}
                    onSuccess={handleEditSuccess}
                />
            )}
            {isCreating && (
                <CreateAccountForm
                    onCancel={() => setIsCreating(false)}
                    onSubmit={handleCreateAccount}
                    onSuccess={() => setIsCreating(false)}
                />
            )}
        </div>
    );
};

export default UserManager;


