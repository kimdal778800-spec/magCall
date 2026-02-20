// web.js (카페24 Node.js 호스팅용 Next.js 런처)
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 8000; // 콘솔에 표시된 포트 사용
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer((req, res) => handle(req, res)).listen(port, "0.0.0.0", () => {
        console.log(`> Ready on http://0.0.0.0:${port}`);
    });
});
