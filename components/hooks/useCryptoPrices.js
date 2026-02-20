// hooks/useCryptoPrices.js
import { useEffect, useState } from "react";

export default function useCryptoPrices() {
    const [prices, setPrices] = useState({
        BTC: { price: null, changeRate: null },
        ETH: { price: null, changeRate: null },
        XRP: { price: null, changeRate: null },
        SOL: { price: null, changeRate: null },
    });

    const [flash, setFlash] = useState({});
    const [USD_RATE, setUsdRate] = useState(null);

    const getChangeColor = (rate) =>
        rate > 0 ? "text-red-500" : rate < 0 ? "text-blue-500" : "text-gray-500";

    const getFlashClass = (sym) =>
        flash[sym] === "up"
            ? "animate-flashUp"
            : flash[sym] === "down"
                ? "animate-flashDown"
                : "";

    // ✅ 네이버 환율 API (3분마다 자동 갱신)
    useEffect(() => {
        const fetchUsdRate = async () => {
            try {
                const res = await fetch("https://api.manana.kr/exchange/rate.json");
                const data = await res.json();
                const usd = data.find((item) => item.name === "USDKRW=X");
                if (usd?.rate) setUsdRate(usd.rate);
            } catch (err) {
                console.error("🚫 환율 API 오류:", err);
            }
        };

        fetchUsdRate();
        const interval = setInterval(fetchUsdRate, 3 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // ✅ 시세 정보 (서버 캐시된 Upbit 프록시 사용)
    useEffect(() => {
        let prevPrices = {};

        const fetchPrices = async () => {
            try {
                const res = await fetch("/api/upbit");
                const data = await res.json();

                const updated = {};
                data.forEach((coin) => {
                    const sym = coin.market.split("-")[1];
                    const oldPrice = prevPrices[sym]?.price || null;
                    const newPrice = coin.trade_price;

                    if (oldPrice && newPrice !== oldPrice) {
                        setFlash((f) => ({
                            ...f,
                            [sym]: newPrice > oldPrice ? "up" : "down",
                        }));
                        setTimeout(() => {
                            setFlash((f) => ({ ...f, [sym]: null }));
                        }, 800);
                    }

                    updated[sym] = {
                        price: newPrice,
                        changeRate: coin.signed_change_rate,
                    };
                });

                prevPrices = updated;
                setPrices(updated);
            } catch (err) {
                console.error("🚫 업비트 시세 API 오류:", err);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 3000);
        return () => clearInterval(interval);
    }, []);

    return { prices, flash, getFlashClass, getChangeColor, USD_RATE };
}
