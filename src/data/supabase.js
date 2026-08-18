import { createClient } from '@supabase/supabase-js';

export function getStoredSupabaseConfig() {
    let url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
    let key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    try {
        const saved = localStorage.getItem('coctask_supabase_config');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.url && parsed.key) {
                url = parsed.url;
                key = parsed.key;
            }
        }
    } catch (e) { }

    return {
        url: typeof url === 'string' ? url.trim() : '',
        key: typeof key === 'string' ? key.trim() : ''
    };
}

export function saveStoredSupabaseConfig(url, key) {
    localStorage.setItem('coctask_supabase_config', JSON.stringify({ url: url.trim(), key: key.trim() }));
}

export function clearStoredSupabaseConfig() {
    localStorage.removeItem('coctask_supabase_config');
}

const config = getStoredSupabaseConfig();
export const isSupabaseConfigured = Boolean(
    config.url && 
    config.url.startsWith('http') && 
    config.key && 
    config.key.length > 10
);

export const supabase = isSupabaseConfigured
    ? createClient(config.url, config.key)
    : createClient('https://placeholder.supabase.co', 'placeholder-key');
