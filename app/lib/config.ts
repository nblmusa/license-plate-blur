export interface LogoSettings {
  size: number;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  maskType: 'blur' | 'solid';
  blur: {
    radius: number;
    opacity: number;
  };
}

export const DEFAULT_SETTINGS: LogoSettings = {
  maskType: 'blur',
  size: 100,
  position: 'center',
  opacity: 100,
  blur: {
    radius: 30,
    opacity: 1
  }
};

export const MASK_TYPES = ['blur', 'solid'] as const;
export const POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'] as const;

// Add other shared configurations here 