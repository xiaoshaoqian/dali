/**
 * Recognition Multi-Selection Screen
 * Displays multiple detected items for user selection
 * Part of Story 3.1: Garment Recognition & Selection
 *
 * @see _bmad-output/planning-artifacts/ux-design/pages/07-flow-pages/recognition-selection-multi.html
 */
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Image,
    ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useAnimatedStyle,
    withSpring,
    FadeInUp,
} from 'react-native-reanimated';

import { colors } from '@/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAROUSEL_CARD_WIDTH = 100;
const CAROUSEL_CARD_HEIGHT = 140;

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
}: {
    item: DetectedItem;
    isSelected: boolean;
    onPress: () => void;
}) {
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withSpring(isSelected ? 1.05 : 1) }],
        backgroundColor: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.1)',
    }));

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            <Animated.View style={[styles.carouselCard, animatedStyle]}>
                <Image
                    source={{ uri: item.thumbnail }}
                    style={styles.cardThumbnail}
                    resizeMode="cover"
                />
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

export default function RecognitionMultiScreen() {
    const params = useLocalSearchParams<{
        photoUrl: string;
    }>();

    const insets = useSafeAreaInsets();
    const [selectedId, setSelectedId] = useState<string>('item-1');

    // Mock detected items
    const detectedItems: DetectedItem[] = [
        {
            id: 'item-1',
            name: '米色风衣',
            thumbnail: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200',
            boundingBox: { top: 120, left: 60, width: 140, height: 200 },
        },
        {
            id: 'item-2',
            name: '白色衬衫',
            thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200',
            boundingBox: { top: 180, left: 200, width: 120, height: 160 },
        },
        {
            id: 'item-3',
            name: '黑色长裤',
            thumbnail: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200',
            boundingBox: { top: 340, left: 100, width: 180, height: 200 },
        },
    ];

    const photoUrl = params.photoUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800';

    const handleBack = useCallback(() => {
        router.back();
    }, []);

    const handleSelectItem = useCallback((id: string) => {
        setSelectedId(id);
    }, []);

    const handleConfirm = useCallback(() => {
        const selectedItem = detectedItems.find((i) => i.id === selectedId);
        if (selectedItem) {
            router.push({
                pathname: '/occasion',
                params: {
                    photoUrl,
                    garmentType: '外套',
                    garmentName: selectedItem.name,
                },
            });
        }
    }, [selectedId, photoUrl, detectedItems]);

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
                locations={[0, 0.15, 1]}
                style={[styles.selectionFooter, { paddingBottom: insets.bottom + 20 }]}
            >
                <Animated.View entering={FadeInUp.delay(100).duration(400)}>
                    <Text style={styles.footerTitle}>选择主体</Text>
                    <Text style={styles.footerSubtitle}>请选择一件物品作为搭配核心</Text>
                </Animated.View>

                {/* Items carousel */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselContainer}
                >
                    {detectedItems.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            entering={FadeInUp.delay(200 + index * 100).duration(400)}
                        >
                            <CarouselCard
                                item={item}
                                isSelected={item.id === selectedId}
                                onPress={() => handleSelectItem(item.id)}
                            />
                        </Animated.View>
                    ))}
                </ScrollView>

                {/* Confirm button */}
                <TouchableOpacity
                    style={[styles.confirmButton, !selectedId && styles.confirmButtonDisabled]}
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                    disabled={!selectedId}
                >
                    <Text style={styles.confirmButtonText}>开始搭配</Text>
                    <Text style={styles.confirmArrow}>→</Text>
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
        paddingTop: 50,
        paddingHorizontal: 24,
        gap: 16,
    },
    footerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    footerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
    },

    // Carousel
    carouselContainer: {
        paddingVertical: 8,
        gap: 12,
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
    },
    confirmButtonDisabled: {
        opacity: 0.5,
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
