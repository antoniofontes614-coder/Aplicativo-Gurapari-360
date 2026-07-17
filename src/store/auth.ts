import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '@/src/lib/supabase';
type AuthState = { session: Session | null; initialized: boolean; initialize: () => Promise<void>; };
export const useAuth = create<AuthState>((set) => ({ session: null, initialized: false, initialize: async () => { if (!supabase) return set({ initialized: true }); const { data } = await supabase.auth.getSession(); set({ session: data.session, initialized: true }); supabase.auth.onAuthStateChange((_event, session) => set({ session })); } }));
