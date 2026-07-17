import * as Linking from 'expo-linking';
import type { Provider } from '@supabase/supabase-js';
import { supabase } from './supabase';

const requireClient = () => { if (!supabase) throw new Error('Configure o Supabase no arquivo .env.'); return supabase; };
export const auth = {
  signUp: (email: string, password: string, firstName: string, lastName: string) => requireClient().auth.signUp({ email, password, options: { emailRedirectTo: Linking.createURL('/auth/callback'), data: { first_name: firstName, last_name: lastName } } }),
  signIn: (email: string, password: string) => requireClient().auth.signInWithPassword({ email, password }),
  signOut: () => requireClient().auth.signOut(),
  resetPassword: (email: string) => requireClient().auth.resetPasswordForEmail(email, { redirectTo: Linking.createURL('/auth/redefinir-senha') }),
  updatePassword: (password: string) => requireClient().auth.updateUser({ password }),
  async signInWithProvider(provider: Provider) { const { data, error } = await requireClient().auth.signInWithOAuth({ provider, options: { redirectTo: Linking.createURL('/auth/callback'), skipBrowserRedirect: true } }); if (error) throw error; if (data.url) await Linking.openURL(data.url); },
  exchangeCallback: (url: string) => requireClient().auth.exchangeCodeForSession(url),
};
