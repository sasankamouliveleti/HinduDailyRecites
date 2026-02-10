import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Layout,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../theme';
import { recites, deities, getRecitesByDeity } from '../data/recites';
import { RootStackParamList, Recite } from '../types';
import { ReciteCard } from '../components/ReciteCard';
import { useStreaks } from '../hooks/useStreaks';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function AnimatedFilterChip({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  const bgProgress = useSharedValue(isActive ? 1 : 0);

  React.useEffect(() => {
    bgProgress.value = withTiming(isActive ? 1 : 0, { duration: 200 });
  }, [isActive]);

  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor:
      bgProgress.value > 0.5 ? colors.saffron : colors.surface,
    borderColor:
      bgProgress.value > 0.5 ? colors.saffron : colors.cardBorder,
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: bgProgress.value > 0.5 ? colors.white : colors.textSecondary,
    fontWeight: bgProgress.value > 0.5 ? ('600' as any) : ('400' as any),
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View style={[styles.filterChip, chipStyle]}>
        <Animated.Text style={[styles.filterText, textStyle]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function LibraryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { isReciteCompletedToday } = useStreaks();
  const [selectedDeity, setSelectedDeity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const searchWidth = useSharedValue(1);

  const searchAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: searchWidth.value }],
  }));

  const handleFocus = () => {
    setIsFocused(true);
    searchWidth.value = withTiming(1.02, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    searchWidth.value = withTiming(1, { duration: 200 });
  };

  const filteredRecites = useMemo(() => {
    let result = getRecitesByDeity(selectedDeity);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.deity.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [selectedDeity, searchQuery]);

  const renderRecite = ({ item, index }: { item: Recite; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(300)}>
      <ReciteCard
        recite={item}
        isCompletedToday={isReciteCompletedToday(item.id)}
        onPress={() =>
          navigation.navigate('ReciteDetail', { reciteId: item.id })
        }
      />
    </Animated.View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <Animated.Text entering={FadeIn.duration(400)} style={styles.title}>
        Library
      </Animated.Text>

      <Animated.View style={searchAnimStyle}>
        <TextInput
          style={[
            styles.searchInput,
            isFocused && styles.searchInputFocused,
          ]}
          placeholder="Search recites..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Animated.View>

      <View style={styles.filterRow}>
        {deities.map((deity) => (
          <AnimatedFilterChip
            key={deity}
            label={deity}
            isActive={selectedDeity === deity}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedDeity(deity);
            }}
          />
        ))}
      </View>

      <FlatList
        data={filteredRecites}
        renderItem={renderRecite}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    paddingHorizontal: spacing.lg,
  },
  searchInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  searchInputFocused: {
    borderColor: colors.gold,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: fontSize.sm,
  },
  listContent: {
    padding: spacing.lg,
  },
});
