/**
 * Onboarding Types
 * Type definitions for onboarding questionnaire
 */

export type BodyType = 'pear' | 'apple' | 'hourglass' | 'rectangle' | 'inverted-triangle';

export type StylePreference = 'minimalist' | 'trendy' | 'sweet' | 'intellectual' | 'athletic';

export type Occasion = 'work' | 'date' | 'party' | 'daily' | 'sports';

export interface BodyTypeOption {
  id: BodyType;
  label: string;
  icon: string;
  description: string;
}

export interface StyleOption {
  id: StylePreference;
  label: string;
}

export interface OccasionOption {
  id: Occasion;
  label: string;
  icon: string;
}

export const BODY_TYPES: BodyTypeOption[] = [
  { id: 'pear', label: '梨形', icon: '🍐', description: '臀部较宽，上身较窄' },
  { id: 'apple', label: '苹果形', icon: '🍎', description: '腰部较圆润' },
  { id: 'hourglass', label: '沙漏形', icon: '⏳', description: '腰细，上下匀称' },
  { id: 'rectangle', label: '直筒形', icon: '📏', description: '上下身宽度相近' },
  { id: 'inverted-triangle', label: '倒三角形', icon: '🔻', description: '肩宽，臀部较窄' },
];

export const STYLE_OPTIONS: StyleOption[] = [
  { id: 'minimalist', label: '简约' },
  { id: 'trendy', label: '时尚' },
  { id: 'sweet', label: '甜美' },
  { id: 'intellectual', label: '知性' },
  { id: 'athletic', label: '运动' },
];

export const OCCASION_OPTIONS: OccasionOption[] = [
  { id: 'work', label: '上班', icon: '🏢' },
  { id: 'date', label: '约会', icon: '💕' },
  { id: 'party', label: '聚会', icon: '🎉' },
  { id: 'daily', label: '日常', icon: '☕' },
  { id: 'sports', label: '运动', icon: '🏃' },
];
