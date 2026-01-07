import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL as string;

export type Account = {
    accountId: string;
    username: string;
    password: string;
    role: string;
    token: string;
    status: string;
};

export type UpdateAccountPayload = {
    username?: string;
    password?: string;
    status?: string;
    role?: string;
};

export type UpdateAccountResult = {
    success: boolean;
    message?: string;
};

export type CreateAccountPayload = {
    username: string;
    password: string;
    role: string;
};

export const useAccount = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const buildHeaders = useCallback(() => {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "x-request-id": crypto.randomUUID(),
        };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        return headers;
    }, [token]);

    const fetchAccounts = useCallback(async () => {
        if (!token) {
            setAccounts([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${BASE_URL}/api/v1/accounts`, {
                method: "GET",
                headers: buildHeaders(),
            });

            if (!res.ok) {
                throw new Error(`Fetch accounts failed: ${res.status}`);
            }

            const raw = await res.json();
            const list = Array.isArray(raw)
                ? raw
                : Array.isArray(raw?.data)
                    ? raw.data
                    : Array.isArray(raw?.items)
                        ? raw.items
                        : [];

            const normalized: Account[] = list
                .map((a: any) => ({
                    accountId: a.accountId,
                    username: a.username,
                    password: a.password,
                    role: a.role,
                    token: a.token,
                    status: a.status,
                }))
                .filter((a: Account) => !!a.accountId);

            setAccounts(normalized);
        } catch (err: any) {
            console.error("Lỗi lấy danh sách tài khoản:", err);
            setError(err?.message ?? "Lỗi không xác định");
        } finally {
            setLoading(false);
        }
    }, [token, buildHeaders]);

    useEffect(() => {
        if (!token) {
            setAccounts([]);
            return;
        }
        fetchAccounts();
    }, [token, fetchAccounts]);

    const updateAccount = useCallback(
        async (accountId: string, payload: UpdateAccountPayload): Promise<UpdateAccountResult> => {
            if (!token) {
                return { success: false, message: "Chưa đăng nhập" };
            }

            try {
                const res = await fetch(`${BASE_URL}/api/v1/accounts/${accountId}`, {
                    method: "PUT",
                    headers: buildHeaders(),
                    body: JSON.stringify(payload),
                });
                
                const body = await res.json().catch(() => null);

                if (!res.ok) {
                    throw new Error(body?.message ?? `Cập nhật thất bại (${res.status})`);
                }

                setAccounts((prev) =>
                    prev.map((acc) =>
                        acc.accountId === accountId ? { ...acc, ...payload } : acc
                    )
                );

                return { success: true };
            } catch (err: any) {
                console.error("Lỗi cập nhật tài khoản:", err);
                return { success: false, message: err?.message ?? "Không thể cập nhật tài khoản" };
            }
        },
        [token, buildHeaders]
    );

    const deleteAccount = useCallback(
        async (accountId: string): Promise<UpdateAccountResult> => {
            if (!token) {
                return { success: false, message: "Chưa đăng nhập" };
            }

            try {
                const res = await fetch(`${BASE_URL}/api/v1/accounts/${accountId}`, {
                    method: "DELETE",
                    headers: buildHeaders(),
                });

                const body = await res.json().catch(() => null);

                if (!res.ok) {
                    throw new Error(body?.message ?? `Xóa tài khoản thất bại (${res.status})`);
                }

                setAccounts((prev) => prev.filter((acc) => acc.accountId !== accountId));
                return { success: true };
            } catch (err: any) {
                console.error("Lỗi xóa tài khoản:", err);
                return { success: false, message: err?.message ?? "Không thể xóa tài khoản" };
            }
        },
        [token, buildHeaders]
    );

    const createAccount = useCallback(
        async (payload: CreateAccountPayload): Promise<UpdateAccountResult> => {
            if (!token) {
                return { success: false, message: "Chưa đăng nhập" };
            }

            try {
                const res = await fetch(`${BASE_URL}/api/v1/accounts`, {
                    method: "POST",
                    headers: buildHeaders(),
                    body: JSON.stringify(payload),
                });

                const body = await res.json().catch(() => null);

                if (!res.ok) {
                    throw new Error(body?.message ?? `Tạo tài khoản thất bại (${res.status})`);
                }

                const account = body?.data ?? body;
                if (account?.accountId) {
                    setAccounts((prev) => [...prev, account]);
                } else {
                    fetchAccounts();
                }

                return { success: true };
            } catch (err: any) {
                console.error("Lỗi tạo tài khoản:", err);
                return { success: false, message: err?.message ?? "Không thể tạo tài khoản" };
            }
        },
        [token, buildHeaders, fetchAccounts]
    );

    return {
        accounts,
        loading,
        error,
        fetchAccounts,
        updateAccount,
        deleteAccount,
        createAccount,
    };
};
