/**
 * Occasion Selection Screen
 * User selects occasion after choosing clothing item
 * Then proceeds to AI generation
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { colors } from '@/constants';

const OCCASIONS = [
    { id: 'work', label: '职场通勤', emoji: '💼', description: '专业得体的职场穿搭' },
    { id: 'date', label: '约会逛街', emoji: '💕', description: '浪漫时尚的约会造型' },
    { id: 'casual', label: '日常休闲', emoji: '☕', description: '舒适自在的日常装扮' },
    { id: 'party', label: '聚会活动', emoji: '🎉', description: '亮眼出众的派对look' },
    { id: 'travel', label: '出游度假', emoji: '✈️', description: '轻松舒适的旅行装' },
    { id: 'formal', label: '正式场合', emoji: '👔', description: '优雅庄重的正装' },
];

export default function OccasionSelectionScreen() {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{
        selectedItemUrl: string;
        selectedItemDescription: string;
        selectedItemCategory: string;
        originalImageUrl: string;
    }>();

    const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);

    const handleSelectOccasion = (occasionId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedOccasion(occasionId);
    };

    const handleConfirm = () => {
        if (!selectedOccasion) return;

        const occasion = OCCASIONS.find(o => o.id === selectedOccasion);
        if (!occasion) return;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Navigate to AI loading/generation screen
        router.push({
            pathname: '/ai-loading',
            params: {
                selectedItemUrl: params.selectedItemUrl,
                selectedItemDescription: params.selectedItemDescription,
                selectedItemCategory: params.selectedItemCategory,
                originalImageUrl: params.originalImageUrl,
                occasion: occasion.label,
                useStreaming: 'true',
            },
        });
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
                <Text style={styles.headerTitle}>选择场合</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Selected Item Preview */}
                <View style={styles.previewSection}>
                    <Text style={styles.sectionTitle}>已选择的单品</Text>
                    <View style={styles.previewCard}>
                        <Image
                            source={{ uri: params.selectedItemUrl }}
                            style={styles.previewImage}
                            resizeMode="contain"
                        />
                        <View style={styles.previewInfo}>
                            <Text style={styles.previewCategory}>{params.selectedItemCategory}</Text>
                            <Text style={styles.previewDescription}>
                                {params.selectedItemDescription}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Occasion Selection */}
                <View style={styles.occasionsSection}>
                    <Text style={styles.sectionTitle}>为它选择一个搭配场合</Text>
                    <View style={styles.occasionsGrid}>
                        {OCCASIONS.map((occasion, index) => (
                            <Animated.View
                                key={occasion.id}
                                entering={FadeInDown.delay(index * 50).duration(400)}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.occasionCard,
                                        selectedOccasion === occasion.id && styles.occasionCardSelected,
                                    ]}
                                    onPress={() => handleSelectOccasion(occasion.id)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.occasionEmoji}>{occasion.emoji}</Text>
                                    <Text style={styles.occasionLabel}>{occasion.label}</Text>
                                    <Text style={styles.occasionDescription}>{occasion.description}</Text>

                                    {selectedOccasion === occasion.id && (
                                        <View style={styles.selectedIndicator}>
                                            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action */}
            <View style={[styles.bottomAction, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        !selectedOccasion && styles.confirmButtonDisabled,
                    ]}
                    onPress={handleConfirm}
                    disabled={!selectedOccasion}
                    activeOpacity={0.8}
                >
                    <Text style={styles.confirmButtonText}>
                        {selectedOccasion ? '开始生成搭配' : '请选择场合'}
                    </Text>
                    {selectedOccasion && (
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                    )}
                </TouchableOpacity>
            </View>
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
    scrollView: {
        flex: 1,
    },
    previewSection: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    previewCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    previewImage: {
        width: 80,
        height: 80,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    previewInfo: {
        flex: 1,
        marginLeft: 16,
    },
    previewCategory: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 4,
    },
    previewDescription: {
        fontSize: 16,
        color: colors.text,
    },
    occasionsSection: {
        padding: 16,
    },
    occasionsGrid: {
        gap: 12,
    },
    occasionCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    occasionCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '10',
    },
    occasionEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    occasionLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    occasionDescription: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    selectedIndicator: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    bottomAction: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
    },
    confirmButton: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonDisabled: {
        backgroundColor: colors.disabled,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

