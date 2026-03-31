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
        <View style={styles.chatItemInner}>
          <View style={[styles.avatarCircle, { backgroundColor: isNew ? '#52b781' : 'rgba(255,255,255,0.06)' }]}>
             {(() => { const IconComp = IconMap[isNew ? 'Sparkles' : 'MessageSquare']; return IconComp ? <IconComp size={22} color={isNew ? '#fff' : 'rgba(255,255,255,0.6)'} /> : null; })()}
          </View>
          <View style={styles.chatMain}>
            <View style={styles.chatTop}>
              <AppText variant="title" style={styles.chatTitle} numberOfLines={1}>
                {item.title || 'New Conservation'}
              </AppText>
              <AppText variant="caption" color="rgba(255,255,255,0.4)">{timeStr}</AppText>
            </View>
            <AppText numberOfLines={1} color="rgba(255,255,255,0.5)" style={styles.chatPreview}>
              {item.preview || 'Start a new conversation...'}
            </AppText>
          </View>
          {(() => { const IconComp = IconMap['ChevronRight']; return IconComp ? <IconComp size={18} color="rgba(255,255,255,0.2)" /> : null; })()}
        </View>
      </Pressable>
    );
  };

  return (
    <Screen padded={false} style={{ backgroundColor: '#0a100c' }}>
      <LinearGradient colors={['#111c15', '#0a100c']} style={StyleSheet.absoluteFillObject} />
      
      <View style={styles.header}>
        <AppText variant="heading" color="#fff" style={{ fontSize: 28 }}>Inbox</AppText>
        <AppText color="rgba(255,255,255,0.5)">Continue your previous chats</AppText>
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
            tintColor="#52b781"
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyCircle}>
                {(() => { const IconComp = IconMap['Ghost']; return IconComp ? <IconComp size={48} color="rgba(255,255,255,0.1)" /> : null; })()}
              </View>
              <AppText color="rgba(255,255,255,0.3)" style={{ marginTop: 16 }}>No chats found</AppText>
            </View>
          ) : null
        }
      />

      <Pressable 
        onPress={() => navigation.navigate('Chat', {})}
        style={styles.fab}
      >
        <LinearGradient colors={['#52b781', '#40916c']} style={styles.fabGradient}>
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
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
    color: '#fff',
    maxWidth: '80%',
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
    backgroundColor: 'rgba(255,255,255,0.02)',
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
    elevation: 8,
    shadowColor: '#52b781',
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
