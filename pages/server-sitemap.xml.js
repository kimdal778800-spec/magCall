import { getServerSideSitemap } from 'next-sitemap';
import mysql from 'mysql2/promise';

export async function getServerSideProps(ctx) {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    });

    const [rows] = await conn.execute(
        'SELECT id, updated_at FROM massage_shops WHERE is_active = 1 ORDER BY id DESC'
    );
    await conn.end();

    const fields = rows.map((shop) => ({
        loc: `https://xn--24-vf0jt1u98lggi.com/shops/${shop.id}`,
        lastmod: shop.updated_at
            ? new Date(shop.updated_at).toISOString()
            : new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.8,
    }));

    return getServerSideSitemap(ctx, fields);
}

export default function SitemapIndex() {}
