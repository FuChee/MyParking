import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { useUpdateProfileMutation } from '../profile/profileApi';

export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const handleLogout = () => setUser(null);
  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleSave = async () => {
    if (!editedName.trim() || !editedEmail.trim()) {
      Alert.alert('Error', 'Name and email cannot be empty.');
      return;
    }

    try {
      await updateProfile({
        user_id: user.id,
        name: editedName,
        email: editedEmail,
      }).unwrap();

      setUser({ ...user, name: editedName, email: editedEmail });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (err) {
      console.error('Error updating profile:', err);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0]?.toUpperCase())
      .join('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Account Details</Text>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Enter your name"
            />
          ) : (
            <Text style={styles.infoText}>{user?.name}</Text>
          )}
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.label}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editedEmail}
              onChangeText={setEditedEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
            />
          ) : (
            <Text style={styles.infoText}>{user?.email}</Text>
          )}
        </View>
      </View>

      <View style={styles.buttonRow}>
        {isEditing ? (
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={handleEditToggle}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PRIMARY = '#0BA467'; 
const DARK_GREEN = '#4E5942';
const BACKGROUND = '#F5F8F6';
const LOGOUT_RED = '#D75C4A';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  profileCard: {
    alignItems: 'center',
    marginBottom: 25,
  },

  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },

  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFF',
  },

  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: DARK_GREEN,
  },

  userEmail: {
    fontSize: 15,
    color: '#66735E',
    marginTop: 5,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK_GREEN,
    marginBottom: 15,
  },

  infoBlock: {
    marginBottom: 15,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6A7565',
    marginBottom: 5,
  },

  infoText: {
    fontSize: 16,
    color: '#3B3B3B',
  },

  input: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#C8D4C4',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
  },

  buttonRow: {
    marginTop: 30,
  },

  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },

  editButton: {
    backgroundColor: DARK_GREEN,
  },

  saveButton: {
    backgroundColor: PRIMARY,
  },

  logoutButton: {
    backgroundColor: LOGOUT_RED,
  },

  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
});