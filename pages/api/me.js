import { parse } from "cookie";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    try {
        const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
        const token = cookies.token;

        if (!token)
            return res.status(200).json({ loggedIn: false, message: "토큰 없음" });

        // ✅ JWT 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ 유효한 토큰인 경우 사용자 정보 반환
        return res.status(200).json({
            loggedIn: true,
            user: { id: decoded.id, email: decoded.email, name: decoded.name },
        });
    } catch (err) {
        console.error("JWT 검증 실패:", err);
        return res.status(200).json({ loggedIn: false, message: "세션 만료됨" });
    }
}
