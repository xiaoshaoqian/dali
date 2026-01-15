/**
 * Recognition Multi-Selection Screen
 * Displays multiple detected items for user selection
 * Part of Story 3.1: Garment Recognition & Selection
 *
 * @see _bmad-output/planning-artifacts/ux-design/pages/07-flow-pages/recognition-selection-multi.html
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useAnimatedStyle,
    withSpring,
    FadeInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors } from '@/constants';
import { visionService } from '@/services';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAROUSEL_CARD_WIDTH = 100;
const CAROUSEL_CARD_HEIGHT = 140;

// Occasion options
const OCCASIONS = [
    { id: 'work', label: '通勤', emoji: '💼' },
    { id: 'date', label: '约会', emoji: '💕' },
    { id: 'casual', label: '休闲', emoji: '☕' },
    { id: 'party', label: '聚会', emoji: '🎉' },
    { id: 'travel', label: '度假', emoji: '✈️' },
];

interface DetectedItem {
    id: string;
    name: string;
    thumbnail: string;
    boundingBox: {
        top: number;
        left: number;
        width: number;
        height: number;
    };
}

// Bounding box for detected items
function ItemBoundingBox({
    item,
    isSelected,
    onPress,
}: {
    item: DetectedItem;
    isSelected: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[
                styles.itemBoundingBox,
                {
                    top: item.boundingBox.top,
                    left: item.boundingBox.left,
                    width: item.boundingBox.width,
                    height: item.boundingBox.height,
                },
                isSelected && styles.itemBoundingBoxSelected,
            ]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {isSelected && (
                <View style={styles.selectedTag}>
                    <Text style={styles.selectedTagText}>✓ 已选主体</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

// Carousel item card
function CarouselCard({
    item,
    isSelected,
    onPress,
    isLoading,
}: {
    item: DetectedItem;
    isSelected: boolean;
    onPress: () => void;
    isLoading?: boolean;
}) {
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isSelected ? 1.05 : 1) }],
        backgroundColor: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.1)',
    }));

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            <Animated.View style={[styles.carouselCard, animatedStyle]}>
                {isLoading ? (
                    <View style={styles.cardThumbnailLoading}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                ) : (
                    <Image
                        source={{ uri: item.thumbnail }}
                        style={styles.cardThumbnail}
                        resizeMode="cover"
                    />
                )}
                <Text
                    style={[styles.cardName, isSelected && styles.cardNameSelected]}
                    numberOfLines={1}
                >
                    {item.name}
                </Text>
                <View style={[styles.radioIndicator, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

// Occasion chip component matching single selection style
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

export default function RecognitionMultiScreen() {
    const params = useLocalSearchParams<{
        photoUrl: string;
    }>();

    const insets = useSafeAreaInsets();
    const [selectedId, setSelectedId] = useState<string>('item-main');
    const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
    const [isLoadingDetection, setIsLoadingDetection] = useState(true);
    const [isLoadingSegment, setIsLoadingSegment] = useState(false);

    // Real detected items (populated by API)
    const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);

    const photoUrl = params.photoUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800';

    // Fetch detection on mount
    useEffect(() => {
        async function loadDetection() {
            setIsLoadingDetection(true);
            try {
                // 1. Detect Main Body
                const box = await visionService.detectMainBody(photoUrl);

                // 2. Create initial item with detected box
                // Note: API returns pixel coordinates. We might need to scale based on image display.
                // For now, mapping directly assuming image fills the top portion of screen.
                const initialItem: DetectedItem = {
                    id: 'item-main',
                    name: '全身穿搭',
                    thumbnail: photoUrl, // Will update with segment result
                    boundingBox: {
                        top: box.y,
                        left: box.x,
                        width: box.width,
                        height: box.height,
                    },
                };

                setDetectedItems([initialItem]);
                setSelectedId('item-main');

                // 3. Fetch Segmentation for thumbnail (async)
                setIsLoadingSegment(true);
                try {
                    const segmentedUrl = await visionService.segmentCloth(photoUrl);
                    setDetectedItems(prev => prev.map(item =>
                        item.id === 'item-main' ? { ...item, thumbnail: segmentedUrl } : item
                    ));
                } catch (segError) {
                    console.warn('Segmentation failed, using original image:', segError);
                } finally {
                    setIsLoadingSegment(false);
                }

            } catch (error) {
                console.error('Detection failed:', error);
                // Fallback to mock data if API fails
                setDetectedItems([{
                    id: 'item-main',
                    name: '全身穿搭',
                    thumbnail: photoUrl,
                    boundingBox: { top: 120, left: 60, width: 200, height: 300 },
                }]);
            } finally {
                setIsLoadingDetection(false);
            }
        }

        loadDetection();
    }, [photoUrl]);

    const handleBack = useCallback(() => {
        router.back();
    }, []);

    const handleSelectItem = useCallback((id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedId(id);
    }, []);

    const handleOccasionSelect = useCallback((id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedOccasion(id);
    }, []);

    const handleConfirm = useCallback(() => {
        const selectedItem = detectedItems.find((i) => i.id === selectedId);
        if (!selectedItem || !selectedOccasion) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const occasionLabel = OCCASIONS.find((o) => o.id === selectedOccasion)?.label || '日常';

        // Navigate directly to AI loading with all data
        router.push({
            pathname: '/ai-loading',
            params: {
                photoUrl,
                occasion: occasionLabel,
                garmentType: '外套', // Simplified for mock
                garmentName: selectedItem.name,
            },
        });
    }, [selectedId, selectedOccasion, photoUrl, detectedItems]);

    const canConfirm = selectedId && selectedOccasion;

    return (
        <View style={styles.container}>
            {/* Photo background */}
            <Image source={{ uri: photoUrl }} style={styles.backgroundImage} />

            {/* Dim overlay for non-selected areas (when item selected) */}
            {selectedId && (
                <View style={styles.dimOverlayFull} pointerEvents="none" />
            )}

            {/* Bounding boxes */}
            {detectedItems.map((item) => (
                <ItemBoundingBox
                    key={item.id}
                    item={item}
                    isSelected={item.id === selectedId}
                    onPress={() => handleSelectItem(item.id)}
                />
            ))}

            {/* Back button */}
            <TouchableOpacity
                style={[styles.backButton, { top: insets.top + 16 }]}
                onPress={handleBack}
                activeOpacity={0.7}
            >
                <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>

            {/* Selection footer */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.95)', '#000']}
                locations={[0, 0.1, 1]}
                style={[styles.selectionFooter, { paddingBottom: insets.bottom + 20 }]}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ maxHeight: SCREEN_HEIGHT * 0.45 }}
                >
                    {/* Section 1: Item Selection */}
                    <Animated.View entering={FadeInUp.delay(100).duration(400)}>
                        <Text style={styles.footerTitle}>选择主体</Text>
                        <Text style={styles.footerSubtitle}>请选择一件物品作为搭配核心</Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.carouselContainer}
                        >
                            {detectedItems.map((item, index) => (
                                <CarouselCard
                                    key={item.id}
                                    item={item}
                                    isSelected={item.id === selectedId}
                                    onPress={() => handleSelectItem(item.id)}
                                />
                            ))}
                        </ScrollView>
                    </Animated.View>

                    {/* Section 2: Occasion Selection */}
                    <Animated.View
                        entering={FadeInUp.delay(300).duration(400)}
                        style={styles.occasionSection}
                    >
                        <Text style={styles.footerTitle}>选择场景</Text>
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
                    </Animated.View>
                </ScrollView>

                {/* Confirm button */}
                <TouchableOpacity
                    style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                    disabled={!canConfirm}
                >
                    <Text style={styles.confirmButtonText}>
                        {canConfirm ? '开始搭配' : '请选择场景'}
                    </Text>
                    {canConfirm && <Text style={styles.confirmArrow}>→</Text>}
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },

    // Background
    backgroundImage: {
        width: '100%',
        height: SCREEN_HEIGHT * 0.65,
    },
    dimOverlayFull: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
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

    // Bounding boxes
    itemBoundingBox: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        borderRadius: 12,
        zIndex: 50,
    },
    itemBoundingBoxSelected: {
        borderColor: colors.primary,
        borderWidth: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 9999,
        zIndex: 100,
    },
    selectedTag: {
        position: 'absolute',
        top: -28,
        left: 0,
        backgroundColor: colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    selectedTagText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
    },

    // Selection footer
    selectionFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 40,
        paddingHorizontal: 24,
        gap: 16,
        maxHeight: SCREEN_HEIGHT * 0.55,
    },
    footerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
        marginTop: 8,
    },
    footerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
    },

    // Carousel
    carouselContainer: {
        paddingVertical: 12,
    },
    carouselCard: {
        width: CAROUSEL_CARD_WIDTH,
        height: CAROUSEL_CARD_HEIGHT,
        borderRadius: 16,
        padding: 8,
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    cardThumbnail: {
        width: '100%',
        height: 80,
        borderRadius: 10,
        marginBottom: 6,
    },
    cardThumbnailLoading: {
        width: '100%',
        height: 80,
        borderRadius: 10,
        marginBottom: 6,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    cardName: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: 4,
    },
    cardNameSelected: {
        color: '#1C1C1E',
        fontWeight: '500',
    },
    radioIndicator: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },
    radioInner: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
    },

    // Occasion section
    occasionSection: {
        marginTop: 8,
        marginBottom: 16,
    },
    occasionScroll: {
        gap: 8,
        paddingRight: 8,
        marginTop: 12,
        paddingBottom: 10,
    },
    occasionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    occasionChipSelected: {
        backgroundColor: colors.primary + '30', // Semi-transparent primary
        borderColor: colors.primary,
    },
    occasionEmoji: {
        fontSize: 16,
    },
    occasionLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    occasionLabelSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

    // Confirm button
    confirmButton: {
        backgroundColor: colors.primary,
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
        marginBottom: 10,
    },
    confirmButtonDisabled: {
        backgroundColor: '#333333',
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
