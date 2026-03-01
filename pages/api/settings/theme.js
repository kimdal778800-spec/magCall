import { getConnection } from "@/lib/db";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const conn = await getConnection();
        const [rows] = await conn.execute(
            "SELECT value FROM site_settings WHERE key_name = 'theme'"
        );
        await conn.end();

        const theme = rows.length > 0 ? rows[0].value : "light";
        return res.status(200).json({ theme });
    } catch (err) {
        console.error("테마 조회 오류:", err);
        return res.status(200).json({ theme: "light" });
    }
}
