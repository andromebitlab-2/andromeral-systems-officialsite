import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import type { Profile } from '../types';

interface AuthContextType {
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
    logout: () => Promise<void>;
    refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    
    const fetchProfile = useCallback(async (user: User) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (data) {
            setProfile(data as Profile);
        } else if (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
        }
    }, []);

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session?.user) {
                await fetchProfile(session.user);
            }
            setLoading(false);
        };

        fetchSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            if (session?.user) {
                await fetchProfile(session.user);
            } else {
                setProfile(null);
            }
            // Ensure loading is false after initial auth check.
            if(event === 'INITIAL_SESSION') setLoading(false);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [fetchProfile]);
    
    const refetchProfile = useCallback(async () => {
      if (session?.user) {
        await fetchProfile(session.user);
      }
    }, [session, fetchProfile]);


    const logout = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
    };

    const value = {
        session,
        profile,
        loading,
        logout,
        refetchProfile,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
