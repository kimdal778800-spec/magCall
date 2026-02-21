import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import cookie from "cookie";

// ✅ Next.js가 기본적으로 body를 JSON으로 파싱하지 않도록 설정
export const config = {
    api: { bodyParser: false },
};

// ✅ 배열 형태 필드를 안전하게 문자열로 바꿔주는 헬퍼 함수
const getValue = (v) => (Array.isArray(v) ? v[0] : v);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        // ✅ JWT 인증 확인
        // const cookies = cookie.parse(req.headers.cookie || "");
        // const token = cookies.token;
        //
        // if (!token) {
        //     return res.status(401).json({ message: "로그인이 필요합니다." });
        // }
        //
        // let decoded;
        // try {
        //     decoded = jwt.verify(token, process.env.JWT_SECRET);
        // } catch {
        //     return res.status(401).json({ message: "유효하지 않은 세션입니다." });
        // }
        //
        // // ✅ 관리자만 접근 가능
        // if (decoded.level !== 9) {
        //     return res.status(403).json({ message: "관리자만 접근 가능합니다." });
        // }

        // ✅ formidable 설정
        const uploadDir = path.join(process.cwd(), "public", "images");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const form = new IncomingForm({
            multiples: false,
            uploadDir,
            keepExtensions: true,
        });

        // ✅ FormData 파싱
        const { fields, files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve({ fields, files });
            });
        });

        // ✅ 안전하게 값 추출
        const id = Number(getValue(fields.id));
        const name = getValue(fields.name);
        const content = getValue(fields.content) || "";
        const oldImage = getValue(fields.oldImage);
        const imageFile = files.image
            ? Array.isArray(files.image)
                ? files.image[0]
                : files.image
            : null;

        // ✅ DB 연결
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        let imagePath = oldImage;

        // ✅ 새 이미지가 업로드된 경우
        if (imageFile) {
            const fileName = path.basename(imageFile.filepath);
            imagePath = `/images/${fileName}`;

            // ✅ 기존 이미지 파일 삭제
            if (oldImage) {
                const oldPath = path.join(process.cwd(), "public", oldImage);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                    console.log("🗑 기존 이미지 삭제 완료:", oldPath);
                }
            }
        }

        // ✅ DB 업데이트
        await conn.execute(
            "UPDATE links SET name=?, content=?, image=? WHERE id=?",
            [name, content, imagePath, id]
        );

        await conn.end();

        console.log(`✅ 링크(${id}) 업데이트 완료:`, { name, content: content?.slice(0, 50), imagePath });

        return res.status(200).json({ message: "링크 수정이 완료되었습니다." });
    } catch (error) {
        console.error("❌ 링크 업데이트 오류:", error);
        return res.status(500).json({ message: "서버 오류 발생" });
    }
}
