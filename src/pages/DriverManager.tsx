import React, { useEffect, useState } from 'react';
import '../styles/DriverManager.scss';
const BASE_URL = import.meta.env.VITE_BASE_URL as string;
type Driver = {
    id: string;
    driverId?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    email?: string;
    phone?: string;
    hireDate?: string;
    baseSalary?: number | string;
    imageUrl?: string;
};

const DriverManager: React.FC = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('Male');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [hireDate, setHireDate] = useState('');
    const [baseSalary, setBaseSalary] = useState<string>('1500.0');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);



    const normalizeDriver = (d: any): Driver | null => {
        const id = d?.id ?? d?.driverId ?? d?.driver_id;
        if (!id) return null;
        return {
            id,
            driverId: d?.driverId ?? d?.driver_id ?? id,
            firstName: d?.firstName ?? d?.first_name,
            lastName: d?.lastName ?? d?.last_name,
            dateOfBirth: d?.dateOfBirth ?? d?.date_of_birth,
            gender: d?.gender,
            email: d?.email,
            phone: d?.phone,
            hireDate: d?.hireDate ?? d?.hire_date,
            baseSalary: d?.baseSalary ?? d?.base_salary,
            imageUrl: d?.imageUrl ?? d?.image_url,
        };
    };

    const fetchDrivers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${BASE_URL}/api/v1/drivers`, {
                headers: {
                    'Content-type': 'application/json',
                    'xRequestId': crypto.randomUUID(),
                },
            });
            if (!res.ok) throw new Error(`Fetch drivers failed: ${res.status}`);
            const data = await res.json();
            const payload = data?.data ?? data?.items ?? data;
            const arr = Array.isArray(payload) ? payload : (payload ? [payload] : []);
            const list = arr
                .map(normalizeDriver)
                .filter(Boolean) as Driver[];
            // de-dup by id
            const uniq = Array.from(new Map(list.map(d => [d.id, d])).values());
            setDrivers(uniq);
        } catch (e: any) {
            console.error('Fetch drivers error:', e);
            setError(e?.message || 'Không thể tải danh sách tài xế');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const form = new FormData();
            form.append('firstName', firstName);
            form.append('lastName', lastName);
            if (dateOfBirth) form.append('dateOfBirth', dateOfBirth);
            if (gender) {
                const genderMap: Record<string, string> = {
                    'Male': '1',
                    'Female': '2',
                    'Other': '0'
                };
                const genderValue = genderMap[gender] ?? gender;
                form.append('gender', genderValue);
            }
            if (email) form.append('email', email);
            if (phone) form.append('phone', phone);
            if (hireDate) form.append('hireDate', hireDate);
            if (baseSalary) form.append('baseSalary', baseSalary);
            if (imageFile) form.append('image', imageFile, imageFile.name);
            console.debug('Submitting driver form fields:');
            for (const pair of (form as any).entries()) {
                // pair is [key, value]
                if (pair[1] instanceof File) {
                    console.debug(pair[0], 'File:', (pair[1] as File).name);
                } else {
                    console.debug(pair[0], pair[1]);
                }
            }

            const res = await fetch(`${BASE_URL}/api/v1/drivers`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    // generate a new xRequestId per request
                    'xRequestId': crypto.randomUUID(),
                },
                // body is FormData -> browser will set Content-Type including boundary
                body: form,
            });
            if (!res.ok) {
                const txt = await res.text();
                if (/Duplicate entry .* for key 'staff.email'/i.test(txt)) {
                    throw new Error('Email đã tồn tại, vui lòng dùng email khác.');
                }
                throw new Error(`Tạo tài xế thất bại: ${res.status} ${txt}`);
            }
            // refresh list
            await fetchDrivers();
            // hiển thị thông báo thành công và đóng modal
            setSuccessMessage('Tạo tài xế thành công.');
            setShowForm(false);
            // reset form
            setFirstName('');
            setLastName('');
            setDateOfBirth('');
            setGender('Male');
            setEmail('');
            setPhone('');
            setHireDate('');
            setBaseSalary('1500.0');
            setImageFile(null);
        } catch (e: any) {
            console.error('Create driver error:', e);
            setError(e?.message || 'Không thể tạo tài xế');
        } finally {
            setSubmitting(false);
        }
    };

    // Xóa thông báo sau 4 giây
    useEffect(() => {
        if (!successMessage && !error) return;
        const t = setTimeout(() => {
            setSuccessMessage(null);
            setError(null);
        }, 4000);
        return () => clearTimeout(t);
    }, [successMessage, error]);

    const onDelete = async (id: string) => {
        if (!confirm('Xóa tài xế này?')) return;
        try {
            const res = await fetch(`http://ALB-save-driving-1470058884.ap-southeast-1.elb.amazonaws.com/api/v1/drivers/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error(`Xóa thất bại: ${res.status}`);
            setDrivers(prev => prev.filter(d => d.id !== id));
        } catch (e: any) {
            console.error('Delete driver error:', e);
            alert(e?.message || 'Không thể xóa');
        }
    };

    return (
        <div className="driver-manager">
            <h2>Quản lý tài xế</h2>
            <button style={{ marginBottom: 16 }} onClick={() => setShowForm(true)}>Tạo tài xế mới</button>

            {successMessage && (
                <div
                    className="driver-alert-success"
                    style={{
                        margin: '12px 0',
                        padding: '10px 12px',
                        background: '#e6ffed',
                        border: '1px solid #b7eb8f',
                        color: '#135200',
                        borderRadius: 6,
                    }}
                >
                    {successMessage}
                </div>
            )}
            {error && !showForm && (
                <div
                    className="driver-alert-error"
                    style={{
                        margin: '12px 0',
                        padding: '10px 12px',
                        background: '#fff1f0',
                        border: '1px solid #ffa39e',
                        color: '#a8071a',
                        borderRadius: 6,
                    }}
                >
                    {error}
                </div>
            )}

            {showForm && (
                <div className="driver-form-modal" onClick={() => setShowForm(false)}>
                    <form className="driver-form" onClick={e => e.stopPropagation()} onSubmit={onSubmit}>
                        <div>
                            <label>Họ</label>
                            <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Họ" required />
                        </div>
                        <div>
                            <label>Tên</label>
                            <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Tên" required />
                        </div>
                        <div>
                            <label>Ngày sinh</label>
                            <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
                        </div>
                        <div>
                            <label>Giới tính</label>
                            <select value={gender} onChange={e => setGender(e.target.value)}>
                                <option value="0">Nam</option>
                                <option value="1">Nữ</option>
                                <option value="2">Khác</option>
                            </select>
                        </div>
                        <div>
                            <label>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="@example.com" />
                        </div>
                        <div>
                            <label>SĐT</label>
                            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại" />
                        </div>
                        <div>
                            <label>Ngày tuyển</label>
                            <input type="date" value={hireDate} onChange={e => setHireDate(e.target.value)} />
                        </div>
                        <div>
                            <label>Lương cơ bản</label>
                            <input type="number" step="0.01" value={baseSalary} onChange={e => setBaseSalary(e.target.value)} />
                        </div>
                        <div>
                            <label>Ảnh</label>
                            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                        </div>
                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Hủy</button>
                            <button type="submit" className="submit-btn" disabled={submitting}>{submitting ? 'Đang tạo...' : 'Tạo tài xế'}</button>
                        </div>
                        {error && <div style={{ color: 'red', gridColumn: 'span 2' }}>{error}</div>}
                    </form>
                </div>
            )}

            <table className="driver-table">
                <thead>
                    <tr>
                        <th style={{ textAlign: 'left' }}>ID</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>SĐT</th>
                        <th>Ngày sinh</th>
                        <th>Ngày tuyển</th>
                        <th>Lương</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {loading && <tr><td colSpan={8}>Đang tải...</td></tr>}
                    {!loading && drivers.length === 0 && <tr><td colSpan={8}>Không có dữ liệu</td></tr>}
                    {!loading && drivers.map(d => (
                        <tr key={d.id}>
                            <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.id}</td>
                            <td>{[d.lastName, d.firstName].filter(Boolean).join(' ') || '-'}</td>
                            <td>{d.email || '-'}</td>
                            <td>{d.phone || '-'}</td>
                            <td>{d.dateOfBirth || '-'}</td>
                            <td>{d.hireDate || '-'}</td>
                            <td>{d.baseSalary ?? '-'}</td>
                            <td>
                                <button onClick={() => onDelete(d.id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DriverManager;