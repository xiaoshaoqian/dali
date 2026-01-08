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
 * Social media platform options (legacy)
 */
export type SocialPlatform = 'wechat' | 'moments' | 'xiaohongshu' | 'douyin';

/**
 * Share platform for tracking events
 * - wechat_session: 微信好友
 * - wechat_timeline: 微信朋友圈
 * - system_share: 系统分享（更多...）
 */
export type SharePlatform = 'wechat_session' | 'wechat_timeline' | 'system_share';

/**
 * Share event analytics data
 */
export interface ShareAnalyticsEvent {
  outfit_id: string;
  platform: SocialPlatform;
  template_style: TemplateStyle;
  timestamp: string;
}
