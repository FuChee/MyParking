import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSaveProfileMutation } from '../profile/profileApi';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saveProfile, { isLoading }] = useSaveProfileMutation();

const handleSave = async () => {
  if (!name.trim() || !email.trim() || !password.trim()) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    Alert.alert('Error', 'Please enter a valid email address');
    return;
  }

  try {
    await saveProfile({ name, email, password }).unwrap();
    Alert.alert(
      'Success',
      'You have registered successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
        },
      ]
    );
  } catch (err) {
    Alert.alert('Error', 'User with same email already exists');
  }
};

  const isButtonActive = name.trim() && email.trim() && password.trim();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Sign Up</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, !isButtonActive && styles.disabledButton]}
            onPress={handleSave}
            disabled={!isButtonActive || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
  },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 25,
    elevation: 4,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    marginBottom: 25, 
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#A5D6A7', 
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
  },
  button: { 
    backgroundColor: '#2E7D32', 
    paddingVertical: 14, 
    borderRadius: 8, 
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: { 
    backgroundColor: '#81C784', 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700',
  },
  loginLink: { 
    marginTop: 20, 
    alignItems: 'center',
  },
  loginText: { 
    color: '#388E3C', 
    fontSize: 14,
    fontWeight: '600',
  },
});