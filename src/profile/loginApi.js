// src/profile/loginApi.js
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../lib/supabase';

export const loginApi = createApi({
  reducerPath: 'loginApi',
  baseQuery: fakeBaseQuery(), 
  endpoints: (builder) => ({
    login: builder.mutation({
      async queryFn({ email, password }) {
        try {
          const { data, error } = await supabase
            .from('profiles')       
            .select('user_id, name, email')
            .eq('email', email)
            .eq('password', password)
            .single();              

          if (error) throw error;
          const user = {
            id: data.user_id,          
            name: data.name,
            email: data.email,
          };

          return { data : user};          
        } catch (err) {
          return { error: { status: 500, data: err.message } };
        }
      },
    }),
  }),
});

export const { useLoginMutation } = loginApi;