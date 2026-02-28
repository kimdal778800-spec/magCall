import { parse } from "cookie";
import jwt from "jsonwebtoken";

/**
 * admin API route에서 JWT 인증 및 관리자 레벨을 확인합니다.
 * 인증 실패 시 res에 에러 응답을 보내고 null을 반환합니다.
 * 성공 시 decoded 토큰 객체를 반환합니다.
 */
export function requireAdmin(req, res) {
    try {
        const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
        const token = cookies.token;

        if (!token) {
            res.status(401).json({ message: "인증이 필요합니다." });
            return null;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (Number(decoded.level) !== 99) {
            res.status(403).json({ message: "관리자 권한이 필요합니다." });
            return null;
        }

        return decoded;
    } catch {
        res.status(401).json({ message: "유효하지 않은 인증 토큰입니다." });
        return null;
    }
}
