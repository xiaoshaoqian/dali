/**
 * Clothing Selection Screen
 * Handles segmentation and clothing item selection
 * 
 * Flow:
 * 1. Call segmentation API
 * 2. Display segmented items for user selection
 * 3. On selection, call description API
 * 4. Navigate to occasion selection with item details
 */
import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants';
import { ClothingSelector, SegmentedClothingItem } from '@/components/ClothingSelector';
import { apiClient } from '@/services';

export default function ClothingSelectionScreen() {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ photoUrl: string }>();
    const photoUrl = params.photoUrl;

    const [isSegmenting, setIsSegmenting] = useState(true);
    const [isDescribing, setIsDescribing] = useState(false);
    const [items, setItems] = useState<SegmentedClothingItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Segment clothing on mount
    useEffect(() => {
        if (!photoUrl) {
            Alert.alert('错误', '照片URL缺失');
            router.back();
            return;
        }

        segmentClothing();
    }, [photoUrl]);

    const segmentClothing = async () => {
        try {
            setIsSegmenting(true);
            setError(null);

            const response = await apiClient.post('/segmentation/segment-clothing', {
                image_url: photoUrl,
            });

            const data = response.data;

            if (data.items && data.items.length > 0) {
                setItems(data.items);
            } else {
                setError('未检测到衣服单品，请重新拍照');
            }
        } catch (err: any) {
            console.error('[ClothingSelection] Segmentation failed:', err);
            setError('分割失败，请重试');
        } finally {
            setIsSegmenting(false);
        }
    };

    const handleSelectItem = async (item: SegmentedClothingItem) => {
        try {
            setIsDescribing(true);

            // Call description API for the selected item
            const response = await apiClient.post('/segmentation/describe-clothing', {
                image_url: item.imageUrl,
                category_hint: item.category,
            });

            const description = response.data;

            // Navigate to occasion selection with item details
            router.push({
                pathname: '/occasion-selection',
                params: {
                    selectedItemUrl: item.imageUrl,
                    selectedItemDescription: description.description || `${description.color}${item.garmentType}`,
                    selectedItemCategory: item.garmentType,
                    originalImageUrl: photoUrl,
                },
            });
        } catch (err: any) {
            console.error('[ClothingSelection] Description failed:', err);
            Alert.alert('识别失败', '获取衣服描述失败，请重试');
        } finally {
            setIsDescribing(false);
        }
    };

    const handleRetry = () => {
        segmentClothing();
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>选择衣服</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Content */}
            {isSegmenting ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>正在分析照片...</Text>
                    <Text style={styles.loadingHint}>AI 正在识别衣服单品</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>😕</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                        <Text style={styles.retryButtonText}>重新识别</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ClothingSelector
                    items={items}
                    originalImageUrl={photoUrl || ''}
                    onSelect={handleSelectItem}
                    isLoading={isDescribing}
                />
            )}

            {/* Describing overlay */}
            {isDescribing && (
                <View style={styles.describingOverlay}>
                    <View style={styles.describingBox}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.describingText}>正在识别这件衣服...</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    loadingHint: {
        marginTop: 8,
        fontSize: 14,
        color: colors.textSecondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    errorIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 16,
        color: colors.text,
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        backgroundColor: colors.primary,
        borderRadius: 24,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    describingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    describingBox: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        minWidth: 200,
    },
    describingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.text,
        textAlign: 'center',
    },
});

