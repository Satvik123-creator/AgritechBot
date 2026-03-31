import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  Pressable,
  Platform,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { apiService } from '../api/services';
import { AppText, Screen, SearchInput } from '../components/ui';
import { useTheme } from '../providers/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { useI18n } from '../hooks/useI18n';
import { IconMap } from '../components/IconMap';

export function ChatListScreen() {
  const { isDark, colors } = useTheme();
  const { t } = useI18n();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => apiService.getChatHistory(),
  });

  const chats = data?.chats || [];
  const filteredChats = chats.filter((c) => 
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.preview?.toLowerCase().includes(search.toLowerCase())
  );

  const renderChatItem = ({ item }: { item: typeof chats[0] }) => {
    const date = new Date(item.lastMessageAt || item.updatedAt);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isNew = !item.lastMessageAt;

    return (
      <Pressable
        onPress={() => navigation.navigate('Chat', { chatId: item.id })}
        style={styles.chatItem}
      >
        <View style={[styles.chatItemInner, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: colors.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: isNew ? colors.primary : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
             {(() => { const IconComp = IconMap[isNew ? 'Sparkles' : 'MessageSquare']; return IconComp ? <IconComp size={22} color={isNew ? '#fff' : isDark ? 'rgba(255,255,255,0.5)' : colors.textMuted} /> : null; })()}
          </View>
          <View style={styles.chatMain}>
            <View style={styles.chatTop}>
              <AppText variant="title" style={[styles.chatTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title || 'New Conversation'}
              </AppText>
              <AppText variant="caption" color={colors.textMuted}>{timeStr}</AppText>
            </View>
            <AppText numberOfLines={1} color={colors.textMuted} style={styles.chatPreview}>
              {item.preview || 'Start a new conversation...'}
            </AppText>
          </View>
          {(() => { const IconComp = IconMap['ChevronRight']; return IconComp ? <IconComp size={18} color={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'} /> : null; })()}
        </View>
      </Pressable>
    );
  };

  return (
    <Screen padded={false} style={{ backgroundColor: colors.background }}>
      <LinearGradient 
        colors={isDark ? ['#111c15', colors.background] : [colors.backgroundAlt, colors.background]} 
        style={StyleSheet.absoluteFillObject} 
      />
      
      <View style={styles.header}>
        <AppText variant="heading" color={colors.text} style={{ fontSize: 28 }}>Inbox</AppText>
        <AppText color={colors.textMuted}>Continue your previous chats</AppText>
      </View>

      <View style={styles.searchContainer}>
        <SearchInput 
          value={search} 
          onChangeText={setSearch} 
          placeholder="Search conversations..." 
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
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }]}>
                {(() => { const IconComp = IconMap['Ghost']; return IconComp ? <IconComp size={48} color={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} /> : null; })()}
              </View>
              <AppText color={colors.textMuted} style={{ marginTop: 16 }}>No chats found</AppText>
            </View>
          ) : null
        }
      />

      <Pressable 
        onPress={() => navigation.navigate('Chat', {})}
        style={[styles.fab, { shadowColor: colors.primary, elevation: 8 }]}
      >
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.fabGradient}>
          {(() => { const IconComp = IconMap['Plus']; return IconComp ? <IconComp size={30} color="#fff" /> : null; })()}
        </LinearGradient>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  chatItem: {
    marginBottom: 8,
  },
  chatItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  chatMain: {
    flex: 1,
    marginRight: 8,
  },
  chatTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatTitle: {
    fontSize: 17,
    maxWidth: '80%',
    fontWeight: '700',
  },
  chatPreview: {
    fontSize: 14,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: Platform.OS === 'ios' ? 40 : 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  fabGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
