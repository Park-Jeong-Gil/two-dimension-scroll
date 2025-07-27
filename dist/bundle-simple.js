/**
 * TwoDimensionScroll - lenis 스타일 스무스 스크롤
 * 가로와 세로 스크롤을 모두 감지하여 부드러운 세로 스크롤로 변환하는 라이브러리
 */
(function (global) {
  "use strict";

  // Debug log removed for production

  // === 이징 함수들 ===
  const Easing = {
    linear: function (t) {
      return t;
    },
    easeInQuad: function (t) {
      return t * t;
    },
    easeOutQuad: function (t) {
      return t * (2 - t);
    },
    easeInOutQuad: function (t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    easeInCubic: function (t) {
      return t * t * t;
    },
    easeOutCubic: function (t) {
      return --t * t * t + 1;
    },
    easeInOutCubic: function (t) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    },
    // lenis 스타일의 부드러운 이징
    easeOutExpo: function (t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    },
    easeOutCirc: function (t) {
      return Math.sqrt(1 - --t * t);
    },
  };

  // === 접근성 유틸리티 함수들 ===

  // 사용자의 모션 감소 설정 확인
  function prefersReducedMotion() {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  // 고대비 모드 감지
  function prefersHighContrast() {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia && window.matchMedia("(prefers-contrast: high)").matches
    );
  }

  // 키보드 네비게이션 사용자 감지
  function detectKeyboardUser() {
    if (typeof document === "undefined") return false;
    var keyboardUser = false;

    document.addEventListener("keydown", function (e) {
      if (
        e.key === "Tab" ||
        e.key === "Enter" ||
        e.key === " " ||
        e.key.startsWith("Arrow")
      ) {
        keyboardUser = true;
        document.body.classList.add("keyboard-user");
      }
    });

    document.addEventListener("mousedown", function () {
      keyboardUser = false;
      document.body.classList.remove("keyboard-user");
    });

    return keyboardUser;
  }

  // 스크린 리더 감지 (휴리스틱 방법)
  function detectScreenReader() {
    if (typeof navigator === "undefined") return false;
    var isScreenReader = false;

    // 일반적인 스크린 리더 감지
    var screenReaderIndicators = [
      navigator.userAgent.includes("NVDA"),
      navigator.userAgent.includes("JAWS"),
      navigator.userAgent.includes("VoiceOver"),
      !!window.speechSynthesis,
      !!document.querySelector("[aria-live]"),
      document.body.classList.contains("screen-reader"),
    ];

    return screenReaderIndicators.some(function (indicator) {
      return indicator;
    });
  }

  // ARIA Live Region 생성
  function createAriaLiveRegion() {
    if (typeof document === "undefined") return null;

    var liveRegion = document.getElementById("scroll-live-region");
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.id = "scroll-live-region";
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.style.position = "absolute";
      liveRegion.style.left = "-10000px";
      liveRegion.style.width = "1px";
      liveRegion.style.height = "1px";
      liveRegion.style.overflow = "hidden";
      document.body.appendChild(liveRegion);
    }

    return liveRegion;
  }

  // 접근성 메시지 announce
  function announceToScreenReader(message, priority) {
    var liveRegion = createAriaLiveRegion();
    if (!liveRegion) return;

    priority = priority || "polite"; // 'polite' 또는 'assertive'
    liveRegion.setAttribute("aria-live", priority);

    // 기존 내용 지우고 새 메시지 추가
    liveRegion.textContent = "";
    setTimeout(function () {
      liveRegion.textContent = message;
    }, 100);
  }

  // 포커스 관리 유틸리티
  function manageFocus(element) {
    if (!element || typeof element.focus !== "function") return;

    element.focus();
    element.setAttribute("tabindex", "-1"); // 프로그래밍적 포커스만 허용

    // 포커스 아웃라인 스타일 적용
    if (document.body.classList.contains("keyboard-user")) {
      element.style.outline = "2px solid #005fcc";
      element.style.outlineOffset = "2px";
    }
  }

  // 접근성 설정 체크
  function getAccessibilitySettings() {
    return {
      reducedMotion: prefersReducedMotion(),
      highContrast: prefersHighContrast(),
      keyboardUser: detectKeyboardUser(),
      screenReader: detectScreenReader(),
      supportsAriaLive:
        typeof document !== "undefined" &&
        "setAttribute" in document.createElement("div"),
    };
  }

  // === 유틸리티 함수들 ===
  function isMobile() {
    if (typeof window === "undefined") return false;
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768
    );
  }

  function isTouchDevice() {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  // 더 정교한 환경 감지
  function detectEnvironment() {
    if (typeof window === "undefined") return "desktop";

    var isMobileUA =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    var isTouchCapable =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    var isSmallScreen = window.innerWidth <= 768;
    var isTablet =
      /iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent) &&
      window.innerWidth >= 768;

    if (isMobileUA && !isTablet) return "mobile";
    if (isSmallScreen && isTouchCapable) return "mobile";
    if (isTablet) return "tablet";
    return "desktop";
  }

  // 환경별 기본 옵션 정의
  function getDefaultOptions() {
    // 접근성 설정 가져오기
    var a11ySettings = getAccessibilitySettings();

    return {
      // 공통 옵션 (모든 환경에서 동일)
      disabled: false,
      scrollableSelector: "body",
      debug: false,
      useNativeScrollOnMobile: false, // 라이브러리가 모든 환경을 처리

      // 접근성 공통 옵션
      accessibility: {
        respectReducedMotion: true, // prefers-reduced-motion 준수
        announceScrollPosition: true, // 스크린 리더에 스크롤 위치 알림
        keyboardNavigation: true, // 키보드 네비게이션 활성화
        focusManagement: true, // 포커스 관리 활성화
        highContrastMode: a11ySettings.highContrast, // 고대비 모드 자동 감지
        screenReaderOptimizations: a11ySettings.screenReader, // 스크린 리더 최적화
        announceFrequency: 1000, // 스크롤 위치 알림 빈도 (ms)
        skipAnimation: a11ySettings.reducedMotion, // 모션 감소 설정 시 애니메이션 건너뛰기
      },

      // UI/UX 옵션
      ui: {
        hideScrollbar: true, // 스크롤바 숨김 (기본값: true)
        showScrollProgress: false, // 스크롤 진행률 표시 (기본값: false)
        customScrollbarStyle: false, // 커스텀 스크롤바 스타일 (기본값: false)
      },

      // 환경별 옵션
      desktop: {
        // PC 환경 최적화 옵션
        duration: a11ySettings.reducedMotion ? 100 : 1000, // ms 단위
        easing: Easing.easeOutCubic,
        horizontalSensitivity: 1,
        verticalSensitivity: 1,
        lerp: a11ySettings.reducedMotion ? 0.8 : 0.1, // 모션 감소 시 즉시 반응
        wheelMultiplier: 1,
        touchMultiplier: 1.5, // PC에서도 터치 지원
        smoothWheel: !a11ySettings.reducedMotion, // 모션 감소 시 부드러운 휠 비활성화
        touchStopThreshold: 8,
        // PC 전용 옵션
        keyboardScrollAmount: 0.8, // 키보드 스크롤 양 (화면 높이 대비)
        precisionMode: a11ySettings.keyboardUser, // 키보드 사용자에게 정밀 모드
        // 접근성 전용 옵션
        keyboardScrollSpeed: a11ySettings.keyboardUser ? 600 : 1000, // ms 단위 - 키보드 사용자를 위한 느린 스크롤
        skipInertia: a11ySettings.reducedMotion, // 모션 감소 시 관성 비활성화
      },
      mobile: {
        // 모바일 환경 최적화 옵션
        duration: a11ySettings.reducedMotion ? 50 : 800, // ms 단위
        easing: Easing.easeOutCubic,
        horizontalSensitivity: 1.5,
        verticalSensitivity: 1.8,
        lerp: a11ySettings.reducedMotion ? 0.9 : 0.15, // 모바일에서도 모션 감소 시 즉시 반응
        wheelMultiplier: 1.2,
        touchMultiplier: 2.5,
        smoothWheel: !a11ySettings.reducedMotion,
        touchStopThreshold: 5,
        // 모바일 전용 옵션
        flingMultiplier: a11ySettings.reducedMotion ? 0.1 : 1.2, // 모션 감소 시 플링 최소화
        bounceEffect: !a11ySettings.reducedMotion, // 모션 감소 시 바운스 비활성화
        fastScrollThreshold: 50, // 빠른 스크롤 감지 임계값
        // 접근성 전용 옵션
        touchScrollSpeed: a11ySettings.screenReader ? 700 : 1000, // ms 단위 - 스크린 리더 사용자를 위한 느린 터치 스크롤
        skipInertia: a11ySettings.reducedMotion,
      },
      tablet: {
        // 태블릿 환경 (PC와 모바일의 중간)
        duration: a11ySettings.reducedMotion ? 80 : 900, // ms 단위
        easing: Easing.easeOutCubic,
        horizontalSensitivity: 1.2,
        verticalSensitivity: 1.5,
        lerp: a11ySettings.reducedMotion ? 0.85 : 0.12,
        wheelMultiplier: 1.1,
        touchMultiplier: 2.0,
        smoothWheel: !a11ySettings.reducedMotion,
        touchStopThreshold: 6,
        // 태블릿 전용 옵션
        hybridMode: true, // 터치와 마우스 모두 최적화
        // 접근성 전용 옵션
        adaptiveSpeed: a11ySettings.keyboardUser, // 키보드 사용자를 위한 적응형 속도
        skipInertia: a11ySettings.reducedMotion,
      },
    };
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getMaxScrollTop() {
    if (typeof document === "undefined") return 0;
    return Math.max(
      document.body.scrollHeight - window.innerHeight,
      document.documentElement.scrollHeight - window.innerHeight,
      0
    );
  }

  function getCurrentScrollTop() {
    if (typeof window === "undefined") return 0;
    return (
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  }

  var raf = (function () {
    if (typeof window === "undefined")
      return function (callback) {
        return setTimeout(callback, 16);
      };
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      function (callback) {
        return setTimeout(callback, 16);
      }
    );
  })();

  var cancelRaf = (function () {
    if (typeof window === "undefined") return clearTimeout;
    return (
      window.cancelAnimationFrame ||
      window.webkitCancelAnimationFrame ||
      clearTimeout
    );
  })();

  function supportsPassive() {
    if (typeof window === "undefined") return false;
    var supportsPassive = false;
    try {
      var opts = Object.defineProperty({}, "passive", {
        get: function () {
          supportsPassive = true;
          return true;
        },
      });
      window.addEventListener("testPassive", function () {}, opts);
      window.removeEventListener("testPassive", function () {}, opts);
    } catch (e) {}
    return supportsPassive;
  }

  function throttle(func, limit) {
    var inThrottle;
    return function () {
      var args = arguments;
      var context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function () {
          inThrottle = false;
        }, limit);
      }
    };
  }

  // lenis 스타일 lerp 함수
  function lerp(start, end, factor) {
    return (1 - factor) * start + factor * end;
  }

  // === 메인 클래스 ===
  function TwoDimensionScroll(options) {
    options = options || {};

    // 현재 환경 감지
    this.currentEnvironment = detectEnvironment();
    this.isMobileDevice = this.currentEnvironment === "mobile";
    this.isTabletDevice = this.currentEnvironment === "tablet";
    this.isDesktopDevice = this.currentEnvironment === "desktop";

    // 환경별 옵션 병합
    this.options = this.mergeOptions(options);

    // React 호환성 시스템 초기화
    this.isReactEnv = isReactEnvironment();
    this.eventManager = createEventManager();
    this.reactStateObserver = createReactStateObserver();
    this.routerCompatibility = createRouterCompatibility();
    this.isDestroyed = false;

    // 접근성 설정 초기화
    this.accessibilitySettings = getAccessibilitySettings();
    this.ariaLiveRegion = null;
    this.lastAnnounceTime = 0;
    this.keyboardNavigationActive =
      this.options.accessibility?.keyboardNavigation !== false;

    // lenis 스타일 상태 변수들
    this.targetScroll = 0;
    this.animatedScroll = 0;
    this.isScrolling = false;
    this.isAnimating = false;
    this.rafId = null;
    this.scrollCallbacks = [];
    this.passive = false;

    // 터치 관련 변수들
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.touchStartTime = 0;
    this.lastTouchX = 0;
    this.lastTouchY = 0;
    this.lastTouchTime = 0;
    this.touchVelocityX = 0;
    this.touchVelocityY = 0;
    this.touchMoveCount = 0;
    this.touchStopTimer = null;

    // 초기화
    this.passive = supportsPassive() ? { passive: false } : false;
    this.targetScroll = getCurrentScrollTop();
    this.animatedScroll = this.targetScroll;
    this.isModalOpen = false; // 모달 상태 초기화

    console.log("📦 TwoDimensionScroll 인스턴스 생성 (환경별 최적화):", {
      environment: this.currentEnvironment,
      isMobile: this.isMobileDevice,
      isTablet: this.isTabletDevice,
      isDesktop: this.isDesktopDevice,
      options: this.options,
    });

    this.init();
  }

  // === 프로토타입 메서드들 ===

  // === 접근성 관련 메서드들 ===

  // 접근성 초기화
  TwoDimensionScroll.prototype.initAccessibility = function () {
    if (typeof document === "undefined") return;

    // ARIA Live Region 생성
    if (this.options.accessibility?.announceScrollPosition) {
      this.ariaLiveRegion = createAriaLiveRegion();
    }

    // 키보드 사용자 감지 초기화
    this.initKeyboardUserDetection();

    // prefers-reduced-motion 변경 감지
    this.watchReducedMotionPreference();

    // 접근성 CSS 클래스 추가
    this.applyAccessibilityStyles();

    // 스크롤 위치 초기 알림
    if (
      this.accessibilitySettings.screenReader &&
      this.options.accessibility?.announceScrollPosition
    ) {
      var self = this;
      setTimeout(function () {
        announceToScreenReader(
          "페이지 스크롤이 준비되었습니다. 화살표 키나 Page Up/Down으로 탐색할 수 있습니다."
        );
      }, 1000);
    }
  };

  // 키보드 사용자 감지 초기화
  TwoDimensionScroll.prototype.initKeyboardUserDetection = function () {
    var self = this;

    if (typeof document === "undefined") return;

    // 키보드 포커스 스타일 적용
    document.addEventListener("keydown", function (e) {
      if (
        e.key === "Tab" ||
        e.key === "Enter" ||
        e.key === " " ||
        e.key.startsWith("Arrow")
      ) {
        document.body.classList.add("keyboard-user");
        self.keyboardNavigationActive = true;
      }
    });

    document.addEventListener("mousedown", function () {
      document.body.classList.remove("keyboard-user");
      self.keyboardNavigationActive = false;
    });
  };

  // prefers-reduced-motion 변경 감지
  TwoDimensionScroll.prototype.watchReducedMotionPreference = function () {
    var self = this;

    if (typeof window === "undefined" || !window.matchMedia) return;

    var mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // 초기 설정
    self.handleReducedMotionChange(mediaQuery.matches);

    // 변경 감지
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", function (e) {
        self.handleReducedMotionChange(e.matches);
      });
    } else if (mediaQuery.addListener) {
      // 구형 브라우저 지원
      mediaQuery.addListener(function (e) {
        self.handleReducedMotionChange(e.matches);
      });
    }
  };

  // prefers-reduced-motion 변경 처리
  TwoDimensionScroll.prototype.handleReducedMotionChange = function (
    reducedMotion
  ) {
    this.accessibilitySettings.reducedMotion = reducedMotion;

    // 옵션 동적 업데이트
    if (reducedMotion) {
      // 모션 감소 모드
      this.options.lerp = Math.max(this.options.lerp, 0.8); // 즉시 반응
      this.options.smoothWheel = false;
      this.options.bounceEffect = false;
      this.options.flingMultiplier = 0.1;
      this.options.skipInertia = true;

      if (this.options.debug) {
        console.log("🎯 모션 감소 모드 활성화:", {
          lerp: this.options.lerp,
          smoothWheel: this.options.smoothWheel,
        });
      }
    } else {
      // 일반 모드로 복원
      this.options = this.mergeOptions(this.originalUserOptions || {});

      if (this.options.debug) {
        console.log("🎯 일반 모션 모드 복원");
      }
    }
  };

  // 접근성 CSS 스타일 적용
  TwoDimensionScroll.prototype.applyAccessibilityStyles = function () {
    if (typeof document === "undefined") return;

    var styleId = "twodimension-scroll-a11y-styles";
    var existingStyle = document.getElementById(styleId);

    if (existingStyle) return; // 이미 추가됨

    var style = document.createElement("style");
    style.id = styleId;
    style.textContent =
      "/* 키보드 포커스 스타일 */" +
      ".keyboard-user *:focus {" +
      "outline: 2px solid #005fcc !important;" +
      "outline-offset: 2px !important;" +
      "}" +
      "/* 고대비 모드 지원 */" +
      "@media (prefers-contrast: high) {" +
      ".keyboard-user *:focus {" +
      "outline: 3px solid currentColor !important;" +
      "outline-offset: 3px !important;" +
      "}" +
      "}" +
      "/* 모션 감소 지원 */" +
      "@media (prefers-reduced-motion: reduce) {" +
      "* {" +
      "animation-duration: 0.01ms !important;" +
      "animation-iteration-count: 1 !important;" +
      "transition-duration: 0.01ms !important;" +
      "}" +
      "}";

    document.head.appendChild(style);
  };

  // 스크롤 위치 알림
  TwoDimensionScroll.prototype.announceScrollPosition = function (force) {
    if (!this.options.accessibility?.announceScrollPosition) return;
    if (!this.accessibilitySettings.screenReader && !force) return;

    var now = Date.now();
    var frequency = this.options.accessibility.announceFrequency || 1000;

    if (now - this.lastAnnounceTime < frequency && !force) return;

    this.lastAnnounceTime = now;

    var maxScroll = getMaxScrollTop();
    var currentScroll = this.animatedScroll;
    var percentage =
      maxScroll > 0 ? Math.round((currentScroll / maxScroll) * 100) : 0;

    var message;
    if (percentage <= 0) {
      message = "페이지 최상단입니다";
    } else if (percentage >= 100) {
      message = "페이지 최하단입니다";
    } else {
      message = "페이지 " + percentage + "% 지점입니다";
    }

    announceToScreenReader(message, "polite");
  };

  // 키보드 네비게이션 개선된 스크롤
  TwoDimensionScroll.prototype.accessibleScrollTo = function (
    position,
    announcement
  ) {
    // 접근성을 고려한 스크롤
    var options = {};

    if (this.accessibilitySettings.reducedMotion) {
      options.immediate = true; // 즉시 이동
    } else {
      options.duration = this.options.keyboardScrollSpeed || 1000; // ms 단위
    }

    this.scrollTo(position, options);

    // 스크린 리더 알림
    if (announcement && this.accessibilitySettings.screenReader) {
      setTimeout(function () {
        announceToScreenReader(announcement, "assertive");
      }, 100);
    }

    // 접근성 포커스 관리
    if (
      this.keyboardNavigationActive &&
      this.options.accessibility?.focusManagement
    ) {
      this.manageFocusAfterScroll(position);
    }
  };

  // 스크롤 후 포커스 관리
  TwoDimensionScroll.prototype.manageFocusAfterScroll = function (position) {
    if (typeof document === "undefined") return;

    setTimeout(function () {
      // 현재 위치에서 포커스 가능한 첫 번째 요소 찾기
      var viewportTop = position;
      var viewportBottom = position + window.innerHeight;

      var focusableElements = document.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
      );

      for (var i = 0; i < focusableElements.length; i++) {
        var element = focusableElements[i];
        var rect = element.getBoundingClientRect();
        var elementTop = rect.top + position;

        if (elementTop >= viewportTop && elementTop <= viewportBottom) {
          manageFocus(element);
          break;
        }
      }
    }, 200);
  };

  // 접근성 상태 조회
  TwoDimensionScroll.prototype.getAccessibilityStatus = function () {
    return {
      settings: this.accessibilitySettings,
      options: this.options.accessibility,
      keyboardNavigationActive: this.keyboardNavigationActive,
      ariaLiveRegionExists: !!this.ariaLiveRegion,
      reducedMotionActive: this.accessibilitySettings.reducedMotion,
    };
  };

  // 실시간 접근성 설정 업데이트
  TwoDimensionScroll.prototype.updateAccessibilitySettings = function (
    newSettings
  ) {
    for (var key in newSettings) {
      if (newSettings.hasOwnProperty(key) && this.options.accessibility) {
        this.options.accessibility[key] = newSettings[key];
      }
    }

    // 설정에 따라 재초기화
    if (newSettings.announceScrollPosition && !this.ariaLiveRegion) {
      this.ariaLiveRegion = createAriaLiveRegion();
    }

    if (this.options.debug) {
      console.log("♿ 접근성 설정 업데이트:", newSettings);
    }
  };

  // === UI/UX 제어 메서드들 ===

  // 스크롤바 표시/숨김 토글
  TwoDimensionScroll.prototype.toggleScrollbar = function (show) {
    this.options.ui = this.options.ui || {};

    if (show !== undefined) {
      this.options.ui.hideScrollbar = !show;
    } else {
      // 토글
      this.options.ui.hideScrollbar = !this.options.ui.hideScrollbar;
    }

    // CSS 재적용
    this.updateScrollbarStyles();

    if (this.options.debug) {
      console.log("📏 스크롤바 토글:", {
        visible: !this.options.ui.hideScrollbar,
        hideScrollbar: this.options.ui.hideScrollbar,
      });
    }

    return !this.options.ui.hideScrollbar; // 현재 표시 상태 반환
  };

  // 스크롤바 스타일만 업데이트
  TwoDimensionScroll.prototype.updateScrollbarStyles = function () {
    if (!this.styleElement) return;

    // 기존 스타일 요소 제거
    if (this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
    }

    // 새로운 스타일 적용
    this.disableDefaultScroll();
  };

  // 커스텀 스크롤바 스타일 설정
  TwoDimensionScroll.prototype.setCustomScrollbarStyle = function (
    enable,
    styles
  ) {
    this.options.ui = this.options.ui || {};
    this.options.ui.customScrollbarStyle = enable;

    if (enable && styles) {
      // 커스텀 스타일 저장
      this.customScrollbarStyles = styles;
    }

    this.updateScrollbarStyles();

    if (this.options.debug) {
      console.log("🎨 커스텀 스크롤바 설정:", {
        enabled: enable,
        styles: styles,
      });
    }
  };

  // 스크롤바 상태 조회
  TwoDimensionScroll.prototype.getScrollbarStatus = function () {
    return {
      hidden: this.options.ui?.hideScrollbar !== false,
      customStyle: this.options.ui?.customScrollbarStyle || false,
      visible: this.options.ui?.hideScrollbar === false,
    };
  };

  // === 환경별 옵션 병합 메서드 ===

  // 환경별 옵션 병합 메서드
  TwoDimensionScroll.prototype.mergeOptions = function (userOptions) {
    var defaults = getDefaultOptions();
    var merged = {};

    // 공통 옵션 병합
    for (var key in defaults) {
      if (key !== "desktop" && key !== "mobile" && key !== "tablet") {
        merged[key] =
          userOptions[key] !== undefined ? userOptions[key] : defaults[key];
      }
    }

    // 환경별 옵션 병합
    var envDefaults = defaults[this.currentEnvironment] || defaults.desktop;
    var userEnvOptions = userOptions[this.currentEnvironment] || {};

    // 기존 방식 호환성: 최상위 레벨 옵션이 있으면 현재 환경에 적용
    for (var envKey in envDefaults) {
      if (userOptions[envKey] !== undefined) {
        // 기존 방식: 최상위 레벨에 정의된 옵션
        merged[envKey] = userOptions[envKey];
      } else if (userEnvOptions[envKey] !== undefined) {
        // 새로운 방식: 환경별로 정의된 옵션
        merged[envKey] = userEnvOptions[envKey];
      } else {
        // 기본값 적용
        merged[envKey] = envDefaults[envKey];
      }
    }

    if (merged.debug) {
      console.log("🔧 옵션 병합 완료:", {
        environment: this.currentEnvironment,
        userOptions: userOptions,
        mergedOptions: merged,
      });
    }

    return merged;
  };

  // 환경 변경 감지 및 옵션 업데이트
  TwoDimensionScroll.prototype.updateEnvironment = function () {
    var newEnvironment = detectEnvironment();

    if (newEnvironment !== this.currentEnvironment) {
      var oldEnvironment = this.currentEnvironment;
      this.currentEnvironment = newEnvironment;
      this.isMobileDevice = newEnvironment === "mobile";
      this.isTabletDevice = newEnvironment === "tablet";
      this.isDesktopDevice = newEnvironment === "desktop";

      // 옵션 재병합 (사용자 옵션 보존)
      var userOptions = this.originalUserOptions || {};
      this.options = this.mergeOptions(userOptions);

      if (this.options.debug) {
        console.log("🔄 환경 변경 감지:", {
          from: oldEnvironment,
          to: newEnvironment,
          newOptions: this.options,
        });
      }

      // 환경 변경 콜백 실행
      this.onEnvironmentChange(oldEnvironment, newEnvironment);
    }
  };

  // 환경 변경 시 호출되는 메서드 (오버라이드 가능)
  TwoDimensionScroll.prototype.onEnvironmentChange = function (oldEnv, newEnv) {
    // 서브클래스에서 오버라이드하여 환경 변경 시 특별한 처리 가능
    if (this.options.debug) {
      console.log("🌍 환경 변경 이벤트:", { from: oldEnv, to: newEnv });
    }
  };

  TwoDimensionScroll.prototype.init = function () {
    if (typeof window === "undefined") return;

    // 사용자 옵션 보존 (환경 변경 시 재사용)
    this.originalUserOptions = arguments[0] || {};

    if (this.isMobileDevice && this.options.useNativeScrollOnMobile) {
      console.log(
        "📱 모바일 네이티브 스크롤 모드 (사용 안함 - 라이브러리가 처리)"
      );
      // 더 이상 네이티브 스크롤로 돌아가지 않고 모든 환경을 지원
    }

    this.disableDefaultScroll();
    this.bindEvents();
    this.startAnimationLoop();

    // 접근성 초기화
    this.initAccessibility();

    // React Router 호환성 초기화
    this.routerCompatibility.init(this);

    // 환경별 초기화 완료 로그
    var envFeatures = [];
    if (this.isDesktopDevice && this.options.precisionMode)
      envFeatures.push("정밀모드");
    if (this.isMobileDevice && this.options.bounceEffect)
      envFeatures.push("바운스효과");
    if (this.isTabletDevice && this.options.hybridMode)
      envFeatures.push("하이브리드모드");

    // 접근성 기능 로그
    var a11yFeatures = [];
    if (this.accessibilitySettings.reducedMotion) a11yFeatures.push("모션감소");
    if (this.accessibilitySettings.screenReader)
      a11yFeatures.push("스크린리더");
    if (this.accessibilitySettings.keyboardUser)
      a11yFeatures.push("키보드네비게이션");
    if (this.accessibilitySettings.highContrast) a11yFeatures.push("고대비");

    console.log("✅ TwoDimensionScroll 초기화 완료 (접근성 강화):", {
      environment: this.currentEnvironment,
      features: envFeatures.length > 0 ? envFeatures.join(", ") : "기본",
      accessibility: a11yFeatures.length > 0 ? a11yFeatures.join(", ") : "표준",
      lerp: this.options.lerp,
      sensitivity: {
        horizontal: this.options.horizontalSensitivity,
        vertical: this.options.verticalSensitivity,
      },
    });
  };

  TwoDimensionScroll.prototype.disableDefaultScroll = function () {
    // lenis 스타일 CSS로 수정 - 전체 콘텐츠가 보이도록 개선
    var style = document.createElement("style");

    // 기본 CSS
    var baseCSS = `
      html {
        overflow-x: hidden;
        scroll-behavior: auto;
      }
      body {
        overflow-x: hidden;
        overscroll-behavior: none;
        -webkit-overflow-scrolling: touch;
      }
      /* 모달 열림 상태에서 바디 스크롤 완전 차단 */
      body.twodimension-modal-open,
      html:has(body.twodimension-modal-open) {
        overflow: hidden !important;
        position: fixed !important;
        width: 100% !important;
        height: 100% !important;
        touch-action: none !important;
        overscroll-behavior: none !important;
      }
      /* 모달 스크롤 완전 격리 (모바일 최적화) */
      .modal, [role="dialog"], [aria-modal="true"], dialog {
        overscroll-behavior: contain;
        overscroll-behavior-y: contain;
        -webkit-overflow-scrolling: touch;
        touch-action: pan-y; /* 세로 터치 스크롤만 허용 */
      }
      /* 모달 내부 스크롤 영역 최적화 */
      .modal *, [role="dialog"] *, [aria-modal="true"] * {
        overscroll-behavior: inherit;
        -webkit-overflow-scrolling: touch;
      }
    `;

    // 스크롤바 숨김 CSS (옵션에 따라)
    var scrollbarCSS = "";
    if (this.options.ui?.hideScrollbar !== false) {
      scrollbarCSS = `
        /* 스크롤바 숨김 */
        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          display: none;
        }
        html {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `;
    } else {
      // 커스텀 스크롤바 스타일 (옵션)
      if (this.options.ui?.customScrollbarStyle) {
        scrollbarCSS = `
          /* 커스텀 스크롤바 */
          html::-webkit-scrollbar {
            width: 8px;
          }
          html::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.1);
          }
          html::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.3);
            border-radius: 4px;
          }
          html::-webkit-scrollbar-thumb:hover {
            background: rgba(0,0,0,0.5);
          }
        `;
      }
    }

    style.textContent = baseCSS + scrollbarCSS;
    document.head.appendChild(style);
    this.styleElement = style;

    if (this.options.debug) {
      console.log("🎨 스크롤바 설정:", {
        hideScrollbar: this.options.ui?.hideScrollbar !== false,
        customStyle: this.options.ui?.customScrollbarStyle || false,
      });
    }

    // 모달 친화적인 스크롤 차단 시스템
    var self = this;
    this.preventScroll = function (e) {
      if (self.options.disabled) return;

      // React 합성 이벤트와의 충돌 방지
      if (
        e.isPropagationStopped &&
        typeof e.isPropagationStopped === "function" &&
        e.isPropagationStopped()
      ) {
        if (self.options.debug) {
          console.log("🔄 React 합성 이벤트 전파 중단됨 - preventScroll 스킵");
        }
        return;
      }

      // 수동 모달 모드일 때 간단한 처리
      if (self.isModalOpen) {
        var target = e.target;
        var element = target;

        // 모달 관련 요소인지 빠른 체크
        var isInModal = false;
        var checkElement = element;

        // 최대 10단계까지만 부모 요소 탐색 (성능 최적화)
        for (
          var i = 0;
          i < 10 && checkElement && checkElement !== document.body;
          i++
        ) {
          if (checkElement.classList) {
            var classList = checkElement.classList;
            if (
              classList.contains("modal") ||
              classList.contains("modal-overlay") ||
              classList.contains("modal-content") ||
              classList.contains("modal-wrapper") ||
              checkElement.getAttribute("role") === "dialog" ||
              checkElement.getAttribute("aria-modal") === "true"
            ) {
              isInModal = true;
              break;
            }
          }
          checkElement = checkElement.parentElement;
        }

        if (self.options.debug) {
          console.log("🎭 수동 모달 모드 처리:", {
            targetElement:
              target.tagName + (target.className ? "." + target.className : ""),
            isInModal: isInModal,
            action: isInModal ? "허용" : "차단",
          });
        }

        if (isInModal) {
          return; // 모달 내부 스크롤 허용
        } else {
          e.preventDefault(); // 모달 외부 스크롤 차단
          return;
        }
      }

      // 일반 모드에서의 모달 내부 스크롤 감지 (React 환경 최적화)
      var target = e.target;
      var element = target;

      if (self.options.debug) {
        console.log("🔍 스크롤 이벤트 분석:", {
          eventType: e.type,
          target:
            target.tagName + (target.className ? "." + target.className : ""),
          modalMode: self.isModalOpen ? "수동활성" : "비활성",
        });
      }

      // 부모 요소들을 순회하면서 모달 관련 요소 확인
      var modalElement = null;
      while (element && element !== document.body) {
        if (!element.tagName) {
          element = element.parentElement;
          continue;
        }

        var tagName = element.tagName.toLowerCase();
        var classList = element.classList || [];
        var role = element.getAttribute("role") || "";
        var ariaModal = element.getAttribute("aria-modal");

        if (self.options.debug) {
          console.log("🔎 요소 검사:", {
            tag: tagName,
            classes: Array.from(classList).join(" "),
            role: role,
            ariaModal: ariaModal,
          });
        }

        // 모달 관련 요소 감지 (React 환경 포함한 포괄적 조건들)
        var isModal =
          // HTML5 dialog 요소
          tagName === "dialog" ||
          // 일반적인 모달 클래스명들
          classList.contains("modal") ||
          classList.contains("modal-overlay") ||
          classList.contains("modal-content") ||
          classList.contains("modal-wrapper") ||
          classList.contains("modal-container") ||
          classList.contains("dialog") ||
          classList.contains("popup") ||
          classList.contains("overlay") ||
          classList.contains("lightbox") ||
          classList.contains("backdrop") ||
          // React Portal 패턴
          element.id === "modal-root" ||
          element.id === "portal-root" ||
          // ARIA 속성
          role === "dialog" ||
          role === "alertdialog" ||
          role === "modal" ||
          ariaModal === "true" ||
          // React 모달 라이브러리 패턴
          classList.contains("ReactModal__Overlay") ||
          classList.contains("ReactModal__Content");

        if (isModal) {
          modalElement = element;
          break;
        }

        element = element.parentElement;
      }

      // 모달 내부에서 발생한 스크롤인 경우
      if (modalElement) {
        if (self.options.debug) {
          console.log("🎭 모달 감지됨:", {
            modalElement: modalElement.tagName,
            modalClasses: Array.from(modalElement.classList).join(" "),
            targetElement: target.tagName,
            targetClasses: target.className,
            isModalOpen: self.isModalOpen,
          });
        }

        // 수동 모달 모드이고 모달 내부가 아닌 경우 차단
        if (self.isModalOpen) {
          if (self.options.debug) {
            console.log("✅ 수동 모달 모드 - 모달 내부 스크롤 허용");
          }
          return; // 수동 모달 모드에서는 모달 내부 모든 스크롤 허용
        }

        // 스크롤 가능한 요소 찾기 (모달 내부의 실제 스크롤 컨테이너)
        var scrollableElement = self.findScrollableElement(
          target,
          modalElement
        );

        if (scrollableElement) {
          var scrollTop = scrollableElement.scrollTop;
          var scrollHeight = scrollableElement.scrollHeight;
          var clientHeight = scrollableElement.clientHeight;
          var maxScrollTop = scrollHeight - clientHeight;

          if (e.type === "wheel") {
            // 휠 스크롤의 경우 오버스크롤 체크
            var deltaY = e.deltaY || e.detail || e.wheelDelta;
            var isScrollingDown = deltaY > 0;
            var isScrollingUp = deltaY < 0;

            // 스크롤 끝에서 더 스크롤하려고 할 때 body 스크롤 차단
            var shouldBlockOverscroll = false;

            if (isScrollingUp && scrollTop <= 0) {
              // 맨 위에서 위로 더 스크롤하려고 할 때
              shouldBlockOverscroll = true;
            } else if (isScrollingDown && scrollTop >= maxScrollTop) {
              // 맨 아래에서 아래로 더 스크롤하려고 할 때
              shouldBlockOverscroll = true;
            }

            if (shouldBlockOverscroll) {
              if (self.options.debug) {
                console.log("🚫 모달 휠 오버스크롤 차단:", {
                  direction: isScrollingUp ? "위로" : "아래로",
                  scrollTop: scrollTop,
                  maxScrollTop: maxScrollTop,
                  reason: isScrollingUp ? "맨_위_도달" : "맨_아래_도달",
                });
              }
              e.preventDefault();
              return;
            }
          } else if (e.type === "touchmove") {
            // 터치 스크롤의 경우 - CSS overscroll-behavior에 주로 의존
            // 모바일에서는 자연스러운 터치 스크롤을 위해 오버스크롤 차단을 최소화
            var isAtTop = scrollTop <= 0;
            var isAtBottom = scrollTop >= maxScrollTop;

            // 정확히 끝에 도달했을 때만 차단 (여유값 제거)
            if ((isAtTop || isAtBottom) && maxScrollTop > 0) {
              if (self.options.debug) {
                console.log("🚫 모달 터치 오버스크롤 차단 (정확한 끝):", {
                  scrollTop: scrollTop,
                  maxScrollTop: maxScrollTop,
                  isAtTop: isAtTop,
                  isAtBottom: isAtBottom,
                });
              }
              // 모바일에서는 더 관대하게 - preventDefault 하지 않고 CSS에 의존
              // e.preventDefault();
              // return;
            }
          }
        }

        if (self.options.debug) {
          console.log("✅ 모달 내부 스크롤 허용:", {
            modalElement: modalElement.tagName,
            scrollableElement: scrollableElement
              ? scrollableElement.tagName
              : "none",
            classes: Array.from(modalElement.classList).join(" "),
            modalMode: self.isModalOpen ? "수동활성" : "자동감지",
          });
        }
        return; // 모달 내부에서는 기본 스크롤 허용 (오버스크롤 제외)
      }

      // 모달이 아닌 경우 body 스크롤 차단
      if (self.options.debug) {
        console.log("❌ Body 스크롤 차단:", {
          target:
            target.tagName + (target.className ? "." + target.className : ""),
          modalMode: self.isModalOpen ? "수동활성" : "비활성",
          reason: self.isModalOpen ? "수동_모달_모드_외부" : "일반_body_스크롤",
        });
      }

      e.preventDefault();
    };

    // 스크롤 가능한 요소를 찾는 헬퍼 함수 (React 환경 최적화)
    this.findScrollableElement = function (startElement, modalElement) {
      var element = startElement;

      // React 환경에서 자주 사용되는 스크롤 컨테이너 클래스명들
      var reactScrollContainers = [
        "modal-content",
        "modal-body",
        "dialog-content",
        "popup-content",
        "ReactModal__Content",
        "Modal__content",
        "scroll-container",
      ];

      while (element && element !== modalElement.parentElement) {
        // React 스크롤 컨테이너 클래스명 우선 확인
        var classList = element.classList || [];
        for (var i = 0; i < reactScrollContainers.length; i++) {
          if (classList.contains(reactScrollContainers[i])) {
            if (self.options.debug) {
              console.log("🎯 React 스크롤 컨테이너 발견:", {
                className: reactScrollContainers[i],
                tagName: element.tagName,
                scrollHeight: element.scrollHeight,
                clientHeight: element.clientHeight,
              });
            }

            // 실제로 스크롤 가능한지 확인
            if (element.scrollHeight > element.clientHeight) {
              var computedStyle = window.getComputedStyle(element);
              var overflowY = computedStyle.overflowY;

              if (
                overflowY === "auto" ||
                overflowY === "scroll" ||
                overflowY === "visible"
              ) {
                return element;
              }
            }
          }
        }

        // 일반적인 스크롤 가능 요소 확인
        if (element.scrollHeight > element.clientHeight) {
          var computedStyle = window.getComputedStyle(element);
          var overflowY = computedStyle.overflowY;

          if (overflowY === "auto" || overflowY === "scroll") {
            if (self.options.debug) {
              console.log("📜 일반 스크롤 요소 발견:", {
                tagName: element.tagName,
                overflowY: overflowY,
                scrollHeight: element.scrollHeight,
                clientHeight: element.clientHeight,
              });
            }
            return element;
          }
        }
        element = element.parentElement;
      }

      // 모달 자체가 스크롤 가능한지 확인
      if (
        modalElement &&
        modalElement.scrollHeight > modalElement.clientHeight
      ) {
        var modalStyle = window.getComputedStyle(modalElement);
        var modalOverflowY = modalStyle.overflowY;

        if (modalOverflowY === "auto" || modalOverflowY === "scroll") {
          if (self.options.debug) {
            console.log("🎭 모달 자체 스크롤 가능:", {
              tagName: modalElement.tagName,
              overflowY: modalOverflowY,
            });
          }
          return modalElement;
        }
      }

      if (self.options.debug) {
        console.log("❌ 스크롤 가능한 요소를 찾을 수 없음");
      }
      return null;
    };

    // 휠과 터치 이벤트를 직접 차단
    document.addEventListener("wheel", this.preventScroll, { passive: false });
    document.addEventListener("touchmove", this.preventScroll, {
      passive: false,
    });

    if (this.options.debug) {
      console.log("✅ 모달 친화적 스크롤 시스템 적용");
    }
  };

  TwoDimensionScroll.prototype.bindEvents = function () {
    if (!isClient()) return;

    var self = this;

    // React 친화적 이벤트 바인딩
    this.eventManager.add(
      document,
      "wheel",
      function (e) {
        if (self.isDestroyed) return;
        self.onWheel(e);
      },
      this.passive
    );

    if (isTouchDevice()) {
      this.eventManager.add(
        document,
        "touchstart",
        function (e) {
          if (self.isDestroyed) return;
          self.onTouchStart(e);
        },
        this.passive
      );
      this.eventManager.add(
        document,
        "touchmove",
        function (e) {
          if (self.isDestroyed) return;
          self.onTouchMove(e);
        },
        this.passive
      );
      this.eventManager.add(
        document,
        "touchend",
        function (e) {
          if (self.isDestroyed) return;
          self.onTouchEnd(e);
        },
        this.passive
      );
    }

    this.eventManager.add(document, "keydown", function (e) {
      if (self.isDestroyed) return;
      self.onKeyDown(e);
    });

    this.eventManager.add(
      window,
      "resize",
      throttle(function () {
        if (self.isDestroyed) return;
        self.onResize();
      }, 100)
    );

    // React 상태 변경 감지 시작
    if (this.isReactEnv) {
      this.reactStateObserver.add(function () {
        if (self.isDestroyed) return;
        // React 컴포넌트 re-render 시 환경 변경 체크
        self.updateEnvironment();
      });
    }

    if (this.options.debug) {
      console.log("🔗 이벤트 바인딩 완료:", {
        환경: this.isReactEnv ? "React" : "Vanilla",
        이벤트_개수: this.eventManager.getCount(),
      });
    }
  };

  // lenis 스타일 애니메이션 루프
  TwoDimensionScroll.prototype.startAnimationLoop = function () {
    var self = this;

    function animate() {
      // lerp를 사용한 부드러운 스크롤
      var oldAnimatedScroll = self.animatedScroll;
      self.animatedScroll = lerp(
        self.animatedScroll,
        self.targetScroll,
        self.options.lerp
      );

      // 경계값 처리
      var maxScrollTop = getMaxScrollTop();
      self.animatedScroll = clamp(self.animatedScroll, 0, maxScrollTop);
      self.targetScroll = clamp(self.targetScroll, 0, maxScrollTop);

      // 차이값 계산
      var difference = Math.abs(self.targetScroll - self.animatedScroll);
      var positionChange = Math.abs(self.animatedScroll - oldAnimatedScroll);

      // 정지 조건: 목표와 현재 위치가 거의 같고, 위치 변화가 거의 없을 때
      if (difference < 0.5 && positionChange < 0.1) {
        // 최종 위치로 정확히 설정
        self.animatedScroll = self.targetScroll;
        window.scrollTo(0, self.animatedScroll);

        // 애니메이션 중지
        self.isScrolling = false;
        self.rafId = null; // rafId 정리

        if (self.options.debug) {
          console.log("⏹️ 애니메이션 정지:", {
            finalPosition: Math.round(self.animatedScroll),
            difference: Math.round(difference * 100) / 100,
          });
        }

        // 애니메이션 루프 종료
        return;
      }

      // 스크롤이 활성 상태일 때만 DOM 업데이트
      if (difference > 0.1 || positionChange > 0.05) {
        // 실제 DOM 스크롤 적용 - window.scrollTo() 사용
        window.scrollTo(0, self.animatedScroll);

        // 접근성: 스크롤 위치 알림
        if (self.options.accessibility?.announceScrollPosition) {
          self.announceScrollPosition();
        }

        // 스크롤 이벤트 콜백 실행
        if (difference > 0.5) {
          self.isScrolling = true;

          var eventData = {
            deltaX: 0,
            deltaY: self.targetScroll - self.animatedScroll,
            scrollTop: self.animatedScroll,
            direction: self.targetScroll > self.animatedScroll ? 1 : -1,
            type: "smooth",
          };

          for (var i = 0; i < self.scrollCallbacks.length; i++) {
            self.scrollCallbacks[i](eventData);
          }
        } else {
          self.isScrolling = false;
        }

        if (self.options.debug && difference > 0.1) {
          console.log("🎯 lenis 스크롤:", {
            targetScroll: Math.round(self.targetScroll),
            animatedScroll: Math.round(self.animatedScroll),
            difference: Math.round(difference * 100) / 100,
            positionChange: Math.round(positionChange * 100) / 100,
          });
        }
      }

      // 다음 프레임 예약
      self.rafId = raf(animate);
    }

    animate();
  };

  TwoDimensionScroll.prototype.onWheel = function (event) {
    if (this.options.disabled) return;

    // 모달이 열려있을 때는 라이브러리 스크롤 비활성화 및 기본 스크롤 차단
    if (this.isModalOpen) {
      if (this.options.debug) {
        console.log("🎭 모달 모드: onWheel 비활성화 및 기본 스크롤 차단");
      }
      this.preventScroll(event); // preventScroll을 통해 모달 내부/외부 구분 처리
      return;
    }

    var deltaX = event.deltaX;
    var deltaY = event.deltaY;

    // deltaMode에 따른 값 정규화
    var normalizedDeltaX = deltaX;
    var normalizedDeltaY = deltaY;

    if (event.deltaMode === 1) {
      // DOM_DELTA_LINE
      normalizedDeltaX *= 40;
      normalizedDeltaY *= 40;
    } else if (event.deltaMode === 2) {
      // DOM_DELTA_PAGE
      normalizedDeltaX *= window.innerHeight * 0.8;
      normalizedDeltaY *= window.innerHeight * 0.8;
    }

    // 민감도 적용
    var adjustedDeltaX = normalizedDeltaX * this.options.horizontalSensitivity;
    var adjustedDeltaY = normalizedDeltaY * this.options.verticalSensitivity;

    if (this.options.debug) {
      console.log("🖱️ 휠 이벤트:", {
        원시_deltaX: deltaX,
        원시_deltaY: deltaY,
        조정된_deltaX: adjustedDeltaX,
        조정된_deltaY: adjustedDeltaY,
        가로스크롤_감지:
          Math.abs(adjustedDeltaX) > Math.abs(adjustedDeltaY)
            ? "✅ YES"
            : "❌ NO",
      });
    }

    var combinedDelta = this.calculateCombinedDelta(
      adjustedDeltaX,
      adjustedDeltaY
    );
    this.addToScroll(combinedDelta * this.options.wheelMultiplier);
  };

  // lenis 스타일 스크롤 추가 함수
  TwoDimensionScroll.prototype.addToScroll = function (delta) {
    var maxScrollTop = getMaxScrollTop();
    var oldTargetScroll = this.targetScroll;
    this.targetScroll = clamp(this.targetScroll + delta, 0, maxScrollTop);

    // 실제로 스크롤 위치가 변경되었고, 애니메이션이 정지되어 있다면 재시작
    if (Math.abs(this.targetScroll - oldTargetScroll) > 0.1 && !this.rafId) {
      if (this.options.debug) {
        console.log("🔄 애니메이션 재시작:", {
          oldTarget: Math.round(oldTargetScroll),
          newTarget: Math.round(this.targetScroll),
          delta: Math.round(delta),
        });
      }
      this.startAnimationLoop();
    }
  };

  TwoDimensionScroll.prototype.onTouchStart = function (event) {
    if (this.options.disabled) return;

    var touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();

    this.lastTouchX = touch.clientX;
    this.lastTouchY = touch.clientY;
    this.lastTouchTime = this.touchStartTime;
    this.touchVelocityX = 0;
    this.touchVelocityY = 0;
    this.touchMoveCount = 0;

    if (this.touchStopTimer) {
      clearTimeout(this.touchStopTimer);
      this.touchStopTimer = null;
    }

    if (this.options.debug) {
      console.log("👆 터치 시작:", {
        x: touch.clientX,
        y: touch.clientY,
      });
    }
  };

  TwoDimensionScroll.prototype.onTouchMove = function (event) {
    if (this.options.disabled) return;

    var touch = event.touches[0];
    var currentTime = Date.now();

    var currentDeltaX = this.lastTouchX - touch.clientX;
    var currentDeltaY = this.lastTouchY - touch.clientY;

    var movementDistance = Math.sqrt(
      currentDeltaX * currentDeltaX + currentDeltaY * currentDeltaY
    );

    if (movementDistance > this.options.touchStopThreshold) {
      if (this.touchStopTimer) {
        clearTimeout(this.touchStopTimer);
        this.touchStopTimer = null;
      }

      var timeDelta = currentTime - this.lastTouchTime;
      if (timeDelta > 0) {
        this.touchVelocityX = currentDeltaX / timeDelta;
        this.touchVelocityY = currentDeltaY / timeDelta;
      }

      var adjustedDeltaX =
        currentDeltaX *
        this.options.horizontalSensitivity *
        this.options.touchMultiplier;
      var adjustedDeltaY =
        currentDeltaY *
        this.options.verticalSensitivity *
        this.options.touchMultiplier;

      // 모달이 열려있을 때는 preventScroll을 통해 모달 내부/외부 구분 처리
      if (this.isModalOpen) {
        this.preventScroll(event); // preventScroll을 통해 모달 내부/외부 구분 처리
        if (this.options.debug) {
          console.log("🎭 모달 모드: onTouchMove - preventScroll 호출");
        }
      } else if (Math.abs(adjustedDeltaX) > 3 || Math.abs(adjustedDeltaY) > 3) {
        var combinedDelta = this.calculateCombinedDelta(
          adjustedDeltaX,
          adjustedDeltaY
        );
        this.addToScroll(combinedDelta);
      }

      this.lastTouchX = touch.clientX;
      this.lastTouchY = touch.clientY;
      this.lastTouchTime = currentTime;
      this.touchMoveCount++;
    } else {
      var self = this;
      if (!this.touchStopTimer) {
        this.touchStopTimer = setTimeout(function () {
          self.touchVelocityX *= 0.8;
          self.touchVelocityY *= 0.8;
          self.touchStopTimer = null;
        }, 100);
      }
    }
  };

  TwoDimensionScroll.prototype.onTouchEnd = function (event) {
    if (this.options.disabled) return;

    if (this.touchStopTimer) {
      clearTimeout(this.touchStopTimer);
      this.touchStopTimer = null;
    }

    var touch = event.changedTouches[0];
    var deltaTime = Date.now() - this.touchStartTime;
    var totalDeltaY = this.touchStartY - touch.clientY;

    // 플링 제스처 처리
    if (
      deltaTime < 300 &&
      Math.abs(totalDeltaY) > 50 &&
      this.touchMoveCount > 3
    ) {
      var velocity = this.touchVelocityY;
      // 환경별 플링 배수 적용
      var flingMultiplier =
        this.options.flingMultiplier !== undefined
          ? this.options.flingMultiplier
          : 1.0;
      var flingDistance = velocity * 400 * flingMultiplier;

      if (Math.abs(flingDistance) > 50) {
        // 모달이 열려있을 때는 body 스크롤 플링 제스처 차단
        if (!this.isModalOpen) {
          this.addToScroll(flingDistance);
        }

        if (this.options.debug) {
          console.log("🚀 플링 제스처:", {
            velocity: velocity,
            flingDistance: flingDistance,
            modalMode: this.isModalOpen ? "차단됨" : "허용됨",
          });
        }
      }
    }

    this.touchVelocityX = 0;
    this.touchVelocityY = 0;
    this.touchMoveCount = 0;
  };

  TwoDimensionScroll.prototype.onKeyDown = function (event) {
    if (this.options.disabled) return;

    // 모달이 열려있을 때는 라이브러리 스크롤 비활성화 및 기본 스크롤 차단
    if (this.isModalOpen) {
      if (this.options.debug) {
        console.log("🎭 모달 모드: onKeyDown 비활성화 및 기본 스크롤 차단");
      }
      this.preventScroll(event); // preventScroll을 통해 모달 내부/외부 구분 처리
      return;
    }

    var delta = 0;
    // 환경별 키보드 스크롤 양 적용
    var scrollRatio =
      this.options.keyboardScrollAmount !== undefined
        ? this.options.keyboardScrollAmount
        : 0.8;
    var scrollAmount = window.innerHeight * scrollRatio;

    var announcement;

    switch (event.key) {
      case "ArrowUp":
      case "PageUp":
        delta = -scrollAmount;
        announcement = "위로 스크롤했습니다";
        break;
      case "ArrowDown":
      case "PageDown":
      case " ":
        delta = scrollAmount;
        announcement = "아래로 스크롤했습니다";
        break;
      case "Home":
        event.preventDefault();
        this.accessibleScrollTo(0, "페이지 최상단으로 이동했습니다");
        return;
      case "End":
        event.preventDefault();
        this.accessibleScrollTo(
          getMaxScrollTop(),
          "페이지 최하단으로 이동했습니다"
        );
        return;
      default:
        return;
    }

    event.preventDefault();

    // 접근성 고려 스크롤
    if (
      this.keyboardNavigationActive &&
      this.options.accessibility?.keyboardNavigation
    ) {
      // 키보드 사용자를 위한 부드러운 스크롤
      var newPosition = clamp(this.targetScroll + delta, 0, getMaxScrollTop());
      this.accessibleScrollTo(newPosition, announcement);
    } else {
      // 일반 스크롤
      this.addToScroll(delta);
    }
  };

  TwoDimensionScroll.prototype.onResize = function () {
    var maxScrollTop = getMaxScrollTop();
    if (this.targetScroll > maxScrollTop) {
      this.targetScroll = maxScrollTop;
    }
    this.updateEnvironment(); // 리사이즈 시 환경 변경 감지
  };

  TwoDimensionScroll.prototype.calculateCombinedDelta = function (
    deltaX,
    deltaY
  ) {
    var absX = Math.abs(deltaX);
    var absY = Math.abs(deltaY);

    if (absX > absY * 0.7) {
      return deltaX;
    }

    if (absY > absX * 0.7) {
      return deltaY;
    }

    var magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    var angle = Math.atan2(deltaY, deltaX);

    if (Math.abs(angle) < Math.PI / 3 || Math.abs(angle) > (2 * Math.PI) / 3) {
      return deltaX > 0 ? magnitude : -magnitude;
    } else {
      return deltaY > 0 ? magnitude : -magnitude;
    }
  };

  // === 공개 메서드들 (lenis 호환) ===
  TwoDimensionScroll.prototype.scrollTo = function (position, options) {
    var maxScrollTop = getMaxScrollTop();
    this.targetScroll = clamp(position, 0, maxScrollTop);

    // 즉시 스크롤 옵션
    if (options && options.immediate) {
      this.animatedScroll = this.targetScroll;
      window.scrollTo(0, this.animatedScroll);
    }

    // 애니메이션이 정지되어 있다면 재시작
    if (
      !this.rafId &&
      Math.abs(this.targetScroll - this.animatedScroll) > 0.1
    ) {
      this.startAnimationLoop();
    }
  };

  TwoDimensionScroll.prototype.on = function (callback) {
    this.scrollCallbacks.push(callback);
  };

  TwoDimensionScroll.prototype.off = function (callback) {
    var index = this.scrollCallbacks.indexOf(callback);
    if (index > -1) {
      this.scrollCallbacks.splice(index, 1);
    }
  };

  TwoDimensionScroll.prototype.disable = function () {
    this.options.disabled = true;
    this.log("스크롤 비활성화");
  };

  TwoDimensionScroll.prototype.enable = function () {
    this.options.disabled = false;
    this.log("스크롤 활성화");
  };

  TwoDimensionScroll.prototype.updateOptions = function (newOptions) {
    // 사용자 옵션 업데이트 후 재병합
    this.originalUserOptions = this.originalUserOptions || {};

    // 새로운 옵션을 기존 사용자 옵션에 병합
    for (var key in newOptions) {
      if (newOptions.hasOwnProperty(key)) {
        this.originalUserOptions[key] = newOptions[key];
      }
    }

    // 환경별 옵션 재병합
    this.options = this.mergeOptions(this.originalUserOptions);

    if (this.options.debug) {
      console.log("🔧 옵션 업데이트 완료:", {
        environment: this.currentEnvironment,
        updatedOptions: newOptions,
        finalOptions: this.options,
      });
    }
  };

  TwoDimensionScroll.prototype.getCurrentPosition = function () {
    return this.animatedScroll;
  };

  TwoDimensionScroll.prototype.getMaxPosition = function () {
    return getMaxScrollTop();
  };

  // === 환경별 최적화 API ===

  // 현재 환경 정보 조회
  TwoDimensionScroll.prototype.getEnvironmentInfo = function () {
    return {
      current: this.currentEnvironment,
      isMobile: this.isMobileDevice,
      isTablet: this.isTabletDevice,
      isDesktop: this.isDesktopDevice,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      isTouchCapable: isTouchDevice(),
      userAgent: navigator.userAgent,
    };
  };

  // 특정 환경의 옵션 업데이트
  TwoDimensionScroll.prototype.updateEnvironmentOptions = function (
    environment,
    options
  ) {
    this.originalUserOptions = this.originalUserOptions || {};
    this.originalUserOptions[environment] =
      this.originalUserOptions[environment] || {};

    // 해당 환경 옵션 업데이트
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        this.originalUserOptions[environment][key] = options[key];
      }
    }

    // 현재 환경이 업데이트된 환경과 같으면 즉시 적용
    if (this.currentEnvironment === environment) {
      this.options = this.mergeOptions(this.originalUserOptions);

      if (this.options.debug) {
        console.log("🎯 현재 환경 옵션 즉시 적용:", {
          environment: environment,
          updatedOptions: options,
          newOptions: this.options,
        });
      }
    } else {
      if (this.options.debug) {
        console.log("💾 환경 옵션 저장 (다음 환경 변경 시 적용):", {
          targetEnvironment: environment,
          currentEnvironment: this.currentEnvironment,
          savedOptions: options,
        });
      }
    }
  };

  // 모든 환경의 기본값으로 리셋
  TwoDimensionScroll.prototype.resetToDefaults = function () {
    this.originalUserOptions = {};
    this.options = this.mergeOptions({});

    if (this.options.debug) {
      console.log("🔄 기본값으로 리셋 완료:", {
        environment: this.currentEnvironment,
        resetOptions: this.options,
      });
    }
  };

  // 환경별 성능 최적화 프리셋 적용
  TwoDimensionScroll.prototype.applyPerformancePreset = function (presetName) {
    var presets = {
      smooth: {
        desktop: { lerp: 0.08, duration: 1200, precisionMode: true }, // ms 단위
        mobile: { lerp: 0.12, duration: 900, bounceEffect: true }, // ms 단위
        tablet: { lerp: 0.1, duration: 1000, hybridMode: true }, // ms 단위
      },
      fast: {
        desktop: { lerp: 0.15, duration: 600, wheelMultiplier: 1.5 }, // ms 단위
        mobile: { lerp: 0.2, duration: 500, touchMultiplier: 3.0 }, // ms 단위
        tablet: { lerp: 0.18, duration: 550, wheelMultiplier: 1.3 }, // ms 단위
      },
      precise: {
        desktop: {
          lerp: 0.05,
          duration: 1500, // ms 단위
          precisionMode: true,
          wheelMultiplier: 0.8,
        },
        mobile: {
          lerp: 0.08,
          duration: 1200, // ms 단위
          touchMultiplier: 2.0,
          touchStopThreshold: 3,
        },
        tablet: {
          lerp: 0.06,
          duration: 1300, // ms 단위
          hybridMode: true,
          wheelMultiplier: 0.9,
        },
      },
    };

    var preset = presets[presetName];
    if (!preset) {
      console.warn(
        "⚠️ 알 수 없는 프리셋:",
        presetName,
        "사용 가능:",
        Object.keys(presets)
      );
      return;
    }

    // 모든 환경에 프리셋 적용
    for (var env in preset) {
      this.updateEnvironmentOptions(env, preset[env]);
    }

    if (this.options.debug) {
      console.log("🎨 성능 프리셋 적용 완료:", {
        preset: presetName,
        appliedTo: Object.keys(preset),
        currentOptions: this.options,
      });
    }
  };

  // 현재 환경에 최적화된 빠른 설정
  TwoDimensionScroll.prototype.optimizeForCurrentEnvironment = function () {
    var optimizations = {};

    if (this.isDesktopDevice) {
      optimizations = {
        lerp: 0.1,
        wheelMultiplier: 1.2,
        precisionMode: true,
        keyboardScrollAmount: 0.75,
      };
    } else if (this.isMobileDevice) {
      optimizations = {
        lerp: 0.15,
        touchMultiplier: 2.8,
        bounceEffect: true,
        flingMultiplier: 1.3,
        touchStopThreshold: 4,
      };
    } else if (this.isTabletDevice) {
      optimizations = {
        lerp: 0.12,
        wheelMultiplier: 1.1,
        touchMultiplier: 2.3,
        hybridMode: true,
      };
    }

    this.updateEnvironmentOptions(this.currentEnvironment, optimizations);

    if (this.options.debug) {
      console.log("⚡ 현재 환경 최적화 완료:", {
        environment: this.currentEnvironment,
        optimizations: optimizations,
      });
    }
  };

  // === 모달 제어 API ===
  TwoDimensionScroll.prototype.pauseForModal = function () {
    this.isModalOpen = true;

    // 현재 스크롤 위치 저장 (position: fixed로 인한 위치 초기화 방지)
    this.savedScrollPosition =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    // 바디 스크롤 완전 차단을 위한 CSS 클래스 추가
    if (document.body) {
      document.body.classList.add("twodimension-modal-open");
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.body.style.top = "-" + this.savedScrollPosition + "px";
    }

    // HTML 요소에도 적용
    if (document.documentElement) {
      document.documentElement.style.overflow = "hidden";
    }

    if (this.options.debug) {
      console.log("🎭 모달 모드 활성화: body 스크롤 완전 차단", {
        저장된_위치: this.savedScrollPosition + "px",
      });
    }
  };

  TwoDimensionScroll.prototype.resumeFromModal = function () {
    this.isModalOpen = false;

    // 바디 스크롤 차단 해제
    if (document.body) {
      document.body.classList.remove("twodimension-modal-open");
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.body.style.top = "";
    }

    // HTML 요소 스타일도 복원
    if (document.documentElement) {
      document.documentElement.style.overflow = "";
    }

    // 저장된 스크롤 위치로 복원
    if (typeof this.savedScrollPosition === "number") {
      window.scrollTo(0, this.savedScrollPosition);
      this.targetScroll = this.savedScrollPosition;
      this.animatedScroll = this.savedScrollPosition;
    }

    if (this.options.debug) {
      console.log("🎭 모달 모드 해제: body 스크롤 재개", {
        복원된_위치: this.savedScrollPosition + "px",
      });
    }
  };

  TwoDimensionScroll.prototype.isInModalMode = function () {
    return this.isModalOpen || false;
  };

  // lenis 호환 속성들
  Object.defineProperty(TwoDimensionScroll.prototype, "scroll", {
    get: function () {
      return this.animatedScroll;
    },
  });

  Object.defineProperty(TwoDimensionScroll.prototype, "limit", {
    get: function () {
      return getMaxScrollTop();
    },
  });

  // React 친화적인 완전한 정리 메서드
  TwoDimensionScroll.prototype.destroy = function () {
    if (this.isDestroyed) {
      console.warn("TwoDimensionScroll: 이미 해제된 인스턴스입니다.");
      return;
    }

    this.isDestroyed = true;

    // 애니메이션 정리
    if (this.touchStopTimer) {
      clearTimeout(this.touchStopTimer);
      this.touchStopTimer = null;
    }

    if (this.rafId) {
      cancelRaf(this.rafId);
      this.rafId = null;
    }

    // React 호환성 시스템 정리
    if (this.eventManager) {
      this.eventManager.removeAll();
    }

    if (this.reactStateObserver) {
      this.reactStateObserver.destroy();
    }

    if (this.routerCompatibility) {
      this.routerCompatibility.destroy();
    }

    // DOM 요소 정리 (React-safe)
    safeDOM(
      function () {
        // 스타일 요소 제거
        if (this.styleElement && this.styleElement.parentNode) {
          this.styleElement.parentNode.removeChild(this.styleElement);
          this.styleElement = null;
        }

        // ARIA Live Region 제거
        if (this.ariaLiveRegion && this.ariaLiveRegion.parentNode) {
          this.ariaLiveRegion.parentNode.removeChild(this.ariaLiveRegion);
          this.ariaLiveRegion = null;
        }

        // 접근성 스타일 제거
        var a11yStyle = document.getElementById(
          "twodimension-scroll-a11y-styles"
        );
        if (a11yStyle && a11yStyle.parentNode) {
          a11yStyle.parentNode.removeChild(a11yStyle);
        }

        // body 클래스 정리
        if (document.body.classList.contains("keyboard-user")) {
          document.body.classList.remove("keyboard-user");
        }
      }.bind(this)
    );

    // 레거시 이벤트 리스너 정리 (혹시 남아있을 수 있는)
    if (isClient() && this.preventScroll) {
      try {
        document.removeEventListener("wheel", this.preventScroll);
        document.removeEventListener("touchmove", this.preventScroll);
      } catch (e) {
        // 이미 제거되었거나 존재하지 않는 경우 무시
      }
    }

    // 상태 초기화
    this.scrollCallbacks = [];
    this.targetScroll = 0;
    this.animatedScroll = 0;
    this.isScrolling = false;
    this.isAnimating = false;
    this.isModalOpen = false;

    // 옵션 및 참조 정리
    this.options = null;
    this.accessibilitySettings = null;
    this.originalUserOptions = null;

    if (this.options?.debug) {
      console.log("🗑️ TwoDimensionScroll 완전 해제 완료 (React 친화적)");
    }
  };

  // React useEffect cleanup을 위한 간편 메서드
  TwoDimensionScroll.prototype.cleanup = function () {
    return this.destroy.bind(this);
  };

  // React 환경 정보 조회
  TwoDimensionScroll.prototype.getReactCompatibilityInfo = function () {
    return {
      isReactEnvironment: this.isReactEnv,
      isDestroyed: this.isDestroyed,
      eventListenerCount: this.eventManager ? this.eventManager.getCount() : 0,
      hasReactRouter: this.routerCompatibility
        ? this.routerCompatibility.isActive()
        : false,
      stateObserverActive: this.reactStateObserver && !this.isDestroyed,
    };
  };

  TwoDimensionScroll.prototype.log = function () {
    if (this.options.debug && console && console.log) {
      var args = Array.prototype.slice.call(arguments);
      args.unshift("[TwoDimensionScroll]");
      console.log.apply(console, args);
    }
  };

  // 이징 함수들도 클래스에 추가
  TwoDimensionScroll.Easing = Easing;

  // === 전역 변수로 설정 ===
  // Debug log removed for production

  if (typeof window !== "undefined") {
    window.TwoDimensionScroll = TwoDimensionScroll;
    window.TwoDimensionScrollClass = TwoDimensionScroll;

    // Debug log removed for production
  }

  // CommonJS
  if (typeof module !== "undefined" && module.exports) {
    module.exports = TwoDimensionScroll;
  }

  // AMD
  if (typeof define === "function" && define.amd) {
    define(function () {
      return TwoDimensionScroll;
    });
  }

  // 글로벌 객체에도 설정
  if (typeof global !== "undefined") {
    global.TwoDimensionScroll = TwoDimensionScroll;
  }

  // Debug log removed for production

  // === React 호환성 및 SSR 안전성 강화 ===

  // SSR 환경 감지
  function isClient() {
    return typeof window !== "undefined" && typeof document !== "undefined";
  }

  // React 환경 감지
  function isReactEnvironment() {
    if (!isClient()) return false;
    return !!(
      window.React ||
      document.querySelector("[data-reactroot]") ||
      document.querySelector("#root") ||
      document.querySelector("#__next")
    );
  }

  // 안전한 DOM 조작 래퍼
  function safeDOM(operation) {
    if (!isClient()) {
      if (console && console.warn) {
        console.warn(
          "TwoDimensionScroll: DOM operation attempted in non-client environment"
        );
      }
      return null;
    }
    return operation();
  }

  // React-friendly 이벤트 리스너 관리
  function createEventManager() {
    var listeners = [];

    return {
      add: function (element, event, handler, options) {
        if (!isClient()) return;

        var wrappedHandler = function (e) {
          // React의 합성 이벤트와 충돌 방지
          if (e.isPropagationStopped && e.isPropagationStopped()) return;
          handler(e);
        };

        element.addEventListener(event, wrappedHandler, options);
        listeners.push({
          element: element,
          event: event,
          handler: wrappedHandler,
          options: options,
        });
      },

      removeAll: function () {
        listeners.forEach(function (listener) {
          if (listener.element && listener.element.removeEventListener) {
            listener.element.removeEventListener(
              listener.event,
              listener.handler,
              listener.options
            );
          }
        });
        listeners = [];
      },

      getCount: function () {
        return listeners.length;
      },
    };
  }

  // React 상태 변경 감지 및 대응
  function createReactStateObserver() {
    var observers = [];
    var rafId = null;

    function checkStateChanges() {
      if (!isClient()) return;

      observers.forEach(function (observer) {
        if (typeof observer === "function") {
          try {
            observer();
          } catch (e) {
            console.warn("TwoDimensionScroll: Observer error:", e);
          }
        }
      });

      rafId = requestAnimationFrame(checkStateChanges);
    }

    return {
      add: function (observer) {
        observers.push(observer);
        if (observers.length === 1 && !rafId) {
          checkStateChanges();
        }
      },

      remove: function (observer) {
        var index = observers.indexOf(observer);
        if (index > -1) {
          observers.splice(index, 1);
        }

        if (observers.length === 0 && rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      },

      destroy: function () {
        observers = [];
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
    };
  }

  // React Router 호환성
  function createRouterCompatibility() {
    var isReactRouter = false;
    var originalPushState = null;
    var originalReplaceState = null;

    function detectReactRouter() {
      if (!isClient()) return false;

      // React Router 감지
      return !!(
        window.history.pushState &&
        (document.querySelector("[data-reach-router]") ||
          document.querySelector("[data-react-router]") ||
          window.__REACT_ROUTER__ ||
          (window.history.state && window.history.state.key))
      );
    }

    function wrapHistoryMethods(scrollInstance) {
      if (!window.history) return;

      originalPushState = window.history.pushState;
      originalReplaceState = window.history.replaceState;

      window.history.pushState = function () {
        var result = originalPushState.apply(this, arguments);
        // 라우트 변경 시 스크롤 위치 리셋
        setTimeout(function () {
          if (scrollInstance && typeof scrollInstance.scrollTo === "function") {
            scrollInstance.scrollTo(0, { immediate: true });
          }
        }, 0);
        return result;
      };

      window.history.replaceState = function () {
        var result = originalReplaceState.apply(this, arguments);
        return result;
      };
    }

    function unwrapHistoryMethods() {
      if (originalPushState && window.history) {
        window.history.pushState = originalPushState;
      }
      if (originalReplaceState && window.history) {
        window.history.replaceState = originalReplaceState;
      }
    }

    return {
      init: function (scrollInstance) {
        if (!isClient()) return;

        isReactRouter = detectReactRouter();

        if (isReactRouter) {
          wrapHistoryMethods(scrollInstance);

          // popstate 이벤트 리스너 추가
          window.addEventListener("popstate", function () {
            setTimeout(function () {
              if (
                scrollInstance &&
                typeof scrollInstance.updateEnvironment === "function"
              ) {
                scrollInstance.updateEnvironment();
              }
            }, 100);
          });
        }
      },

      destroy: function () {
        if (isReactRouter) {
          unwrapHistoryMethods();
        }
      },

      isActive: function () {
        return isReactRouter;
      },
    };
  }

  // === 접근성 유틸리티 함수들 ===
})(typeof window !== "undefined" ? window : this);
