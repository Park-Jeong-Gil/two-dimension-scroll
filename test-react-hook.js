// React Hook import 테스트

console.log("🧪 React Hook import 테스트 시작...\n");

// 1. TwoDimensionScroll 메인 클래스 로드 테스트
console.log("1️⃣ 메인 클래스 import 테스트...");
try {
  const mainModule = require("./dist/index.js");
  console.log("📦 메인 모듈:", Object.keys(mainModule));

  const TwoDimensionScroll =
    mainModule.default || mainModule.TwoDimensionScroll || mainModule;
  console.log("✅ TwoDimensionScroll 클래스:", typeof TwoDimensionScroll);

  if (typeof TwoDimensionScroll === "function") {
    // 인스턴스 생성 테스트
    const instance = new TwoDimensionScroll({ debug: true });
    console.log("✅ 인스턴스 생성 성공:", instance.constructor.name);

    // 메서드 확인
    console.log("✅ getMaxPosition 메서드:", typeof instance.getMaxPosition);
    console.log("✅ scrollTo 메서드:", typeof instance.scrollTo);
  }
} catch (error) {
  console.error("❌ 메인 클래스 로드 실패:", error.message);
}

// 2. React Hook 동적 import 함수 테스트
console.log("\n2️⃣ React Hook import 함수 테스트...");
try {
  // React Hook 파일에서 getTwoDimensionScrollClass 함수를 직접 실행
  const reactHookContent = require("fs").readFileSync(
    "./src/react-hook.js",
    "utf8"
  );

  // 간단한 시뮬레이션
  global.window = {
    TwoDimensionScroll: undefined,
  };

  // require 함수를 모킹
  const originalRequire = require;
  global.require = function (moduleName) {
    if (moduleName === "two-dimension-scroll") {
      const mainModule = originalRequire("./dist/index.js");
      return mainModule;
    }
    return originalRequire.apply(this, arguments);
  };

  console.log("✅ React Hook 로직 시뮬레이션 준비 완료");
} catch (error) {
  console.error("❌ React Hook 테스트 실패:", error.message);
}

// 3. 사용자 안내 메시지
console.log("\n📝 사용자 안내:");
console.log("React 프로젝트에서 다음과 같이 사용하세요:");
console.log("");
console.log("방법 1 (권장): ScrollClass 직접 전달");
console.log("```javascript");
console.log("import TwoDimensionScroll from 'two-dimension-scroll';");
console.log(
  "import { useTwoDimensionScroll } from 'two-dimension-scroll/react';"
);
console.log("");
console.log("const { scrollTo, scrollInfo } = useTwoDimensionScroll(");
console.log("  { duration: 1000 },");
console.log("  { ScrollClass: TwoDimensionScroll }");
console.log(");");
console.log("```");
console.log("");
console.log("방법 2: 전역 스크립트 로드");
console.log("```html");
console.log(
  '<script src="https://unpkg.com/two-dimension-scroll@latest/dist/bundle-simple.js"></script>'
);
console.log("```");
console.log("```javascript");
console.log(
  "import { useTwoDimensionScroll } from 'two-dimension-scroll/react';"
);
console.log("const { scrollTo } = useTwoDimensionScroll({ duration: 1000 });");
console.log("```");
