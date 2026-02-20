import { useRouter } from "next/router";
import { useEffect } from "react";

/**
 * ✅ 페이지 이동 시 스크롤 위치 저장 & 복원
 * (복원 시 부드럽게 0.5초 동안 이동)
 */
export function useScrollRestoration() {
    const router = useRouter();

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!("scrollRestoration" in window.history)) return;

        // 브라우저 기본 스크롤 복원 비활성화
        window.history.scrollRestoration = "manual";

        const positions = {};

        // ✅ 이동 전 위치 저장
        const saveScroll = (url) => {
            positions[url] = window.scrollY;
        };

        // ✅ 이동 후 위치 복원 (0.5초 부드러운 애니메이션)
        const restoreScroll = (url) => {
            const y = positions[url];
            if (y === undefined) return;

            const start = window.scrollY;
            const distance = y - start;
            const duration = 500; // 0.5초

            let startTime = null;

            const smoothScroll = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const ease = 0.5 - Math.cos(progress * Math.PI) / 2; // 부드러운 easeInOut

                window.scrollTo(0, start + distance * ease);

                if (elapsed < duration) {
                    requestAnimationFrame(smoothScroll);
                }
            };

            requestAnimationFrame(smoothScroll);
        };

        router.events.on("routeChangeStart", saveScroll);
        router.events.on("routeChangeComplete", restoreScroll);

        return () => {
            router.events.off("routeChangeStart", saveScroll);
            router.events.off("routeChangeComplete", restoreScroll);
        };
    }, [router]);
}
