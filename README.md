# TwoDimensionScroll 📱🖱️

가로와 세로 스크롤을 모두 감지하여 부드러운 세로 스크롤로 변환하는 혁신적인 JavaScript 라이브러리입니다.

## ✨ 주요 기능

- **🎯 2차원 스크롤 감지**: 트랙패드나 매직마우스의 가로 스크롤을 자동으로 세로 스크롤로 변환
- **🌊 부드러운 애니메이션**: requestAnimationFrame을 사용한 60fps 부드러운 스크롤
- **📱 모바일 최적화**: 환경별 최적화된 스크롤 경험 (PC/모바일/태블릿)
- **⚛️ React 완벽 지원**: 공식 React Hook과 TypeScript 타입 정의 제공
- **🎭 모달 친화적**: 모달 상태에서 완벽한 스크롤 제어 (바디 차단 + 내부 허용)
- **♿ 접근성 지원**: `prefers-reduced-motion`, 스크린 리더, 키보드 네비게이션 완벽 지원
- **🎛️ 다양한 옵션**: 감도, 지속시간, 이징 함수 등 세밀한 커스터마이징
- **⚡ 고성능**: 메모리 효율적이고 배터리 친화적인 구조
- **🔧 TypeScript 지원**: 완전한 타입 정의 포함

## 🚀 시작하기

### 설치

```bash
npm install two-dimension-scroll
```

### Vanilla JavaScript 사용법

```javascript
// ES Modules (권장)
import TwoDimensionScroll from 'two-dimension-scroll';

// CommonJS
const TwoDimensionScroll = require('two-dimension-scroll').default;

// 기본 설정으로 초기화
const scroll = new TwoDimensionScroll();

// 커스텀 옵션으로 초기화
const scroll = new TwoDimensionScroll({
  duration: 1200,
  horizontalSensitivity: 1.5,
  verticalSensitivity: 1.0,
  debug: true
});
```

### React Hook 사용법

React에서는 **두 가지 방법**을 지원합니다:

> ⚠️ **Vite/Webpack 환경**: 동적 require 미지원으로 **방법 2 (ScrollClass 직접 전달) 필수**  
> 💡 **Create React App**: 방법 1, 2 모두 지원  
> 🔧 **Next.js/SSR**: 방법 2 권장

#### 방법 1: 간단한 사용 (자동 감지) ⚠️ Vite 미지원
```tsx
import { useTwoDimensionScroll } from 'two-dimension-scroll/react';

function App() {
  const { isReady, scrollPosition, scrollTo, scrollInfo } = useTwoDimensionScroll({
    duration: 1200,
    desktop: { lerp: 0.1, sensitivity: 1.2 },
    mobile: { lerp: 0.15, sensitivity: 0.8 }
  });
  // ScrollClass 전달 없이도 자동으로 클래스를 찾아서 작동합니다!
  // ⚠️ 주의: Vite, Webpack 환경에서는 작동하지 않습니다.

  if (!isReady) return <div>Loading...</div>;
```

#### 방법 2: 명시적 전달 (권장, ✅ Vite 호환)
```tsx
import TwoDimensionScroll from 'two-dimension-scroll';
import { useTwoDimensionScroll } from 'two-dimension-scroll/react';

function App() {
  const { isReady, scrollPosition, scrollTo, scrollInfo } = useTwoDimensionScroll(
    {
      duration: 1200,
      desktop: { lerp: 0.1, sensitivity: 1.2 },
      mobile: { lerp: 0.15, sensitivity: 0.8 }
    },
    { ScrollClass: TwoDimensionScroll } // 클래스 직접 전달로 최대 안정성 보장
  );

  if (!isReady) return <div>Loading...</div>;

  return (
    <div>
      <p>현재 위치: {scrollPosition}px</p>
      <button onClick={() => scrollTo(0)}>맨 위로</button>
    </div>
  );
}
```

### CDN 사용

```html
<script src="path/to/dist/bundle-simple.js"></script>
<script>
  const scroll = new TwoDimensionScroll({
    duration: 1000,
    debug: true
  });
</script>
```

## ⚛️ React에서 사용하기

TwoDimensionScroll은 React 환경을 완벽하게 지원하여 최고의 개발 경험을 제공합니다.

### React 설치 및 설정

```bash
# npm으로 설치
npm install two-dimension-scroll

# 또는 yarn으로 설치
yarn add two-dimension-scroll
```

```tsx
// React Hook import
import { 
  useTwoDimensionScroll,
  useModalScroll,
  useScrollToTop,
  useScrollProgress
} from 'two-dimension-scroll/react';
```

### 기본 React Hook 사용법

```tsx
import React from 'react';
import { useTwoDimensionScroll } from 'two-dimension-scroll/react';

function App() {
  const { 
    isReady, 
    scrollPosition, 
    scrollTo, 
    scrollInfo 
  } = useTwoDimensionScroll({
    debug: process.env.NODE_ENV === 'development',
    desktop: {
      duration: 1000,
      lerp: 0.1
    },
    mobile: {
      duration: 800,
      lerp: 0.15
    }
  });

  if (!isReady) {
    return <div>Loading scroll system...</div>;
  }

  return (
    <div>
      <div style={{ height: '200vh' }}>
        <h1>Smooth Scroll with React</h1>
        
        {/* 스크롤 정보 표시 */}
        <div style={{ position: 'fixed', top: 10, right: 10 }}>
          <p>위치: {Math.round(scrollPosition)}px</p>
          <p>진행률: {Math.round((scrollInfo?.progress || 0) * 100)}%</p>
        </div>
        
        {/* 스크롤 제어 버튼 */}
        <button onClick={() => scrollTo(0, 1000)}>
          맨 위로
        </button>
        <button onClick={() => scrollTo(scrollInfo?.maxPosition || 0)}>
          맨 아래로
        </button>
      </div>
    </div>
  );
}
```

### TypeScript 지원

완벽한 TypeScript 지원을 위해 타입 정의를 포함하세요:

```tsx
import { 
  useTwoDimensionScroll, 
  TwoDimensionScrollOptions, 
  ScrollInfo 
} from 'two-dimension-scroll/react';

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const options: TwoDimensionScrollOptions = {
    duration: 1200,
    desktop: {
      lerp: 0.08,
      sensitivity: 1.2
    },
    accessibility: {
      reducedMotion: true,
      keyboardNavigation: true
    }
  };

  const { 
    isReady, 
    scrollPosition, 
    scrollInfo,
    scrollTo,
    disable,
    enable 
  } = useTwoDimensionScroll(options);

  return (
    // JSX 내용
  );
};
```

### 모달과 함께 사용하기

모달이 열린 상태에서 바디 스크롤을 차단하고 모달 내부만 스크롤 가능하게:

```tsx
import { useModalScroll } from 'two-dimension-scroll/react';

function ModalExample() {
  const { isModalOpen, openModal, closeModal } = useModalScroll();

  return (
    <div>
      <button onClick={openModal}>모달 열기</button>
      
      {isModalOpen && (
        <div 
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
        >
          <div 
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              overflow: 'auto',
              maxHeight: '80vh',
              padding: '20px'
            }}
          >
            <h2>스크롤 가능한 모달</h2>
            
            {/* 긴 콘텐츠 */}
            {Array(50).fill(0).map((_, i) => (
              <p key={i}>모달 내부 콘텐츠 {i + 1}</p>
            ))}
            
            <button onClick={closeModal}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Next.js에서 사용하기

SSR 환경에서 안전하게 사용하는 방법:

```tsx
// pages/_app.tsx
import { useEffect } from 'react';
import Script from 'next/script';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      {/* TwoDimensionScroll 라이브러리 로드 */}
      <Script 
        src="/js/bundle-simple.js"
        strategy="beforeInteractive"
      />
      <Component {...pageProps} />
    </>
  );
}

// components/ScrollProvider.tsx
import { useEffect, useState } from 'react';
import { useTwoDimensionScroll } from 'two-dimension-scroll/react';

export function ScrollProvider({ children }) {
  const [isClient, setIsClient] = useState(false);
  
  const { isReady } = useTwoDimensionScroll({
    debug: process.env.NODE_ENV === 'development'
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !isReady) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}

// pages/index.tsx
import { ScrollProvider } from '../components/ScrollProvider';

export default function Home() {
  return (
    <ScrollProvider>
      <div style={{ height: '300vh' }}>
        {/* 페이지 콘텐츠 */}
      </div>
    </ScrollProvider>
  );
}
```

### 스크롤 진행률 추적

실시간 스크롤 진행률을 추적하는 방법:

```tsx
import { useScrollProgress } from 'two-dimension-scroll/react';

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useScrollProgress((data) => {
    setProgress(data.percentage);
  }, 50); // 50ms 스로틀링

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: `${progress}%`,
      height: '4px',
      background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4)',
      transition: 'width 0.1s ease',
      zIndex: 9999
    }} />
  );
}
```

### React Hook API 완전 가이드

#### `useTwoDimensionScroll(options, config)`

```tsx
// 새로운 API (권장)
const {
  // 상태 정보
  instance,           // TwoDimensionScroll 인스턴스
  isReady,           // 초기화 완료 여부
  scrollPosition,    // 현재 스크롤 위치 (실시간)
  scrollInfo,        // 스크롤 상세 정보 { position, maxPosition, progress, isScrolling }
  
  // 제어 함수
  scrollTo,          // (position, duration?) => void
  pauseForModal,     // () => void - 모달용 스크롤 정지
  resumeFromModal,   // () => void - 모달 스크롤 재개
  disable,           // () => void - 스크롤 완전 비활성화
  enable,            // () => void - 스크롤 활성화
  updateOptions,     // (options) => void - 실시간 옵션 변경
  
  // React 전용
  getReactInfo       // () => ReactCompatibilityInfo
} = useTwoDimensionScroll(options, { ScrollClass, deps });

// config 매개변수:
// {
//   ScrollClass?: TwoDimensionScrollClass,  // 클래스 직접 전달 (권장)
//   deps?: DependencyList                   // React 의존성 배열
// }

// 기존 API (하위 호환성)
const { ... } = useTwoDimensionScroll(options, deps);
```

#### `useModalScroll()`

```tsx
const {
  isModalOpen,       // boolean - 모달 상태
  openModal,         // () => void - 모달 열기 + 바디 스크롤 차단
  closeModal,        // () => void - 모달 닫기 + 바디 스크롤 복원
  toggleModal        // () => void - 모달 토글
} = useModalScroll();
```

#### `useScrollToTop()`

```tsx
const scrollToTop = useScrollToTop();

// 사용법
<button onClick={() => scrollToTop(1500)}>
  맨 위로 (1.5초)
</button>
```

#### `useScrollProgress(callback, throttle)`

```tsx
useScrollProgress((data) => {
  console.log('스크롤 진행률:', data.percentage + '%');
  console.log('현재 위치:', data.position);
  console.log('진행률 (0-1):', data.progress);
}, 100); // 100ms 간격으로 호출
```

## 📖 API 문서

### 생성자 옵션

```typescript
interface TwoDimensionScrollOptions {
  // 기본 옵션
  duration?: number;                    // 스무스 스크롤 지속 시간 (기본값: 1000ms)
  easing?: (t: number) => number;       // 이징 함수 (기본값: easeOutCubic)
  horizontalSensitivity?: number;       // 가로 스크롤 감도 (기본값: 1)
  verticalSensitivity?: number;         // 세로 스크롤 감도 (기본값: 1)
  disabled?: boolean;                   // 스크롤 비활성화 여부 (기본값: false)
  debug?: boolean;                      // 디버그 모드 (기본값: false)
  
  // 환경별 최적화 옵션
  desktop?: {
    duration?: number;                  // PC용 애니메이션 지속시간
    lerp?: number;                      // 선형 보간 값 (0-1, 낮을수록 더 부드러움)
    sensitivity?: number;               // 전체적인 감도
    wheelMultiplier?: number;           // 휠 이벤트 배수
    touchMultiplier?: number;           // 터치 이벤트 배수
  };
  mobile?: {
    duration?: number;                  // 모바일용 애니메이션 지속시간
    lerp?: number;                      // 선형 보간 값
    sensitivity?: number;               // 전체적인 감도
    wheelMultiplier?: number;           // 휠 이벤트 배수 (모바일에서는 터치 휠)
    touchMultiplier?: number;           // 터치 이벤트 배수
    touchStopThreshold?: number;        // 터치 정지 임계값
    flingMultiplier?: number;           // 플링 제스처 배수
  };
  tablet?: {
    duration?: number;                  // 태블릿용 애니메이션 지속시간
    lerp?: number;                      // 선형 보간 값
    sensitivity?: number;               // 전체적인 감도
    wheelMultiplier?: number;           // 휠 이벤트 배수
    touchMultiplier?: number;           // 터치 이벤트 배수
  };
  
  // 접근성 옵션
  accessibility?: {
    reducedMotion?: boolean;            // prefers-reduced-motion 자동 감지 (기본값: true)
    screenReader?: boolean;             // 스크린 리더 지원 (기본값: true)
    keyboardNavigation?: boolean;       // 키보드 네비게이션 지원 (기본값: true)
    ariaLiveRegion?: boolean;           // ARIA Live Region 생성 (기본값: true)
    focusManagement?: boolean;          // 포커스 관리 자동화 (기본값: true)
  };
  
  // UI/UX 옵션
  ui?: {
    hideScrollbar?: boolean;            // 스크롤바 숨김 (기본값: true)
    showScrollProgress?: boolean;       // 스크롤 진행률 표시 (기본값: false)
    customScrollbarStyle?: string;      // 커스텀 스크롤바 CSS
  };
}
```

### 메서드

#### 기본 제어 메서드

##### `scrollTo(position: number, options?: object): void`
특정 위치로 부드럽게 스크롤합니다.

```javascript
// 기본 사용법
scroll.scrollTo(1000);        // 1000px 위치로 스크롤

// 옵션과 함께 사용
scroll.scrollTo(1000, { 
  duration: 2000,              // 2초 동안 스크롤
  immediate: false             // 즉시 스크롤 여부
});

// React에서 사용
const { scrollTo } = useTwoDimensionScroll();
scrollTo(0, { duration: 1500 }); // 1.5초 동안 맨 위로
```

##### `on(callback: ScrollCallback): void`
스크롤 이벤트 리스너를 추가합니다.

```javascript
// Vanilla JS
scroll.on((data) => {
  console.log('스크롤 위치:', data.scroll || data.scrollTop);
  console.log('스크롤 방향:', data.direction);
  console.log('이벤트 타입:', data.type);
  console.log('진행률:', data.progress);
});

// React Hook은 자동으로 이벤트를 처리하므로 직접 on/off 호출 불필요
const { scrollPosition, scrollInfo } = useTwoDimensionScroll();
```

##### `updateOptions(options: Partial<TwoDimensionScrollOptions>): void`
실시간으로 옵션을 업데이트합니다.

```javascript
// Vanilla JS
scroll.updateOptions({
  duration: 1500,
  desktop: {
    lerp: 0.05,
    sensitivity: 1.5
  },
  accessibility: {
    reducedMotion: true
  }
});

// React Hook
const { updateOptions } = useTwoDimensionScroll();
updateOptions({ 
  mobile: { duration: 600 } 
});
```

#### 모달 및 상태 제어 메서드

##### `pauseForModal(): void` / `resumeFromModal(): void`
모달 상태에서 스크롤을 제어합니다.

```javascript
// Vanilla JS
function openModal() {
  scroll.pauseForModal();    // 바디 스크롤 차단, 스크롤 위치 저장
  showModal();
}

function closeModal() {
  hideModal();
  scroll.resumeFromModal();  // 바디 스크롤 복원, 위치 복원
}

// React Hook (권장)
const { openModal, closeModal } = useModalScroll();
// 자동으로 pauseForModal/resumeFromModal 처리
```

##### `disable(): void` / `enable(): void`
스크롤을 완전히 비활성화/활성화합니다.

```javascript
// Vanilla JS
scroll.disable();  // 모든 스크롤 이벤트 비활성화
scroll.enable();   // 스크롤 재활성화

// React Hook
const { disable, enable } = useTwoDimensionScroll();
```

#### 정보 조회 메서드

##### `getCurrentPosition(): number` / `getMaxPosition(): number`
현재 및 최대 스크롤 위치를 반환합니다.

```javascript
// Vanilla JS
const current = scroll.getCurrentPosition();
const max = scroll.getMaxPosition();
const progress = current / max;

// React Hook (실시간 자동 업데이트)
const { scrollPosition, scrollInfo } = useTwoDimensionScroll();
console.log('현재 위치:', scrollPosition);
console.log('최대 위치:', scrollInfo.maxPosition);
console.log('진행률:', scrollInfo.progress);
```

##### `getReactCompatibilityInfo(): ReactCompatibilityInfo` (React 전용)
React 환경 정보를 조회합니다.

```javascript
const { getReactInfo } = useTwoDimensionScroll();
const info = getReactInfo();

console.log('React 환경:', info.isReactEnvironment);
console.log('Router 감지:', info.hasReactRouter);
console.log('이벤트 수:', info.eventListenerCount);
```

#### 환경 및 성능 최적화 메서드

##### `updateEnvironmentOptions(environment: string, options: object): void`
특정 환경의 옵션만 업데이트합니다.

```javascript
// 모바일 환경만 별도 최적화
scroll.updateEnvironmentOptions('mobile', {
  duration: 500,
  lerp: 0.2,
  touchStopThreshold: 5
});

// 데스크톱 성능 최적화
scroll.updateEnvironmentOptions('desktop', {
  lerp: 0.08,
  wheelMultiplier: 1.5
});
```

##### `applyPerformancePreset(preset: string): void`
미리 정의된 성능 프리셋을 적용합니다.

```javascript
scroll.applyPerformancePreset('smooth');      // 부드러운 스크롤 우선
scroll.applyPerformancePreset('performance'); // 성능 우선
scroll.applyPerformancePreset('accessibility'); // 접근성 우선
```

#### 정리 및 해제 메서드

##### `destroy(): void`
라이브러리를 완전히 해제합니다.

```javascript
// Vanilla JS
scroll.destroy();

// React Hook은 useEffect cleanup에서 자동 호출
// 수동 호출 시:
const { instance } = useTwoDimensionScroll();
useEffect(() => {
  return () => {
    if (instance) {
      instance.destroy();
    }
  };
}, []);
```

##### `cleanup(): () => void` (React 전용)
React useEffect cleanup 함수를 반환합니다.

```javascript
const { instance } = useTwoDimensionScroll();

useEffect(() => {
  // 다른 초기화 로직...
  
  return instance?.cleanup?.(); // 안전한 cleanup
}, [instance]);
```

## 🎨 이징 함수

라이브러리에 내장된 이징 함수들:

```javascript
import { Easing } from 'two-dimension-scroll';

const scroll = new TwoDimensionScroll({
  easing: Easing.easeInOutCubic  // 사용 가능한 옵션들:
  // Easing.linear
  // Easing.easeInQuad
  // Easing.easeOutQuad
  // Easing.easeInOutQuad
  // Easing.easeInCubic
  // Easing.easeOutCubic
  // Easing.easeInOutCubic
});

// 커스텀 이징 함수
const scroll = new TwoDimensionScroll({
  easing: (t) => t * t * t  // 커스텀 cubic easing
});
```

## 💡 사용 사례 및 실전 예제

### 1. 기본 부드러운 스크롤

```javascript
// Vanilla JS
const scroll = new TwoDimensionScroll({
  duration: 800,
  easing: Easing.easeOutQuad,
  desktop: {
    lerp: 0.1
  },
  mobile: {
    lerp: 0.15
  }
});
```

```tsx
// React Hook
function SmoothScrollApp() {
  const { isReady } = useTwoDimensionScroll({
    duration: 800,
    desktop: { lerp: 0.1 },
    mobile: { lerp: 0.15 }
  });

  return (
    <div style={{ height: '300vh' }}>
      {isReady ? '부드러운 스크롤 준비 완료!' : 'Loading...'}
    </div>
  );
}
```

### 2. 환경별 감도 최적화

```javascript
// Vanilla JS - 세밀한 환경별 설정
const scroll = new TwoDimensionScroll({
  desktop: {
    sensitivity: 1.2,           // PC에서 더 민감하게
    wheelMultiplier: 1.5,       // 휠 스크롤 배수
    duration: 1000
  },
  mobile: {
    sensitivity: 0.8,           // 모바일에서 덜 민감하게
    touchMultiplier: 1.0,       // 터치 스크롤 배수
    duration: 600,
    touchStopThreshold: 5       // 터치 정지 감도
  },
  tablet: {
    sensitivity: 1.0,           // 태블릿 중간값
    duration: 800
  }
});
```

```tsx
// React Hook - 반응형 설정
function ResponsiveScrollApp() {
  const { scrollPosition, updateOptions } = useTwoDimensionScroll({
    desktop: {
      sensitivity: 1.2,
      duration: 1000
    },
    mobile: {
      sensitivity: 0.8,
      duration: 600
    }
  });

  // 화면 크기 변경 시 설정 동적 변경
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        updateOptions({
          mobile: { sensitivity: 0.6 } // 작은 화면에서 더 부드럽게
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateOptions]);

  return <div>현재 스크롤: {scrollPosition}px</div>;
}
```

### 3. 고급 모달 스크롤 제어

```javascript
// Vanilla JS - 정교한 모달 제어
class ModalManager {
  constructor() {
    this.scroll = new TwoDimensionScroll({
      debug: true
    });
    this.modals = [];
  }

  openModal(modalId) {
    this.scroll.pauseForModal();
    this.modals.push(modalId);
    console.log('모달 열림, 바디 스크롤 차단');
  }

  closeModal(modalId) {
    this.modals = this.modals.filter(id => id !== modalId);
    
    if (this.modals.length === 0) {
      this.scroll.resumeFromModal();
      console.log('모든 모달 닫힘, 바디 스크롤 복원');
    }
  }
}
```

```tsx
// React Hook - 중첩 모달 지원
function AdvancedModalApp() {
  const [modals, setModals] = useState([]);
  const { pauseForModal, resumeFromModal } = useTwoDimensionScroll();

  const openModal = useCallback((modalId) => {
    setModals(prev => {
      if (prev.length === 0) {
        pauseForModal(); // 첫 번째 모달일 때만 스크롤 차단
      }
      return [...prev, modalId];
    });
  }, [pauseForModal]);

  const closeModal = useCallback((modalId) => {
    setModals(prev => {
      const newModals = prev.filter(id => id !== modalId);
      if (newModals.length === 0) {
        resumeFromModal(); // 마지막 모달일 때만 스크롤 복원
      }
      return newModals;
    });
  }, [resumeFromModal]);

  return (
    <div>
      <button onClick={() => openModal('modal1')}>모달 1 열기</button>
      <button onClick={() => openModal('modal2')}>모달 2 열기</button>
      
      {modals.includes('modal1') && (
        <Modal onClose={() => closeModal('modal1')}>
          <button onClick={() => openModal('modal2')}>중첩 모달 열기</button>
        </Modal>
      )}
      
      {modals.includes('modal2') && (
        <Modal onClose={() => closeModal('modal2')}>
          중첩된 모달 내용
        </Modal>
      )}
    </div>
  );
}
```

### 4. 실시간 스크롤 진행률 및 네비게이션

```javascript
// Vanilla JS - 섹션 기반 네비게이션
const scroll = new TwoDimensionScroll({
  debug: false
});

const sections = document.querySelectorAll('.section');
let currentSection = 0;

scroll.on((data) => {
  const progress = data.scroll / scroll.limit;
  const percentage = Math.round(progress * 100);
  
  // 진행률 바 업데이트
  document.getElementById('progress-bar').style.width = `${percentage}%`;
  
  // 현재 섹션 감지
  sections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
      if (currentSection !== index) {
        currentSection = index;
        updateNavigation(index);
      }
    }
  });
});

function updateNavigation(activeIndex) {
  document.querySelectorAll('.nav-item').forEach((item, index) => {
    item.classList.toggle('active', index === activeIndex);
  });
}
```

```tsx
// React Hook - 고급 진행률 컴포넌트
function ProgressiveScrollApp() {
  const { scrollPosition, scrollInfo } = useTwoDimensionScroll();
  const [currentSection, setCurrentSection] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const sectionsRef = useRef([]);

  useScrollProgress((data) => {
    setProgress(data.percentage);
  }, 16); // 60fps로 업데이트

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionsRef.current.findIndex(
              ref => ref.current === entry.target
            );
            if (index !== -1) {
              setCurrentSection(index);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionsRef.current.forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {/* 진행률 바 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: '4px',
        backgroundColor: '#007bff',
        zIndex: 1000,
        transition: 'width 0.1s ease'
      }} />
      
      {/* 섹션 네비게이션 */}
      <nav style={{ position: 'fixed', right: 20, top: '50%' }}>
        {[1, 2, 3, 4].map((num, index) => (
          <div 
            key={num}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: currentSection === index ? '#007bff' : '#ccc',
              margin: '8px 0',
              cursor: 'pointer'
            }}
            onClick={() => {
              const section = sectionsRef.current[index]?.current;
              if (section) {
                const top = section.offsetTop;
                scrollTo(top, { duration: 1000 });
              }
            }}
          />
        ))}
      </nav>
      
      {/* 섹션들 */}
      {[1, 2, 3, 4].map((num, index) => (
        <section
          key={num}
          ref={el => sectionsRef.current[index] = { current: el }}
          style={{ height: '100vh', padding: '50px' }}
          className="section"
        >
          <h2>섹션 {num}</h2>
          <p>현재 스크롤 위치: {Math.round(scrollPosition)}px</p>
          <p>스크롤 진행률: {progress}%</p>
        </section>
      ))}
    </div>
  );
}
```

### 5. 접근성 최적화 스크롤

```javascript
// 접근성을 고려한 설정
const accessibleScroll = new TwoDimensionScroll({
  accessibility: {
    reducedMotion: true,        // prefers-reduced-motion 자동 감지
    screenReader: true,         // 스크린 리더 지원
    keyboardNavigation: true,   // 키보드 네비게이션
    ariaLiveRegion: true,       // ARIA 라이브 리전
    focusManagement: true       // 포커스 관리
  },
  desktop: {
    duration: 800              // 적당한 속도
  },
  mobile: {
    duration: 600              // 모바일에서 빠르게
  }
});
```

```tsx
// React - 접근성 친화적 스크롤
function AccessibleScrollApp() {
  const { scrollTo, scrollPosition } = useTwoDimensionScroll({
    accessibility: {
      reducedMotion: true,
      keyboardNavigation: true,
      screenReader: true
    }
  });

  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'Home':
        e.preventDefault();
        scrollTo(0, { duration: 800 });
        break;
      case 'End':
        e.preventDefault();
        scrollTo(document.body.scrollHeight, { duration: 800 });
        break;
      case 'PageUp':
        e.preventDefault();
        scrollTo(scrollPosition - window.innerHeight, { duration: 600 });
        break;
      case 'PageDown':
        e.preventDefault();
        scrollTo(scrollPosition + window.innerHeight, { duration: 600 });
        break;
    }
  }, [scrollTo, scrollPosition]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div role="main" aria-label="부드러운 스크롤 페이지">
      <div style={{ height: '300vh', padding: '20px' }}>
        <h1>접근성 친화 스크롤</h1>
        <p>키보드로 스크롤하세요: Home, End, PageUp, PageDown</p>
        
        <button 
          onClick={() => scrollTo(0)}
          aria-label="페이지 상단으로 이동"
        >
          맨 위로
        </button>
      </div>
    </div>
  );
}
```

## 🌏 브라우저 지원

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ iOS Safari 12+
- ✅ Android Chrome 60+

## 📱 환경별 최적화

라이브러리는 사용자의 환경(PC/모바일/태블릿)을 자동으로 감지하여 최적의 스크롤 경험을 제공합니다.

### 자동 환경 감지

```javascript
// 환경별 자동 최적화
const scroll = new TwoDimensionScroll({
  desktop: {
    duration: 1000,
    lerp: 0.1,
    sensitivity: 1.2
  },
  mobile: {
    duration: 600,           // 모바일에서 더 빠른 반응
    lerp: 0.15,             // 더 직접적인 반응
    touchStopThreshold: 3   // 터치 정지 감도
  },
  tablet: {
    duration: 800,          // 중간값
    lerp: 0.12
  }
});

// 현재 환경 정보 확인
console.log(scroll.getEnvironmentInfo());
```

### React에서 환경별 대응

```tsx
function ResponsiveScrollComponent() {
  const { instance, scrollPosition } = useTwoDimensionScroll({
    desktop: { duration: 1000 },
    mobile: { duration: 600 },
    tablet: { duration: 800 }
  });

  useEffect(() => {
    if (instance) {
      const envInfo = instance.getEnvironmentInfo();
      console.log('현재 환경:', envInfo.currentEnvironment);
      console.log('터치 지원:', envInfo.isTouchDevice);
    }
  }, [instance]);

  return <div>환경 최적화 스크롤 활성화</div>;
}
```

## ⚛️ React 개발 팁

### 성능 최적화

```tsx
// 1. 메모이제이션으로 불필요한 리렌더링 방지
const ScrollComponent = memo(() => {
  const { scrollPosition, scrollTo } = useTwoDimensionScroll();
  
  return (
    <div>위치: {scrollPosition}</div>
  );
});

// 2. 스크롤 콜백 최적화
function OptimizedScrollApp() {
  const scrollCallbackRef = useRef();
  
  const { instance } = useTwoDimensionScroll();
  
  useEffect(() => {
    if (!instance) return;
    
    // 스로틀링된 콜백
    scrollCallbackRef.current = throttle((data) => {
      console.log('스크롤:', data.scroll);
    }, 100);
    
    instance.on(scrollCallbackRef.current);
    
    return () => {
      if (scrollCallbackRef.current) {
        instance.off(scrollCallbackRef.current);
      }
    };
  }, [instance]);
}
```

### 디버깅 및 개발 모드

```tsx
// 개발 환경에서만 디버깅 활성화
const { instance, getReactInfo } = useTwoDimensionScroll({
  debug: process.env.NODE_ENV === 'development'
});

// React 호환성 정보 확인
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('React 호환성:', getReactInfo());
  }
}, [getReactInfo]);
```

### 일반적인 문제 해결

#### 1. SSR 오류 해결
```tsx
// Next.js에서 hydration 오류 방지
function SSRSafeScrollApp() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const { isReady } = useTwoDimensionScroll();
  
  if (!isClient || !isReady) {
    return <div>Loading...</div>;
  }
  
  return <div>스크롤 준비 완료</div>;
}
```

#### 2. 메모리 누수 방지
```tsx
// 컴포넌트 언마운트 시 확실한 정리
function SafeScrollComponent() {
  const scrollRef = useRef(null);
  
  useEffect(() => {
    return () => {
      // 강제 정리
      if (scrollRef.current) {
        scrollRef.current.destroy();
        scrollRef.current = null;
      }
    };
  }, []);
  
  const { instance } = useTwoDimensionScroll();
  scrollRef.current = instance;
  
  return <div>안전한 스크롤 컴포넌트</div>;
}
```

#### 3. 상태 동기화
```tsx
// 외부 상태와 스크롤 위치 동기화
function SyncedScrollApp() {
  const [externalScroll, setExternalScroll] = useState(0);
  const { scrollPosition, scrollTo } = useTwoDimensionScroll();
  
  // 외부 상태 변경 시 스크롤 위치 업데이트
  useEffect(() => {
    if (Math.abs(externalScroll - scrollPosition) > 10) {
      scrollTo(externalScroll);
    }
  }, [externalScroll, scrollPosition, scrollTo]);
  
  // 스크롤 위치 변경 시 외부 상태 업데이트
  useEffect(() => {
    setExternalScroll(scrollPosition);
  }, [scrollPosition]);
}
```

### TypeScript 타입 활용

```tsx
import type { 
  TwoDimensionScrollOptions,
  ScrollInfo,
  TwoDimensionScrollHookReturn 
} from 'two-dimension-scroll/react';

interface ScrollPageProps {
  initialOptions?: TwoDimensionScrollOptions;
  onScrollChange?: (info: ScrollInfo) => void;
}

const ScrollPage: React.FC<ScrollPageProps> = ({ 
  initialOptions, 
  onScrollChange 
}) => {
  const scrollHook: TwoDimensionScrollHookReturn = useTwoDimensionScroll(
    initialOptions
  );
  
  useEffect(() => {
    if (scrollHook.scrollInfo && onScrollChange) {
      onScrollChange(scrollHook.scrollInfo);
    }
  }, [scrollHook.scrollInfo, onScrollChange]);
  
  return <div>타입 안전한 스크롤 페이지</div>;
};
```

## 🔧 개발 환경 설정

### 의존성 설치

```bash
npm install
```

### 빌드

```bash
npm run build
```

### 개발 모드 (watch)

```bash
npm run dev
```

### 데모 실행

```bash
npm run serve
```

브라우저에서 `http://localhost:3000`으로 접속하여 데모를 확인할 수 있습니다.

## 🎮 데모 페이지

프로젝트에 포함된 `index.html` 파일을 통해 라이브러리의 모든 기능을 체험해볼 수 있습니다:

- 다양한 스크롤 방식 테스트
- 실시간 설정 변경
- 디버그 모드로 이벤트 확인
- 모바일과 데스크톱 환경 모두 지원

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

MIT License. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 감사의 말

이 프로젝트는 [Lenis](https://github.com/studio-freight/lenis)와 같은 훌륭한 스크롤 라이브러리들에서 영감을 받았습니다.

---

**Made with ❤️ for developers who love smooth scrolling** 