import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { filePath } = req.body;

        if (!filePath) {
            return res.status(400).json({ message: "파일 경로가 필요합니다." });
        }

        // ✅ public 경로 기준으로 실제 파일 경로 구성
        const absolutePath = path.join(process.cwd(), "public", filePath);

        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            console.log("🗑 파일 삭제 완료:", absolutePath);
            return res.status(200).json({ message: "파일 삭제 완료" });
        } else {
            return res.status(404).json({ message: "파일을 찾을 수 없습니다." });
        }
    } catch (err) {
        console.error("❌ 파일 삭제 오류:", err);
        return res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
}
