import fs from "fs";
import path from "path";

const MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
};

export default function handler(req, res) {
    const { path: pathParts } = req.query;

    // 경로 순회 공격 방지
    const safeParts = pathParts.map((p) => path.basename(p));
    const filePath = path.join(process.cwd(), "public", "images", ...safeParts);

    if (!fs.existsSync(filePath)) {
        return res.status(404).end();
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext];
    if (!mimeType) {
        return res.status(400).end();
    }

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");

    fs.createReadStream(filePath).pipe(res);
}
