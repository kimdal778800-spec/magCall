import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        fetch("/api/settings/theme")
            .then((res) => res.json())
            .then((data) => {
                const t = data.theme || "light";
                setTheme(t);
                applyTheme(t);
            })
            .catch(() => {});
    }, []);

    const applyTheme = (t) => {
        if (t === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        applyTheme(newTheme);

        try {
            await fetch("/api/admin/updateTheme", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ theme: newTheme }),
                credentials: "include",
            });
        } catch (err) {
            console.error("테마 업데이트 오류:", err);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
