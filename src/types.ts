/**
 * 스크롤 라이브러리 옵션 인터페이스
 */
export interface TwoDimensionScrollOptions {
  /** 스무스 스크롤 지속 시간 (밀리초) */
  duration?: number;

  /** 이징 함수 */
  easing?: (t: number) => number;

  /** 가로 스크롤 감도 (기본값: 1) */
  horizontalSensitivity?: number;

  /** 세로 스크롤 감도 (기본값: 1) */
  verticalSensitivity?: number;

  /** 스크롤 비활성화 여부 */
  disabled?: boolean;

  /** 모바일에서 네이티브 스크롤 사용 여부 */
  useNativeScrollOnMobile?: boolean;

  /** 스크롤 가능한 요소 선택자 */
  scrollableSelector?: string;

  /** 디버그 모드 */
  debug?: boolean;
}

/**
 * 스크롤 이벤트 데이터
 */
export interface ScrollEventData {
  /** 델타 X (가로 스크롤량) */
  deltaX: number;

  /** 델타 Y (세로 스크롤량) */
  deltaY: number;

  /** 현재 스크롤 위치 */
  scrollTop: number;

  /** 스크롤 방향 (-1: 위, 1: 아래) */
  direction: number;

  /** 이벤트 타입 */
  type: "wheel" | "touch" | "keyboard";
}

/**
 * 애니메이션 프레임 데이터
 */
export interface AnimationFrame {
  /** 시작 시간 */
  startTime: number;

  /** 시작 위치 */
  startPosition: number;

  /** 목표 위치 */
  targetPosition: number;

  /** 지속 시간 */
  duration: number;

  /** 이징 함수 */
  easing: (t: number) => number;
}

/**
 * 콜백 함수 타입들
 */
export type ScrollCallback = (data: ScrollEventData) => void;
export type AnimationCallback = (progress: number) => void;

/**
 * 기본 이징 함수들
 */
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
