import { useState, useEffect } from 'react';

const OPIGUIDE_URL = 'https://opiguide.com';

export default function OpiguideBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // 500ms 딜레이 후 등장 (자연스러운 UX)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  if (dismissed) return null;

  return (
    <>
      {/* ── 우하단 플로팅 배너 ── */}
      <div
        className={`
          fixed bottom-6 right-4 z-[9999]
          transition-all duration-500 ease-out
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}
        `}
        style={{ filter: 'drop-shadow(0 8px 24px rgba(225,29,72,0.35))' }}
      >
        <div className="relative">
          {/* 닫기 버튼 */}
          <button
            onClick={() => setDismissed(true)}
            aria-label="배너 닫기"
            className="
              absolute -top-2 -right-2 z-10
              w-5 h-5 rounded-full
              bg-gray-700 hover:bg-gray-600
              text-white text-[10px] font-bold
              flex items-center justify-center
              transition-colors shadow
            "
          >
            ✕
          </button>

          {/* 배너 카드 */}
          <a
            href={OPIGUIDE_URL}
            target="_blank"
            rel="noopener"
            aria-label="OpiGuide - 전국 업소 정보 가이드"
            className="
              block group
              w-[160px] md:w-[190px]
              rounded-2xl overflow-hidden
              bg-gradient-to-br from-rose-600 via-rose-500 to-pink-500
              hover:from-rose-500 hover:via-rose-400 hover:to-pink-400
              transition-all duration-300
              hover:scale-[1.04]
            "
          >
            {/* 상단 글로우 라인 */}
            <div className="h-0.5 bg-gradient-to-r from-white/20 via-white/60 to-white/20" />

            <div className="px-4 py-3.5">
              {/* 로고 + 이름 */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="
                  w-8 h-8 rounded-xl flex-shrink-0
                  bg-white/20 backdrop-blur-sm
                  flex items-center justify-center
                  text-white font-black text-base
                  border border-white/30
                ">
                  O
                </span>
                <span className="text-white font-black text-sm tracking-tight leading-none">
                  OpiGuide
                </span>
              </div>

              {/* 설명 */}
              <p className="text-white/90 text-[11px] leading-snug mb-3 break-keep">
                전국 유흥·마사지·스파<br />
                업소 정보 가이드
              </p>

              {/* CTA 버튼 */}
              <div className="
                flex items-center justify-between
                bg-white/15 hover:bg-white/25
                rounded-lg px-2.5 py-1.5
                transition-colors
              ">
                <span className="text-white font-semibold text-[11px]">
                  정보 확인하기
                </span>
                <span className="text-white/80 text-xs group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* ── 푸터 위 배너 스트립 (항상 노출 = 크롤러 우선 수집) ── */}
      <div className="w-full bg-gradient-to-r from-rose-700 via-rose-600 to-pink-600 py-2.5 px-4">
        <a
          href={OPIGUIDE_URL}
          target="_blank"
          rel="noopener"
          className="
            flex items-center justify-center gap-3
            text-white text-xs md:text-sm
            hover:opacity-90 transition-opacity
            max-w-7xl mx-auto
          "
        >
          <span className="
            w-5 h-5 rounded-md bg-white/25 border border-white/30
            flex items-center justify-center font-black text-xs flex-shrink-0
          ">O</span>
          <span className="font-semibold">OpiGuide</span>
          <span className="text-white/70 hidden sm:inline">—</span>
          <span className="text-white/90 hidden sm:inline">
            전국 유흥·마사지·스파 업소 정보 &amp; 이용 가이드
          </span>
          <span className="
            ml-auto sm:ml-0
            bg-white/20 border border-white/30
            px-3 py-0.5 rounded-full text-xs font-bold
            hover:bg-white/30 transition-colors
          ">
            바로가기 →
          </span>
        </a>
      </div>
    </>
  );
}
