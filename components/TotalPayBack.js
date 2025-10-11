import {useEffect, useState} from "react";

export default function PartnersSection() {
    const [count, setCount] = useState(0);
    const targetValue = 685842;

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


    return (
<section className="bg-white py-20 border-t border-gray-100 text-center">
    <div className="max-w-4xl mx-auto px-6">
        <p className="text-sm text-blue-600 mb-3 font-medium tracking-wide">
            예상 페이백 통계
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            셀퍼럴 이용자 평균 페이백 금액은
        </h2>

        {/* 홍당무색 숫자 */}
        <p
            className="text-5xl font-extrabold mb-6 transition-all duration-500"
            style={{ color: "#FF6B6B" }}
        >
            {count.toLocaleString()}원
        </p>

        <p className="text-gray-500 mb-10">
            회원님의 거래 기록을 기반으로 자동 계산된 예상 금액입니다.
        </p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-md text-sm font-semibold hover:bg-blue-700 transition">
            내 예상 페이백 확인하기
        </button>
    </div>
</section>
);
}