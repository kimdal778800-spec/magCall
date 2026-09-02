import { getServerSideSitemapLegacy } from 'next-sitemap';
import mysql from 'mysql2/promise';

export async function getServerSideProps(ctx) {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });

    const [shopRows] = await conn.execute(
        'SELECT id FROM massage_shops WHERE is_active = 1 ORDER BY id DESC'
    );
    const [exchangeRows] = await conn.execute('SELECT id FROM partnerExchanges ORDER BY id DESC');
    const [serviceInterRows] = await conn.execute('SELECT id FROM serviceInter ORDER BY id DESC');
    await conn.end();

    const fields = [
        ...shopRows.map((shop) => ({
            loc: `https://msgcall.kr/shops/${shop.id}`,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.8,
        })),
        ...exchangeRows.map((exchange) => ({
            loc: `https://msgcall.kr/exchange/${exchange.id}`,
            lastmod: new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.6,
        })),
        ...serviceInterRows.map((serviceInter) => ({
            loc: `https://msgcall.kr/serviceInter/${serviceInter.id}`,
            lastmod: new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.6,
        })),
    ];

    return getServerSideSitemapLegacy(ctx, fields);
}

export default function SitemapIndex() {}
