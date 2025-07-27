// TwoDimensionScroll React Hook TypeScript Definitions

import { DependencyList } from "react";

// 기본 TwoDimensionScroll 타입들
export interface TwoDimensionScrollOptions {
  duration?: number;
  horizontalSensitivity?: number;
  verticalSensitivity?: number;
  disabled?: boolean;
  debug?: boolean;
  desktop?: {
    duration?: number;
    lerp?: number;
    sensitivity?: number;
    wheelMultiplier?: number;
    touchMultiplier?: number;
  };
  mobile?: {
    duration?: number;
    lerp?: number;
    sensitivity?: number;
    wheelMultiplier?: number;
    touchMultiplier?: number;
  };
  tablet?: {
    duration?: number;
    lerp?: number;
    sensitivity?: number;
    wheelMultiplier?: number;
    touchMultiplier?: number;
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
  scrollTo: (position: number, duration?: number) => void;
  pauseForModal: () => void;
  resumeFromModal: () => void;
  updateOptions: (options: Partial<TwoDimensionScrollOptions>) => void;
  on: (callback: (data: any) => void) => void;
  off: (callback: (data: any) => void) => void;
  destroy: () => void;
  cleanup: () => () => void;
  getReactCompatibilityInfo: () => ReactCompatibilityInfo;
  limit?: number;
  isScrolling?: boolean;
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

// React Hook 함수들
export function useTwoDimensionScroll(
  options?: TwoDimensionScrollOptions,
  deps?: DependencyList
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
