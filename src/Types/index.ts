// Common types

// Aspect Ratio options
export type AspectRatio = '9x16' | '4x5' | '1x1';

// Spin direction options
export type SpinDirection = 'normal' | 'reverse';

// Export quality options
export type ExportQuality = 'low' | 'medium' | 'high';

// Mapping of aspect ratios to human-readable labels
export const AspectRatioLabels: Record<AspectRatio, string> = {
  '9x16': 'Vertical',
  '4x5': 'Portrait',
  '1x1': 'Square'
}; 