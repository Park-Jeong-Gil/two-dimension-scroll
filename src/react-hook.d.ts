// TwoDimensionScroll React Hook TypeScript Definitions

import { DependencyList } from "react";

// UI/UX 옵션 인터페이스
export interface UIOptions {
  hideScrollbar?: boolean; // 스크롤바 숨김 (기본값: true)
  showScrollProgress?: boolean; // 스크롤 진행률 표시 (기본값: false)
  customScrollbarStyle?: boolean; // 커스텀 스크롤바 스타일 (기본값: false)
}

// 환경별 스크롤 옵션
export interface EnvironmentScrollOptions {
  duration?: number;
  horizontalSensitivity?: number;
  verticalSensitivity?: number;
  lerp?: number;
  wheelMultiplier?: number;
  touchMultiplier?: number;
  precisionMode?: boolean;
  keyboardScrollAmount?: number;
  bounceEffect?: boolean;
  flingMultiplier?: number;
  touchStopThreshold?: number;
  hybridMode?: boolean;
  prioritizeVertical?: boolean; // 🆕 Y축 우선 모드
  lockTouchDirection?: boolean; // 🆕 터치 방향 고정 모드
  touchDirectionThreshold?: number; // 🆕 터치 방향 결정 임계값
  allowDirectionChange?: boolean; // 🆕 터치 방향 전환 허용
  directionChangeThreshold?: number; // 🆕 방향 전환 임계값
  directionChangeSmoothness?: number; // 🆕 방향 전환 스무딩 강도
}

// 메인 옵션 인터페이스
export interface TwoDimensionScrollOptions extends EnvironmentScrollOptions {
  disabled?: boolean;
  debug?: boolean;
  ui?: UIOptions; // 🚨 UI 옵션 추가
  desktop?: EnvironmentScrollOptions;
  mobile?: EnvironmentScrollOptions;
  tablet?: EnvironmentScrollOptions;
}

// 스크롤 정보
export interface ScrollInfo {
  position: number;
  maxPosition: number;
  progress: number;
}

// 스크롤 이벤트 데이터
export interface ScrollEventData {
  deltaX: number;
  deltaY: number;
  scrollTop: number;
  direction: number;
  type: string;
}

// 스크롤바 가시성 정보
export interface ScrollbarVisibility {
  visible: boolean;
  hideScrollbar: boolean;
}

// TwoDimensionScroll 인스턴스 타입
export interface TwoDimensionScrollInstance {
  scrollTo(position: number, options?: { immediate?: boolean }): void;
  on(callback: (data: ScrollEventData) => void): void;
  off(callback: (data: ScrollEventData) => void): void;
  disable(): void;
  enable(): void;
  getCurrentPosition(): number;
  getMaxPosition(): number;
  destroy(): void;
  cleanup(): () => void;

  // 🚨 스크롤바 제어 메서드들 추가
  showScrollbar(show: boolean): void;
  toggleScrollbar(): void;
  getScrollbarVisibility(): ScrollbarVisibility;
  isScrollbarVisible(): boolean;

  // 🚨 모달 처리를 위한 속성/메서드 추가
  isModalOpen?: boolean;
  pauseForModal?: () => void;
  resumeFromModal?: () => void;
  isInModalMode?: () => boolean;
}

// Hook 반환 타입
export interface TwoDimensionScrollHookReturn {
  isReady: boolean;
  scrollPosition: number;
  scrollInfo: ScrollInfo;
  scrollTo: (position: number) => void;
  instance: TwoDimensionScrollInstance | null;
}

// Hook 설정 타입
export interface TwoDimensionScrollHookConfig {
  // 추가 설정이 필요한 경우 여기에 추가
}

// 메인 Hook 함수
export function useTwoDimensionScroll(
  options?: TwoDimensionScrollOptions,
  config?: TwoDimensionScrollHookConfig
): TwoDimensionScrollHookReturn;

export default useTwoDimensionScroll;
