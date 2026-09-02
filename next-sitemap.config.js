/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://msgcall.kr',
    generateRobotsTxt: true,
    sitemapSize: 7000,
    changefreq: 'daily',
    priority: 0.7,
    exclude: [
        '/admin/*',
        '/api/*',
        '/login',
        '/signup',
        '/signup/complete',
        '/findPassword',
        '/payback-result',
        '/confirmation',
        '/server-sitemap.xml',
    ],
    additionalPaths: async () => [],
    transform: async (config, path) => ({
        loc: path,
        changefreq: config.changefreq,
        priority: config.priority,
        lastmod: new Date().toISOString(),
    }),
    robotsTxtOptions: {
        policies: [
            { userAgent: '*', allow: '/' },
            { userAgent: '*', disallow: ['/admin', '/api'] },
        ],
        additionalSitemaps: [
            'https://msgcall.kr/server-sitemap.xml',
        ],
    },
};
