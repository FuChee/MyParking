import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useLoginMutation } from '../profile/loginApi';
import { UserContext } from '../context/UserContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const { setUser } = useContext(UserContext);

  const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }

  try {
    const user = await login({ email, password }).unwrap();
    setUser(user);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }], 
    });
  } catch (err) {
    if (err.status === 'FETCH_ERROR' || err.message?.includes('Network')) {
      Alert.alert('Network Error', 'Unable to connect. Please check your internet.');
    } else {
      Alert.alert('Error', 'Invalid email or password');
    }
  }
};

  const isButtonActive = email.trim() && password.trim();

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
          <Text style={styles.title}>Login</Text>

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
            style={[styles.button, !isButtonActive && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!isButtonActive || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
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
    paddingVertical: 30,
    paddingHorizontal: 25,
    borderRadius: 10,
    backgroundColor: '#fff',

    elevation: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
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
  buttonDisabled: {
    backgroundColor: '#81C784', 
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#388E3C', 
    fontSize: 14,
    fontWeight: '600',
  },
});