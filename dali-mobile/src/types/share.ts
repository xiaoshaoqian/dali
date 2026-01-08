/**
 * Share-related type definitions
 *
 * @module types/share
 */

/**
 * Outfit item data for share template
 */
export interface OutfitItem {
  id: string;
  imageUrl: string;
}

/**
 * Complete outfit data for sharing
 */
export interface OutfitData {
  id: string;
  items: OutfitItem[];          // 3件单品
  styleTags: string[];          // 风格标签
  occasionTag: string;          // 场合标签
  theoryExcerpt: string;        // 理论摘要(150字)
}

/**
 * Template style options
 */
export type TemplateStyle = 'minimal' | 'fashion' | 'artistic';

/**
 * Social media platform options
 */
export type SocialPlatform = 'wechat' | 'moments' | 'xiaohongshu' | 'douyin';

/**
 * Share event analytics data
 */
export interface ShareAnalyticsEvent {
  outfit_id: string;
  platform: SocialPlatform;
  template_style: TemplateStyle;
  timestamp: string;
}
