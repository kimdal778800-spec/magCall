import { useEffect, useState } from "react";

export default function PartnersSection() {
    const [count, setCount] = useState(0);
    const [prices, setPrices] = useState({
        BTC: { price: null, changeRate: null, prevPrice: null },
        ETH: { price: null, changeRate: null, prevPrice: null },
        XRP: { price: null, changeRate: null, prevPrice: null },
        SOL: { price: null, changeRate: null, prevPrice: null },
    });
    const [flash, setFlash] = useState({});
    const targetValue = 632156;
    const USD_RATE = 1360; // ✅ 환율 기준 (1 USD = 1360 KRW)

    // ✅ 숫자 카운트 애니메이션
    useEffect(() => {
        let start = 0;
        const duration = 2000;
        const stepTime = 10;
        const steps = duration / stepTime;
        const increment = targetValue / steps;

        const counter = setInterval(() => {
            start += increment;
            if (start >= targetValue) {
                start = targetValue;
                clearInterval(counter);
            }
            setCount(Math.floor(start));
        }, stepTime);

        return () => clearInterval(counter);
    }, []);

    // ✅ 업비트 WebSocket 연결 (BTC, ETH, XRP, SOL)


    const handleSupportClick = () => {
        window.open("https://t.me/Pay0301", "_blank");
    };


    return (
        <section className="bg-white py-20 border-t border-gray-100">
            {/* ✅ 부드러운 전환 효과 */}
            <style jsx global>{`
                @keyframes flashUp {
                    0% {
                        background-color: rgba(255, 0, 0, 0.15);
                    }
                    100% {
                        background-color: transparent;
                    }
                }
                @keyframes flashDown {
                    0% {
                        background-color: rgba(0, 102, 255, 0.15);
                    }
                    100% {
                        background-color: transparent;
                    }
                }
                .animate-flashUp {
                    animation: flashUp 0.8s ease-in-out;
                }
                .animate-flashDown {
                    animation: flashDown 0.8s ease-in-out;
                }
            `}</style>

            <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between gap-10 px-6">
                {/* 왼쪽 텍스트 */}
                <div className="text-center md:text-left flex-1">

                    <h2
                        className="
                            relative font-bold text-center md:text-left
                            text-[clamp(1.2rem,3.2vw,2rem)]
                            mb-8 leading-snug
                            text-gray-900 tracking-tight
                          "
                    >
                      <span
                          className="
                          font-extrabold bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400
                          bg-[length:200%_auto] bg-clip-text text-transparent
                          animate-gradientMove
                          drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]
                        "
                      >
                        셀퍼럴.kr
                      </span>{" "}
                        이용자 평균 <span className="text-blue-600">페이백 금액</span>은
                    </h2>
                    <p className="text-[clamp(2rem,5vw,3.5rem)]
                              font-extrabold text-pink-500 tracking-tight
                              animate-countPulse
                              drop-shadow-[0_2px_2px_rgba(0,0,0,0.15)]
                            ">
                            {count.toLocaleString()}원
                    </p>
                    <p className="text-gray-600 mb-10">
                        회원님들의 환급 기록을 기반으로 계산한 평균 금액입니다.
                    </p>
                    <p
                        className="
                            relative font-extrabold tracking-tight
                            text-center md:text-left
                            mb-6 leading-tight
                            text-[clamp(1.5rem,4vw,2.8rem)]
                            bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500
                            bg-[length:200%_auto] bg-clip-text text-transparent
                            animate-gradientMove
                            drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]
                          ">
                        상담 받고 <span className="text-yellow-400">잃어버린 거래수수료</span> 환급 받기
                    </p>

                    <button
                        onClick={handleSupportClick}
                        className="bg-blue-600 text-white px-10 py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-blue-700 transition-all shadow-md"
                    >
                        실시간 상담
                    </button>


                </div>

                {/* 오른쪽 이미지 */}
                <div className="flex-1 flex justify-center">
                    <img
                        src="/images/PayBack1.png"
                        alt="셀퍼럴 구조 이미지"
                        className="w-full max-w-md rounded-lg object-contain bg-transparent mix-blend-multiply"
                    />
                </div>
            </div>
            {/* 실시간 지원 말풍선 */}
            <div
                className="fixed left-0.5 -inset-y-0.5 bottom-24 transform translate-y-1/2 p-4 bg-red-300 text-white text-center rounded-lg shadow-xl relative"
                onClick={handleSupportClick} // 클릭 시 텔레그램으로 연결
                style={{ cursor: 'pointer' }} // 클릭할 수 있음을 나타내는 손 모양 커서 추가
            >
                <p className="font-semibold text-lg">도움이 필요하신가요?</p>
                <p className="text-sm mt-2">실시간으로 지원해 드릴 수 있습니다.</p>

                {/* 말풍선 꼬리 */}
                {/*<div className="absolute bottom-[-12px] right-4 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-transparent border-t-blue-600"></div>*/}
            </div>
        </section>
    );
}
