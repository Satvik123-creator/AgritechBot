import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  Pressable,
  Platform,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { apiService } from '../api/services';
import { AppText, Screen, SearchInput, GradientButton } from '../components/ui';
import { theme } from '../constants/theme';
import { useTheme } from '../providers/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { useI18n } from '../hooks/useI18n';
import { IconMap } from '../components/IconMap';

export function ChatListScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => apiService.getChatHistory(),
  });

  const chats = data?.chats || [];
  const filteredChats = chats.filter((c) => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.preview?.toLowerCase().includes(search.toLowerCase())
  );

  const renderChatItem = ({ item }: { item: typeof chats[0] }) => {
    const date = new Date(item.lastMessageAt || item.updatedAt);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

    return (
      <Pressable
        onPress={() => navigation.navigate('Chat', { chatId: item.id })}
        style={({ pressed }) => [
          styles.chatItem,
          { 
            backgroundColor: isDark ? colors.surface : '#ffffff',
            borderColor: colors.border,
            opacity: pressed ? 0.8 : 1 
          }
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(82,183,129,0.15)' : 'rgba(82,183,129,0.08)' }]}>
             {(() => { const IconComp = IconMap['MessageSquare']; return IconComp ? <IconComp size={22} color={colors.primary} /> : null; })()}
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeaderRow}>
            <AppText variant="label" numberOfLines={1} style={{ flex: 1, fontSize: 16 }}>{item.title || 'Untitled Chat'}</AppText>
            <AppText variant="caption" color={colors.textMuted} style={{ fontSize: 11 }}>{dateStr}, {timeStr}</AppText>
          </View>
          <AppText numberOfLines={1} color={colors.textMuted} style={styles.preview}>
            {item.preview || 'No messages yet'}
          </AppText>
        </View>
      </Pressable>
    );
  };

  return (
    <Screen style={{ paddingBottom: 0 }} padded={false}>
      <View style={styles.content}>
        <View style={styles.header}>
            <View>
            <AppText variant="heading" style={{ fontSize: 28, marginBottom: 4 }}>{t('chatTab')}</AppText>
            <AppText color={colors.textMuted}>{t('yourConversations') || 'All your chats in one place'}</AppText>
            </View>
        </View>

        <View style={styles.searchWrap}>
            <SearchInput 
            value={search} 
            onChangeText={setSearch} 
            placeholder={t('searchChats') || 'Search chats...'} 
            />
        </View>

        <FlatList
            data={filteredChats}
            keyExtractor={(item) => item.id}
            renderItem={renderChatItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
            <RefreshControl 
                refreshing={isLoading || isRefetching} 
                onRefresh={refetch} 
                tintColor={colors.primary}
            />
            }
            ListEmptyComponent={
            !isLoading ? (
                <View style={styles.emptyWrap}>
                {(() => { const IconComp = IconMap['MessageSquare']; return IconComp ? <IconComp size={64} color={colors.border} /> : null; })()}
                <AppText color={colors.textMuted} style={{ marginTop: 16, fontSize: 16 }}>{t('noConversations') || 'No conversations found'}</AppText>
                </View>
            ) : null
            }
        />
      </View>

      {/* Floating Action Button */}
      <Pressable 
        onPress={() => navigation.navigate('Chat', {})}
        style={({ pressed }) => [
            styles.fab, 
            { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }
        ]}
      >
        {(() => { const IconComp = IconMap['Plus']; return IconComp ? <IconComp size={28} color="#fff" /> : null; })()}
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
  },
  header: {
    marginBottom: 24,
  },
  searchWrap: {
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 120,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 12,
    ...theme.shadow.card,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  preview: {
    fontSize: 14,
    opacity: 0.8,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 100 : 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.glow,
    elevation: 8,
  },
});
