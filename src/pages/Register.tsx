// import React from "react";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import '../styles/Register.scss';

// const BASE_URL = import.meta.env.VITE_BASE_URL as string;

// const Register: React.FC = () => {
//     const roleOptions = ["MANAGER", "DRIVER"];
//     const navigate = useNavigate();
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const [role, setRole] = useState("DRIVER");
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleRegister = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setError('');

//         if (!username.trim() || !password || !confirmPassword) {
//             setError("Vui lòng nhập đầy đủ thông tin");
//             return;
//         }

//         if (password !== confirmPassword) {
//             setError("Xác nhận mật khẩu không khớp");
//             return;
//         }
//         if (password.length < 6) {
//             setError("Mật khẩu phải có 6 ký tự trở lên");
//             return;
//         }
//         try {
//             setLoading(true);
//             const res = await fetch(`${BASE_URL}/api/v1/accounts`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "x-request-id": "111"
//                 },
//                 body: JSON.stringify({
//                     username: username.trim(),
//                     password: password,
//                     role: role.toUpperCase()
//                 })
//             });

//             const data = await res.json();

//             if (!res.ok) {
//                 setError(data?.message || "Có lỗi xảy ra")
//                 return;
//             }
//             navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } });
//         } catch (err: any) {
//             setError(err.message || "Có lỗi xảy ra");
//         } finally {
//             setLoading(false);
//         }
//     }

//     return (
//         <div className='welcome-container'>
//             <div className='register-container'>
//                 <img src="/images/logo.png" alt="Logo" className="register-logo" />
//                 <form className='register-form'>
//                     <h1 className='register-title'>Đăng ký</h1>
//                     {error && <p className="error-text">{error}</p>}

//                     <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên đăng nhập" className='register-input' />
//                     <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" className='register-input' />
//                     <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Xác nhận mật khẩu" className='register-input' />
//                     <select className="register-input" value={role} onChange={(e) => setRole(e.target.value)}>
//                         {roleOptions.map((option) => (
//                             <option key={option} value={option}>
//                                 {option}
//                             </option>
//                         ))}
//                     </select>
//                     <button type="submit" className='register-button' onClick={handleRegister}>Đăng ký</button>
//                     <button onClick={() => navigate('/login')} type="button" className='register-login'>Đăng nhập</button>
//                 </form>
//             </div>
//         </div>
//     );
// }

// export default Register;