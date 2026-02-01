/**
 * Clothing Selector Component
 * Displays segmented clothing items for user selection
 * Shows clothing cards with transparent background images
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '@/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;  // 2 columns with 16px margins

export interface SegmentedClothingItem {
    id: string;
    category: string;  // e.g., "tops", "pants", "coat"
    garmentType: string;  // e.g., "上衣", "裤子", "外套"
    imageUrl: string;  // Segmented image with transparent background
}

interface ClothingSelectorProps {
    items: SegmentedClothingItem[];
    originalImageUrl: string;
    onSelect: (item: SegmentedClothingItem) => void;
    isLoading?: boolean;
}

export function ClothingSelector({
    items,
    originalImageUrl,
    onSelect,
    isLoading = false,
}: ClothingSelectorProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleSelect = (item: SegmentedClothingItem) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedId(item.id);

        // Call parent callback after a short delay for visual feedback
        setTimeout(() => {
            onSelect(item);
        }, 200);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>正在识别衣服...</Text>
            </View>
        );
    }

    if (items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>👕</Text>
                <Text style={styles.emptyText}>未检测到衣服单品</Text>
                <Text style={styles.emptyHint}>请确保照片中有清晰的衣服</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
                <Text style={styles.title}>选择您想要搭配的单品</Text>
                <Text style={styles.subtitle}>
                    检测到 {items.length} 件衣服，点击选择其中一件
                </Text>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.grid}
                showsVerticalScrollIndicator={false}
            >
                {items.map((item, index) => (
                    <Animated.View
                        key={item.id}
                        entering={FadeInUp.delay(index * 100).duration(400)}
                    >
                        <TouchableOpacity
                            style={[
                                styles.card,
                                selectedId === item.id && styles.cardSelected,
                            ]}
                            onPress={() => handleSelect(item)}
                            activeOpacity={0.8}
                        >
                            {selectedId === item.id && (
                                <LinearGradient
                                    colors={[colors.primary + '20', colors.primary + '10']}
                                    style={styles.selectedOverlay}
                                />
                            )}

                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={styles.itemImage}
                                    resizeMode="contain"
                                />
                            </View>

                            <View style={styles.labelContainer}>
                                <Text style={styles.garmentType}>{item.garmentType}</Text>
                            </View>

                            {selectedId === item.id && (
                                <Animated.View
                                    entering={FadeIn.duration(200)}
                                    style={styles.checkMark}
                                >
                                    <Text style={styles.checkIcon}>✓</Text>
                                </Animated.View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.gray4,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.gray2,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.gray4,
        paddingHorizontal: 32,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.gray1,
        marginBottom: 8,
    },
    emptyHint: {
        fontSize: 14,
        color: colors.gray2,
        textAlign: 'center',
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.gray1,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: colors.gray2,
    },
    scrollView: {
        flex: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 8,
        paddingBottom: 100,  // Extra space for bottom navigation
    },
    card: {
        width: CARD_WIDTH,
        margin: 8,
        backgroundColor: colors.gray5,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardSelected: {
        borderColor: colors.primary,
        elevation: 8,
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    selectedOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    imageContainer: {
        width: '100%',
        height: CARD_WIDTH * 1.2,  // Taller aspect ratio for clothing
        backgroundColor: '#E0E0E0', // Darker gray for better contrast with white clothes
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    labelContainer: {
        padding: 12,
        alignItems: 'center',
    },
    garmentType: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.gray1,
    },
    checkMark: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    checkIcon: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});

