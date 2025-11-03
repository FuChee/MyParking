import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../lib/supabase';

export const statsApi = createApi({
  reducerPath: 'statsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({

    getParkingStats: builder.query({
      async queryFn(user_id) {
        try {
          const { data, error } = await supabase
            .from('parking_records')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          let totalDuration = 0;
          const slotCount = {};
          const hourSlotCount = {}; 

          data.forEach((rec) => {
            const created = new Date(rec.created_at);
            const hour = created.getHours();
            const slotKey = `Level ${rec.level} - Slot ${rec.slot_number}`;

           
            if (!hourSlotCount[hour]) hourSlotCount[hour] = {};
            hourSlotCount[hour][slotKey] = (hourSlotCount[hour][slotKey] || 0) + 1;

        
            slotCount[slotKey] = (slotCount[slotKey] || 0) + 1;

            // Duration
            if (rec.left_at) {
              const start = new Date(rec.created_at);
              const end = new Date(rec.left_at);
              totalDuration += (end - start) / 1000 / 60; // minutes
            }
          });

          // Find hour with most parkings
          let preferredHour = null;
          let maxCount = 0;
          for (const hour in hourSlotCount) {
            const totalAtHour = Object.values(hourSlotCount[hour]).reduce(
              (a, b) => a + b,
              0
            );
            if (totalAtHour > maxCount) {
              maxCount = totalAtHour;
              preferredHour = parseInt(hour);
            }
          }

          // Find most frequent slot at that preferred hour
          let preferredSlot = 'No data';
          if (preferredHour !== null) {
            const slotStats = hourSlotCount[preferredHour];
            preferredSlot = Object.keys(slotStats).reduce((a, b) =>
              slotStats[a] > slotStats[b] ? a : b
            );
          }

          // Format time nicely
          let preferredTimeRange = 'No data yet';
          if (preferredHour !== null) {
            const start = new Date();
            start.setHours(preferredHour, 0, 0);
            const end = new Date();
            end.setHours(preferredHour + 1, 0, 0);
            preferredTimeRange = `${start.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })} – ${end.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}`;
          }

          return {
            data: {
              totalDuration,
              slotCount,
              preferredTimeRange,
              preferredSlot,
              history: data,
            },
          };
        } catch (err) {
          return { error: err };
        }
      },
    }),
   
  }),
});

export const { useGetDailyScheduleQuery, useGetParkingStatsQuery } = statsApi;