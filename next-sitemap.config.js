/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://xn--24-vf0jt1u98lggi.com',
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
    ],
    robotsTxtOptions: {
        policies: [
            { userAgent: '*', allow: '/' },
            { userAgent: '*', disallow: ['/admin', '/api'] },
        ],
    },
};
