import { supabase } from './supabase';
export type SubscriptionStatus = 'active'|'past_due'|'canceled'|'pending'|'expired';
export type Subscription = { plan_code:string; status:SubscriptionStatus; current_period_end:string|null; next_charge_at:string|null; cancel_at_period_end:boolean };
export async function getMySubscription():Promise<Subscription|null>{if(!supabase)return null;const{data,error}=await supabase.from('subscriptions').select('plan_code,status,current_period_end,next_charge_at,cancel_at_period_end').maybeSingle();if(error)throw error;return data as Subscription|null;}
export const hasPremium=(s:Subscription|null)=>!!s&&s.status==='active'&&(!s.current_period_end||new Date(s.current_period_end)>new Date());
export async function startCheckout(){if(!supabase)throw new Error('Configure o Supabase.');const{data,error}=await supabase.functions.invoke<{url:string}>('create-checkout');if(error)throw error;return data.url;}
