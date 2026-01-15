/**
 * Recognition Selection Screen - Combined with Occasion Selection
 * Displays recognized garment with bounding box + occasion selection in one page
 * UX Improvement: Merged recognition confirmation and occasion selection
 *
 * @see Story 3.1: Garment Recognition & Selection
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    FadeInUp,
    FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors } from '@/constants';
import { visionService } from '@/services';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Occasion options
const OCCASIONS = [
    { id: 'work', label: '职场通勤', emoji: '💼' },
    { id: 'date', label: '约会逛街', emoji: '💕' },
    { id: 'casual', label: '日常休闲', emoji: '☕' },
    { id: 'party', label: '聚会活动', emoji: '🎉' },
    { id: 'travel', label: '出游度假', emoji: '✈️' },
    { id: 'formal', label: '正式场合', emoji: '👔' },
];

// Helper to load image dimensions
function loadImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        Image.getSize(
            url,
            (width, height) => resolve({ width, height }),
            (error) => reject(error)
        );
    });
}

// Bounding box with pulsing animation
function BoundingBox({
    confidence,
    position,
}: {
    confidence: number;
    position: { top: number; left: number; width: number; height: number };
}) {
    const pulseOpacity = useSharedValue(0.6);

    useEffect(() => {
        pulseOpacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.6, { duration: 1000 })
            ),
            -1,
            false
        );
    }, []);

    const animatedBorderStyle = useAnimatedStyle(() => ({
        borderColor: `rgba(108, 99, 255, ${pulseOpacity.value})`,
    }));

    return (
        <Animated.View
            style={[
                styles.boundingBox,
                {
                    top: position.top,
                    left: position.left,
                    width: position.width,
                    height: position.height,
                },
                animatedBorderStyle,
            ]}
        >
            {/* Corner accents */}
            <View style={[styles.cornerAccent, styles.cornerTopLeft]} />
            <View style={[styles.cornerAccent, styles.cornerTopRight]} />
            <View style={[styles.cornerAccent, styles.cornerBottomLeft]} />
            <View style={[styles.cornerAccent, styles.cornerBottomRight]} />

            {/* Confidence tag */}
            <View style={styles.confidenceTag}>
                <Text style={styles.confidenceText}>已识别 {Math.round(confidence * 100)}%</Text>
            </View>
        </Animated.View>
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

// Combined recognition + occasion card
function RecognitionOccasionCard({
    itemName,
    category,
    styleName,
    selectedOccasion,
    onOccasionSelect,
    onConfirm,
    onEdit,
}: {
    itemName: string;
    category: string;
    styleName: string;
    selectedOccasion: string | null;
    onOccasionSelect: (id: string) => void;
    onConfirm: () => void;
    onEdit: () => void;
}) {
    const canConfirm = selectedOccasion !== null;

    return (
        <Animated.View
            entering={FadeInUp.delay(200).duration(500)}
            style={styles.combinedCard}
        >
            {/* Section 1: Recognized garment */}
            <View style={styles.garmentSection}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.sectionLabel}>已识别</Text>
                        <Text style={styles.itemName}>{itemName}</Text>
                    </View>
                    <TouchableOpacity onPress={onEdit} activeOpacity={0.7}>
                        <Text style={styles.editButton}>修改</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tagRow}>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{category}</Text>
                    </View>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{styleName}</Text>
                    </View>
                </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Section 2: Occasion selection */}
            <View style={styles.occasionSection}>
                <Text style={styles.sectionLabel}>选择场景</Text>
                <Text style={styles.occasionHint}>选择穿搭场景，AI 会为你推荐最适合的搭配</Text>

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
                            onPress={() => onOccasionSelect(occasion.id)}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Confirm button */}
            <TouchableOpacity
                style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
                onPress={onConfirm}
                activeOpacity={0.8}
                disabled={!canConfirm}
            >
                <Text style={styles.confirmButtonText}>
                    {canConfirm ? '开始搭配' : '请选择场景'}
                </Text>
                {canConfirm && <Text style={styles.confirmArrow}>→</Text>}
            </TouchableOpacity>
        </Animated.View>
    );
}

export default function RecognitionSelectionScreen() {
    const params = useLocalSearchParams<{
        photoUrl: string;
        garmentType: string;
        confidence: string;
    }>();

    const insets = useSafeAreaInsets();
    const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [imageError, setImageError] = useState<string | null>(null);
    const [boundingBox, setBoundingBox] = useState({
        top: SCREEN_HEIGHT * 0.15,
        left: SCREEN_WIDTH * 0.15,
        width: SCREEN_WIDTH * 0.7,
        height: SCREEN_HEIGHT * 0.35,
    });

    // Parse recognition data - decode URL if needed
    const rawPhotoUrl = params.photoUrl;
    const photoUrl = rawPhotoUrl
        ? decodeURIComponent(rawPhotoUrl)
        : 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800';

    // Debug logging
    useEffect(() => {
        console.log('[Recognition] Raw photoUrl param:', rawPhotoUrl);
        console.log('[Recognition] Decoded photoUrl:', photoUrl);
    }, [rawPhotoUrl, photoUrl]);
    const confidence = parseFloat(params.confidence || '0.98');

    // Recognition result (can be enhanced with garmentService.analyzeGarment later)
    const recognitionResult = {
        itemName: '全身穿搭',
        category: '外套',
        style: '简约',
    };

    // Fetch detection on mount
    useEffect(() => {
        async function loadDetection() {
            setIsLoading(true);
            console.log('[Recognition] Starting detection for:', photoUrl);
            try {
                // 1. Get image dimensions for scaling
                console.log('[Recognition] Getting image dimensions...');
                const imageDimensions = await loadImageDimensions(photoUrl);
                console.log('[Recognition] Image dimensions:', imageDimensions);

                // 2. Call detection API
                console.log('[Recognition] Calling detectMainBody API...');
                const box = await visionService.detectMainBody(photoUrl);
                console.log('[Recognition] Detection result:', box);

                // 3. Scale box coordinates to screen
                const imageDisplayHeight = SCREEN_HEIGHT;
                const imageDisplayWidth = SCREEN_WIDTH;

                // Calculate scale factors
                const scaleX = imageDisplayWidth / imageDimensions.width;
                const scaleY = imageDisplayHeight / imageDimensions.height;

                // Update bounding box with scaled coordinates
                setBoundingBox({
                    top: box.y * scaleY,
                    left: box.x * scaleX,
                    width: box.width * scaleX,
                    height: box.height * scaleY,
                });

            } catch (error) {
                console.error('[Recognition] Detection failed:', error);
                // Keep default fallback box
            } finally {
                setIsLoading(false);
            }
        }

        loadDetection();
    }, [photoUrl]);

    const handleBack = useCallback(() => {
        router.back();
    }, []);

    const handleEdit = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Navigate to multi-selection for manual correction
        router.push({
            pathname: '/recognition-multi',
            params: { photoUrl },
        });
    }, [photoUrl]);

    const handleOccasionSelect = useCallback((id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedOccasion(id);
    }, []);

    const handleConfirm = useCallback(() => {
        if (!selectedOccasion) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const occasionLabel = OCCASIONS.find((o) => o.id === selectedOccasion)?.label || '日常';

        // Navigate directly to AI loading with all data
        router.push({
            pathname: '/ai-loading',
            params: {
                photoUrl,
                occasion: occasionLabel,
                garmentType: recognitionResult.category,
                garmentName: recognitionResult.itemName,
            },
        });
    }, [selectedOccasion, photoUrl, recognitionResult]);

    return (
        <View style={styles.container}>
            {/* Photo background with dim overlay */}
            <Image
                source={{ uri: photoUrl }}
                style={styles.backgroundImage}
                resizeMode="cover"
                onError={(e) => {
                    console.error('[Recognition] Image load error:', e.nativeEvent.error);
                    setImageError(e.nativeEvent.error);
                }}
                onLoad={() => {
                    console.log('[Recognition] Image loaded successfully');
                    setImageError(null);
                }}
            />
            {imageError && (
                <View style={styles.errorOverlay}>
                    <Text style={styles.errorText}>图片加载失败</Text>
                    <Text style={styles.errorDetail}>{imageError}</Text>
                </View>
            )}
            <View style={styles.dimOverlay} />

            {/* Bounding box */}
            <BoundingBox
                confidence={confidence}
                position={boundingBox}
            />

            {/* Back button */}
            <TouchableOpacity
                style={[styles.backButton, { top: insets.top + 16 }]}
                onPress={handleBack}
                activeOpacity={0.7}
            >
                <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>

            {/* Combined recognition + occasion card */}
            <View style={[styles.cardContainer, { paddingBottom: insets.bottom + 16 }]}>
                <RecognitionOccasionCard
                    itemName={recognitionResult.itemName}
                    category={recognitionResult.category}
                    styleName={recognitionResult.style}
                    selectedOccasion={selectedOccasion}
                    onOccasionSelect={handleOccasionSelect}
                    onConfirm={handleConfirm}
                    onEdit={handleEdit}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },

    // Background image
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    dimOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    errorDetail: {
        color: '#999',
        fontSize: 12,
        textAlign: 'center',
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

    // Bounding box
    boundingBox: {
        position: 'absolute',
        borderWidth: 3,
        borderRadius: 12,
        borderColor: colors.primary,
    },

    // Corner accents
    cornerAccent: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: colors.primary,
        borderWidth: 4,
    },
    cornerTopLeft: {
        top: -2,
        left: -2,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 8,
    },
    cornerTopRight: {
        top: -2,
        right: -2,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 8,
    },
    cornerBottomLeft: {
        bottom: -2,
        left: -2,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 8,
    },
    cornerBottomRight: {
        bottom: -2,
        right: -2,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 8,
    },

    // Confidence tag
    confidenceTag: {
        position: 'absolute',
        top: -30,
        left: 0,
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    confidenceText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },

    // Card container
    cardContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
    },

    // Combined card
    combinedCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },

    // Garment section
    garmentSection: {
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#8E8E93',
        marginBottom: 4,
    },
    itemName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    editButton: {
        fontSize: 15,
        color: colors.primary,
        fontWeight: '600',
    },

    // Tags
    tagRow: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    tagText: {
        fontSize: 13,
        color: '#3A3A3C',
        fontWeight: '500',
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: '#F2F2F7',
        marginVertical: 16,
    },

    // Occasion section
    occasionSection: {
        marginBottom: 16,
    },
    occasionHint: {
        fontSize: 13,
        color: '#8E8E93',
        marginBottom: 12,
    },
    occasionScroll: {
        gap: 8,
        paddingRight: 8,
    },

    // Occasion chip
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
