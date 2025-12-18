import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '@/lib/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTabBar } from '@/contexts/tab-bar-context';

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
};

type Conversation = {
  id: string;
  customerId: string;
  sellerId: string;
  productId: string | null;
  lastMessageAt: string;
  customerName: string;
  sellerName: string;
  productName: string | null;
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  };
};

export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setIsVisible } = useTabBar();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesScrollRef = useRef<ScrollView>(null);

  // Hide tab bar when screen is focused
  useFocusEffect(
    useCallback(() => {
      setIsVisible(false);
      return () => {
        setIsVisible(true);
      };
    }, [setIsVisible])
  );

  // Fetch user when screen mounts/focuses
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await api.getToken();
        if (!token || token === 'demo-token-offline-mode') {
          console.log('MessagesScreen: No token found');
          return;
        }

        const user = await api.getCurrentUser();
        setCurrentUserId(user?.id || null);
      } catch (error: any) {
        console.error('Error fetching user:', error);
        if (error.status === 401) {
          router.replace('/login');
        }
      }
    };
    fetchUser();
  }, [router]);

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://buyani-ecommerce-app-2kse.vercel.app/api';

  const fetchConversations = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      
      const token = await api.getToken();
      if (!token) {
        console.log('fetchConversations: No token available');
        if (showLoading) setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log('fetchConversations: Fetching conversations...');
      const data = await api.getConversations();
      console.log('fetchConversations: Received conversations:', data, 'Count:', data?.length || 0);

      if (data && Array.isArray(data)) {
        // Fetch last message for each conversation
        const conversationsWithLastMessage = await Promise.all(
          data.map(async (conv: Conversation) => {
            try {
              const messages = await api.getMessages(conv.id);
              const lastMessage = messages && messages.length > 0 
                ? messages[messages.length - 1] 
                : null;
              
              return {
                ...conv,
                lastMessage: lastMessage ? {
                  content: lastMessage.content,
                  senderId: lastMessage.senderId,
                  createdAt: lastMessage.createdAt,
                } : undefined,
              };
            } catch (error) {
              console.error(`Error fetching last message for conversation ${conv.id}:`, error);
              return conv;
            }
          })
        );
        
        console.log('fetchConversations: Setting conversations, count:', conversationsWithLastMessage.length);
        setConversations(conversationsWithLastMessage);
        
        // Auto-select first conversation if none selected
        if (!selectedConversation && conversationsWithLastMessage.length > 0) {
          console.log('fetchConversations: Auto-selecting first conversation:', conversationsWithLastMessage[0].id);
          setSelectedConversation(conversationsWithLastMessage[0].id);
        }
      } else {
        console.log('fetchConversations: No valid data received, setting empty array');
        setConversations([]);
      }
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      console.error('Error details:', error.message, error.status);
      
      // Handle 401 Unauthorized - redirect to login
      if (error.status === 401 || error.message?.includes('Unauthorized')) {
        console.log('fetchConversations: Unauthorized, redirecting to login');
        router.replace('/login');
        return;
      }
      
      // Set empty array on other errors
      setConversations([]);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  }, [selectedConversation, router]);

  const fetchMessages = useCallback(
    async (convId: string) => {
      if (!convId) {
        console.log('fetchMessages: No conversation ID provided');
        return;
      }

      try {
        setLoadingMessages(true);
        console.log('fetchMessages: Fetching messages for conversation:', convId);
        
        const token = await api.getToken();
        if (!token) {
          console.log('fetchMessages: No token available');
          return;
        }

        const data = await api.getMessages(convId);
        console.log('fetchMessages: Received data:', data, 'Count:', data?.length || 0);

        if (data && Array.isArray(data)) {
          // Deduplicate messages by ID
          const uniqueMessages = Array.from(
            new Map(data.map((msg: Message) => [msg.id, msg])).values()
          ) as Message[];
          // Sort messages by creation date (oldest first)
          const sortedMessages = uniqueMessages.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          console.log('fetchMessages: Setting messages, count:', sortedMessages.length);
          setMessages(sortedMessages);

          // Scroll to bottom after messages load
          setTimeout(() => {
            messagesScrollRef.current?.scrollToEnd({ animated: true });
          }, 100);

          if (selectedConversation === convId) {
            setUnreadCounts((prev) => ({ ...prev, [convId]: 0 }));
          }
        } else {
          console.log('fetchMessages: No valid data received, setting empty array');
          setMessages([]);
        }
      } catch (error: any) {
        console.error('Error fetching messages:', error);
        console.error('Error details:', error.message, error.status);
        
        // Handle 401 Unauthorized - redirect to login
        if (error.status === 401 || error.message?.includes('Unauthorized')) {
          console.log('fetchMessages: Unauthorized, redirecting to login');
          router.replace('/login');
          return;
        }
        
        // Set empty array on other errors to show empty state
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    },
    [selectedConversation, router]
  );

  const fetchUnreadCounts = useCallback(async (convs: Conversation[]) => {
    if (!currentUserId || convs.length === 0) return;

    try {
      const token = await api.getToken();
      if (!token) return;

      const counts: Record<string, number> = {};
      await Promise.all(
        convs.map(async (conv) => {
          try {
            const msgs = await api.getMessages(conv.id);
            const unread = msgs.filter(
              (m: Message) => m.senderId !== currentUserId && !m.isRead
            ).length;
            counts[conv.id] = unread;
          } catch (error: any) {
            console.error(`Error fetching unread count for conversation ${conv.id}:`, error);
            // Don't throw, just skip this conversation
            if (error.status === 401) {
              // If unauthorized, stop fetching unread counts
              throw error;
            }
          }
        })
      );
      setUnreadCounts(counts);
    } catch (error: any) {
      console.error('Error fetching unread counts:', error);
      // Don't redirect on unread count errors, just log
    }
  }, [currentUserId]);

  // Fetch conversations when screen is focused or when component mounts
  useFocusEffect(
    useCallback(() => {
      const token = api.getToken();
      token.then((t) => {
        if (t && t !== 'demo-token-offline-mode') {
          fetchConversations(true);
        }
      }).catch(() => {
        // Token check failed, will be handled by fetchConversations
        fetchConversations(true);
      });
    }, [fetchConversations])
  );

  useEffect(() => {
    if (selectedConversation) {
      console.log('useEffect: Selected conversation changed to:', selectedConversation);
      fetchMessages(selectedConversation);
      const interval = setInterval(() => {
        fetchMessages(selectedConversation);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      console.log('useEffect: No conversation selected, clearing messages');
      setMessages([]);
    }
  }, [selectedConversation, fetchMessages]);

  useEffect(() => {
    if (conversations.length > 0) {
      fetchUnreadCounts(conversations);
      const interval = setInterval(() => {
        fetchUnreadCounts(conversations);
        fetchConversations(false);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [conversations, fetchUnreadCounts, fetchConversations]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations(false);
  }, [fetchConversations]);

  const sendMessage = useCallback(async () => {
    if (!selectedConversation || !messageContent.trim() || !currentUserId) return;

    const trimmedContent = messageContent.trim();
    
    // Create optimistic message to show immediately
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversation,
      senderId: currentUserId,
      content: trimmedContent,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Immediately add the message to state and clear input
    setMessages((prev) => [...prev, optimisticMessage]);
    setMessageContent('');
    
    // Scroll to bottom after adding message
    setTimeout(() => {
      messagesScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      setSending(true);
      const token = await api.getToken();
      if (!token) {
        // Revert optimistic update on auth failure
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        setMessageContent(trimmedContent);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/conversations/${selectedConversation}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: trimmedContent }),
        }
      );

      if (response.ok) {
        const newMessage = await response.json();
        // Replace optimistic message with real one from server
        setMessages((prev) => 
          prev.map((m) => m.id === optimisticMessage.id ? newMessage : m)
        );
      } else {
        // Revert optimistic update on API error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        setMessageContent(trimmedContent);
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Revert optimistic update on network error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      setMessageContent(trimmedContent);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }, [selectedConversation, messageContent, currentUserId, API_BASE_URL]);

  const deleteConversation = useCallback(async (convId: string) => {
    try {
      const token = await api.getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/conversations?id=${convId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== convId));
        if (selectedConversation === convId) {
          setSelectedConversation(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      Alert.alert('Error', 'Failed to delete conversation. Please try again.');
    }
  }, [selectedConversation, API_BASE_URL]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(
      (conv) =>
        conv.sellerName?.toLowerCase().includes(query) ||
        conv.customerName?.toLowerCase().includes(query) ||
        conv.productName?.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  const selectedConv = conversations.find((c) => c.id === selectedConversation);
  const totalUnreadCount = useMemo(() => {
    return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  }, [unreadCounts]);

  // If conversation is selected, show conversation view
  if (selectedConversation && selectedConv) {
    return (
      <ThemedView style={styles.container}>
        {/* Conversation Header */}
        <View style={[styles.conversationHeader, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedConversation(null);
              setMessages([]);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.conversationHeaderInfo}>
            <View style={styles.conversationAvatar}>
              <Ionicons name="storefront" size={20} color="#10B981" />
            </View>
            <View style={styles.conversationHeaderText}>
              <ThemedText style={styles.conversationHeaderName}>
                {selectedConv.sellerName || selectedConv.customerName}
              </ThemedText>
              {selectedConv.productName && (
                <ThemedText style={styles.conversationHeaderProduct}>
                  {selectedConv.productName}
                </ThemedText>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Delete Conversation',
                'Are you sure you want to delete this conversation?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteConversation(selectedConversation),
                  },
                ]
              );
            }}
            activeOpacity={0.7}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        {loadingMessages ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <ThemedText style={styles.loadingText}>Loading messages...</ThemedText>
          </View>
        ) : (
          <ScrollView
            ref={messagesScrollRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              messagesScrollRef.current?.scrollToEnd({ animated: true });
            }}
            onLayout={() => {
              // Scroll to bottom when layout changes
              setTimeout(() => {
                messagesScrollRef.current?.scrollToEnd({ animated: false });
              }, 100);
            }}
          >
            {messages.length === 0 ? (
              <View style={styles.centerContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
                <ThemedText style={styles.emptyText}>No messages yet</ThemedText>
                <ThemedText style={styles.emptySubtext}>Start the conversation!</ThemedText>
              </View>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderId === currentUserId;
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageWrapper,
                      isOwn ? styles.messageWrapperOwn : styles.messageWrapperOther,
                    ]}
                  >
                    <View
                      style={[styles.messageBubble, isOwn ? styles.messageOwn : styles.messageOther]}
                    >
                      <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
                        {msg.content}
                      </Text>
                      <Text style={[styles.messageTime, isOwn && styles.messageTimeOwn]}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}

        {/* Message Input */}
        <View style={[styles.messageInputContainer, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            value={messageContent}
            onChangeText={setMessageContent}
            multiline
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!messageContent.trim() || sending}
            style={[styles.sendButton, (!messageContent.trim() || sending) && styles.sendButtonDisabled]}
            activeOpacity={0.7}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // Default view: Conversation list
  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Messages
        </ThemedText>
        {totalUnreadCount > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{totalUnreadCount}</Text>
          </View>
        )}
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Conversations List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : filteredConversations.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
          <ThemedText style={styles.emptyText}>No conversations yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>Start chatting with sellers</ThemedText>
        </View>
      ) : (
        <ScrollView
          style={styles.conversationsScroll}
          contentContainerStyle={styles.conversationsContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {filteredConversations.map((conv) => {
            const unread = unreadCounts[conv.id] || 0;
            const contactName = currentUserId === conv.customerId 
              ? conv.sellerName 
              : conv.customerName;
            const lastMessage = conv.lastMessage;
            const isLastMessageFromMe = lastMessage && lastMessage.senderId === currentUserId;
            
            // Format time
            const formatTime = (dateString: string) => {
              const date = new Date(dateString);
              const now = new Date();
              const diffMs = now.getTime() - date.getTime();
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMs / 3600000);
              const diffDays = Math.floor(diffMs / 86400000);
              
              if (diffMins < 1) return 'Just now';
              if (diffMins < 60) return `${diffMins}m`;
              if (diffHours < 24) return `${diffHours}h`;
              if (diffDays < 7) return `${diffDays}d`;
              return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            };
            
            return (
              <TouchableOpacity
                key={conv.id}
                style={styles.conversationItem}
                onPress={() => setSelectedConversation(conv.id)}
                activeOpacity={0.7}
              >
                <View style={styles.conversationAvatar}>
                  <Ionicons name="storefront" size={24} color="#10B981" />
                  {unread > 0 && (
                    <View style={styles.avatarUnreadBadge} />
                  )}
                </View>
                <View style={styles.conversationInfo}>
                  <View style={styles.conversationHeaderRow}>
                    <ThemedText 
                      style={[
                        styles.conversationName,
                        unread > 0 && styles.conversationNameUnread
                      ]} 
                      numberOfLines={1}
                    >
                      {contactName || 'Unknown'}
                    </ThemedText>
                    {lastMessage && (
                      <ThemedText style={styles.conversationTime}>
                        {formatTime(lastMessage.createdAt)}
                      </ThemedText>
                    )}
                  </View>
                  {lastMessage ? (
                    <ThemedText 
                      style={[
                        styles.conversationLastMessage,
                        unread > 0 && styles.conversationLastMessageUnread
                      ]} 
                      numberOfLines={1}
                    >
                      {isLastMessageFromMe ? 'You: ' : ''}{lastMessage.content}
                    </ThemedText>
                  ) : conv.productName ? (
                    <ThemedText style={styles.conversationProduct} numberOfLines={1}>
                      {conv.productName}
                    </ThemedText>
                  ) : (
                    <ThemedText style={styles.conversationProduct} numberOfLines={1}>
                      No messages yet
                    </ThemedText>
                  )}
                </View>
                {unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{unread > 99 ? '99+' : unread}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: 8,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  conversationsScroll: {
    flex: 1,
  },
  conversationsContent: {
    paddingBottom: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  conversationAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarUnreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  conversationNameUnread: {
    fontWeight: '700',
  },
  conversationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  conversationProduct: {
    fontSize: 13,
    color: '#6B7280',
  },
  conversationLastMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  conversationLastMessageUnread: {
    color: '#111827',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  conversationHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  conversationHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  conversationHeaderName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  conversationHeaderProduct: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageWrapper: {
    marginBottom: 12,
    width: '100%',
  },
  messageWrapperOwn: {
    alignItems: 'flex-end',
  },
  messageWrapperOther: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  messageOwn: {
    backgroundColor: '#10B981',
    borderBottomRightRadius: 4,
  },
  messageOther: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#111827',
    marginBottom: 4,
    lineHeight: 20,
  },
  messageTextOwn: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    color: '#6B7280',
  },
  messageTimeOwn: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    maxHeight: 100,
    backgroundColor: '#F9FAFB',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  debugText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});






