import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import type { Provider } from '@supabase/supabase-js';
import { supabase } from './supabase';

const requireClient = () => { if (!supabase) throw new Error('Configure o Supabase no arquivo .env.'); return supabase; };
const redirectUrl = (path: string) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return new URL(path, window.location.origin).toString();
  }

  return Linking.createURL(path);
};

export const auth = {
  signUp: (email: string, password: string, firstName: string, lastName: string) => requireClient().auth.signUp({ email, password, options: { emailRedirectTo: redirectUrl('/auth/callback'), data: { first_name: firstName, last_name: lastName } } }),
  signIn: (email: string, password: string) => requireClient().auth.signInWithPassword({ email, password }),
  signOut: () => requireClient().auth.signOut(),
  resetPassword: (email: string) => requireClient().auth.resetPasswordForEmail(email, { redirectTo: redirectUrl('/auth/redefinir-senha') }),
  updatePassword: (password: string) => requireClient().auth.updateUser({ password }),
  async signInWithProvider(provider: Provider) {
    const { data, error } = await requireClient().auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectUrl('/auth/callback'), skipBrowserRedirect: Platform.OS !== 'web' },
    });
    if (error) throw error;
    if (Platform.OS !== 'web' && data.url) await Linking.openURL(data.url);
  },
  exchangeCallback: (code: string) => requireClient().auth.exchangeCodeForSession(code),
  setSession: (accessToken: string, refreshToken: string) => requireClient().auth.setSession({ access_token: accessToken, refresh_token: refreshToken }),
};
