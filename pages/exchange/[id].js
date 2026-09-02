// pages/exchange/[id].js
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
            "SELECT * FROM partnerExchanges WHERE id = ?",
            [numericId]
        );
        await conn.end();

        if (rows.length === 0) return { notFound: true };

        return { props: { exchange: JSON.parse(JSON.stringify(rows[0])) } };
    } catch (err) {
        console.error("❌ DB 조회 오류:", err);
        return { notFound: true };
    }
}

export default function ExchangeDetail({ exchange }) {
    const router = useRouter();
    const canonicalUrl = `https://msgcall.kr/exchange/${exchange.id}`;
    const description = `${exchange.name} 페이백 ${exchange.rate ?? ""}% 할인 ${exchange.discount ?? ""}% - 마사지콜 제휴 거래소 안내`;

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 pt-[100px]">
            <Head>
                <title key="title">{exchange.name} 페이백 안내 | 마사지콜</title>
                <meta key="description" name="description" content={description} />
                <link key="canonical" rel="canonical" href={canonicalUrl} />
                <meta key="og:title" property="og:title" content={`${exchange.name} 페이백 안내 | 마사지콜`} />
                <meta key="og:description" property="og:description" content={description} />
                <meta key="og:url" property="og:url" content={canonicalUrl} />
            </Head>

            {/* 상단 제목만 남기기 */}
            <div className="flex justify-center items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">
                    {exchange.name} 상세정보
                </h1>
            </div>

            {/* 거래소 로고 */}
            {exchange.logo && (
                <div className="flex justify-center mb-10">
                    <img
                        src={exchange.logo}
                        alt={exchange.name}
                        className="w-48 h-48 object-contain border rounded-xl p-4 bg-white shadow-sm"
                    />
                </div>
            )}

            {/* 주요 정보 테이블 */}
            <table className="w-full border border-gray-300 mb-10 text-sm md:text-base">
                <tbody>
                <tr className="border-b">
                    <th className="text-red-300 w-40 p-3 text-left font-semibold">
                        거래소명 :
                    </th>
                    <td className="p-3">{exchange.name}</td>
                </tr>
                <tr className="border-b">
                    <th className="text-red-300 p-3 text-left font-semibold">
                        페이백 (%) :
                    </th>
                    <td className="p-3">{exchange.rate}</td>
                </tr>
                <tr className="border-b">
                    <th className="text-red-300 p-3 text-left font-semibold">
                        할인 (%) :
                    </th>
                    <td className="p-3">{exchange.discount}</td>
                </tr>
                <tr className="border-b">
                    <th className="text-red-300 p-3 text-left font-semibold">
                        지정가 수수료 :
                    </th>
                    <td className="p-3">{exchange.fee1}</td>
                </tr>
                <tr>
                    <th className="text-red-300 p-3 text-left font-semibold">
                        시장가 수수료 :
                    </th>
                    <td className="p-3">{exchange.fee2}</td>
                </tr>
                </tbody>
            </table>

            {/* 거래소 설명 */}
            <div className="mb-12">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">거래소 설명</h2>

                <div
                    className="prose max-w-none ql-editor"
                    dangerouslySetInnerHTML={{ __html: typeof window !== "undefined" ? DOMPurify.sanitize(exchange.description) : exchange.description }}
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
