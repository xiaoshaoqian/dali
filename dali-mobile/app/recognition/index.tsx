/**
 * Recognition Selection Screen V2 - Anchor Point Selection
 * Displays recognized garments with center anchor points + occasion selection
 * Replaces bounding box with modern anchor point UI with breathing animations
 *
 * @see Story 9-5: Frontend Anchor Point UI
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image,
    ScrollView,
    FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    withSpring,
    FadeInUp,
    FadeIn,
    interpolate,
    Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors } from '@/constants';
import { visionService, garmentService } from '@/services';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Anchor point type from visual analysis
interface AnchorPoint {
    id: string;
    x: number;  // Normalized 0-1
    y: number;  // Normalized 0-1
    category: string;
    description?: string;
}

// Occasion options
const OCCASIONS = [
    { id: 'work', label: '职场通勤', emoji: '💼' },
    { id: 'date', label: '约会逛街', emoji: '💕' },
    { id: 'casual', label: '日常休闲', emoji: '☕' },
    { id: 'party', label: '聚会活动', emoji: '🎉' },
    { id: 'travel', label: '出游度假', emoji: '✈️' },
    { id: 'formal', label: '正式场合', emoji: '👔' },
];

// Note: We use OSS image info API instead of Image.getSize()
// Image.getSize() is unreliable for OSS signed URLs, especially with large images
// See visionService.getImageInfo() for the implementation

// Single anchor point with breathing animation
function AnchorPointDot({
    point,
    isSelected,
    onPress,
    imageLayout,
}: {
    point: AnchorPoint;
    isSelected: boolean;
    onPress: () => void;
    imageLayout: { width: number; height: number; offsetX: number; offsetY: number };
}) {
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.3);

    // Breathing animation for selected state
    useEffect(() => {
        if (isSelected) {
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
                ),
                -1,
                false
            );
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.8, { duration: 800 }),
                    withTiming(0.3, { duration: 800 })
                ),
                -1,
                false
            );
        } else {
            scale.value = withSpring(1);
            glowOpacity.value = withTiming(0.3);
        }
    }, [isSelected]);

    const animatedDotStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const animatedGlowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    // Calculate screen position from normalized coordinates
    const screenX = point.x * imageLayout.width + imageLayout.offsetX;
    const screenY = point.y * imageLayout.height + imageLayout.offsetY;

    return (
        <TouchableOpacity
            style={[
                styles.anchorTouchArea,
                { left: screenX - 24, top: screenY - 24 },
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Outer glow ring (selected only) */}
            {isSelected && (
                <Animated.View style={[styles.anchorGlow, animatedGlowStyle]} />
            )}

            {/* Main dot */}
            <Animated.View
                style={[
                    styles.anchorDot,
                    isSelected && styles.anchorDotSelected,
                    animatedDotStyle,
                ]}
            >
                {/* Inner highlight */}
                <View style={styles.anchorInner} />
            </Animated.View>

            {/* Category label */}
            <View style={[styles.anchorLabel, isSelected && styles.anchorLabelSelected]}>
                <Text style={[styles.anchorLabelText, isSelected && styles.anchorLabelTextSelected]}>
                    {point.category}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

// Item card for bottom scroll list
function ItemCard({
    point,
    isSelected,
    onPress,
}: {
    point: AnchorPoint;
    isSelected: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[styles.itemCard, isSelected && styles.itemCardSelected]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.itemCardIcon}>
                <Text style={styles.itemCardEmoji}>
                    {point.category === '外套' ? '🧥' :
                        point.category === '上衣' ? '👕' :
                            point.category === '裤子' ? '👖' :
                                point.category === '裙子' ? '👗' :
                                    point.category === '鞋子' ? '👟' :
                                        point.category === '包包' ? '👜' : '👔'}
                </Text>
            </View>
            <Text style={[styles.itemCardText, isSelected && styles.itemCardTextSelected]}>
                {point.category}
            </Text>
            {isSelected && <View style={styles.itemCardCheck}>
                <Text style={styles.itemCardCheckText}>✓</Text>
            </View>}
        </TouchableOpacity>
    );
}

// Occasion chip component
function OccasionChip({
    occasion,
    isSelected,
    onPress,
}: {
    occasion: { id: string; label: string; emoji: string };
    isSelected: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[styles.occasionChip, isSelected && styles.occasionChipSelected]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={styles.occasionEmoji}>{occasion.emoji}</Text>
            <Text style={[styles.occasionLabel, isSelected && styles.occasionLabelSelected]}>
                {occasion.label}
            </Text>
        </TouchableOpacity>
    );
}

export default function RecognitionSelectionScreen() {
    const params = useLocalSearchParams<{
        photoUrl: string;
        garmentType?: string;
        confidence?: string;
    }>();

    const insets = useSafeAreaInsets();
    const itemListRef = useRef<FlatList>(null);

    // State
    const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
    const [selectedAnchorId, setSelectedAnchorId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [imageError, setImageError] = useState<string | null>(null);
    const [anchorPoints, setAnchorPoints] = useState<AnchorPoint[]>([]);
    const [imageLayout, setImageLayout] = useState({
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.65,
        offsetX: 0,
        offsetY: 0,
    });

    // Parse photo URL
    // IMPORTANT: Decode URL if it was encoded during navigation
    // OSS URLs contain query params (signatures) that need proper handling
    const rawPhotoUrl = params.photoUrl;
    const photoUrl = rawPhotoUrl
        ? (rawPhotoUrl.includes('%') ? decodeURIComponent(rawPhotoUrl) : rawPhotoUrl)
        : 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800';

    // Fetch anchor points on mount
    useEffect(() => {
        async function loadAnalysis() {
            setIsLoading(true);
            console.log('[Recognition] Starting visual analysis for:', photoUrl);

            try {
                // Get image info using OSS IMG service (more reliable than Image.getSize)
                // This avoids React Native Image.getSize() issues with OSS signed URLs
                const imageInfo = await visionService.getImageInfo(photoUrl);
                const imageDimensions = {
                    width: imageInfo.width,
                    height: imageInfo.height
                };
                console.log('[Recognition] Image dimensions from OSS:', imageDimensions);

                // Calculate display layout (cover mode)
                const imageAspect = imageDimensions.width / imageDimensions.height;
                const containerHeight = SCREEN_HEIGHT * 0.65;
                const screenAspect = SCREEN_WIDTH / containerHeight;

                let displayedWidth: number;
                let displayedHeight: number;
                let offsetX = 0;
                let offsetY = 0;

                if (imageAspect > screenAspect) {
                    displayedHeight = containerHeight;
                    displayedWidth = containerHeight * imageAspect;
                    offsetX = (SCREEN_WIDTH - displayedWidth) / 2;
                } else {
                    displayedWidth = SCREEN_WIDTH;
                    displayedHeight = SCREEN_WIDTH / imageAspect;
                    offsetY = (containerHeight - displayedHeight) / 2;
                }

                setImageLayout({
                    width: displayedWidth,
                    height: displayedHeight,
                    offsetX,
                    offsetY,
                });

                // Call visual analysis API using Qwen-VL-Max
                console.log('[Recognition] Calling visual analysis API...');
                const clothingItems = await visionService.analyzeClothingItems(photoUrl);
                console.log('[Recognition] Visual analysis result:', clothingItems);

                // Convert API response to anchor points
                const anchors: AnchorPoint[] = clothingItems.map((item) => ({
                    id: item.id,
                    x: item.center_x,
                    y: item.center_y,
                    category: item.category,
                    description: item.description,
                }));

                if (anchors.length > 0) {
                    setAnchorPoints(anchors);
                    setSelectedAnchorId(anchors[0].id);
                } else {
                    // Fallback if no items detected
                    console.warn('[Recognition] No clothing items detected, using fallback');
                    setAnchorPoints([
                        { id: '1', x: 0.5, y: 0.4, category: '服装' },
                    ]);
                    setSelectedAnchorId('1');
                }

            } catch (error) {
                console.error('[Recognition] Analysis failed:', error);
                // Fallback: single anchor at center
                setAnchorPoints([
                    { id: '1', x: 0.5, y: 0.4, category: '服装' },
                ]);
                setSelectedAnchorId('1');
            } finally {
                setIsLoading(false);
            }
        }

        loadAnalysis();
    }, [photoUrl]);

    // Handlers
    const handleBack = useCallback(() => {
        router.back();
    }, []);

    const handleAnchorSelect = useCallback((anchorId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedAnchorId(anchorId);

        // Scroll to corresponding item card
        const index = anchorPoints.findIndex(p => p.id === anchorId);
        if (index >= 0 && itemListRef.current) {
            itemListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        }
    }, [anchorPoints]);

    const handleItemCardPress = useCallback((anchorId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedAnchorId(anchorId);
    }, []);

    const handleOccasionSelect = useCallback((id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedOccasion(id);
    }, []);

    const handleConfirm = useCallback(() => {
        if (!selectedOccasion || !selectedAnchorId) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const occasionLabel = OCCASIONS.find((o) => o.id === selectedOccasion)?.label || '日常';
        const selectedItem = anchorPoints.find(p => p.id === selectedAnchorId);

        // Navigate to AI loading with streaming
        router.push({
            pathname: '/ai-loading',
            params: {
                photoUrl,
                occasion: occasionLabel,
                selectedItem: selectedItem?.category || '',
                useStreaming: 'true',
            },
        });
    }, [selectedOccasion, selectedAnchorId, photoUrl, anchorPoints]);

    const canConfirm = selectedOccasion !== null && selectedAnchorId !== null;

    return (
        <View style={styles.container}>
            {/* Photo background */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: photoUrl }}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                    onError={(e) => {
                        console.error('[Recognition] Image load error:', e.nativeEvent.error);
                        setImageError(e.nativeEvent.error);
                    }}
                    onLoad={() => setImageError(null)}
                />
                <View style={styles.dimOverlay} />

                {/* Anchor points overlay */}
                {!isLoading && anchorPoints.map((point) => (
                    <AnchorPointDot
                        key={point.id}
                        point={point}
                        isSelected={selectedAnchorId === point.id}
                        onPress={() => handleAnchorSelect(point.id)}
                        imageLayout={imageLayout}
                    />
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <Animated.View entering={FadeIn} style={styles.loadingOverlay}>
                        <Text style={styles.loadingText}>正在识别服装...</Text>
                    </Animated.View>
                )}
            </View>

            {/* Back button */}
            <TouchableOpacity
                style={[styles.backButton, { top: insets.top + 16 }]}
                onPress={handleBack}
                activeOpacity={0.7}
            >
                <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>

            {/* Bottom sheet */}
            <Animated.View
                entering={FadeInUp.delay(200).duration(500)}
                style={[styles.bottomSheet, { paddingBottom: insets.bottom + 16 }]}
            >
                {/* Item cards row */}
                <View style={styles.itemsSection}>
                    <Text style={styles.sectionLabel}>识别到的单品</Text>
                    <FlatList
                        ref={itemListRef}
                        horizontal
                        data={anchorPoints}
                        keyExtractor={(item) => item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.itemsList}
                        renderItem={({ item }) => (
                            <ItemCard
                                point={item}
                                isSelected={selectedAnchorId === item.id}
                                onPress={() => handleItemCardPress(item.id)}
                            />
                        )}
                    />
                </View>

                <View style={styles.divider} />

                {/* Occasion selection */}
                <View style={styles.occasionSection}>
                    <Text style={styles.sectionLabel}>选择场景</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.occasionScroll}
                    >
                        {OCCASIONS.map((occasion) => (
                            <OccasionChip
                                key={occasion.id}
                                occasion={occasion}
                                isSelected={selectedOccasion === occasion.id}
                                onPress={() => handleOccasionSelect(occasion.id)}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Confirm button */}
                <TouchableOpacity
                    style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                    disabled={!canConfirm}
                >
                    <Text style={styles.confirmButtonText}>
                        {canConfirm ? '开始 AI 搭配' : '请选择单品和场景'}
                    </Text>
                    {canConfirm && <Text style={styles.confirmArrow}>→</Text>}
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },

    // Image container
    imageContainer: {
        height: SCREEN_HEIGHT * 0.65,
        width: '100%',
        position: 'relative',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    dimOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },

    // Anchor point styles
    anchorTouchArea: {
        position: 'absolute',
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
    },
    anchorDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    anchorDotSelected: {
        backgroundColor: colors.primary,
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    anchorInner: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    anchorGlow: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
    },
    anchorLabel: {
        position: 'absolute',
        top: 50,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    anchorLabelSelected: {
        backgroundColor: colors.primary,
    },
    anchorLabelText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '500',
    },
    anchorLabelTextSelected: {
        fontWeight: '600',
    },

    // Back button
    backButton: {
        position: 'absolute',
        left: 20,
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    backIcon: {
        fontSize: 28,
        color: '#FFFFFF',
        fontWeight: '300',
        marginTop: -2,
    },

    // Bottom sheet
    bottomSheet: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
        padding: 20,
        zIndex: 60,
    },

    // Items section
    itemsSection: {
        marginBottom: 12,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
        marginBottom: 12,
    },
    itemsList: {
        gap: 12,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 16,
        gap: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    itemCardSelected: {
        backgroundColor: colors.primary + '15',
        borderColor: colors.primary,
    },
    itemCardIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemCardEmoji: {
        fontSize: 16,
    },
    itemCardText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#3A3A3C',
    },
    itemCardTextSelected: {
        color: colors.primary,
        fontWeight: '600',
    },
    itemCardCheck: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    },
    itemCardCheckText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: '#F2F2F7',
        marginVertical: 12,
    },

    // Occasion section
    occasionSection: {
        marginBottom: 16,
    },
    occasionScroll: {
        gap: 8,
        paddingRight: 8,
    },
    occasionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    occasionChipSelected: {
        backgroundColor: colors.primary + '15',
        borderColor: colors.primary,
    },
    occasionEmoji: {
        fontSize: 16,
    },
    occasionLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#3A3A3C',
    },
    occasionLabelSelected: {
        color: colors.primary,
        fontWeight: '600',
    },

    // Confirm button
    confirmButton: {
        backgroundColor: '#1C1C1E',
        height: 52,
        borderRadius: 26,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    confirmButtonDisabled: {
        backgroundColor: '#C7C7CC',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmArrow: {
        color: '#FFFFFF',
        fontSize: 18,
    },
});
