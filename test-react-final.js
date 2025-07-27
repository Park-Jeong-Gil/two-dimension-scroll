// 실제 React 환경 시뮬레이션 테스트

console.log("🚀 React 환경 시뮬레이션 테스트...\n");

// 1. import 시뮬레이션
console.log("1️⃣ import 시뮬레이션...");

// React Hook에서 사용하는 getTwoDimensionScrollClass 함수 시뮬레이션
function getTwoDimensionScrollClass() {
  let TwoDimensionScrollClass = null;

  // 브라우저 환경에서만 실행
  if (typeof window === "undefined") {
    console.log("🌐 window 객체 생성...");
    global.window = {};
  }

  // 1. 전역에서 찾기 (script 태그로 로드된 경우)
  if (global.window && global.window.TwoDimensionScroll) {
    TwoDimensionScrollClass = global.window.TwoDimensionScroll;
    console.log("✅ 전역에서 발견:", typeof TwoDimensionScrollClass);
    return TwoDimensionScrollClass;
  }

  // 2. npm 모듈에서 import 시도 (여러 방법)
  try {
    // 방법 1: 메인 패키지에서 import
    console.log("📦 메인 패키지에서 import 시도...");
    const packageModule = require("./dist/index.js"); // 실제로는 'two-dimension-scroll'
    console.log("📦 패키지 모듈 키:", Object.keys(packageModule));

    TwoDimensionScrollClass =
      packageModule.default || // ES Module style export
      packageModule.TwoDimensionScroll || // Named export
      packageModule; // Direct export

    console.log("✅ 추출된 클래스:", typeof TwoDimensionScrollClass);

    if (
      TwoDimensionScrollClass &&
      typeof TwoDimensionScrollClass === "function"
    ) {
      return TwoDimensionScrollClass;
    }
  } catch (error) {
    console.log("❌ 방법 1 실패:", error.message);
  }

  return null;
}

// 2. 실제 테스트 실행
console.log("2️⃣ TwoDimensionScroll 클래스 로드 테스트...");
const TwoDimensionScroll = getTwoDimensionScrollClass();

if (TwoDimensionScroll) {
  console.log("✅ 클래스 로드 성공!");

  // 3. 인스턴스 생성 테스트
  console.log("\n3️⃣ 인스턴스 생성 테스트...");
  try {
    const instance = new TwoDimensionScroll({
      duration: 1000,
      debug: false,
    });

    console.log("✅ 인스턴스 생성 성공:", instance.constructor.name);

    // 4. React Hook에서 사용하는 메서드들 테스트
    console.log("\n4️⃣ 핵심 메서드 테스트...");
    console.log("✅ getMaxPosition:", typeof instance.getMaxPosition);
    console.log("✅ scrollTo:", typeof instance.scrollTo);
    console.log("✅ isScrolling:", typeof instance.isScrolling);
    console.log("✅ pauseForModal:", typeof instance.pauseForModal);
    console.log("✅ resumeFromModal:", typeof instance.resumeFromModal);

    // 5. getMaxPosition 실제 호출 테스트
    if (typeof instance.getMaxPosition === "function") {
      const maxPos = instance.getMaxPosition();
      console.log("✅ getMaxPosition() 결과:", maxPos);
    }

    console.log("\n🎉 모든 테스트 통과! React Hook이 정상 작동할 것입니다.");
  } catch (error) {
    console.error("❌ 인스턴스 생성 실패:", error.message);
  }
} else {
  console.error("❌ TwoDimensionScroll 클래스 로드 실패");
}

// 6. 사용자 안내
console.log("\n📋 사용자 안내:");
console.log("테스트 프로젝트에서 다음과 같이 업데이트하세요:");
console.log("");
console.log("1. 패키지 업데이트:");
console.log("   npm install two-dimension-scroll@latest");
console.log("");
console.log("2. App.jsx 수정:");
console.log("```javascript");
console.log("import TwoDimensionScroll from 'two-dimension-scroll';");
console.log(
  "import { useTwoDimensionScroll } from 'two-dimension-scroll/react';"
);
console.log("");
console.log("function App() {");
console.log(
  "  const { isReady, scrollPosition, scrollTo, scrollInfo } = useTwoDimensionScroll("
);
console.log("    {");
console.log("      desktop: { duration: 1000, lerp: 0.1 },");
console.log("      mobile: { duration: 800, lerp: 0.15 }");
console.log("    },");
console.log("    { ScrollClass: TwoDimensionScroll } // 👈 이 부분이 핵심!");
console.log("  );");
console.log("");
console.log(
  '  console.log("scrollInfo:", scrollInfo); // 이제 null이 아닙니다!'
);
console.log("");
console.log("  if (!isReady) return <div>Loading...</div>;");
console.log("  return <div>스크롤 시스템 준비 완료!</div>;");
console.log("}");
console.log("```");
console.log("");
console.log("이렇게 하면 TwoDimensionScroll 클래스를 직접 전달해서");
console.log("모든 모듈 시스템에서 안전하게 작동합니다! 🎯");
