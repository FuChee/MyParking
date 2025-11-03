import React, { useContext, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { Swipeable } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  useGetParkingRecordsQuery,
  useDeleteParkingRecordMutation,
} from '../features/parkingApi';

export default function SavedLocationsScreen({ navigation }) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,        
      headerBackVisible: false,     
    });
  }, [navigation]);
  const { user } = useContext(UserContext);
  const [filter, setFilter] = useState('active'); 
  

  const getDuration = (start, end) => {
    if (!start || !end) return null;

    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime; 
    const diffMinutes = Math.floor(diffMs / 60000);

    const days = Math.floor(diffMinutes / (60 * 24));
    const hours = Math.floor((diffMinutes % (60 * 24)) / 60);
    const minutes = diffMinutes % 60;

    let durationStr = '';

    if (days > 0) durationStr += `${days} day${days > 1 ? 's' : ''} `;
    if (hours > 0) durationStr += `${hours} hr${hours > 1 ? 's' : ''} `;
    if (minutes > 0 || durationStr === '') durationStr += `${minutes} min`;

    return durationStr.trim();
  };
  const {
    data: locations = [],
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetParkingRecordsQuery(user?.id, { skip: !user });

  const [deleteParkingRecord] = useDeleteParkingRecordMutation();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    try {
      setDeletingId(id); 
      await deleteParkingRecord(id).unwrap();
      Alert.alert('Deleted', 'Location has been deleted.');
      refetch();
    } catch (err) {
      console.error('Error deleting location:', err);
      Alert.alert('Error', 'Failed to delete location.');
    } finally {
      setDeletingId(null); 
    }
  };

  const renderRightActions = (itemId) => (
    <TouchableOpacity
      onPress={() => handleDelete(itemId)}
      activeOpacity={0.8}
      style={styles.deleteSwipe}
      disabled={deletingId === itemId}
    >
      {deletingId === itemId ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Ionicons name="trash" size={28} color="#fff" />
      )}
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('LocationDetail', { location: item, refresh: refetch })
        }
      >
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={20} color="#7A7050" style={styles.icon} />
            <Text style={styles.slotText}>Level {item.level}-{item.slot_number}</Text>
          </View>

          <View style={styles.row}>
            <Ionicons name="time-outline" size={20} color="#7A7050" style={styles.icon} />
            <Text style={styles.text}>Saved: {new Date(item.created_at).toLocaleString()}</Text>
          </View>

          {item.left_at && (
          <>
            <View style={styles.row}>
              <Ionicons name="exit-outline" size={20} color="#7A7050" style={styles.icon} />
              <Text style={styles.text}>
                Left: {new Date(item.left_at).toLocaleString()}
              </Text>
            </View>

            <View style={styles.row}>
              <Ionicons name="time-outline" size={20} color="#7A7050" style={styles.icon} />
              <Text style={[styles.text, styles.durationText]}>
                Duration: {getDuration(item.created_at, item.left_at)}
              </Text>
            </View>
          </>
        )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  const filteredLocations = locations.filter((item) =>
    filter === 'active' ? !item.left_at : item.left_at
  );

  if (isLoading || isFetching) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#9E8F67" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={50} color="#C2B490" />
        <Text style={styles.emptyText}>Error loading locations</Text>
        <TouchableOpacity
          style={styles.loginPromptButton}
          onPress={() => refetch()}
        >
          <Text style={styles.loginPromptButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!filteredLocations.length) {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setFilter('active')}
          >
            <Text
              style={[styles.tabText, filter === 'active' && styles.tabTextActive]}
            >
              Active Parking
            </Text>
            {filter === 'active' && <View style={styles.activeLine} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setFilter('completed')}
          >
            <Text
              style={[styles.tabText, filter === 'completed' && styles.tabTextActive]}
            >
              Completed
            </Text>
            {filter === 'completed' && <View style={styles.activeLine} />}
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Ionicons name="car-outline" size={50} color="#C2B490" style={{ marginBottom: 15 }} />
          <Text style={styles.emptyText}>
            {filter === 'active' ? 'No active parking yet' : 'No completed records'}
          </Text>
          <Text style={styles.emptySubText}>
            {filter === 'active'
              ? 'Save your parking spot to see it here later'
              : 'Completed parking sessions will appear here'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setFilter('active')}
        >
          <Text
            style={[styles.tabText, filter === 'active' && styles.tabTextActive]}
          >Active Parking</Text>
          {filter === 'active' && <View style={styles.activeLine} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setFilter('completed')}
        >
          <Text
            style={[styles.tabText, filter === 'completed' && styles.tabTextActive]}
          >
            Completed
          </Text>
          {filter === 'completed' && <View style={styles.activeLine} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredLocations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },

  icon: {
    marginRight: 8,
  },

  slotText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5B4C2D',
  },
  durationText: {
    fontSize: 15,
    color: '#5B4C2D',
    fontStyle: 'italic',
    fontWeight: 'bold',
  },

  text: {
    fontSize: 15,
    color: '#3F3B2B',
    marginRight: 12,
  },

  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7A7050',
  },

  emptySubText: {
    fontSize: 15,
    color: '#A09373',
    textAlign: 'center',
    marginTop: 5,
    width: '75%',
  },

  deleteSwipe: {
    backgroundColor: '#D9534F',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 15,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },

  loginPromptButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 40,
    backgroundColor: '#A67B5B',
    borderRadius: 12,
  },

  loginPromptButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginBottom: 15,
    elevation: 2,
    marginHorizontal: -10,
    paddingHorizontal: 0,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative',
  },

  tabText: {
    color: '#7A7050',
    fontSize: 16,
    fontWeight: '500',
  },

  tabTextActive: {
    color: '#0BA467',
    fontWeight: '700',
  },

  activeLine: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '50%',
    backgroundColor: '#0BA467',
    borderRadius: 2,
  },
});