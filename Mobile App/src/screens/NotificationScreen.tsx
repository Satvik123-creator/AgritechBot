import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, View, useColorScheme } from 'react-native';
import { useState, useCallback, useEffect } from 'react';

import { apiService } from '../api/services';
import { AppText, GradientButton, Screen, ScreenCard } from '../components/ui';
import { theme } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { AppNotification, NotificationType } from '../types/api';

const TABS: { label: string; type?: NotificationType }[] = [
  { label: 'All' },
  { label: 'Crop Alerts', type: 'crop_alert' },
  { label: 'Weather', type: 'weather' },
  { label: 'AI Suggestions', type: 'ai_suggestion' },
];

const TYPE_COLORS: Record<NotificationType, string> = {
  crop_alert: 'rgba(239,68,68,0.14)',
  weather: 'rgba(37,99,235,0.12)',
  ai_suggestion: 'rgba(82,183,129,0.14)',
  order: 'rgba(245,158,11,0.14)',
  system: 'rgba(139,92,246,0.12)',
};

const TYPE_ICONS: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  crop_alert: 'leaf-outline',
  weather: 'cloud-outline',
  ai_suggestion: 'sparkles-outline',
  order: 'cube-outline',
  system: 'information-circle-outline',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationScreen() {
  const isDark = useColorScheme() === 'dark';
  const [activeTab, setActiveTab] = useState(0);
  const queryClient = useQueryClient();
  const setUnreadCount = useAppStore((s) => s.setUnreadNotificationCount);

  const activeType = TABS[activeTab].type;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications', activeType],
    queryFn: () => apiService.getNotifications(activeType),
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (data?.unreadCount != null) {
      setUnreadCount(data.unreadCount);
    }
  }, [data?.unreadCount, setUnreadCount]);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiService.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <Screen scrollable refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
    }>
      <View style={styles.header}>
        <AppText variant="heading">Notifications</AppText>
        {unreadCount > 0 && (
          <Pressable onPress={() => markAllReadMutation.mutate()}>
            <AppText color={theme.colors.primary} variant="label">
              {markAllReadMutation.isPending ? 'Clearing...' : 'Mark All Read'}
            </AppText>
          </Pressable>
        )}
      </View>

      <View style={styles.tabsRow}>
        {TABS.map((tab, index) => (
          <Pressable
            key={tab.label}
            onPress={() => setActiveTab(index)}
            style={[styles.tab, index === activeTab && styles.tabActive]}
          >
            <AppText
              variant="label"
              color={index === activeTab ? theme.colors.textOnDark : theme.colors.textMuted}
            >
              {tab.label}
            </AppText>
          </Pressable>
        ))}
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <AppText color={theme.colors.textMuted} style={{ marginTop: 12 }}>
            Loading notifications...
          </AppText>
        </View>
      )}

      {isError && !isLoading && (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.danger} />
          <AppText color={theme.colors.textMuted} style={{ marginTop: 12 }}>
            Failed to load notifications.
          </AppText>
          <GradientButton label="Retry" onPress={() => refetch()} secondary style={{ marginTop: 16 }} />
        </View>
      )}

      {!isLoading && !isError && notifications.length === 0 && (
        <View style={styles.centered}>
          <Ionicons name="notifications-off-outline" size={48} color={theme.colors.textMuted} />
          <AppText color={theme.colors.textMuted} style={{ marginTop: 12 }}>
            No notifications yet
          </AppText>
        </View>
      )}

      {!isLoading && !isError && notifications.length > 0 && (
        <View style={{ gap: 12 }}>
          {notifications.map((item: AppNotification) => (
            <Pressable
              key={item._id}
              onPress={() => {
                if (!item.read) {
                  markReadMutation.mutate(item._id);
                }
              }}
            >
              <ScreenCard
                style={[
                  styles.alertCard,
                  !item.read && styles.alertCardUnread,
                  !item.read && isDark && styles.alertCardUnreadDark,
                ]}
              >
                <View style={[styles.alertIcon, { backgroundColor: TYPE_COLORS[item.type] }]}>
                  <Ionicons name={TYPE_ICONS[item.type]} size={22} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.alertHeader}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <AppText variant="label">{item.title}</AppText>
                      {!item.read && <View style={styles.unreadDot} />}
                    </View>
                    <AppText color={theme.colors.textMuted}>{timeAgo(item.createdAt)}</AppText>
                  </View>
                  <AppText color={theme.colors.textMuted}>{item.body}</AppText>
                  {item.actionLabel && (
                    <GradientButton label={item.actionLabel} secondary style={{ marginTop: 14 }} />
                  )}
                </View>
              </ScreenCard>
            </Pressable>
          ))}
        </View>
      )}

      {!isLoading && !isError && notifications.length > 0 && (
        <ScreenCard style={styles.suggestionCard}>
          <AppText variant="label" color={theme.colors.textOnDark}>
            Stay Updated
          </AppText>
          <AppText color="#ddf4e8" style={{ marginTop: 8 }}>
            New alerts appear automatically based on your crops and location. Pull down to refresh.
          </AppText>
        </ScreenCard>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 18,
  },
  tab: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceMuted,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
  },
  alertCard: {
    flexDirection: 'row',
    gap: 12,
  },
  alertCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    backgroundColor: 'rgba(82,183,129,0.05)',
  },
  alertCardUnreadDark: {
    backgroundColor: 'rgba(82,183,129,0.08)',
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  suggestionCard: {
    marginTop: 18,
    backgroundColor: theme.colors.primaryDark,
    paddingBottom: 120,
  },
});
