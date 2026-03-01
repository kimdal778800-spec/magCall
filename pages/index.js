"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useAnimationControls } from "framer-motion";
import ShopsSection from "@/components/ShopsSection";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

/** 아이템: 정사각형 + 테두리 + hover wiggle */
function LogoItem({ logo }) {
    const controls = useAnimationControls();
    const MotionLink = motion(Link);
    const isSpecial = logo.isSpecial;

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
            <div className={isSpecial ? "p-[2px] rounded-xl special-border-shimmer" : ""}>
                <motion.img
                    src={logo.src}
                    alt="logo"
                    initial={{ rotate: 0, y: 0 }}
                    animate={controls}
                    className="h-[120px] w-[120px] object-cover object-top rounded-xl bg-white transition-all duration-300 hover:scale-110 hover:brightness-110"
                />
            </div>
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
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-pink-50 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-pink-50 to-transparent" />

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
    const router = useRouter();
    const { user } = useAuth();
    const isAdmin = user && Number(user.level) === 99;
    const [logos, setLogos] = useState([]);
    // ✅ 모바일 감지
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile(); // 최초 실행
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    /** 업체 대표 이미지를 슬라이더에 표시 */
    useEffect(() => {
        const fetchLogos = async () => {
            try {
                const res = await fetch("/api/shops/list");
                const data = await res.json();

                if (data.shops && Array.isArray(data.shops)) {
                    const mapped = data.shops
                        .filter((s) => s.image)
                        .map((s) => ({
                            src: s.image,
                            link: `/shops/${s.id}`,
                            isSpecial: s.is_special == 1,
                        }));
                    setLogos(mapped);
                }
            } catch (err) {
                console.error("슬라이더 데이터 불러오기 오류:", err);
            }
        };

        fetchLogos();
    }, []);

    const handleApplyClick = () => {
        if (!user) {
            router.push("/login"); // 로그인되지 않으면 로그인 페이지로 이동
        } else {
            router.push("/apply"); // 로그인되었으면 신청 페이지로 이동
        }
    };


    return (
        <div className="bg-pink-50 min-h-screen text-gray-800 font-sans overflow-hidden">
            {/* 헤더 높이만큼 패딩 적용 */}
            <div className="pt-[72px]">
                <section className="min-h-[35vh] md:min-h-[30vh] flex flex-col items-center justify-center relative overflow-visible">
                    {/* 반짝이는 별 장식 */}
                    {[
                        { top: "5%",  left: "2%",  size: 32, dur: "1.6s", delay: "0s",    color: "#f472b6", cls: "sparkle-pop" },
                        { top: "18%", left: "8%",  size: 20, dur: "2.0s", delay: "0.3s",  color: "#a78bfa", cls: "sparkle-float" },
                        { top: "2%",  left: "16%", size: 28, dur: "1.4s", delay: "0.7s",  color: "#fb7185", cls: "sparkle-pop" },
                        { top: "22%", left: "24%", size: 18, dur: "2.2s", delay: "0.1s",  color: "#f472b6", cls: "sparkle-float" },
                        { top: "8%",  left: "33%", size: 24, dur: "1.7s", delay: "0.5s",  color: "#fbbf24", cls: "sparkle-pop" },
                        { top: "28%", left: "41%", size: 16, dur: "2.4s", delay: "0.9s",  color: "#a78bfa", cls: "sparkle-float" },
                        { top: "4%",  left: "55%", size: 26, dur: "1.5s", delay: "0.4s",  color: "#f472b6", cls: "sparkle-pop" },
                        { top: "20%", left: "62%", size: 20, dur: "2.1s", delay: "0.8s",  color: "#fb7185", cls: "sparkle-float" },
                        { top: "6%",  left: "72%", size: 30, dur: "1.8s", delay: "0.2s",  color: "#fbbf24", cls: "sparkle-pop" },
                        { top: "24%", left: "80%", size: 18, dur: "2.3s", delay: "0.6s",  color: "#a78bfa", cls: "sparkle-float" },
                        { top: "3%",  left: "88%", size: 34, dur: "1.6s", delay: "1.0s",  color: "#f472b6", cls: "sparkle-pop" },
                        { top: "18%", left: "94%", size: 22, dur: "2.0s", delay: "0.35s", color: "#fb7185", cls: "sparkle-float" },
                        { top: "55%", left: "1%",  size: 26, dur: "1.9s", delay: "0.55s", color: "#fbbf24", cls: "sparkle-pop" },
                        { top: "65%", left: "96%", size: 28, dur: "1.7s", delay: "0.75s", color: "#a78bfa", cls: "sparkle-pop" },
                        { top: "40%", left: "5%",  size: 16, dur: "2.5s", delay: "0.15s", color: "#fb7185", cls: "sparkle-float" },
                        { top: "42%", left: "92%", size: 18, dur: "2.2s", delay: "0.85s", color: "#f472b6", cls: "sparkle-float" },
                    ].map((s, i) => (
                        <svg
                            key={i}
                            className={`${s.cls} absolute pointer-events-none`}
                            style={{ top: s.top, left: s.left, width: s.size, height: s.size, "--dur": s.dur, "--delay": s.delay, filter: `drop-shadow(0 0 6px ${s.color})` }}
                            viewBox="0 0 24 24" fill={s.color}
                        >
                            <path d="M12 2 L13.5 9.5 L21 12 L13.5 14.5 L12 22 L10.5 14.5 L3 12 L10.5 9.5 Z" />
                        </svg>
                    ))}

                    {/* 타이틀 영역 */}
                    <div className="max-w-7xl mx-auto w-full px-4 flex flex-col items-center justify-center z-10 pt-8 pb-4 md:py-12">
                        <p className="text-xs md:text-sm font-semibold tracking-[0.2em] md:tracking-[0.3em] text-pink-400 uppercase mb-2 md:mb-3">
                            MASSAGE CALL
                        </p>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 text-center leading-tight tracking-tight">
                            내 주변의{" "}
                            <span className="relative inline-block">
                                <span className="relative z-10 text-pink-500">빠른 출장</span>
                                <span className="absolute bottom-1 left-0 w-full h-3 bg-pink-100 rounded-full -z-0"></span>
                            </span>{" "}
                            검색
                        </h1>
                        <p className="mt-3 text-xs md:text-base text-gray-500 text-center tracking-wide px-2">
                            지금 바로 가장 가까운 마사지 출장 서비스를 찾아보세요
                        </p>
                    </div>

                    {/* ✅ 아래쪽 무한 슬라이더 (중앙 정렬 유지) */}
                    <div className="mt-[20px] md:mt-[10px] w-full relative">
                        <InfiniteRightSlider items={logos} duration={150} />
                    </div>
                </section>


                {/* 업체 카드 섹션 */}
                <ShopsSection />

            </div>
        </div>
    );
}
