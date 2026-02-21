export default function Footer() {
    return (
        <footer className="w-full">
            {/* 상단 - 카피라이트 */}
            <div className="bg-[#3a3a3a] text-center py-2.5">
                <p className="text-gray-400 text-xs tracking-widest uppercase">
                    COPYRIGHT@2023 MSGCALL. ALL RIGHTS RESERVED.
                </p>
            </div>

            {/* 중간 - 링크 메뉴 */}
            <div className="bg-[#4a4a4a] py-3 px-6">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
                    {/* 좌측 링크 */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                        {["사이트 소개", "이용약관", "개인정보처리방침", "이메일 무단수집거부", "책임의 한계와 법적고지"].map((item, i) => (
                            <span key={item} className="flex items-center gap-3">
                                {i > 0 && <span className="text-gray-600">/</span>}
                                <a href="#" className="hover:text-white transition">{item}</a>
                            </span>
                        ))}
                    </div>
                    {/* 우측 링크 */}
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        {["이용안내", "문의하기", "모바일버전"].map((item, i) => (
                            <span key={item} className="flex items-center gap-3">
                                {i > 0 && <span className="text-gray-600">/</span>}
                                <a href="#" className="hover:text-white transition">{item}</a>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* 하단 - 키워드 */}
            <div className="bg-[#3a3a3a] py-3 px-6 text-center">
                <p className="text-gray-500 text-xs">
                    🔔 마사지콜: &nbsp;|&nbsp; 출장안마 &nbsp;|&nbsp; 출장마사지 &nbsp;|&nbsp; 24시출장 &nbsp;|&nbsp; 홈타이 &nbsp;
                    <span className="text-gray-600">© All rights reserved.</span>
                </p>
            </div>
        </footer>
    );
}
