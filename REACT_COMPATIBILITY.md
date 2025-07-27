# TwoDimensionScroll React 호환성 가이드 🚀⚛️

**TwoDimensionScroll**은 React 환경에서 완벽하게 작동하도록 설계되었습니다. 이 가이드는 React, Next.js, 그리고 다른 React 기반 프레임워크에서 안전하게 사용하는 방법을 설명합니다.

## 🌟 주요 React 호환성 기능

### ✅ **완벽히 지원되는 기능들**
- **SSR (Server-Side Rendering)** 완전 호환
- **React StrictMode** 안전성
- **React Router** 자동 감지 및 호환
- **useEffect cleanup** 자동 처리
- **React 합성 이벤트** 충돌 방지
- **동적 컴포넌트 마운트/언마운트** 안전성
- **환경별 최적화** (데스크톱/모바일/태블릿)
- **접근성** (prefers-reduced-motion, 스크린 리더)

### 🔧 **React 친화적 개선사항**
- **자동 메모리 누수 방지**
- **이벤트 리스너 자동 정리**
- **DOM 조작 충돌 방지**
- **React 상태 변경 감지**

---

## 📦 설치 및 기본 설정

### 1. 라이브러리 로드
```html
<!-- HTML head에 추가 -->
<script src="./dist/bundle-simple.js"></script>
```

또는 ES6 모듈로:
```javascript
// 글로벌 스크립트 로드 후
const TwoDimensionScroll = window.TwoDimensionScroll;
```

### 2. React Hook 생성

```javascript
import React, { useEffect, useRef, useState, useCallback } from 'react';

const useTwoDimensionScroll = (options = {}) => {
  const scrollInstance = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // SSR 안전성 체크
    if (typeof window === 'undefined') return;
    
    if (!window.TwoDimensionScroll) {
      console.error('TwoDimensionScroll 라이브러리가 로드되지 않았습니다.');
      return;
    }

    // React 친화적 옵션
    const reactOptions = {
      debug: true,
      desktop: {
        duration: 1000,
        lerp: 0.1,
        precisionMode: true,
        ...options.desktop
      },
      mobile: {
        duration: 800,
        lerp: 0.15,
        bounceEffect: true,
        ...options.mobile
      },
      accessibility: {
        respectReducedMotion: true,
        announceScrollPosition: true,
        ...options.accessibility
      },
      ...options
    };

    // 인스턴스 생성
    scrollInstance.current = new window.TwoDimensionScroll(reactOptions);
    setIsInitialized(true);

    // React 정리 함수 - StrictMode에서도 안전
    return () => {
      if (scrollInstance.current && !scrollInstance.current.isDestroyed) {
        scrollInstance.current.destroy();
      }
      setIsInitialized(false);
    };
  }, []); // 빈 의존성 배열 중요!

  // 메서드들 노출
  const scrollTo = useCallback((position, options) => {
    if (scrollInstance.current && isInitialized) {
      scrollInstance.current.scrollTo(position, options);
    }
  }, [isInitialized]);

  return {
    isInitialized,
    scrollTo,
    instance: scrollInstance.current
  };
};
```

---

## 🎯 기본 사용법

### 1. 함수형 컴포넌트에서 사용

```javascript
const MyScrollComponent = () => {
  const { isInitialized, scrollTo, instance } = useTwoDimensionScroll({
    desktop: {
      duration: 1200,
      lerp: 0.08
    },
    mobile: {
      duration: 800,
      touchMultiplier: 3.0
    }
  });

  const handleScrollToTop = () => {
    scrollTo(0, { duration: 800 });
  };

  if (!isInitialized) {
    return <div>스크롤 초기화 중...</div>;
  }

  return (
    <div>
      <button onClick={handleScrollToTop}>맨 위로</button>
      {/* 콘텐츠 */}
    </div>
  );
};
```

### 2. 클래스 컴포넌트에서 사용

```javascript
class MyScrollComponent extends React.Component {
  constructor(props) {
    super(props);
    this.scrollInstance = null;
    this.state = { isInitialized: false };
  }

  componentDidMount() {
    if (typeof window !== 'undefined' && window.TwoDimensionScroll) {
      this.scrollInstance = new window.TwoDimensionScroll({
        desktop: { duration: 1000, lerp: 0.1 },
        mobile: { duration: 800, lerp: 0.15 }
      });
      this.setState({ isInitialized: true });
    }
  }

  componentWillUnmount() {
    if (this.scrollInstance && !this.scrollInstance.isDestroyed) {
      this.scrollInstance.destroy();
    }
  }

  render() {
    if (!this.state.isInitialized) {
      return <div>로딩 중...</div>;
    }

    return (
      <div>
        <button onClick={() => this.scrollInstance.scrollTo(0)}>
          맨 위로
        </button>
      </div>
    );
  }
}
```

---

## 🌐 Next.js 호환성

### 1. SSR 안전한 컴포넌트

```javascript
// components/SmoothScroll.js
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const SmoothScrollComponent = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { isInitialized, scrollTo } = useTwoDimensionScroll();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // SSR 중에는 렌더링하지 않음
  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* 스크롤 콘텐츠 */}
    </div>
  );
};

// 클라이언트에서만 렌더링
export default dynamic(() => Promise.resolve(SmoothScrollComponent), {
  ssr: false
});
```

### 2. _app.js에서 글로벌 설정

```javascript
// pages/_app.js
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script 
        src="/dist/bundle-simple.js" 
        strategy="beforeInteractive"
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
```

---

## 🎛️ 고급 사용법

### 1. 모달과 함께 사용

```javascript
const ModalExample = () => {
  const { pauseForModal, resumeFromModal } = useTwoDimensionScroll();
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setModalOpen(true);
    pauseForModal(); // 배경 스크롤 비활성화
  }, [pauseForModal]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    resumeFromModal(); // 배경 스크롤 재개
  }, [resumeFromModal]);

  return (
    <div>
      <button onClick={openModal}>모달 열기</button>
      
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <p>모달 내부에서는 일반 스크롤이 작동합니다.</p>
            <button onClick={closeModal}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 2. React Router와 함께 사용

```javascript
import { useLocation } from 'react-router-dom';

const RouterScrollComponent = () => {
  const location = useLocation();
  const { scrollTo, instance } = useTwoDimensionScroll();

  // 라우트 변경 시 맨 위로 스크롤
  useEffect(() => {
    if (instance) {
      scrollTo(0, { immediate: true });
    }
  }, [location.pathname, instance, scrollTo]);

  return <div>{/* 콘텐츠 */}</div>;
};
```

### 3. 스크롤 이벤트 리스닝

```javascript
const ScrollEventExample = () => {
  const [scrollInfo, setScrollInfo] = useState({
    position: 0,
    progress: 0
  });

  const { instance } = useTwoDimensionScroll();

  useEffect(() => {
    if (!instance) return;

    const handleScroll = (data) => {
      setScrollInfo({
        position: Math.round(data.scroll),
        progress: Math.round(data.progress * 100)
      });
    };

    instance.on(handleScroll);

    return () => {
      // cleanup은 destroy에서 자동 처리됨
    };
  }, [instance]);

  return (
    <div>
      <div>현재 위치: {scrollInfo.position}px</div>
      <div>진행률: {scrollInfo.progress}%</div>
    </div>
  );
};
```

---

## 🔧 환경별 최적화

### 1. 반응형 설정

```javascript
const ResponsiveScrollComponent = () => {
  const { updateOptions, applyPreset } = useTwoDimensionScroll({
    desktop: {
      duration: 1200,
      lerp: 0.08,
      precisionMode: true,
      wheelMultiplier: 1.2
    },
    mobile: {
      duration: 800,
      lerp: 0.15,
      touchMultiplier: 2.8,
      bounceEffect: true
    },
    tablet: {
      duration: 900,
      lerp: 0.12,
      hybridMode: true
    }
  });

  // 동적 옵션 변경
  const handleOptimize = () => {
    updateOptions('mobile', {
      touchMultiplier: 3.5,
      flingMultiplier: 1.5
    });
  };

  // 프리셋 적용
  const handlePreset = (preset) => {
    applyPreset(preset); // 'smooth', 'fast', 'precise'
  };

  return (
    <div>
      <button onClick={handleOptimize}>모바일 최적화</button>
      <button onClick={() => handlePreset('fast')}>빠름 모드</button>
    </div>
  );
};
```

### 2. 접근성 설정

```javascript
const AccessibleScrollComponent = () => {
  const { getAccessibilityStatus } = useTwoDimensionScroll({
    accessibility: {
      respectReducedMotion: true,        // prefers-reduced-motion 준수
      announceScrollPosition: true,      // 스크린 리더 알림
      keyboardNavigation: true,          // 키보드 네비게이션
      focusManagement: true              // 포커스 관리
    }
  });

  const checkA11yStatus = () => {
    const status = getAccessibilityStatus();
    console.log('접근성 상태:', status);
  };

  return (
    <div>
      <button onClick={checkA11yStatus}>접근성 상태 확인</button>
    </div>
  );
};
```

---

## 🚨 주의사항 및 Best Practices

### ✅ **Do's (권장사항)**

1. **useEffect의 빈 의존성 배열 사용**
   ```javascript
   useEffect(() => {
     // 초기화 로직
     return () => {
       // cleanup 로직
     };
   }, []); // 빈 배열 중요!
   ```

2. **SSR 안전성 체크**
   ```javascript
   if (typeof window === 'undefined') return;
   ```

3. **useCallback 사용으로 불필요한 리렌더링 방지**
   ```javascript
   const scrollTo = useCallback((position) => {
     instance.scrollTo(position);
   }, [instance]);
   ```

4. **조건부 렌더링으로 초기화 대기**
   ```javascript
   if (!isInitialized) {
     return <LoadingSpinner />;
   }
   ```

### ❌ **Don'ts (피해야 할 것들)**

1. **useEffect 의존성 배열에 불필요한 값 추가**
   ```javascript
   // ❌ 잘못된 예
   useEffect(() => {
     // 초기화
   }, [props, state]); // 재초기화 위험
   ```

2. **수동으로 이벤트 리스너 제거 시도**
   ```javascript
   // ❌ 불필요함 - destroy()가 자동 처리
   useEffect(() => {
     return () => {
       document.removeEventListener(...);
     };
   }, []);
   ```

3. **클래스 컴포넌트에서 cleanup 누락**
   ```javascript
   // ❌ 메모리 누수 위험
   componentWillUnmount() {
     // cleanup 없음
   }
   ```

---

## 🔍 디버깅 및 문제 해결

### 1. React 호환성 정보 확인

```javascript
const DebugComponent = () => {
  const { instance } = useTwoDimensionScroll({ debug: true });

  useEffect(() => {
    if (instance) {
      const reactInfo = instance.getReactCompatibilityInfo();
      console.log('React 호환성 정보:', reactInfo);
      /*
      {
        isReactEnvironment: true,
        isDestroyed: false,
        eventListenerCount: 5,
        hasReactRouter: true,
        stateObserverActive: true
      }
      */
    }
  }, [instance]);

  return <div>디버그 정보는 콘솔을 확인하세요</div>;
};
```

### 2. 일반적인 문제들

**문제: "TwoDimensionScroll is not defined"**
```javascript
// 해결: 라이브러리 로드 확인
useEffect(() => {
  if (!window.TwoDimensionScroll) {
    console.error('라이브러리가 로드되지 않았습니다');
    return;
  }
  // 초기화...
}, []);
```

**문제: StrictMode에서 중복 초기화**
```javascript
// 해결: isDestroyed 체크 추가
useEffect(() => {
  if (scrollInstance.current?.isDestroyed === false) {
    return; // 이미 초기화됨
  }
  // 초기화...
}, []);
```

**문제: 라우트 변경 시 스크롤 위치 유지**
```javascript
// 해결: 라우트 변경 감지
const location = useLocation();
useEffect(() => {
  if (instance) {
    instance.scrollTo(0, { immediate: true });
  }
}, [location.pathname]);
```

---

## 📋 완전한 사용 예제

전체 예제는 `react-example.jsx` 파일을 참조하세요. 이 파일에는 다음이 포함되어 있습니다:

- ✨ **useTwoDimensionScroll Hook**
- 🎮 **완전한 데모 컴포넌트**
- 🎭 **모달 통합 예제**
- ♿ **접근성 기능 데모**
- 📊 **스크롤 정보 표시**
- 🌐 **Next.js 호환 예제**
- 📝 **TypeScript 타입 정의**

---

## 🎉 결론

**TwoDimensionScroll**은 React 환경에서 완벽하게 작동하도록 설계되었습니다:

- ✅ **SSR/Next.js** 완전 호환
- ✅ **React StrictMode** 안전
- ✅ **메모리 누수 없음**
- ✅ **React Router** 자동 호환
- ✅ **접근성** 완벽 지원
- ✅ **환경별 최적화**

React 프로젝트에서 안심하고 사용하세요! 🚀⚛️ 