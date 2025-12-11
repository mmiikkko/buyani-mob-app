import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTabBar } from '@/contexts/tab-bar-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setIsVisible } = useTabBar();
  const [username, setUsername] = useState('Pandiet');
  const [firstName, setFirstName] = useState('Mark');
  const [lastName, setLastName] = useState('Quintela');
  const [newEmail, setNewEmail] = useState('quintelamark1010@gmail.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Hide tab bar immediately when screen is focused
  useFocusEffect(
    useCallback(() => {
      setIsVisible(false);
      return () => {
        setIsVisible(true);
      };
    }, [setIsVisible])
  );

  const pickImage = async () => {
    // TODO: Implement image picker when expo-image-picker is installed
    // For now, just show an alert
    alert('Image picker will be implemented. Please install expo-image-picker to enable this feature.');
    // To implement: Install expo-image-picker and use it to select images from the device
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    // TODO: Implement API call to save profile
    console.log('Saving profile:', { username, firstName, lastName, image: selectedImage });
    setTimeout(() => {
      setLoading(false);
      router.push('/(tabs)/account');
    }, 1000);
  };

  const handleRequestEmailChange = async () => {
    setLoading(true);
    // TODO: Implement API call to request email change
    console.log('Requesting email change to:', newEmail);
    setTimeout(() => {
      setLoading(false);
      alert('Email change request sent! Please check your email for confirmation.');
    }, 1000);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      alert('Please fill in both password fields');
      return;
    }
    setLoading(true);
    // TODO: Implement API call to change password
    console.log('Changing password');
    setTimeout(() => {
      setLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      alert('Password changed successfully!');
    }, 1000);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/account')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerTitle}>
            Profile
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Update your account details, email, and password.
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Left Column - Profile Details */}
          <View style={styles.leftColumn}>
            <View style={styles.card}>
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                Profile Details
              </ThemedText>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Username</ThemedText>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Username"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>First Name</ThemedText>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First Name"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Last Name</ThemedText>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last Name"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Profile Image</ThemedText>
                <TouchableOpacity
                  style={styles.fileButton}
                  onPress={pickImage}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.fileButtonText}>Choose File</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.fileText}>
                  {selectedImage ? 'File selected' : 'No file chosen'}
                </ThemedText>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, loading && styles.buttonDisabled]}
                onPress={handleSaveProfile}
                disabled={loading}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.saveButtonText}>Save changes</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            {/* Change Email Card */}
            <View style={styles.card}>
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                Change Email
              </ThemedText>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>New Email</ThemedText>
                <TextInput
                  style={styles.input}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="New Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, loading && styles.buttonDisabled]}
                onPress={handleRequestEmailChange}
                disabled={loading}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.saveButtonText}>Request change</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Change Password Card */}
            <View style={styles.card}>
              <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                Change Password
              </ThemedText>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>Current Password</ThemedText>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Current password"
                    secureTextEntry={!showCurrentPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.label}>New Password</ThemedText>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="New password"
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, loading && styles.buttonDisabled]}
                onPress={handleChangePassword}
                disabled={loading}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.saveButtonText}>Change password</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  backButton: {
    marginBottom: 12,
  },
  headerContent: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  content: {
    flexDirection: SCREEN_WIDTH >= 768 ? 'row' : 'column',
    gap: 20,
  },
  leftColumn: {
    flex: SCREEN_WIDTH >= 768 ? 1 : undefined,
    minWidth: SCREEN_WIDTH >= 768 ? 300 : undefined,
    width: SCREEN_WIDTH >= 768 ? undefined : '100%',
  },
  rightColumn: {
    flex: SCREEN_WIDTH >= 768 ? 1 : undefined,
    minWidth: SCREEN_WIDTH >= 768 ? 300 : undefined,
    width: SCREEN_WIDTH >= 768 ? undefined : '100%',
    gap: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  fileButton: {
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  fileButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
  },
  fileText: {
    fontSize: 14,
    color: '#999',
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px 0px rgba(46, 125, 50, 0.2)',
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

