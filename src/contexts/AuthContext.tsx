import { createContext, useContext, useEffect, useState, useCallback } from "react";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_API_URL_LOCAL = import.meta.env.VITE_BASE_URL_LOCAL as string;
export const AUTH_STORAGE_KEY = "safe-driving-auth";

export type AuthRole = "ADMIN" | "DRIVER" | string;

export interface AuthUser {
    accountId?: string | null;
    username: string;
    role: AuthRole;
    token: string;
    refreshToken?: string | null;
    staffId?: string | null;
}

export interface LoginResult {
    success: boolean;
    message?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    login: (username: string, password: string) => Promise<LoginResult>;
    logout: () => void;
    fetchAccounts: () => Promise<any[] | null>;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

//  Tạo context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (role?: string | null) => (role ? role.toUpperCase() : "DRIVER");

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(() => {
        if (typeof window === "undefined") return null;
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!stored) return null;
        try {
            const parsed = JSON.parse(stored) as AuthUser;
            if (parsed?.token) return parsed;
        } catch (err) {
            console.warn("Không thể đọc thông tin đăng nhập đã lưu:", err);
        }
        return null;
    });

    //  Lưu user vào localStorage mỗi khi thay đổi
    useEffect(() => {
        if (!user) localStorage.removeItem(AUTH_STORAGE_KEY);
        else localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }, [user]);

    const login = useCallback(async (username: string, password: string): Promise<LoginResult> => {
        const requestId = "111";

        try {
            const response = await fetch(`${BASE_API_URL_LOCAL}/api/v1/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "x-request-id": requestId,
                },
                body: JSON.stringify({ username, password }),
            });

            const body = await response.json().catch(() => null);

            if (!response.ok) {
                return {
                    success: false,
                    message: body?.message ?? `Đăng nhập thất bại (${response.status})`,
                };
            }

            //  Lấy token
            const token = body?.data?.token ?? body?.token;
            if (!token) {
                return { success: false, message: "Không tìm thấy token trong phản hồi đăng nhập" };
            }

            const role = body?.data?.role ?? body?.role ?? (username === "admin" ? "ADMIN" : "DRIVER");
            const accountId = body?.data?.accountId ?? body?.accountId ?? null;

            const normalizedUser: AuthUser = {
                accountId,
                username,
                role: normalizeRole(role),
                token,
            };

            setUser(normalizedUser);
            return { success: true };
        } catch (err: any) {
            console.error("Lỗi đăng nhập:", err);
            return { success: false, message: err?.message ?? "Không thể kết nối máy chủ" };
        }
    }, []);


    const fetchAccounts = useCallback(async (): Promise<any[] | null> => {
        if (!user?.token) {
            console.warn("Chưa đăng nhập hoặc thiếu token");
            return null;
        }

        const url = `${BASE_API_URL.replace(/\/$/, "")}/api/v1/accounts`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Authorization": `Bearer ${user.token}`,
                    "x-request-id": "111",
                },
            });

            const body = await response.json().catch(() => null);

            if (!response.ok || !body?.success) {
                console.error("Không thể tải danh sách tài khoản:", body);
                return null;
            }

            return body.data ?? [];
        } catch (err) {
            console.error("Lỗi khi lấy danh sách tài khoản:", err);
            return null;
        }
    }, [user]);

    const logout = useCallback(() => {
        setUser(null);
    }, []);

    const value: AuthContextType = {
        user,
        token: user?.token ?? null,
        login,
        logout,
        fetchAccounts,
        isAuthenticated: !!user?.token,
        isAdmin: normalizeRole(user?.role) === "ADMIN",
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
