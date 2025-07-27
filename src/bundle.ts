/**
 * TwoDimensionScroll - 완전한 번들 버전
 * 가로와 세로 스크롤을 모두 감지하여 부드러운 세로 스크롤로 변환하는 라이브러리
 */

// === 타입 정의 ===
export interface TwoDimensionScrollOptions {
  duration?: number;
  easing?: (t: number) => number;
  horizontalSensitivity?: number;
  verticalSensitivity?: number;
  disabled?: boolean;
  useNativeScrollOnMobile?: boolean;
  scrollableSelector?: string;
  debug?: boolean;
}

export interface ScrollEventData {
  deltaX: number;
  deltaY: number;
  scrollTop: number;
  direction: number;
  type: "wheel" | "touch" | "keyboard";
}

export interface AnimationFrame {
  startTime: number;
  startPosition: number;
  targetPosition: number;
  duration: number;
  easing: (t: number) => number;
}

export type ScrollCallback = (data: ScrollEventData) => void;

export const Easing = {
  linear: (t: number): number => t,
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => --t * t * t + 1,
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
} as const;

// === 유틸리티 함수들 ===
function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768
  );
}

function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getMaxScrollTop(): number {
  if (typeof document === "undefined") return 0;
  return Math.max(
    document.body.scrollHeight - window.innerHeight,
    document.documentElement.scrollHeight - window.innerHeight,
    0
  );
}

function getCurrentScrollTop(): number {
  if (typeof window === "undefined") return 0;
  return (
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

const raf = (() => {
  if (typeof window === "undefined")
    return (callback: FrameRequestCallback) => setTimeout(callback, 16);
  return (
    window.requestAnimationFrame ||
    (window as any).webkitRequestAnimationFrame ||
    ((callback: FrameRequestCallback) => setTimeout(callback, 16))
  );
})();

const cancelRaf = (() => {
  if (typeof window === "undefined") return clearTimeout;
  return (
    window.cancelAnimationFrame ||
    (window as any).webkitCancelAnimationFrame ||
    clearTimeout
  );
})();

function supportsPassive(): boolean {
  if (typeof window === "undefined") return false;
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, "passive", {
      get() {
        supportsPassive = true;
        return true;
      },
    });
    window.addEventListener("testPassive", () => {}, opts);
    window.removeEventListener("testPassive", () => {}, opts);
  } catch (e) {}
  return supportsPassive;
}

function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// === 메인 클래스 ===
export class TwoDimensionScroll {
  private options: Required<TwoDimensionScrollOptions>;
  private isAnimating: boolean = false;
  private animationFrame: AnimationFrame | null = null;
  private rafId: number | null = null;
  private lastScrollTop: number = 0;
  private touchStartY: number = 0;
  private touchStartX: number = 0;
  private touchStartTime: number = 0;
  private isScrolling: boolean = false;
  private scrollCallbacks: Set<ScrollCallback> = new Set();
  private isMobileDevice: boolean = false;
  private passive: boolean | { passive: boolean } = false;

  constructor(options: TwoDimensionScrollOptions = {}) {
    this.options = {
      duration: 1000,
      easing: Easing.easeOutCubic,
      horizontalSensitivity: 1,
      verticalSensitivity: 1,
      disabled: false,
      useNativeScrollOnMobile: true,
      scrollableSelector: "body",
      debug: false,
      ...options,
    };

    this.isMobileDevice = isMobile();
    this.passive = supportsPassive() ? { passive: false } : false;
    this.lastScrollTop = getCurrentScrollTop();

    this.init();
  }

  private init(): void {
    if (typeof window === "undefined") return;

    if (this.isMobileDevice && this.options.useNativeScrollOnMobile) {
      this.log("모바일 네이티브 스크롤 모드");
      return;
    }

    this.bindEvents();
    this.log("TwoDimensionScroll 초기화 완료");
  }

  private bindEvents(): void {
    document.addEventListener("wheel", this.onWheel, this.passive);

    if (isTouchDevice()) {
      document.addEventListener("touchstart", this.onTouchStart, this.passive);
      document.addEventListener("touchmove", this.onTouchMove, this.passive);
      document.addEventListener("touchend", this.onTouchEnd, this.passive);
    }

    document.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("resize", throttle(this.onResize, 100));
  }

  private onWheel = (event: WheelEvent): void => {
    if (this.options.disabled || this.isScrolling) return;

    event.preventDefault();

    const deltaX = event.deltaX * this.options.horizontalSensitivity;
    const deltaY = event.deltaY * this.options.verticalSensitivity;

    if (this.options.debug) {
      console.log("🖱️ 휠 이벤트:", {
        원시_deltaX: event.deltaX,
        원시_deltaY: event.deltaY,
        조정된_deltaX: deltaX,
        조정된_deltaY: deltaY,
        deltaMode: event.deltaMode,
        가로스크롤_감지:
          Math.abs(deltaX) > Math.abs(deltaY) ? "✅ YES" : "❌ NO",
      });
    }

    const combinedDelta = this.calculateCombinedDelta(deltaX, deltaY);
    this.handleScroll(combinedDelta, "wheel");
  };

  private onTouchStart = (event: TouchEvent): void => {
    if (this.options.disabled) return;

    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
  };

  private onTouchMove = (event: TouchEvent): void => {
    if (this.options.disabled || this.isScrolling) return;

    const touch = event.touches[0];
    const deltaX =
      (this.touchStartX - touch.clientX) * this.options.horizontalSensitivity;
    const deltaY =
      (this.touchStartY - touch.clientY) * this.options.verticalSensitivity;

    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      event.preventDefault();
      const combinedDelta = this.calculateCombinedDelta(deltaX, deltaY);
      this.handleScroll(combinedDelta, "touch");
    }
  };

  private onTouchEnd = (event: TouchEvent): void => {
    if (this.options.disabled) return;

    const touch = event.changedTouches[0];
    const deltaTime = Date.now() - this.touchStartTime;
    const deltaY = this.touchStartY - touch.clientY;

    if (deltaTime < 300 && Math.abs(deltaY) > 50) {
      const velocity = deltaY / deltaTime;
      const flingDistance = velocity * 200;
      this.handleScroll(flingDistance, "touch");
    }
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    if (this.options.disabled || this.isScrolling) return;

    let delta = 0;
    const scrollAmount = window.innerHeight * 0.8;

    switch (event.key) {
      case "ArrowUp":
      case "PageUp":
        delta = -scrollAmount;
        break;
      case "ArrowDown":
      case "PageDown":
      case " ":
        delta = scrollAmount;
        break;
      case "Home":
        delta = -getCurrentScrollTop();
        break;
      case "End":
        delta = getMaxScrollTop() - getCurrentScrollTop();
        break;
      default:
        return;
    }

    event.preventDefault();
    this.handleScroll(delta, "keyboard");
  };

  private onResize = (): void => {
    const maxScrollTop = getMaxScrollTop();
    const currentScrollTop = getCurrentScrollTop();

    if (currentScrollTop > maxScrollTop) {
      this.scrollTo(maxScrollTop);
    }
  };

  private calculateCombinedDelta(deltaX: number, deltaY: number): number {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX;
    }

    if (Math.abs(deltaY) >= Math.abs(deltaX)) {
      return deltaY;
    }

    const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);

    if (Math.abs(angle) < Math.PI / 4 || Math.abs(angle) > (3 * Math.PI) / 4) {
      return deltaX > 0 ? magnitude : -magnitude;
    } else {
      return deltaY > 0 ? magnitude : -magnitude;
    }
  }

  private handleScroll(delta: number, type: ScrollEventData["type"]): void {
    if (Math.abs(delta) < 1) return;

    const currentScrollTop = getCurrentScrollTop();
    const maxScrollTop = getMaxScrollTop();
    const targetScrollTop = clamp(currentScrollTop + delta, 0, maxScrollTop);

    if (Math.abs(targetScrollTop - currentScrollTop) < 1) return;

    const direction = delta > 0 ? 1 : -1;

    const eventData: ScrollEventData = {
      deltaX: 0,
      deltaY: delta,
      scrollTop: currentScrollTop,
      direction,
      type,
    };

    this.scrollCallbacks.forEach((callback) => callback(eventData));
    this.smoothScrollTo(targetScrollTop);
  }

  private smoothScrollTo(targetPosition: number): void {
    if (this.isAnimating) {
      cancelRaf(this.rafId!);
    }

    const startPosition = getCurrentScrollTop();
    const distance = targetPosition - startPosition;

    if (Math.abs(distance) < 1) return;

    this.animationFrame = {
      startTime: performance.now(),
      startPosition,
      targetPosition,
      duration: this.options.duration,
      easing: this.options.easing,
    };

    this.isAnimating = true;
    this.isScrolling = true;
    this.animate();
  }

  private animate = (): void => {
    if (!this.animationFrame) return;

    const now = performance.now();
    const elapsed = now - this.animationFrame.startTime;
    const progress = Math.min(elapsed / this.animationFrame.duration, 1);

    const easedProgress = this.animationFrame.easing(progress);
    const currentPosition =
      this.animationFrame.startPosition +
      (this.animationFrame.targetPosition - this.animationFrame.startPosition) *
        easedProgress;

    window.scrollTo(0, currentPosition);

    if (progress < 1) {
      this.rafId = raf(this.animate);
    } else {
      this.isAnimating = false;
      this.isScrolling = false;
      this.animationFrame = null;
      this.rafId = null;
    }
  };

  public scrollTo(position: number, duration?: number): void {
    const maxScrollTop = getMaxScrollTop();
    const targetPosition = clamp(position, 0, maxScrollTop);

    if (duration !== undefined) {
      const originalDuration = this.options.duration;
      this.options.duration = duration;
      this.smoothScrollTo(targetPosition);
      this.options.duration = originalDuration;
    } else {
      this.smoothScrollTo(targetPosition);
    }
  }

  public on(callback: ScrollCallback): void {
    this.scrollCallbacks.add(callback);
  }

  public off(callback: ScrollCallback): void {
    this.scrollCallbacks.delete(callback);
  }

  public disable(): void {
    this.options.disabled = true;
    this.log("스크롤 비활성화");
  }

  public enable(): void {
    this.options.disabled = false;
    this.log("스크롤 활성화");
  }

  public updateOptions(newOptions: Partial<TwoDimensionScrollOptions>): void {
    this.options = { ...this.options, ...newOptions };
    this.log("옵션 업데이트", newOptions);
  }

  public getCurrentPosition(): number {
    return getCurrentScrollTop();
  }

  public getMaxPosition(): number {
    return getMaxScrollTop();
  }

  public destroy(): void {
    if (this.isAnimating && this.rafId) {
      cancelRaf(this.rafId);
    }

    document.removeEventListener("wheel", this.onWheel);
    document.removeEventListener("touchstart", this.onTouchStart);
    document.removeEventListener("touchmove", this.onTouchMove);
    document.removeEventListener("touchend", this.onTouchEnd);
    document.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("resize", this.onResize);

    this.isAnimating = false;
    this.isScrolling = false;
    this.animationFrame = null;
    this.rafId = null;
    this.scrollCallbacks.clear();

    this.log("TwoDimensionScroll 해제");
  }

  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log("[TwoDimensionScroll]", ...args);
    }
  }
}

// 브라우저 전역 변수로 설정
if (typeof window !== "undefined") {
  (window as any).TwoDimensionScroll = TwoDimensionScroll;
  console.log("🌍 TwoDimensionScroll 전역 설정 완료");
}

export default TwoDimensionScroll;
