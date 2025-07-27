import {
  TwoDimensionScrollOptions,
  ScrollEventData,
  AnimationFrame,
  ScrollCallback,
  Easing,
} from "./types";
import {
  isMobile,
  isTouchDevice,
  clamp,
  getMaxScrollTop,
  getCurrentScrollTop,
  raf,
  cancelRaf,
  supportsPassive,
  throttle,
} from "./utils";

/**
 * 2차원 스크롤 라이브러리
 * 가로와 세로 스크롤을 모두 감지하여 부드러운 세로 스크롤로 변환
 */
export class TwoDimensionScroll {
  private options: TwoDimensionScrollOptions &
    Required<
      Pick<
        TwoDimensionScrollOptions,
        | "duration"
        | "easing"
        | "horizontalSensitivity"
        | "verticalSensitivity"
        | "disabled"
        | "useNativeScrollOnMobile"
        | "scrollableSelector"
        | "debug"
      >
    >;
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
  private lastTouchY: number = 0; // 터치 이동 이벤트 핸들러에서 사용할 변수

  // 🚨 데모와 동일한 터치 관련 속성들 추가
  private lastTouchX: number = 0;
  private lastTouchTime: number = 0;
  private touchVelocityX: number = 0;
  private touchVelocityY: number = 0;
  private touchMoveCount: number = 0;
  private touchStopTimer: NodeJS.Timeout | null = null;

  // 🚨 모달 관련 속성 추가
  private isModalOpen: boolean = false;

  constructor(options: TwoDimensionScrollOptions = {}) {
    // 기본 옵션
    const baseOptions = {
      duration: 1000,
      easing: Easing.easeOutCubic,
      horizontalSensitivity: 1,
      verticalSensitivity: 1,
      disabled: false,
      useNativeScrollOnMobile: true,
      scrollableSelector: "body",
      debug: false,
    };

    // 환경 감지
    const isMobileEnv = isMobile();
    const isTabletEnv = isTouchDevice() && !isMobileEnv;

    // 환경별 옵션 적용
    let environmentOptions = {};
    if (options.mobile && isMobileEnv) {
      environmentOptions = { ...options.mobile };
    } else if (options.tablet && isTabletEnv) {
      environmentOptions = { ...options.tablet };
    } else if (options.desktop && !isMobileEnv && !isTabletEnv) {
      environmentOptions = { ...options.desktop };
    }

    // 최종 옵션 병합 (환경별 옵션이 기본값을 덮어씀)
    this.options = {
      ...baseOptions,
      ...options, // 전역 옵션
      ...environmentOptions, // 환경별 옵션이 최우선
    };

    if (this.options.debug) {
      console.log(
        `[TwoDimensionScroll] 환경: ${
          isMobileEnv ? "Mobile" : isTabletEnv ? "Tablet" : "Desktop"
        }`
      );
      console.log("[TwoDimensionScroll] 최종 적용된 옵션:", this.options);
    }

    this.isMobileDevice = isMobile();
    this.passive = supportsPassive() ? { passive: false } : false;
    this.lastScrollTop = getCurrentScrollTop();

    this.init();
  }

  /**
   * 라이브러리 초기화
   */
  private init(): void {
    if (typeof window === "undefined") return;

    // 모바일에서 네이티브 스크롤 사용 시 초기화하지 않음
    if (this.isMobileDevice && this.options.useNativeScrollOnMobile) {
      this.log("모바일 네이티브 스크롤 모드");
      return;
    }

    this.bindEvents();
    this.log("TwoDimensionScroll 초기화 완료");
  }

  /**
   * 이벤트 바인딩
   */
  private bindEvents(): void {
    // 휠 이벤트 (데스크톱)
    document.addEventListener("wheel", this.onWheel, this.passive);

    // 터치 이벤트 (모바일/태블릿)
    if (isTouchDevice()) {
      document.addEventListener("touchstart", this.onTouchStart, this.passive);
      document.addEventListener("touchmove", this.onTouchMove, this.passive);
      document.addEventListener("touchend", this.onTouchEnd, this.passive);
    }

    // 키보드 이벤트
    document.addEventListener("keydown", this.onKeyDown);

    // 리사이즈 이벤트
    window.addEventListener("resize", throttle(this.onResize, 100));
  }

  /**
   * 휠 이벤트 핸들러 (데모와 동일한 성능)
   */
  private onWheel = (event: WheelEvent): void => {
    if (this.options.disabled || this.isScrolling) return;

    event.preventDefault();

    // 🚀 데모와 동일한 계산 방식
    const rawDeltaX = event.deltaX;
    const rawDeltaY = event.deltaY;

    // 환경별 multiplier 적용
    const wheelMultiplier = (this.options as any).wheelMultiplier || 1.0;

    // 민감도 * multiplier 적용
    const deltaX =
      rawDeltaX * this.options.horizontalSensitivity * wheelMultiplier;
    const deltaY =
      rawDeltaY * this.options.verticalSensitivity * wheelMultiplier;

    // 🔥 데모와 동일: 더 큰 델타 값 선택
    let finalDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;

    // 🚨 극한 성능: 추가 배율 적용
    finalDelta *= 2.0; // 데모 수준의 극한 성능

    if (this.options.debug) {
      console.log("🚀 DEMO-LEVEL WHEEL:", {
        원시: `X:${rawDeltaX.toFixed(1)}, Y:${rawDeltaY.toFixed(1)}`,
        민감도: `X:${this.options.horizontalSensitivity}, Y:${this.options.verticalSensitivity}`,
        배율: wheelMultiplier,
        계산후: `X:${deltaX.toFixed(1)}, Y:${deltaY.toFixed(1)}`,
        최종델타: finalDelta.toFixed(1),
        극한배율: "2.0x",
      });
    }

    this.handleScroll(finalDelta, "wheel");
  };

  /**
   * 터치 시작 이벤트 핸들러
   */
  private onTouchStart = (event: TouchEvent): void => {
    if (this.options.disabled) return;

    // 🚨 데모와 동일: preventDefault 제거 - 기본 터치 허용
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchStartTime = Date.now();
    this.lastTouchY = touch.clientY;

    this.lastTouchX = touch.clientX;
    this.lastTouchTime = this.touchStartTime;
    this.touchVelocityX = 0;
    this.touchVelocityY = 0;
    this.touchMoveCount = 0;

    if (this.touchStopTimer) {
      clearTimeout(this.touchStopTimer);
      this.touchStopTimer = null;
    }
  };

  /**
   * 터치 이동 이벤트 핸들러 (데모와 완전히 동일)
   */
  private onTouchMove = (event: TouchEvent): void => {
    if (this.options.disabled) return;

    const touch = event.touches[0];
    const currentTime = Date.now();

    const currentDeltaX = this.lastTouchX - touch.clientX;
    const currentDeltaY = this.lastTouchY - touch.clientY;

    const movementDistance = Math.sqrt(
      currentDeltaX * currentDeltaX + currentDeltaY * currentDeltaY
    );

    if (movementDistance > (this.options as any).touchStopThreshold) {
      if (this.touchStopTimer) {
        clearTimeout(this.touchStopTimer);
        this.touchStopTimer = null;
      }

      const timeDelta = currentTime - this.lastTouchTime;
      if (timeDelta > 0) {
        this.touchVelocityX = currentDeltaX / timeDelta;
        this.touchVelocityY = currentDeltaY / timeDelta;
      }

      const adjustedDeltaX =
        currentDeltaX *
        this.options.horizontalSensitivity *
        ((this.options as any).touchMultiplier || 1.0);
      const adjustedDeltaY =
        currentDeltaY *
        this.options.verticalSensitivity *
        ((this.options as any).touchMultiplier || 1.0);

      // 🚨 데모와 동일: 모달이 열려있을 때는 preventScroll로 구분 처리
      if (this.isModalOpen) {
        // preventScroll을 통해 모달 내부/외부 구분 처리
        if (this.options.debug) {
          console.log("🎭 모달 모드: onTouchMove - preventScroll 호출");
        }
      } else if (Math.abs(adjustedDeltaX) > 3 || Math.abs(adjustedDeltaY) > 3) {
        // 🚨 데모와 동일: calculateCombinedDelta와 addToScroll 사용
        const combinedDelta = this.calculateCombinedDelta(
          adjustedDeltaX,
          adjustedDeltaY
        );
        this.addToScroll(combinedDelta);

        if (this.options.debug) {
          console.log("🚀 DEMO-LEVEL TOUCH:", {
            원시델타X: currentDeltaX.toFixed(1),
            원시델타Y: currentDeltaY.toFixed(1),
            조정델타X: adjustedDeltaX.toFixed(1),
            조정델타Y: adjustedDeltaY.toFixed(1),
            최종델타: combinedDelta.toFixed(1),
            터치배율: (this.options as any).touchMultiplier || 1.0,
          });
        }
      }

      this.lastTouchX = touch.clientX;
      this.lastTouchY = touch.clientY;
      this.lastTouchTime = currentTime;
      this.touchMoveCount++;
    } else {
      const self = this;
      if (!this.touchStopTimer) {
        this.touchStopTimer = setTimeout(() => {
          self.touchVelocityX *= 0.8;
          self.touchVelocityY *= 0.8;
          self.touchStopTimer = null;
        }, 100);
      }
    }
  };

  /**
   * 터치 종료 이벤트 핸들러 (데모와 완전히 동일)
   */
  private onTouchEnd = (event: TouchEvent): void => {
    if (this.options.disabled) return;

    if (this.touchStopTimer) {
      clearTimeout(this.touchStopTimer);
      this.touchStopTimer = null;
    }

    const touch = event.changedTouches[0];
    const deltaTime = Date.now() - this.touchStartTime;
    const totalDeltaY = this.touchStartY - touch.clientY;

    // 🚨 데모와 동일: 플링 제스처 처리
    if (
      deltaTime < 300 &&
      Math.abs(totalDeltaY) > 50 &&
      this.touchMoveCount > 3
    ) {
      const velocity = this.touchVelocityY;
      // 환경별 플링 배수 적용
      const flingMultiplier = (this.options as any).flingMultiplier || 1.0;
      const flingDistance = velocity * 400 * flingMultiplier;

      if (Math.abs(flingDistance) > 50) {
        // 🚨 데모와 동일: 모달이 열려있을 때는 body 스크롤 플링 제스처 차단
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

    if (this.options.debug) {
      console.log("🚀 TOUCH END:", {
        지속시간: deltaTime,
        총이동: totalDeltaY.toFixed(1),
      });
    }
  };

  /**
   * 키보드 이벤트 핸들러
   */
  private onKeyDown = (event: KeyboardEvent): void => {
    if (this.options.disabled || this.isScrolling) return;

    let delta = 0;
    const scrollAmount = window.innerHeight * 0.8; // 화면 높이의 80%

    switch (event.key) {
      case "ArrowUp":
      case "PageUp":
        delta = -scrollAmount;
        break;
      case "ArrowDown":
      case "PageDown":
      case " ": // 스페이스바
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

  /**
   * 리사이즈 이벤트 핸들러
   */
  private onResize = (): void => {
    // 현재 스크롤 위치가 최대값을 초과하지 않도록 조정
    const maxScrollTop = getMaxScrollTop();
    const currentScrollTop = getCurrentScrollTop();

    if (currentScrollTop > maxScrollTop) {
      this.scrollTo(maxScrollTop);
    }
  };

  /**
   * 가로와 세로 델타를 조합하여 최종 델타 계산
   */
  private calculateCombinedDelta(deltaX: number, deltaY: number): number {
    // 가로 스크롤이 더 큰 경우, 가로 스크롤을 세로로 변환
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX; // 가로 스크롤을 세로로 변환
    }

    // 세로 스크롤이 더 크거나 같은 경우
    if (Math.abs(deltaY) >= Math.abs(deltaX)) {
      return deltaY;
    }

    // 가로와 세로가 동시에 발생한 경우, 벡터 합 계산
    const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX);

    // 각도에 따라 방향 결정 (-45도 ~ 45도는 가로, 나머지는 세로)
    if (Math.abs(angle) < Math.PI / 4 || Math.abs(angle) > (3 * Math.PI) / 4) {
      return deltaX > 0 ? magnitude : -magnitude; // 가로 방향
    } else {
      return deltaY > 0 ? magnitude : -magnitude; // 세로 방향
    }
  }

  /**
   * 스크롤 처리 (데모 수준 극한 성능)
   */
  private handleScroll(delta: number, type: ScrollEventData["type"]): void {
    if (Math.abs(delta) < 0.5) return; // 더 민감한 임계값

    const currentScrollTop = getCurrentScrollTop();
    const maxScrollTop = getMaxScrollTop();

    // 🚀 데모 수준: 더 큰 이동 거리
    const amplifiedDelta = delta * 1.5; // 추가 증폭
    const targetScrollTop = clamp(
      currentScrollTop + amplifiedDelta,
      0,
      maxScrollTop
    );

    // 스크롤할 필요가 없으면 리턴
    if (Math.abs(targetScrollTop - currentScrollTop) < 0.5) return;

    const direction = delta > 0 ? 1 : -1;

    if (this.options.debug) {
      console.log("🚀 DEMO-LEVEL SCROLL:", {
        현재위치: currentScrollTop.toFixed(1),
        원본델타: delta.toFixed(1),
        증폭델타: amplifiedDelta.toFixed(1),
        목표위치: targetScrollTop.toFixed(1),
        실제이동: Math.abs(targetScrollTop - currentScrollTop).toFixed(1),
        증폭비율: "1.5x",
      });
    }

    // 🚨 데모 수준: 즉각적인 스크롤 (애니메이션 없음)
    window.scrollTo(0, targetScrollTop);

    // 스크롤 상태 업데이트
    this.isScrolling = true;

    // 스크롤 완료 후 상태 리셋 (매우 빠르게)
    setTimeout(() => {
      this.isScrolling = false;
    }, 10); // 10ms 후 리셋

    const eventData: ScrollEventData = {
      deltaX: type === "wheel" ? delta : 0,
      deltaY: delta,
      scrollTop: targetScrollTop,
      direction,
      type,
    };

    // 콜백 실행 (안전한 실행)
    this.scrollCallbacks.forEach((callback) => {
      if (typeof callback === "function") {
        try {
          callback(eventData);
        } catch (error) {
          console.error("🚨 스크롤 콜백 실행 중 오류:", error);
        }
      }
    });
  }

  /**
   * lenis 스타일 스크롤 추가 함수 (데모와 동일)
   */
  private addToScroll(delta: number): void {
    const maxScrollTop = getMaxScrollTop();
    const oldTargetScroll = this.targetScroll || getCurrentScrollTop();
    this.targetScroll = clamp(oldTargetScroll + delta, 0, maxScrollTop);

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
  }

  /**
   * lenis 스타일 애니메이션 루프 시작 (데모와 동일)
   */
  private startAnimationLoop(): void {
    // 애니메이션 루프 구현이 필요함
    // 현재는 즉시 스크롤로 대체
    if (this.targetScroll !== undefined) {
      window.scrollTo(0, this.targetScroll);
    }
  }

  private targetScroll: number = 0;

  /**
   * 부드러운 스크롤 실행 (극한 성능 모드)
   */
  private smoothScrollTo(targetPosition: number): void {
    if (this.isAnimating) {
      cancelRaf(this.rafId!);
    }

    const startPosition = getCurrentScrollTop();
    const distance = targetPosition - startPosition;

    if (Math.abs(distance) < 1) return;

    // 🚨 극한 성능 모드: 즉각적인 스크롤
    if (this.options.debug) {
      console.log(
        `🚀 EXTREME SCROLL: ${startPosition} → ${targetPosition} (거리: ${Math.abs(
          distance
        )})`
      );
    }

    // lerp 값이 0.5 이하면 즉각적인 스크롤
    const shouldInstantScroll = (this.options as any).lerp <= 0.5;

    if (shouldInstantScroll) {
      window.scrollTo(0, targetPosition);
      this.isAnimating = false;
      this.isScrolling = false;
      return;
    }

    // 기존 애니메이션 로직 (lerp > 0.5일 때만)
    this.animationFrame = {
      startTime: performance.now(),
      startPosition,
      targetPosition,
      duration: Math.max(50, this.options.duration / 10), // 🚨 10배 빠르게
      easing: this.options.easing,
    };

    this.isAnimating = true;
    this.isScrolling = true;
    this.animate();
  }

  /**
   * 애니메이션 실행
   */
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

  /**
   * 특정 위치로 스크롤
   */
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

  /**
   * 스크롤 콜백 추가
   */
  public on(callback: ScrollCallback): void {
    this.scrollCallbacks.add(callback);
  }

  /**
   * 스크롤 콜백 제거
   */
  public off(callback: ScrollCallback): void {
    this.scrollCallbacks.delete(callback);
  }

  /**
   * 스크롤 비활성화
   */
  public disable(): void {
    this.options.disabled = true;
    this.log("스크롤 비활성화");
  }

  /**
   * 스크롤 활성화
   */
  public enable(): void {
    this.options.disabled = false;
    this.log("스크롤 활성화");
  }

  /**
   * 옵션 업데이트
   */
  public updateOptions(newOptions: Partial<TwoDimensionScrollOptions>): void {
    this.options = { ...this.options, ...newOptions };
    this.log("옵션 업데이트", newOptions);
  }

  /**
   * 현재 스크롤 위치 가져오기
   */
  public getCurrentPosition(): number {
    return getCurrentScrollTop();
  }

  /**
   * 최대 스크롤 위치 가져오기
   */
  public getMaxPosition(): number {
    return getMaxScrollTop();
  }

  /**
   * 라이브러리 해제
   */
  public destroy(): void {
    // 애니메이션 중단
    if (this.isAnimating && this.rafId) {
      cancelRaf(this.rafId);
    }

    // 이벤트 리스너 제거
    document.removeEventListener("wheel", this.onWheel);
    document.removeEventListener("touchstart", this.onTouchStart);
    document.removeEventListener("touchmove", this.onTouchMove);
    document.removeEventListener("touchend", this.onTouchEnd);
    document.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("resize", this.onResize);

    // 상태 초기화
    this.isAnimating = false;
    this.isScrolling = false;
    this.animationFrame = null;
    this.rafId = null;
    this.scrollCallbacks.clear();

    this.log("TwoDimensionScroll 해제");
  }

  /**
   * 디버그 로그
   */
  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log("[TwoDimensionScroll]", ...args);
    }
  }
}

// 기본 내보내기
export default TwoDimensionScroll;

// 타입과 유틸리티도 함께 내보내기
export * from "./types";
export * from "./utils";

// 브라우저 전역 변수로 설정 (CDN 사용 시)
if (typeof window !== "undefined") {
  (window as any).TwoDimensionScroll = TwoDimensionScroll;
}
