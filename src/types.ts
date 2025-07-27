/**
 * 환경별 스크롤 옵션
 */
export interface EnvironmentScrollOptions {
  /** 스무스 스크롤 지속 시간 (밀리초) */
  duration?: number;
  /** 가로 스크롤 감도 */
  horizontalSensitivity?: number;
  /** 세로 스크롤 감도 */
  verticalSensitivity?: number;
  /** 러프 값 (애니메이션 부드러움) */
  lerp?: number;
  /** 휠 배율 */
  wheelMultiplier?: number;
  /** 터치 배율 */
  touchMultiplier?: number;
  /** 정밀 모드 */
  precisionMode?: boolean;
  /** 바운스 효과 */
  bounceEffect?: boolean;
  /** 플링 배율 */
  flingMultiplier?: number;
  /** 키보드 스크롤 양 */
  keyboardScrollAmount?: number;
  /** 터치 정지 임계값 */
  touchStopThreshold?: number;
  /** 하이브리드 모드 */
  hybridMode?: boolean;
}

/**
 * 스크롤 라이브러리 옵션 인터페이스
 */
export interface TwoDimensionScrollOptions extends EnvironmentScrollOptions {
  /** 이징 함수 */
  easing?: (t: number) => number;

  /** 스크롤 비활성화 여부 */
  disabled?: boolean;

  /** 모바일에서 네이티브 스크롤 사용 여부 */
  useNativeScrollOnMobile?: boolean;

  /** 스크롤 가능한 요소 선택자 */
  scrollableSelector?: string;

  /** 디버그 모드 */
  debug?: boolean;

  /** 데스크톱 환경 전용 옵션 */
  desktop?: EnvironmentScrollOptions;

  /** 모바일 환경 전용 옵션 */
  mobile?: EnvironmentScrollOptions;

  /** 태블릿 환경 전용 옵션 */
  tablet?: EnvironmentScrollOptions;
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
