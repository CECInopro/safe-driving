import { useMemo, useState } from 'react';
import '../styles/UserManager.scss';

type User = {
    id: number;
    name: string;
    email: string;
    username: string;
    password: string;
    isActive: boolean;
};

const initialUsers: User[] = [
    { id: 1, name: 'Bùi Tuấn Dũng', email: 'btdung@gmail.com', username: 'admin', password: 'admin', isActive: true },
    { id: 2, name: 'Đỗ Thanh Công', email: 'dtcong@gmail.com', username: 'dtcong123', password: '123456', isActive: false },
    { id: 3, name: 'Vũ Thanh Hoàn', email: 'vthoan@gmail.com', username: 'vthoan', password: '123456', isActive: true },
    { id: 4, name: 'Dương Anh Đức', email: 'daduc@gmail.com', username: 'daduc', password: '123456', isActive: false },
];

const UserManager = () => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [query, setQuery] = useState<string>('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return users;
        return users.filter((u) =>
            [u.name, u.email, u.username].some((f) => f.toLowerCase().includes(q))
        );
    }, [users, query]);

    const toggleActive = (id: number) => {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)));
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
                    <button className="btn btn--primary">+ Thêm</button>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Username</th>
                            <th>Password</th>
                            <th>Is Active</th>
                            <th style={{ width: 120 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((u) => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>{u.username}</td>
                                <td>{u.password}</td>
                                <td>
                                    <label className="switch">
                                        <input type="checkbox" checked={u.isActive} onChange={() => toggleActive(u.id)} />
                                        <span className="slider" />
                                    </label>
                                </td>
                                <td>
                                    <button className="btn btn--small">Sửa</button>
                                    <button className="btn btn--small btn--danger" style={{ marginLeft: 8 }}>Xóa</button>

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManager;


