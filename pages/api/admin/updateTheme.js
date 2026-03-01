import { getConnection } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    if (!requireAdmin(req, res)) return;

    const { theme } = req.body;
    if (!["light", "dark"].includes(theme)) {
        return res.status(400).json({ message: "유효하지 않은 테마입니다." });
    }

    try {
        const conn = await getConnection();
        await conn.execute(
            "INSERT INTO site_settings (key_name, value) VALUES ('theme', ?) ON DUPLICATE KEY UPDATE value = ?",
            [theme, theme]
        );
        await conn.end();
        return res.status(200).json({ theme });
    } catch (err) {
        console.error("테마 업데이트 오류:", err);
        return res.status(500).json({ message: "서버 오류" });
    }
}
