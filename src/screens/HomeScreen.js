import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import { useSaveParkingSlotMutation, useGetTodayParkingRecordsQuery } from '../features/parkingApi';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function HomeScreen() {
  const { user } = useContext(UserContext);
  const [saveParkingSlot, { isLoading: saving }] = useSaveParkingSlotMutation();
  const { data: todayRecords, isLoading: loadingRecords, refetch } = useGetTodayParkingRecordsQuery(user?.id);
  const navigation = useNavigation();

  const [location, setLocation] = useState(null);
  const [timestamp, setTimestamp] = useState(null); // 🕒 store last updated time
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [slotLevel, setSlotLevel] = useState('');
  const [slotNumber, setSlotNumber] = useState('');
  const watchId = useRef(null);

  const slots = [
    { level: '1', number: 17, lat: 2.967768, lon: 101.732965, elevation: 50 },
    { level: '1', number: 36, lat: 2.969333, lon: 101.732192, elevation: 43 },
    { level: 'LG', number: 'Intern 5', lat: 2.968512, lon: 101.734298, elevation: 43 },
    { level: 'LG', number: 'Intern 4', lat: 2.968558, lon: 101.734328, elevation: 40 },
    { level: 'LG', number: 'Intern 6', lat: 2.968492, lon: 101.734263, elevation: 41 },
  ];

  function findNearestSlot(lat, lon, elev) {
    let nearest = slots[0];
    let minDist = Infinity;
    for (const s of slots) {
      const dLat = lat - s.lat;
      const dLon = lon - s.lon;
      const dElev = (elev ?? 0) - (s.elevation ?? 0);
      const dist = Math.sqrt(dLat ** 2 + dLon ** 2 + (dElev / 100000) ** 2);
      if (dist < minDist) {
        minDist = dist;
        nearest = s;
      }
    }
    return nearest;
  }

  const slot = location ? findNearestSlot(location.latitude, location.longitude) : null;

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Parking Finder needs access to your location',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const startTrackingLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location access is required.');
      return;
    }
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
    }

    setLoading(true);
    watchId.current = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, altitude } = position.coords;
        setUpdating(true);
        setLocation({ latitude, longitude, elevation: altitude ?? 0 });
        setTimestamp(new Date(position.timestamp)); 
        setTimeout(() => setUpdating(false), 800);
        setLoading(false);
      },
      (error) => {
        console.warn('Geolocation Error:', error);
        if (error.code === 1) {
          Alert.alert('Permission Denied', 'Please allow location access in Settings.');
        } else if (error.code === 2) {
          Alert.alert('Location Unavailable', 'Please ensure GPS is enabled and you have a clear view of the sky.');
        } else if (error.code === 3) {
          Alert.alert('Timeout', 'GPS signal is taking too long. Try moving outdoors.');
        } else {
          Alert.alert('Error', error.message);
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, 
        timeout: 20000,             // wait up to 20 seconds
        maximumAge: 5000,           // allow cache from last 5s
        distanceFilter: 1,}
    );
  };

  useEffect(() => {
    startTrackingLocation();
    return () => {
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetch(); 
    });
    return unsubscribe;
  }, [navigation]);

  const saveSlotNumber = async () => {
    if (!slotLevel.trim() || !slotNumber.trim()) {
      Alert.alert('Missing Details', 'Please fill in both level and slot number.');
      return;
    }
    setModalVisible(false);
    try {
      await saveParkingSlot({
        userId: user?.id,
        slotLevel,
        slotNumber,
        latitude: location?.latitude,
        longitude: location?.longitude,
        elevation: location?.elevation,
      }).unwrap();

      Alert.alert('Saved Successfully', `Your parking location (Level ${slotLevel}, Slot ${slotNumber}) has been saved.`);
      setSlotLevel('');
      setSlotNumber('');
      refetch();
    } catch (error) {
      console.error('Error saving slot:', error);
      Alert.alert('Error', 'Failed to save location. Please try again.');
    }
  };

  const handleAddPress = () => {
    if (!location) {
      Alert.alert('Location not found', 'Please wait for your GPS to update.');
      return;
    }

    const nearest = findNearestSlot(location.latitude, location.longitude, location.elevation);

    Alert.alert(
      'Confirm Parking Slot',
      `Are you parked at Level ${nearest.level}, Slot ${nearest.number}?`,
      [
        {
          text: 'No',
          onPress: () => setModalVisible(true),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await saveParkingSlot({
                userId: user?.id,
                slotLevel: nearest.level,
                slotNumber: nearest.number,
                latitude: location.latitude,
                longitude: location.longitude,
                elevation: location.elevation,
              }).unwrap();

              Alert.alert(
                'Saved Successfully',
                `Your parking location (Level ${nearest.level}, Slot ${nearest.number}) has been saved.`
              );
              refetch();
            } catch (error) {
              console.error('Error saving slot:', error);
              Alert.alert('Error', 'Failed to save location. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>MyParking</Text>
      <Text style={styles.subtitle}>Track & Save your daily parking location</Text>

      {location && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={22} color="#0BA467" />
            <Text style={styles.cardHeaderText}>Current Location</Text>
            {updating && <ActivityIndicator size="small" color="#0BA467" style={{ marginLeft: 6 }} />}
          </View>
          <Text style={styles.locationText}>Latitude: {location.latitude?.toFixed(6)}</Text>
          <Text style={styles.locationText}>Longitude: {location.longitude?.toFixed(6)}</Text>
          <Text style={styles.locationText}>Elevation: {location.elevation?.toFixed(2)} m</Text>
          <Text style={styles.locationText}>Nearest Slot: {slot ? `${slot.level}-${slot.number}` : 'N/A'}</Text>
          {timestamp && (
            <Text style={styles.timestampText}>
              Captured At: {timestamp.toLocaleTimeString()}
            </Text>
          )}
        </View>
      )}

      <View style={styles.todayCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderText}>Today's Parking</Text>
        </View>

        {loadingRecords ? (
          <ActivityIndicator style={{ marginTop: 30 }} color="#0BA467" />
        ) : todayRecords && todayRecords.length > 0 ? (
          todayRecords.map((record) => (
            <TouchableOpacity
              key={record.id}
              style={styles.recordItem}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('Parking', {
                  screen: 'LocationDetail',
                  params: { location: record },
                })
              }
            >
              <Text style={styles.recordTitle}>
                🅿️ Level {record.level} - Slot {record.slot_number}
              </Text>
              <Text style={styles.recordTime}>
                {new Date(record.created_at).toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={[styles.recordItem, { justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }]}>
            <Ionicons name="car-outline" size={36} color="#7A6F56" style={{ marginBottom: 6 }} />
            <Text style={styles.noRecordText}>No parking record for today</Text>
            <Text style={styles.noRecordSubText}>Tap below to save your first slot</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Parking Slot</Text>
            <TextInput style={styles.input} placeholder="Level" value={slotLevel} onChangeText={setSlotLevel} />
            <TextInput style={styles.input} placeholder="Slot Number" value={slotNumber} onChangeText={setSlotNumber} />
            <TouchableOpacity style={styles.modalButton} onPress={saveSlotNumber}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 100,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0BA467',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#7A6F56',
    textAlign: 'center',
    marginVertical: 10,
    width: '85%',
  },
  card: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginTop: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  timestampText: {
    marginTop: 6,
    fontSize: 14,
    color: '#7A6F56',
    fontStyle: 'italic',
  },
  todayCard: {
    width: '100%',
    padding: 20,
    marginTop: 40,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3F3B2B',
    marginLeft: 8,
  },
  recordItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6DDC4',
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0BA467',
  },
  recordTime: {
    fontSize: 14,
    color: '#7A6F56',
    marginTop: 4,
  },
  locationText: {
    fontSize: 15,
    color: '#4A4A4A',
    marginBottom: 4,
  },

  emptyMessage: {
    width: '100%',
    alignItems: 'center',
    padding: 30,
    marginTop: 40,
  },
  noRecordText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5C4E33',
    marginTop: 8,
  },
  noRecordSubText: {
    fontSize: 15,
    color: '#7A6F56',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0BA467',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0BA467',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  modalButton: {
    width: '100%',
    backgroundColor: '#0BA467',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelText: {
    fontSize: 16,
    color: '#7A6F56',
  },
});