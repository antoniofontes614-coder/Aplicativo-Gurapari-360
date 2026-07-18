import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '@/src/lib/supabase';
export type AppRole = 'admin' | 'member';
type AuthState = { session: Session | null; role: AppRole | null; initialized: boolean; initialize: () => Promise<void>; };
const loadRole = async (userId: string): Promise<AppRole> => { if (!supabase) return 'member'; const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(); return data?.role === 'admin' ? 'admin' : 'member'; };
export const useAuth = create<AuthState>((set) => ({ session: null, role: null, initialized: false, initialize: async () => { if (!supabase) return set({ initialized: true }); const [{ data: sessionData }, { data: userData, error }] = await Promise.all([supabase.auth.getSession(), supabase.auth.getUser()]); const session = error || !userData.user ? null : sessionData.session; set({ session, role: session ? await loadRole(session.user.id) : null, initialized: true }); supabase.auth.onAuthStateChange(async (_event, nextSession) => set({ session: nextSession, role: nextSession ? await loadRole(nextSession.user.id) : null })); } }));
