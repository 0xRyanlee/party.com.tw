import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Only validate if we're in a browser environment (not during SSR/build)
    if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
        throw new Error(
            'Missing Supabase environment variables. ' +
            'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
        );
    }

    // Provide fallback values for SSR/Build time to prevent @supabase/ssr from throwing
    return createBrowserClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder'
    );
}
