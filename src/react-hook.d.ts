// TwoDimensionScroll React Hook TypeScript Definitions

import { DependencyList } from "react";

// TwoDimensionScroll 클래스 타입 (any 생성자 허용)
export type TwoDimensionScrollClass = new (
  options?: TwoDimensionScrollOptions
) => TwoDimensionScrollInstance;

// Hook 설정 타입 (유연한 클래스 타입 허용)
export interface TwoDimensionScrollHookConfig {
  ScrollClass?: any; // 유연하게 any 타입의 생성자 함수 허용
  deps?: DependencyList;
}

// 기본 TwoDimensionScroll 타입들
export interface TwoDimensionScrollOptions {
  duration?: number;
  horizontalSensitivity?: number;
  verticalSensitivity?: number;
  disabled?: boolean;
  debug?: boolean;
  desktop?: {
    duration?: number;
    easing?: (t: number) => number;
    horizontalSensitivity?: number;
    verticalSensitivity?: number;
    lerp?: number;
    wheelMultiplier?: number;
    touchMultiplier?: number;
    smoothWheel?: boolean;
    touchStopThreshold?: number;
    keyboardScrollAmount?: number;
    precisionMode?: boolean;
    keyboardScrollSpeed?: number;
    skipInertia?: boolean;
  };
  mobile?: {
    duration?: number;
    easing?: (t: number) => number;
    horizontalSensitivity?: number;
    verticalSensitivity?: number;
    lerp?: number;
    wheelMultiplier?: number;
    touchMultiplier?: number;
    smoothWheel?: boolean;
    touchStopThreshold?: number;
    flingMultiplier?: number;
    bounceEffect?: boolean;
    fastScrollThreshold?: number;
    touchScrollSpeed?: number;
    skipInertia?: boolean;
  };
  tablet?: {
    duration?: number;
    easing?: (t: number) => number;
    horizontalSensitivity?: number;
    verticalSensitivity?: number;
    lerp?: number;
    wheelMultiplier?: number;
    touchMultiplier?: number;
    smoothWheel?: boolean;
    touchStopThreshold?: number;
    hybridMode?: boolean;
    adaptiveSpeed?: boolean;
    skipInertia?: boolean;
  };
  accessibility?: {
    reducedMotion?: boolean;
    screenReader?: boolean;
    keyboardNavigation?: boolean;
  };
  ui?: {
    hideScrollbar?: boolean;
    showScrollProgress?: boolean;
    customScrollbarStyle?: string;
  };
}

export interface ScrollInfo {
  position: number;
  maxPosition: number;
  progress: number;
  isScrolling: boolean;
}

export interface ReactCompatibilityInfo {
  isReactEnvironment: boolean;
  isDestroyed: boolean;
  eventListenerCount: number;
  hasReactRouter: boolean;
  stateObserverActive: boolean;
}

export interface TwoDimensionScrollInstance {
  // 핵심 스크롤 메서드
  scrollTo: (position: number, duration?: number) => void;
  on: (callback: (data: any) => void) => void;
  off: (callback: (data: any) => void) => void;

  // 모달 관련
  pauseForModal: () => void;
  resumeFromModal: () => void;
  isInModalMode: () => boolean;

  // 옵션 및 상태 관리
  updateOptions: (options: Partial<TwoDimensionScrollOptions>) => void;
  disable: () => void;
  enable: () => void;

  // 위치 정보
  getCurrentPosition: () => number;
  getMaxPosition: () => number;

  // 환경 관리
  getEnvironmentInfo: () => any;
  updateEnvironmentOptions: (environment: string, options: any) => void;
  resetToDefaults: () => void;
  applyPerformancePreset: (preset: string) => void;
  optimizeForCurrentEnvironment: () => void;

  // 접근성
  getAccessibilityStatus: () => any;
  updateAccessibilitySettings: (settings: any) => void;

  // UI 관련
  toggleScrollbar: (show?: boolean) => void;
  getScrollbarStatus: () => any;

  // 생명주기
  destroy: () => void;
  cleanup: () => () => void;

  // React 호환성
  getReactCompatibilityInfo: () => ReactCompatibilityInfo;

  // 속성
  isScrolling?: boolean;
  animatedScroll?: number;
  targetScroll?: number;
  options?: TwoDimensionScrollOptions;
}

export interface TwoDimensionScrollHookReturn {
  instance: TwoDimensionScrollInstance | null;
  isReady: boolean;
  scrollPosition: number;
  scrollInfo: ScrollInfo | null;
  scrollTo: (position: number, duration?: number) => void;
  pauseForModal: () => void;
  resumeFromModal: () => void;
  disable: () => void;
  enable: () => void;
  updateOptions: (options: Partial<TwoDimensionScrollOptions>) => void;
  getReactInfo: () => ReactCompatibilityInfo | null;
}

export interface ScrollProgressData {
  position: number;
  progress: number;
  percentage: number;
}

export interface ModalScrollHookReturn {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

// React Hook 함수 (단일 시그니처, 유연한 config 타입)
export function useTwoDimensionScroll(
  options?: TwoDimensionScrollOptions,
  config?: TwoDimensionScrollHookConfig | DependencyList
): TwoDimensionScrollHookReturn;

export function useScrollToTop(): (duration?: number) => void;

export function useScrollProgress(
  callback: (data: ScrollProgressData) => void,
  throttle?: number
): void;

export function useModalScroll(): ModalScrollHookReturn;

// 글로벌 타입 확장 (window.TwoDimensionScroll)
declare global {
  interface Window {
    TwoDimensionScroll: new (
      options?: TwoDimensionScrollOptions
    ) => TwoDimensionScrollInstance;
  }
}
