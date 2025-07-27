const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

// MIME 타입 정의
const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
};

const server = http.createServer((req, res) => {
  // Vite ping 요청 무시
  if (req.url === "/__vite_ping" || req.url.includes("__vite_ping")) {
    res.writeHead(404);
    res.end();
    return;
  }

  // 기본 파일 설정
  let filePath = "." + req.url;
  if (filePath === "./") {
    filePath = "./index.html";
  }

  // 파일 확장자 확인
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = mimeTypes[extname] || "application/octet-stream";

  // 파일 읽기
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        // 404 에러
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 - File Not Found</h1>", "utf-8");
      } else {
        // 서버 에러
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, "utf-8");
      }
    } else {
      // 성공적으로 파일 전송
      res.writeHead(200, {
        "Content-Type": mimeType,
        "Cache-Control": "no-cache",
      });
      res.end(content, "utf-8");
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 TwoDimensionScroll 서버가 실행됩니다:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://127.0.0.1:${PORT}`);
  console.log("");
  console.log("💡 종료하려면 Ctrl+C 를 누르세요");
});

// 에러 처리
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`❌ 포트 ${PORT}이 이미 사용 중입니다.`);
    console.log("   다른 서버를 종료하거나 다른 포트를 사용해주세요.");
  } else {
    console.log("❌ 서버 에러:", err);
  }
});

// 깔끔한 종료 처리
process.on("SIGINT", () => {
  console.log("\n👋 서버를 종료합니다...");
  server.close(() => {
    console.log("✅ 서버가 정상적으로 종료되었습니다.");
    process.exit(0);
  });
});
