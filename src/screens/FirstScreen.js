// src/screens/FirstScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { UserContext } from '../context/UserContext';

export default function FirstScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);

  const handleLogout = () => {
    setUser(null);
    navigation.reset({
      index: 0,
      routes: [{ name: 'First' }],
    });
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Ionicons name="car-sport" size={120} color="#2E7D32" />
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.desc}>
            This app is the simplest way to save your parking lot using your smartphone
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>

          </View>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello, {user.name}!</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 60,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  desc: {
    fontSize: 18,
    color: '#444',
    marginBottom: 20,
    textAlign: 'center',
    maxWidth: '70%',
    alignSelf: 'center',
    lineHeight: 26,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 8,
    width: '60%',
    alignItems: 'center',
  },
  signUpButton: {
    backgroundColor: '#50C878',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
