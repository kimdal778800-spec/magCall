import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { requireAdmin } from "@/lib/adminAuth";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    if (!requireAdmin(req, res)) return;

    const { url } = req.body;
    if (!url || !/^https?:\/\/.+/.test(url)) {
        return res.status(400).json({ message: "유효하지 않은 URL입니다." });
    }

    try {
        const uploadDir = path.join(process.cwd(), "public", "images", "EditorImage");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const imageBuffer = await fetchImage(url);
        const ext = getExtFromUrl(url);
        const filename = `ext_${Date.now()}${ext}`;
        const filepath = path.join(uploadDir, filename);

        fs.writeFileSync(filepath, imageBuffer);

        return res.status(200).json({ url: `/images/EditorImage/${filename}` });
    } catch (err) {
        console.error("외부 이미지 다운로드 오류:", err);
        return res.status(500).json({ message: "이미지 다운로드 실패" });
    }
}

function fetchImage(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith("https") ? https : http;
        protocol.get(url, { timeout: 10000 }, (response) => {
            if (response.statusCode !== 200) {
                return reject(new Error(`HTTP ${response.statusCode}`));
            }
            const contentType = response.headers["content-type"] || "";
            if (!contentType.startsWith("image/")) {
                return reject(new Error("이미지가 아닌 리소스입니다."));
            }
            const chunks = [];
            response.on("data", (chunk) => chunks.push(chunk));
            response.on("end", () => resolve(Buffer.concat(chunks)));
            response.on("error", reject);
        }).on("error", reject).on("timeout", () => reject(new Error("요청 시간 초과")));
    });
}

function getExtFromUrl(url) {
    const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    try {
        const pathname = new URL(url).pathname;
        const ext = path.extname(pathname).toLowerCase().split("?")[0];
        return allowedExts.includes(ext) ? ext : ".jpg";
    } catch {
        return ".jpg";
    }
}
