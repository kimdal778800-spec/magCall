import { useState } from "react";
import Link from "next/link";
import { motion, useAnimationControls } from "framer-motion";
import PartnersSection from "@/components/PartnersSection";
import TotalPayBack from "@/components/TotalPayBack";

/** 배너에 노출할 이미지 & 링크 (DB 연동 시 이 배열만 교체) */
const logos = [
    { src: "/images/1.png", link: "/shortform/1" },
    { src: "/images/2.png", link: "/shortform/2" },
    { src: "/images/3.png", link: "/shortform/3" },
    { src: "/images/4.png", link: "/shortform/4" },
    { src: "/images/5.png", link: "/shortform/5" },
    { src: "/images/6.png", link: "/shortform/5" },
];

/** 아이템: 정사각형 + 테두리 + hover wiggle */
function LogoItem({ logo }) {
    const controls = useAnimationControls();
    const MotionLink = motion(Link);

    const wiggle = () => {
        const r1 = Math.random() * 6 - 3;
        const r2 = Math.random() * 6 - 3;
        return {
            rotate: [0, r1, r2, 0],
            y: [0, -3, 0],
            transition: { duration: 0.7, ease: "easeInOut" },
        };
    };

    return (
        <MotionLink
            href={logo.link || "#"}
            className="block shrink-0 transition-all duration-500 group-hover:opacity-40 hover:!opacity-100"
            onHoverStart={() => controls.start(wiggle())}
            onHoverEnd={() =>
                controls.start({
                    rotate: 0,
                    y: 0,
                    transition: { duration: 0.2, ease: "easeOut" },
                })
            }
            whileTap={{ scale: 0.95 }}
        >
            <motion.img
                src={logo.src}
                alt="logo"
                initial={{ rotate: 0, y: 0 }}
                animate={controls}
                className="
                h-[120px] w-[120px]
                object-cover object-center
                rounded-xl
                bg-transparent   /* ✅ 완전 투명 */
                transition-all duration-300
                hover:scale-110 hover:brightness-110
              "
            />
        </MotionLink>
    );
}

/** 무한 슬라이더 (왼쪽 → 오른쪽, 화면 꽉 찬 상태에서 시작) */
function InfiniteRightSlider({ items, duration = 90 }) {
    // 트랙을 길게 만들어 초기에 화면을 꽉 채우고, 두 트랙이 서로를 잇게 함
    const REPEAT = 6;
    const track = Array(REPEAT).fill(items).flat();

    return (
        <div className="relative w-full overflow-hidden h-[140px] group">
            {/* 좌/우 페이드 */}
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-blue-50 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-blue-50 to-transparent" />

            {/* 트랙 A: 0% → 100% (오른쪽으로 이동) */}
            <motion.div
                className="absolute left-0 top-0 flex w-max items-center gap-8 pr-8"
                animate={{ x: ["0%", "100%"] }}
                transition={{ repeat: Infinity, duration, ease: "linear" }}
                style={{ willChange: "transform" }}
            >
                {track.map((logo, i) => (
                    <LogoItem key={`A-${i}`} logo={logo} />
                ))}
            </motion.div>

            {/* 트랙 B: -100% → 0% (A 뒤를 자연스럽게 잇기) */}
            <motion.div
                className="absolute left-0 top-0 flex w-max items-center gap-8 pr-8"
                initial={{ x: "-100%" }}
                animate={{ x: ["-100%", "0%"] }}
                transition={{ repeat: Infinity, duration, ease: "linear" }}
                style={{ willChange: "transform" }}
            >
                {track.map((logo, i) => (
                    <LogoItem key={`B-${i}`} logo={logo} />
                ))}
            </motion.div>
        </div>
    );
}

export default function Home() {
    const [images] = useState([
        "/images/20251010_231600.png",
        "/images/20251010_231518.png",
    ]);

    return (
        <div className="bg-blue-50 min-h-screen text-gray-800 font-sans overflow-hidden">
            {/* Hero Section */}
            <section className="h-[60vh] md:h-[50vh] flex flex-col items-center justify-center relative">
                <div className="max-w-7xl mx-auto w-full px-6 flex flex-col md:flex-row items-center justify-between gap-10">
                    {/* Left Text */}
                    <div className="md:w-1/2 text-center md:text-left">
                        <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-snug text-gray-900">
                            정직하고 안전한 곳에서
                            <br />
                            <span className="text-blue-700">페이백 받으세요</span>
                        </h1>
                        <p className="text-gray-700 mb-8 text-base md:text-lg leading-relaxed">
                            잃어버린 거래수수료 환급 받기, 신청 버튼 한 번이면 됩니다!
                        </p>
                        <button className="bg-blue-600 text-white px-8 py-3 rounded-md text-sm font-semibold hover:bg-blue-700 transition">
                            신청하기
                        </button>
                    </div>

                    {/* Right Image */}
                    <div className="md:w-1/2 flex justify-center md:justify-end">
                        <div className="relative">
                            <img
                                src={images[0]}
                                alt="배경"
                                className="rounded-xl shadow-md w-[400px] md:w-[480px] object-cover"
                            />
                            <img
                                src={images[1]}
                                alt="웹사이트 예시"
                                className="absolute -bottom-6 -left-6 w-[300px] md:w-[360px] rounded-lg shadow-lg border border-gray-200"
                            />
                        </div>
                    </div>
                </div>

                {/* 🔥 신청하기 아래: 무한 오른쪽 슬라이더 */}
                <div className="mt-[60px] md:h-[0vh] w-full">
                    <InfiniteRightSlider items={logos} duration={150} />
                </div>
            </section>

            {/* 예상 페이백 섹션 */}
            <TotalPayBack />

            {/* 제휴 거래소 섹션 */}
            <PartnersSection />
        </div>
    );
}
