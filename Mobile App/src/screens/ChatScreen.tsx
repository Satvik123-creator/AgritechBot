
import { ArrowLeft, Search, MoreVertical, PlayCircle, Mic, ImagePlus } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import { apiService } from '../api/services';
import { AppText, GradientButton, Pill, Screen, TypingDots } from '../components/ui';
import { designImages } from '../constants/designData';
import { t } from '../constants/localization';
import { theme } from '../constants/theme';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { ChatMessage } from '../types/api';

const starterMessage: ChatMessage = {
  id: 'starter',
  chatId: 'starter',
  role: 'assistant',
  content: '',
};

export function ChatScreen() {
  const isDark = useColorScheme() === 'dark';
  const route = useRoute<RouteProp<MainTabParamList, 'ChatTab'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const language = useAppStore((state) => state.language);
  const [messages, setMessages] = useState<ChatMessage[]>([{ ...starterMessage, content: t(language, 'greeting') }]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState<string | undefined>(undefined);
  const [isHydratingHistory, setIsHydratingHistory] = useState(false);
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const incomingChatId = route.params?.chatId;
    if (incomingChatId) {
      setChatId(incomingChatId);
    }
  }, [route.params?.chatId]);

  useEffect(() => {
    if (!chatId) {
      return;
    }

    let cancelled = false;
    setIsHydratingHistory(true);

    apiService
      .getChatMessages(chatId)
      .then((data) => {
        if (cancelled) return;

        if (!data.messages.length) {
          setMessages([{ ...starterMessage, content: t(language, 'greeting') }]);
          return;
        }

        setMessages(
          data.messages.map((msg) => ({
            ...msg,
            chatId: String(msg.chatId),
          }))
        );
      })
      .catch(() => {
        if (cancelled) return;
      })
      .finally(() => {
        if (cancelled) return;
        setIsHydratingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chatId, language]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const appendAssistantMessage = useCallback(
    (incomingChatId: string, content: string, audioUrl?: string) => {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          chatId: incomingChatId,
          role: 'assistant',
          content,
          audioUrl,
        },
      ]);
    },
    []
  );

  const askMutation = useMutation({
    mutationFn: (message: string) => apiService.askChat({ message, language, chatId }),
    onSuccess: async (data) => {
      setChatId(data.chatId);
      if (data.quickReplies && data.quickReplies.length > 0) {
        setQuickReplies(data.quickReplies.slice(0, 3));
      }

      appendAssistantMessage(data.chatId, data.answer, data.audioUrl);
      setIsStreaming(false);
    },
    onError: (error) => {
      setIsStreaming(false);

      let message = t(language, 'backendsConnectionError');
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message = t(language, 'sessionExpired');
        } else if (typeof error.response?.data === 'object' && error.response?.data && 'error' in error.response.data) {
          message = String((error.response.data as { error?: unknown }).error || message);
        }
      }

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant-error`,
          chatId: chatId ?? 'local',
          role: 'assistant',
          content: message,
        },
      ]);
    },
  });

  const sendMessage = () => {
    if (!input.trim()) {
      return;
    }

    const outgoing = input.trim();
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-user`, chatId: chatId ?? 'local', role: 'user', content: outgoing },
    ]);
    setInput('');
    setIsStreaming(true);
    askMutation.mutate(outgoing);
  };

  const sendQuickReply = (text: string) => {
    setInput(text);
    setTimeout(() => {
      setInput('');
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-user`, chatId: chatId ?? 'local', role: 'user', content: text },
      ]);
      setIsStreaming(true);
      askMutation.mutate(text);
    }, 0);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPickedImage(result.assets[0].uri);
    }
  };

  const playAudio = async (audioUrl?: string) => {
    if (!audioUrl) {
      Alert.alert(t(language, 'noAudio'), t(language, 'noAudioPayload'));
      return;
    }

    const sound = new Audio.Sound();
    await sound.loadAsync({ uri: audioUrl });
    await sound.playAsync();
  };

  return (
    <Screen dark={isDark} padded={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={[styles.header, { backgroundColor: isDark ? '#151d19' : '#eaf3ee' }]}>
          <View style={styles.headerLeft}>
            <Pressable onPress={() => navigation.goBack()} style={styles.topIconButton}>
              <ArrowLeft size={20} color={theme.colors.textOnDark} />
            </Pressable>
            <Image source={{ uri: designImages.chatAvatar }} style={styles.avatar} />
            <View>
              <AppText variant="heading" color={isDark ? theme.colors.textOnDark : theme.colors.text}>
                {t(language, 'aiAssistant')}
              </AppText>
              <AppText color={isDark ? '#8de2b2' : theme.colors.primaryDark}>{t(language, 'online')}</AppText>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.topIconButton}>
              <Search size={20} color={theme.colors.textOnDark} />
            </Pressable>
            <Pressable style={styles.topIconButton}>
              <MoreVertical size={20} color={theme.colors.textOnDark} />
            </Pressable>
          </View>
        </View>
        <ScrollView
          ref={scrollRef}
          style={styles.messagesScroll}
          contentContainerStyle={[styles.messages, { backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.background }]}
        >
          <AppText color={isDark ? '#8aa598' : theme.colors.textMuted} style={styles.dateLabel}>
            {t(language, 'today')}
          </AppText>
          {messages.map((message) => (
            <View key={message.id} style={[styles.messageRow, message.role === 'user' && styles.messageRowUser]}>
              <View
                style={[
                  styles.bubble,
                  message.role === 'user'
                    ? styles.userBubble
                    : [styles.aiBubble, { backgroundColor: isDark ? '#203028' : '#ffffff' }],
                ]}
              >
                <AppText color={message.role === 'user' ? theme.colors.textOnDark : (isDark ? theme.colors.textOnDark : theme.colors.text)}>
                  {message.content}
                </AppText>
                {message.role === 'assistant' && message.audioUrl ? (
                  <Pressable onPress={() => playAudio(message.audioUrl)} style={styles.audioButton}>
                    <PlayCircle size={18} color={theme.colors.primaryDark} />
                    <AppText variant="label" color={theme.colors.primaryDark}>
                      {t(language, 'audioPlayback')}
                    </AppText>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
          {askMutation.isPending || isStreaming || isHydratingHistory ? (
            <View style={styles.messageRow}>
              <View style={[styles.aiBubble, { backgroundColor: isDark ? '#203028' : '#ffffff' }]}>
                <TypingDots isDark={isDark} />
              </View>
            </View>
          ) : null}
          <View style={styles.suggestionsWrap}>
            {(quickReplies.length > 0 ? quickReplies : ['Weather today', 'Pest control tips', 'Best fertilizer'])
              .slice(0, 3)
              .map((chip) => (
                <Pill key={chip} label={chip} onPress={() => sendQuickReply(chip)} />
              ))}
          </View>
        </ScrollView>
        <View style={[styles.footer, { backgroundColor: isDark ? '#151d19' : '#eaf3ee' }]}>
          {pickedImage ? (
            <View style={styles.imagePreviewRow}>
              <Image source={{ uri: pickedImage }} style={styles.previewImage} />
              <AppText color={theme.colors.textOnDark}>{t(language, 'imageAttached')}</AppText>
            </View>
          ) : null}
          <View style={styles.inputRow}>
            <Pressable onPress={pickImage} style={styles.iconAction}>
              <ImagePlus size={20} color={theme.colors.textOnDark} />
            </Pressable>
            <TextInput
              placeholder={t(language, 'typeHere')}
              placeholderTextColor={isDark ? '#8aa598' : theme.colors.textMuted}
              value={input}
              onChangeText={setInput}
              style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#ffffff', color: isDark ? theme.colors.textOnDark : theme.colors.text }]}
              multiline
            />
            <Pressable onPress={() => navigation.navigate('Voice')} style={styles.iconAction}>
              <Mic size={20} color={theme.colors.textOnDark} />
            </Pressable>
            <GradientButton label="→" onPress={sendMessage} style={styles.sendButton} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#151d19',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
  },
  messagesScroll: {
    flex: 1,
  },
  messages: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  dateLabel: {
    textAlign: 'center',
    marginVertical: 12,
  },
  messageRow: {
    alignItems: 'flex-start',
  },
  messageRowUser: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 22,
  },
  aiBubble: {
    borderTopLeftRadius: 8,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderTopRightRadius: 8,
  },
  audioButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#151d19',
    gap: 10,
  },
  imagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewImage: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: theme.colors.textOnDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendButton: {
    minWidth: 48,
  },
});
