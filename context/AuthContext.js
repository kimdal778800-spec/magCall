import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // ✅ 세션 상태 확인
    const checkSession = async () => {
        try {
            const res = await fetch("/api/me", { credentials: "include" });
            const data = await res.json();
            if (res.status === 200 && data.loggedIn) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    // ✅ 페이지 이동마다 세션 재검증
    useEffect(() => {
        const handleRouteChange = async () => {
            await checkSession();
        };
        router.events.on("routeChangeComplete", handleRouteChange);
        return () => router.events.off("routeChangeComplete", handleRouteChange);
    }, [router]);

    // ✅ 로그인
    const login = (userData) => setUser(userData);

    // ✅ 로그아웃
    const logout = async () => {
        try {
            await fetch("/api/logout", { method: "GET", credentials: "include" });
            setUser(null);
            router.replace(router.asPath); // 새로고침 없이 상태 반영
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
