// pages/api/upbit.js

// Redis 모듈 없는 환경 대응
let redis = null;
let memoryCache = { data: null, timestamp: 0 };
const CACHE_TTL = 2 * 1000; // 5초

export default async function handler(req, res) {
    try {
        const now = Date.now();

        // ✅ 메모리 캐시 사용 (Redis 없이)
        if (memoryCache.data && now - memoryCache.timestamp < CACHE_TTL) {
            console.log("⚡ 메모리 캐시 사용");
            return res.status(200).json(memoryCache.data);
        }

        // ✅ Upbit API 호출
        console.log("🌐 Upbit API 호출");
        const response = await fetch(
            "https://api.upbit.com/v1/ticker?markets=KRW-BTC,KRW-ETH,KRW-XRP,KRW-SOL"
        );

        if (!response.ok) {
            throw new Error(`Upbit API 오류: ${response.status}`);
        }

        const data = await response.json();

        // ✅ 메모리 캐시 저장
        memoryCache = { data, timestamp: now };

        // ✅ 응답 캐시 헤더 추가
        res.setHeader("Cache-Control", "s-maxage=3, stale-while-revalidate=5");
        res.status(200).json(data);
    } catch (error) {
        console.error("🚫 Upbit 프록시 서버 오류:", error);
        res.status(500).json({ error: "서버 내부 오류" });
    }
}
