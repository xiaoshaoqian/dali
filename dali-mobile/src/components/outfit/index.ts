// Outfit Components barrel export
// Outfit-related components (OutfitCard, StyleTagChip, etc.)
// Part of Story 4.2: Style Tag and Occasion Icon Display
// Part of Story 5.2: Outfit History Grid View

export { OutfitCard } from './OutfitCard';
export { StyleTagChip, LegacyStyleTagChip } from './StyleTagChip';
export type { StyleTagChipProps, LegacyStyleTagChipProps } from './StyleTagChip';
export { LikeButton } from './LikeButton';
export { SaveButton } from './SaveButton';

// OccasionIcon component and types
export { OccasionIcon, isValidOccasionType, getAllOccasionTypes } from './OccasionIcon';
export type { OccasionIconProps, OccasionType } from './OccasionIcon';

// Individual occasion icons (for direct use if needed)
export {
  HeartIcon,
  BriefcaseIcon,
  BuildingIcon,
  PeopleIcon,
  CoffeeIcon,
  HouseIcon,
} from './icons';

// Story 5.2: Outfit History Grid View
export { OutfitHistoryCard } from './OutfitHistoryCard';
export type { OutfitHistoryCardProps } from './OutfitHistoryCard';
export { OutfitEmptyState } from './OutfitEmptyState';
export type { OutfitEmptyStateProps } from './OutfitEmptyState';
export { OutfitHistoryGrid } from './OutfitHistoryGrid';
export type { OutfitHistoryGridProps } from './OutfitHistoryGrid';
