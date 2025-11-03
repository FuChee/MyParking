import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../lib/supabase';

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    saveProfile: builder.mutation({
      async queryFn(profile) {
        const { data, error } = await supabase
          .from('profiles')
          .insert([profile]);
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ['Profile'],
    }),
    updateProfile: builder.mutation({
      async queryFn({ user_id, name, email }) {

        const { data, error } = await supabase
          .from('profiles')
          .update({ name, email })
          .eq('user_id', user_id)
          .select()

        if (error) {
          console.error('❌ Supabase update error:', error);
          return { error };
        }

        console.log('✅ Profile updated successfully:', data);
        return { data };
      },
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const { useUpdateProfileMutation, useSaveProfileMutation } = profileApi;