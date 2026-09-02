// pages/serviceInter/[id].js
import { useRouter } from "next/router";
import Head from "next/head";
import DOMPurify from "dompurify";

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
            "SELECT * FROM serviceInter WHERE id = ?",
            [numericId]
        );
        await conn.end();

        if (rows.length === 0) return { notFound: true };

        return { props: { serviceInter: JSON.parse(JSON.stringify(rows[0])) } };
    } catch (err) {
        console.error("❌ DB 조회 오류:", err);
        return { notFound: true };
    }
}

export default function ServiceInterDetail({ serviceInter }) {
    const router = useRouter();
    const canonicalUrl = `https://msgcall.kr/serviceInter/${serviceInter.id}`;
    const plainDescription = (serviceInter.description || "")
        .replace(/<[^>]*>/g, "")
        .slice(0, 150) || `${serviceInter.name} - 마사지콜 서비스 소개`;

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 pt-[100px]">
            <Head>
                <title key="title">{serviceInter.name} | 마사지콜</title>
                <meta key="description" name="description" content={plainDescription} />
                <link key="canonical" rel="canonical" href={canonicalUrl} />
                <meta key="og:title" property="og:title" content={`${serviceInter.name} | 마사지콜`} />
                <meta key="og:description" property="og:description" content={plainDescription} />
                <meta key="og:url" property="og:url" content={canonicalUrl} />
            </Head>

            {/* 상단 제목만 남기기 */}
            <div className="flex justify-center items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">
                    {serviceInter.name}
                </h1>
            </div>

            {/* 서비스 소개 설명 */}
            <div className="mb-12">
                <div
                    className="prose max-w-none ql-editor"
                    dangerouslySetInnerHTML={{ __html: typeof window !== "undefined" ? DOMPurify.sanitize(serviceInter.description) : serviceInter.description }}
                ></div>
            </div>

            {/* ✅ 하단 오른쪽에 돌아가기 버튼 */}
            <div className="flex justify-end">
                <button
                    onClick={() => {
                        router.push("/"); // ✅ 목록 페이지로 이동
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md shadow-sm font-medium"
                >
                    ← 돌아가기
                </button>
            </div>
        </div>
    );
}
