import { parse } from "cookie";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    try {
        const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
        const token = cookies.token;

        if (!token) {
            return res.status(401).json({ loggedIn: false, message: "인증 토큰이 없습니다." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.status(200).json({
            loggedIn: true,
            user: {
                id: decoded.id,
                email: decoded.email,
                name: decoded.name,
                level: decoded.level,
            },
        });
    } catch (err) {
        return res
            .status(401)
            .json({ loggedIn: false, message: "세션이 만료되었거나 유효하지 않습니다." });
    }
}
