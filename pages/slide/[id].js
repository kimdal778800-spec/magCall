import { useRouter } from "next/router";
import Head from "next/head";
import DOMPurify from "dompurify";
import "react-quill/dist/quill.snow.css";

export async function getServerSideProps({ params }) {
    const mysql = (await import("mysql2/promise")).default;
    const numericId = Number(params.id);
    if (!numericId) return { notFound: true };

    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });
        const [rows] = await conn.execute(
            "SELECT id, name, content, image, DATE_FORMAT(createdAt, '%Y-%m-%d') AS createdAt FROM links WHERE id = ?",
            [numericId]
        );
        await conn.end();

        if (rows.length === 0) return { notFound: true };

        return { props: { slide: JSON.parse(JSON.stringify(rows[0])) } };
    } catch (err) {
        console.error("슬라이드 조회 오류:", err);
        return { notFound: true };
    }
}

export default function SlideDetail({ slide }) {
    const router = useRouter();
    const canonicalUrl = `https://msgcall.kr/slide/${slide.id}`;
    const plainDescription = (slide.content || "")
        .replace(/<[^>]*>/g, "")
        .slice(0, 150) || slide.name;

    return (
        <>
            <Head>
                <title key="title">{slide.name} | 마사지콜</title>
                <meta key="description" name="description" content={plainDescription} />
                <link key="canonical" rel="canonical" href={canonicalUrl} />
                <meta key="og:title" property="og:title" content={`${slide.name} | 마사지콜`} />
                <meta key="og:description" property="og:description" content={plainDescription} />
                <meta key="og:url" property="og:url" content={canonicalUrl} />
            </Head>

            <div className="min-h-screen bg-gray-50 py-10 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* 뒤로가기 */}
                    <button
                        onClick={() => router.back()}
                        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition"
                    >
                        ← 뒤로가기
                    </button>

                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        {/* 대표 이미지 */}
                        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
                            <img
                                src={slide.image}
                                alt={slide.name}
                                className="w-full h-full object-cover"
                            />
                            {/* 제목 오버레이 */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-6 py-4">
                                <h1 className="text-white text-xl md:text-2xl font-bold">
                                    {slide.name}
                                </h1>
                                <p className="text-white/60 text-xs mt-1">{slide.createdAt}</p>
                            </div>
                        </div>

                        {/* 본문 내용 */}
                        <div className="p-6 md:p-8">
                            {slide.content ? (
                                <div
                                    className="ql-editor slide-content"
                                    dangerouslySetInnerHTML={{ __html: typeof window !== "undefined" ? DOMPurify.sanitize(slide.content) : slide.content }}
                                />
                            ) : (
                                <p className="text-gray-400 text-sm text-center py-8">
                                    내용이 없습니다.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
