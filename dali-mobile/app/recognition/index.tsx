/**
 * Recognition Selection Screen - Single Item High Confidence
 * Displays recognized garment with bounding box for confirmation
 * Part of Story 3.1: Garment Recognition & Selection
 *
 * @see _bmad-output/planning-artifacts/ux-design/pages/07-flow-pages/recognition-selection.html
 */
import React, { useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image,
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
} from 'react-native-reanimated';

import { colors } from '@/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

// Recognition card at bottom
function RecognitionCard({
    itemName,
    category,
    style: styleName,
    season,
    onEdit,
    onConfirm,
}: {
    itemName: string;
    category: string;
    style: string;
    season: string;
    onEdit: () => void;
    onConfirm: () => void;
}) {
    return (
        <Animated.View
            entering={FadeInUp.delay(200).duration(500)}
            style={styles.recognitionCard}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.itemName}>{itemName}</Text>
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
                <View style={styles.tag}>
                    <Text style={styles.tagText}>{season}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.confirmButton}
                onPress={onConfirm}
                activeOpacity={0.8}
            >
                <Text style={styles.confirmButtonText}>开始搭配</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

export default function RecognitionSelectionScreen() {
    const params = useLocalSearchParams<{
        photoUrl: string;
        garmentType: string;
        confidence: string;
        colors: string;
        styleTags: string;
    }>();

    const insets = useSafeAreaInsets();

    // Parse recognition data
    const photoUrl = params.photoUrl || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800';
    const confidence = parseFloat(params.confidence || '0.98');

    // Mock recognition result
    const recognitionResult = {
        itemName: '米色经典风衣',
        category: '外套',
        style: '简约',
        season: '春秋',
        boundingBox: {
            top: SCREEN_HEIGHT * 0.2,
            left: SCREEN_WIDTH * 0.15,
            width: SCREEN_WIDTH * 0.7,
            height: SCREEN_HEIGHT * 0.45,
        },
    };

    const handleBack = useCallback(() => {
        router.back();
    }, []);

    const handleEdit = useCallback(() => {
        // Navigate to multi-selection for manual correction
        router.push({
            pathname: '/recognition-multi',
            params: {
                photoUrl,
            },
        });
    }, [photoUrl]);

    const handleConfirm = useCallback(() => {
        // Save to invisible wardrobe and navigate to occasion selector
        router.push({
            pathname: '/occasion',
            params: {
                photoUrl,
                garmentType: recognitionResult.category,
                garmentName: recognitionResult.itemName,
            },
        });
    }, [photoUrl, recognitionResult]);

    return (
        <View style={styles.container}>
            {/* Photo background with dim overlay */}
            <Image source={{ uri: photoUrl }} style={styles.backgroundImage} />
            <View style={styles.dimOverlay} />

            {/* Bounding box */}
            <BoundingBox
                confidence={confidence}
                position={recognitionResult.boundingBox}
            />

            {/* Back button */}
            <TouchableOpacity
                style={[styles.backButton, { top: insets.top + 16 }]}
                onPress={handleBack}
                activeOpacity={0.7}
            >
                <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>

            {/* Recognition card */}
            <View style={[styles.cardContainer, { paddingBottom: insets.bottom + 20 }]}>
                <RecognitionCard
                    itemName={recognitionResult.itemName}
                    category={recognitionResult.category}
                    style={recognitionResult.style}
                    season={recognitionResult.season}
                    onEdit={handleEdit}
                    onConfirm={handleConfirm}
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
        paddingHorizontal: 20,
    },

    // Recognition card
    recognitionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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

    // Confirm button
    confirmButton: {
        backgroundColor: '#1C1C1E',
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
