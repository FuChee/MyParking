import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { UserContext } from '../context/UserContext';
import { useUpdateLeaveTimeMutation } from '../features/parkingApi';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function LocationDetailScreen({ route, navigation }) {
  const { user } = useContext(UserContext);
  const { location } = route.params;
  const [updateLeaveTime, { isLoading }] = useUpdateLeaveTimeMutation();

  const handleLeave = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to update location.');
      return;
    }

    try {
      await updateLeaveTime(location.id).unwrap();
      Alert.alert('Saved', 'You have left this parking spot.');
      navigation.goBack();
    } catch (err) {
      console.error('Error updating leave time:', err);
      Alert.alert('Error', 'Failed to update leave time. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('SavedLocations')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.headerCard}>
        <Text style={styles.slotLabel}>Parking Slot</Text>
        <Text style={styles.slotNumber}>Level {location.level|| 'N/A'} — Slot {location.slot_number}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>📍 Location Details</Text>
        <Text style={styles.text}>Latitude: {location.latitude.toFixed(6)}</Text>
        <Text style={styles.text}>Longitude: {location.longitude.toFixed(6)}</Text>
        <Text style={styles.text}>Elevation: {location.elevation.toFixed(2)} m</Text>

        <Text style={[styles.infoLabel, { marginTop: 16 }]}>🕓 Time Information</Text>
        <Text style={styles.text}>Saved At: {new Date(location.created_at).toLocaleString()}</Text>
        {location.left_at && (
          <Text style={styles.text}>Left At: {new Date(location.left_at).toLocaleString()}</Text>
        )}
      </View>

      {!location.left_at && (
        <TouchableOpacity
          style={[styles.button, isLoading && { backgroundColor: '#7A6F56' }]}
          onPress={handleLeave}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Leave Parking</Text>}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',

  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: '#5C4E33',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 40,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  slotLabel: {
    fontSize: 15,
    color: '#F5EEDC',
    marginBottom: 5,
  },
  slotNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6DDC4',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#5B4C2D',
    marginBottom: 6,
  },
  text: {
    fontSize: 15,
    color: '#3F3B2B',
    marginBottom: 4,
    lineHeight: 22,
  },

  button: {
    marginTop: 30,
    backgroundColor: '#0BA467',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});