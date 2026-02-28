import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

const TABS = [
    { code: "all", label: "전체", icon: "🏠" },
    { code: "massage", label: "출장마사지", icon: "🧖" },
    { code: "theme", label: "테마별샵", icon: "💝" },
];

const REGIONS = [
    { code: "all", label: "전체", subs: [] },
    { code: "seoul_g", label: "서울-강남", subs: [
        { code: "gangnam", label: "강남" }, { code: "yeoksam", label: "역삼" },
        { code: "seocho", label: "서초" }, { code: "jamsil", label: "잠실" },
        { code: "songpa", label: "송파" }, { code: "banpo", label: "반포" },
        { code: "nonhyeon", label: "논현" },
    ]},
    { code: "seoul_ng", label: "서울-비강남", subs: [
        { code: "hongdae", label: "홍대" }, { code: "sinchon", label: "신촌" },
        { code: "guro", label: "구로" }, { code: "yongsan", label: "용산" },
        { code: "gangdong", label: "강동" }, { code: "gangbuk", label: "강북" },
        { code: "gangseo", label: "강서" }, { code: "gwanak", label: "관악" },
        { code: "gwangjin", label: "광진" }, { code: "geumcheon", label: "금천" },
        { code: "nowon", label: "노원" }, { code: "dobong", label: "도봉" },
        { code: "dongdaemun", label: "동대문" }, { code: "dongjak", label: "동작" },
        { code: "mapo", label: "마포" }, { code: "seodaemun", label: "서대문" },
        { code: "seongbuk", label: "성북" }, { code: "yangcheon", label: "양천" },
        { code: "yeongdeungpo", label: "영등포" }, { code: "eunpyeong", label: "은평" },
        { code: "jongno", label: "종로" }, { code: "junggu", label: "중구" },
        { code: "jungnang", label: "중랑" }, { code: "seongdong", label: "성동" },
    ]},
    { code: "incheon", label: "인천", subs: [
        { code: "ic_jung", label: "중구" }, { code: "ic_dong", label: "동구" },
        { code: "michuhol", label: "미추홀구" }, { code: "yeonsu", label: "연수구" },
        { code: "namdong", label: "남동구" }, { code: "bupyeong", label: "부평구" },
        { code: "gyeyang", label: "계양구" }, { code: "ic_seo", label: "서구" },
        { code: "ganghwa", label: "강화군" }, { code: "ongjin", label: "옹진군" },
        { code: "bucheon", label: "부천" },
    ]},
    { code: "gyeonggi", label: "경기", subs: [
        { code: "suwon", label: "수원" }, { code: "bundang", label: "분당" },
        { code: "ilsan", label: "일산" }, { code: "pyeongtaek", label: "평택" },
        { code: "seongnam", label: "성남" }, { code: "goyang", label: "고양" },
        { code: "gwangju_g", label: "광주" }, { code: "gwangmyeong", label: "광명" },
        { code: "guri", label: "구리" }, { code: "gunpo", label: "군포" },
        { code: "gimpo", label: "김포" }, { code: "paju", label: "파주" },
        { code: "namyangju", label: "남양주" }, { code: "siheung", label: "시흥" },
        { code: "ansan", label: "안산" }, { code: "anseong", label: "안성" },
        { code: "anyang", label: "안양" }, { code: "yangju", label: "양주" },
        { code: "yeoju", label: "여주" }, { code: "osan", label: "오산" },
        { code: "yongin", label: "용인" }, { code: "uijeongbu", label: "의정부" },
        { code: "icheon", label: "이천" }, { code: "hanam", label: "하남" },
        { code: "hwaseong", label: "화성" }, { code: "dongducheon", label: "동두천" },
        { code: "pocheon", label: "포천" }, { code: "uiwang", label: "의왕" },
        { code: "dongtan", label: "동탄" }, { code: "songtan", label: "송탄" },
    ]},
    { code: "daejeon", label: "대전-충청", subs: [
        { code: "daejeon", label: "대전" }, { code: "cheonan", label: "천안" },
        { code: "cheongju", label: "청주" }, { code: "sejong", label: "세종" },
        { code: "seosan", label: "서산" }, { code: "dangjin", label: "당진" },
        { code: "boryeong", label: "보령" }, { code: "jincheon", label: "진천" },
        { code: "asan", label: "아산" }, { code: "chungju", label: "충주" },
        { code: "jecheon", label: "제천" }, { code: "hongseong", label: "홍성" },
        { code: "nonsan", label: "논산" }, { code: "ochang", label: "오창" },
        { code: "eumseong", label: "음성" }, { code: "gongju", label: "공주" },
        { code: "buyeo", label: "부여" }, { code: "taean", label: "태안" },
    ]},
    { code: "busan", label: "부산-경남", subs: [
        { code: "busan", label: "부산" }, { code: "ulsan", label: "울산" },
        { code: "yangsan", label: "양산" }, { code: "masan", label: "마산" },
        { code: "changwon", label: "창원-진해" }, { code: "gimhae", label: "김해-거제" },
        { code: "jinju", label: "진주" }, { code: "sacheon", label: "사천" },
    ]},
    { code: "daegu", label: "대구-경북", subs: [
        { code: "daegu", label: "대구" }, { code: "gumi", label: "구미" },
        { code: "pohang", label: "포항" }, { code: "gyeongju", label: "경주" },
        { code: "gyeongsan", label: "경산" }, { code: "uljin", label: "울진" },
        { code: "hyeonpung", label: "현풍" }, { code: "andong", label: "안동" },
        { code: "gimcheon", label: "김천" },
    ]},
    { code: "gangwon", label: "강원-제주-전라", subs: [
        { code: "gunsan", label: "군산" }, { code: "jeonju", label: "전주" },
        { code: "iksan", label: "익산" }, { code: "jeongeup", label: "정읍" },
        { code: "yeosu", label: "여수-순천" }, { code: "mokpo", label: "목포" },
        { code: "gwangyang", label: "광양" }, { code: "wonju", label: "원주" },
        { code: "chuncheon", label: "춘천" }, { code: "jeju", label: "제주" },
        { code: "gangneung", label: "강릉" }, { code: "sokcho", label: "속초" },
        { code: "gwangju_j", label: "광주" },
    ]},
];

const THEME_TYPE_LABELS = {
    korean: "한국",
    japanese: "일본/혼혈",
    thai: "태국",
    chinese: "중국",
    todaki: "토닥이",
};

export { REGIONS, TABS };

function formatPhone(phone) {
    if (!phone) return "";
    const d = phone.replace(/\D/g, "");
    if (d.length <= 3) return d;
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
}

function getRegionLabel(regionCode, subCode) {
    const r = REGIONS.find((r) => r.code === regionCode);
    if (!r) return "";
    if (subCode) {
        const s = r.subs.find((s) => s.code === subCode);
        return s ? `${r.label} · ${s.label}` : r.label;
    }
    return r.label;
}

export default function ShopsSection() {
    const [shops, setShops] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [activeRegion, setActiveRegion] = useState("all");
    const [selectedSubs, setSelectedSubs] = useState([]);
    const { user } = useAuth();
    const isAdmin = user && Number(user.level) === 99;
    const router = useRouter();

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const res = await fetch("/api/shops/list");
                const data = await res.json();
                setShops(data.shops || []);
            } catch (err) {
                console.error("업체 목록 불러오기 오류:", err);
            }
        };
        fetchShops();
    }, []);

    // 모바일 메뉴에서 전달된 URL 쿼리 파라미터로 필터 초기화
    useEffect(() => {
        if (!router.isReady) return;
        const { tab, region, subs } = router.query;
        if (tab) setActiveTab(tab);
        if (region) setActiveRegion(region);
        if (subs) setSelectedSubs(subs.split(",").filter(Boolean));
    }, [router.isReady, router.query]);

    const currentRegion = REGIONS.find((r) => r.code === activeRegion);

    const handleRegionClick = (code) => {
        setActiveRegion(code);
        setSelectedSubs([]);
    };

    const toggleSub = (code) => {
        setSelectedSubs((prev) =>
            prev.includes(code) ? prev.filter((s) => s !== code) : [...prev, code]
        );
    };

    const filtered = shops.filter((shop) => {
        const tabMatch = activeTab === "all" || shop.category === activeTab;
        const regionMatch = activeRegion === "all" || shop.region === activeRegion;
        const subMatch = selectedSubs.length === 0 || selectedSubs.includes(shop.sub_region);
        return tabMatch && regionMatch && subMatch;
    });

    return (
        <section id="shops">
            {/* 이모지 탭 */}
            <div className="bg-pink-200 -mt-[70px] pt-5 pb-4 md:mt-0 md:pt-8 md:pb-6 sticky top-[64px] z-30">
                <div className="flex justify-center gap-3 md:gap-5 px-4 md:px-6 mb-4 md:mb-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab.code}
                            onClick={() => setActiveTab(tab.code)}
                            style={activeTab === tab.code ? {
                                boxShadow: "0 0 0 2px #ec4899, 0 0 18px 4px rgba(236,72,153,0.4)"
                            } : {}}
                            className={`flex flex-col items-center justify-center gap-1 md:gap-2 w-[72px] h-[72px] md:w-24 md:h-24 rounded-xl md:rounded-2xl transition-all duration-200 border-2 ${
                                activeTab === tab.code
                                    ? "bg-pink-400 border-pink-600 text-white"
                                    : "bg-pink-50 border-pink-300 text-gray-600 hover:border-pink-500 hover:text-pink-700"
                            }`}
                        >
                            <span className="text-2xl md:text-4xl leading-none">{tab.icon}</span>
                            <span className="text-[10px] md:text-xs font-bold tracking-wide">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* 지역 필터 */}
                <div className="max-w-5xl mx-auto px-3 md:px-6">
                    <div className="bg-pink-300 rounded-xl md:rounded-2xl p-3 md:p-4">
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                            {REGIONS.map((r) => (
                                <button
                                    key={r.code}
                                    onClick={() => handleRegionClick(r.code)}
                                    className={`px-2.5 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-semibold border transition-all ${
                                        activeRegion === r.code
                                            ? "border-pink-600 text-white bg-pink-500"
                                            : "border-pink-400 text-pink-900 bg-pink-100 hover:border-pink-600 hover:bg-pink-200"
                                    }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>

                        {/* 상세 구역 */}
                        {currentRegion && currentRegion.subs.length > 0 && (
                            <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-pink-400">
                                <div className="flex items-center justify-between mb-2 md:mb-3">
                                    <span className="text-xs text-pink-800 font-semibold flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-pink-600 inline-block" />
                                        상세 구역 (중복 선택 가능)
                                    </span>
                                    {selectedSubs.length > 0 && (
                                        <button
                                            onClick={() => setSelectedSubs([])}
                                            className="text-xs text-pink-800 hover:text-white border border-pink-500 hover:bg-pink-500 px-3 py-1 rounded-full transition"
                                        >
                                            × 전체해제
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {currentRegion.subs.map((sub) => (
                                        <button
                                            key={sub.code}
                                            onClick={() => toggleSub(sub.code)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                                                selectedSubs.includes(sub.code)
                                                    ? "border-pink-600 text-white bg-pink-500"
                                                    : "border-pink-400 text-pink-900 bg-pink-100 hover:border-pink-600 hover:bg-pink-200"
                                            }`}
                                        >
                                            {sub.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 카드 영역 */}
            <div className="bg-gray-50 py-6 md:py-10">
                <div className="max-w-6xl mx-auto px-3 md:px-6">
                    {isAdmin && (
                        <div className="flex justify-end mb-6">
                            <button
                                onClick={() => router.push("/admin/ShopsList")}
                                className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full font-bold text-sm transition shadow-sm"
                            >
                                관리
                            </button>
                        </div>
                    )}

                    {filtered.length === 0 ? (
                        <div className="text-center py-24 text-gray-400">
                            <p className="text-5xl mb-5">🏪</p>
                            <p className="text-lg font-semibold mb-2 text-gray-500">등록된 업체가 없습니다.</p>
                            {isAdmin && (
                                <>
                                    <p className="text-sm mb-8">첫 번째 업체로 등록해보세요!</p>
                                    <button
                                        onClick={() => router.push("/admin/ShopsNew")}
                                        className="bg-pink-500 hover:bg-pink-600 text-white px-10 py-3 rounded-full font-bold transition shadow-md"
                                    >
                                        업체 등록하기
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                            {[...filtered].sort((a, b) => (b.is_special == 1 ? 1 : 0) - (a.is_special == 1 ? 1 : 0)).map((shop, idx) => {
                                const gradients = [
                                    "from-pink-400 via-fuchsia-400 to-blue-400",
                                    "from-blue-400 via-cyan-400 to-pink-400",
                                    "from-fuchsia-500 via-pink-400 to-indigo-400",
                                    "from-indigo-400 via-blue-400 to-pink-500",
                                ];
                                const grad = gradients[idx % gradients.length];
                                const isSpecial = shop.is_special == 1;
                                return (
                                <div
                                    key={shop.id}
                                    className={`p-[2px] rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
                                        isSpecial
                                            ? "special-border-shimmer shadow-red-200"
                                            : `bg-gradient-to-br ${grad}`
                                    }`}
                                    onClick={() => router.push(`/shops/${shop.id}`)}
                                >
                                <div className="bg-white rounded-[14px] overflow-hidden h-full">
                                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100">
                                        <img
                                            src={shop.image}
                                            alt={shop.name}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {isSpecial && (
                                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                                <span>⭐</span>
                                                <span>스페셜 픽</span>
                                            </div>
                                        )}
                                        {shop.comment_count > 0 && (
                                            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                                    <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223Z" clipRule="evenodd" />
                                                </svg>
                                                {shop.comment_count}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 flex flex-col gap-1.5">
                                        <h3 className="font-bold text-gray-800 text-sm truncate">{shop.name}</h3>
                                        {shop.region && (
                                            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                                <span>📍</span>
                                                {getRegionLabel(shop.region, shop.sub_region)}
                                            </p>
                                        )}
                                        {shop.category && (() => {
                                            const tab = TABS.find((t) => t.code === shop.category);
                                            return tab ? (
                                                <div className="flex flex-wrap gap-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border w-fit ${
                                                        shop.category === "massage"
                                                            ? "bg-pink-50 text-pink-500 border-pink-100"
                                                            : "bg-purple-50 text-purple-500 border-purple-100"
                                                    }`}>
                                                        {tab.label}
                                                    </span>
                                                    {shop.category === "theme" && shop.theme_type && THEME_TYPE_LABELS[shop.theme_type] && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold border w-fit bg-indigo-50 text-indigo-500 border-indigo-100">
                                                            {THEME_TYPE_LABELS[shop.theme_type]}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : null;
                                        })()}
                                        {/* PC: 전화번호 텍스트 + 텔레그램 버튼 */}
                                        {shop.phone && (
                                            <p className="hidden md:flex text-sm font-bold text-pink-500 truncate items-center gap-1">
                                                <span>📞</span>{formatPhone(shop.phone)}
                                            </p>
                                        )}
                                        {shop.telegram && (
                                            <a
                                                href={`https://t.me/${shop.telegram}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="hidden md:flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white py-1.5 rounded-full transition"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                    <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 7.5a2.25 2.25 0 0 0 .126 4.073l3.9 1.205 2.306 6.814a.75.75 0 0 0 1.3.21l2.454-3.188 4.57 3.122a2.25 2.25 0 0 0 3.433-1.6l2.25-16.5a2.25 2.25 0 0 0-2.817-2.851ZM19.86 4.05l-2.025 14.87-4.496-3.073a.75.75 0 0 0-.921.097l-1.43 1.858-1.553-4.584 8.212-7.655a.75.75 0 0 0-.946-1.164L6.58 12.473l-2.72-.84 16.5-7.5a.75.75 0 0 1 .5.917Z" />
                                                </svg>
                                            </a>
                                        )}
                                        {/* 모바일: 전화 + 텔레그램 아이콘 버튼 */}
                                        {(shop.phone || shop.telegram) && (
                                            <div className="flex md:hidden gap-2 mt-0.5">
                                                {shop.phone && (
                                                    <a
                                                        href={`tel:${shop.phone}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex-1 flex items-center justify-center bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-full transition"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                            <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
                                                        </svg>
                                                    </a>
                                                )}
                                                {shop.telegram && (
                                                    <a
                                                        href={`https://t.me/${shop.telegram}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex-1 flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-full transition"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                            <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.5 7.5a2.25 2.25 0 0 0 .126 4.073l3.9 1.205 2.306 6.814a.75.75 0 0 0 1.3.21l2.454-3.188 4.57 3.122a2.25 2.25 0 0 0 3.433-1.6l2.25-16.5a2.25 2.25 0 0 0-2.817-2.851ZM19.86 4.05l-2.025 14.87-4.496-3.073a.75.75 0 0 0-.921.097l-1.43 1.858-1.553-4.584 8.212-7.655a.75.75 0 0 0-.946-1.164L6.58 12.473l-2.72-.84 16.5-7.5a.75.75 0 0 1 .5.917Z" />
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
