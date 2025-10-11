import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // ✅ 로그인 상태 확인 함수
    const checkSession = async () => {
        try {
            const res = await fetch("/api/me");
            const data = await res.json();

            if (data.loggedIn) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error("Session check failed:", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // ✅ 페이지 새로고침 or 첫 렌더링 시 세션 복원
    useEffect(() => {
        checkSession();
    }, []);

    // ✅ 페이지 이동 시마다 세션 재검증 (로그인 유지 안정화)
    useEffect(() => {
        const handleRouteChange = async () => {
            await checkSession();
        };

        router.events.on("routeChangeComplete", handleRouteChange);
        return () => router.events.off("routeChangeComplete", handleRouteChange);
    }, [router]);

    // ✅ 로그인 시: 즉시 Context 반영 (Header 즉시 갱신)
    const login = (userData) => {
        setUser(userData);
    };

    // ✅ 로그아웃 시: 서버 쿠키 삭제 + 상태 초기화 + 홈 리다이렉트
    const logout = async () => {
        try {
            await fetch("/api/logout");
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            setUser(null);
            router.push("/");
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// ✅ 어디서든 useAuth()로 접근 가능
export const useAuth = () => useContext(AuthContext);
