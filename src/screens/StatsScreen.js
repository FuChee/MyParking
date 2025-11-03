import React, { useContext, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { useGetParkingStatsQuery } from '../features/statsApi';
import * as Animatable from 'react-native-animatable';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function StatsScreen() {
  const { user } = useContext(UserContext);
  const {
    data: statsData,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetParkingStatsQuery(user?.id);

  // Auto-refresh 
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('parking-records-updates')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'parking_records',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 Parking record changed:', payload);
          refetch(); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); 
    };
  }, [user?.id, refetch]);


  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const formatDuration = (totalMinutes) => {
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = Math.floor(totalMinutes % 60);
    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || result === '') result += `${minutes}m`;
    return result.trim();
  };

  if (isLoading) {
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
        <Text style={styles.emptyText}>Error loading statistics</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!statsData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>No parking data available.</Text>
      </View>
    );
  }

  const totalSessions = statsData.history?.filter((rec) => rec.left_at).length || 0;
  const averageDuration =
    totalSessions > 0 ? statsData.totalDuration / totalSessions : 0;

  const topSlots = Object.entries(statsData.slotCount || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Animatable.Text animation="fadeInDown" duration={600} style={styles.title}>
        Parking Insights
      </Animatable.Text>

      {/* Total Duration */}
      <Animatable.View animation="fadeInUp" duration={600} delay={150} style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Parking Duration</Text>
        <Text style={styles.summaryValue}>
          {formatDuration(statsData.totalDuration || 0)}
        </Text>
      </Animatable.View>

      {/* Average Session */}
      <Animatable.View animation="fadeInUp" duration={600} delay={250} style={styles.infoCard}>
        <Text style={styles.infoLabel}>Average Parking Duration</Text>
        <Text style={styles.infoValue}>{formatDuration(averageDuration)}</Text>
      </Animatable.View>

      {/* Preferred Time & Slot */}
      <Animatable.View animation="fadeInUp" duration={600} delay={350} style={styles.infoCard}>
        <Text style={styles.infoLabel}>Preferred Parking Time</Text>
        <Text style={styles.infoValue}>
          {statsData.preferredTimeRange && statsData.preferredTimeRange.trim() !== '' && statsData.preferredTimeRange.toLowerCase() !== 'no data yet'
            ? statsData.preferredTimeRange
            : 'No data available'}
        </Text>

        <Text style={[styles.infoLabel, { marginTop: 10 }]}>Preferred Slot</Text>
        <Text style={styles.infoValue}>
          {statsData.preferredSlot && statsData.preferredSlot.trim() !== '' && statsData.preferredSlot.toLowerCase() !== 'no data'
            ? `Usually parks at ${statsData.preferredSlot}`
            : 'No data available'}
        </Text>
      </Animatable.View>


      {/* Top 3 Slots */}
      <Animatable.View animation="fadeInUp" duration={600} delay={400} style={styles.freqCard}>
        <Text style={styles.label}>Top 3 Frequently Used Slots</Text>
        {topSlots.length === 0 ? (
          <Text style={styles.noDataText}>No slot data available.</Text>
        ) : (
          topSlots.map(([slot, count], index) => {
            const max = Math.max(...Object.values(statsData.slotCount || {}));
            const widthPercent = (count / max) * 100;
            return (
              <View key={slot} style={styles.slotItem}>
                <View style={styles.slotHeader}>
                  <Text style={styles.rank}>{index + 1}.</Text>
                  <Text style={styles.slotText}>{slot}</Text>
                  <Text style={styles.count}>{count}×</Text>
                </View>
                <View style={styles.barContainer}>
                  <Animatable.View
                    animation="fadeInLeft"
                    duration={800}
                    delay={index * 200}
                    style={[styles.barFill, { width: `${widthPercent}%` }]}
                  />
                </View>
              </View>
            );
          })
        )}
      </Animatable.View>

      {/* Tip */}
      <Animatable.Text animation="fadeIn" duration={700} delay={450} style={styles.tipText}>
        💡 Tip: View full parking history in “Saved Locations” → “Completed” tab.
      </Animatable.Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    paddingTop: 70 
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E2B23',
    marginBottom: 25,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#0BA467',
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  summaryLabel: { 
    color: '#E8F5EF', 
    fontSize: 16, 
    fontWeight: '500' 
  },
  summaryValue: { 
    color: '#FFF', 
    fontSize: 30, 
    fontWeight: '700', 
    marginTop: 6 },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  infoLabel: { 
    color: '#3C3523', 
    fontSize: 17, 
    fontWeight: '600'
  },
  infoValue: { 
    color: '#0BA467', 
    fontSize: 22, 
    fontWeight: '700', 
    marginTop: 5 
  },
  freqCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  label: { fontSize: 18, fontWeight: '700', marginBottom: 14, color: '#333' },
  slotItem: { marginBottom: 14 },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rank: { color: '#0BA467', fontWeight: '700', marginRight: 6, fontSize: 16 },
  slotText: { flex: 1, fontSize: 16, color: '#333' },
  count: { color: '#666', fontSize: 15, fontWeight: '500' },
  barContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#F2F2F2',
    borderRadius: 5,
    marginTop: 6,
    overflow: 'hidden',
  },
  barFill: { 
    height: '100%', 
    backgroundColor: '#0BA467', 
    borderRadius: 5, 
    opacity: 0.9 
  },
  noDataText: { 
    color: '#8B8575', 
    fontSize: 14, 
    textAlign: 'center', 
    marginTop: 10 
  },
  tipText: { 
    textAlign: 'center', 
    color: '#7A7463', 
    fontSize: 13, 
    marginBottom: 50, 
    marginTop: 10 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  retryButton: {
    backgroundColor: '#0BA467',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginTop: 12,
  },
  retryText: { 
    color: '#fff', 
    fontWeight: '600'
   },
  emptyText: { 
    color: '#555', 
    fontSize: 16,
    marginTop: 10 
    },
  loadingText: { 
    color: '#5A5648', 
    fontSize: 16 
  },
});