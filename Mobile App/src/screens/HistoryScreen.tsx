import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Image, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { useState } from 'react';
import { Pressable } from 'react-native';

import { apiService } from '../api/services';
import { AppText, Pill, Screen, SearchInput } from '../components/ui';
import { designImages, fallbackHistory } from '../constants/designData';
import { theme } from '../constants/theme';
import { MainTabParamList } from '../navigation/types';

const filterChips = ['All Crops', 'Wheat', 'Tomato', 'Rice'];
const imageMap = [designImages.historyWheat, designImages.historyTomato, designImages.historyWheat, designImages.historyTomato];

export function HistoryScreen() {
  const isDark = useColorScheme() === 'dark';
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const { data } = useQuery({
    queryKey: ['chat-history'],
    queryFn: () => apiService.getChatHistory(),
  });

  const hasRealHistory = Boolean(data?.chats?.length);
  const chats = hasRealHistory ? data!.chats : fallbackHistory;

  return (
    <Screen scrollable withTabBar>

      <AppText variant="heading">History / इतिहास / تاریخ</AppText>
      <AppText color={theme.colors.textMuted}>Your Scans</AppText>
      <View style={{ marginTop: 18 }}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="Search history" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {filterChips.map((chip, index) => (
          <Pill key={chip} label={chip} active={index === 0} />
        ))}
      </ScrollView>
      <AppText variant="caption" color={theme.colors.textMuted} style={styles.dayLabel}>
        Today / आज / آج
      </AppText>
      <View style={{ gap: 14, paddingBottom: 108 }}>
        {chats.map((chat, index) => (
          <Pressable
            key={chat.id}
            onPress={() => {
              if (!hasRealHistory) return;
              navigation.navigate('ChatTab' as keyof MainTabParamList, { chatId: chat.id });
            }}
            style={[
              styles.rowCard,
              {
                backgroundColor: isDark ? '#1b2721' : theme.colors.surface,
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.border,
              },
            ]}
          >
            <Image source={{ uri: imageMap[index % imageMap.length] }} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <AppText variant="label">{chat.title}</AppText>
              <AppText color={theme.colors.textMuted}>{chat.language}</AppText>
              <AppText color={theme.colors.textMuted} style={{ marginTop: 6 }}>
                {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </AppText>
            </View>
            <Pill label={index % 2 === 0 ? 'Good' : 'Warning'} active={index % 2 === 0} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    gap: 10,
    paddingVertical: 18,
  },
  dayLabel: {
    marginBottom: 12,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
    ...theme.shadow.card,
  },
  thumb: {
    width: 74,
    height: 74,
    borderRadius: 18,
  },
});
