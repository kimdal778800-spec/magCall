import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { ids } = req.body;

        // ✅ 유효성 검사
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "삭제할 ID가 없습니다." });
        }

        // ✅ undefined / null 제거
        const validIds = ids.filter((id) => id !== undefined && id !== null);
        if (validIds.length === 0) {
            return res.status(400).json({ message: "유효한 ID가 없습니다." });
        }

        // ✅ DB 연결
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        // ✅ 삭제 대상의 이미지 경로 가져오기
        const placeholders = validIds.map(() => "?").join(",");
        const [rows] = await conn.execute(
            `SELECT id FROM serviceInter WHERE id IN (${placeholders})`,
            validIds
        );

        // ✅ DB에서 삭제
        await conn.execute(
            `DELETE FROM serviceInter WHERE id IN (${placeholders})`,
            validIds
        );

        // ✅ 연결 종료
        await conn.end();

        // ✅ 이미지 파일 삭제 처리
        rows.forEach((row) => {
            try {
                if (row.logo) {
                    // 예: /images/PartnerImage/bingx.webp → 절대 경로로 변환
                    const filePath = path.join(process.cwd(), "public", row.logo);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(`🗑 이미지 삭제 완료: ${filePath}`);
                    }
                }
            } catch (err) {
                console.error(`⚠️ 이미지 삭제 실패 (${row.logo}):`, err.message);
            }
        });

        console.log("✅ 삭제 완료:", validIds);

        return res.status(200).json({
            message: "선택한 거래소 및 이미지가 삭제되었습니다.",
            deleted: validIds,
        });
    } catch (err) {
        console.error("❌ 삭제 중 오류:", err);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
