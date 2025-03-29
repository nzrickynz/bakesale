import { Adapter, AdapterUser, AdapterSession } from 'next-auth/adapters'
import { supabase } from './supabase'
import { Database } from '@/types/supabase'

type User = Database['public']['Tables']['users']['Row']

function toAdapterUser(user: User): AdapterUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.email_verified ? new Date(user.email_verified) : null,
    image: user.image,
    role: user.role,
  }
}

function toAdapterSession(session: any): AdapterSession {
  return {
    sessionToken: session.session_token,
    userId: session.user_id,
    expires: new Date(session.expires),
  }
}

export function SupabaseAdapter(): Adapter {
  return {
    async createUser(data: Omit<AdapterUser, 'id'>) {
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email: data.email,
          name: data.name,
          email_verified: data.emailVerified?.toISOString(),
          image: data.image,
          role: data.role || 'PUBLIC',
          password_hash: '', // Supabase handles password hashing
        })
        .select()
        .single()

      if (error) throw error
      return toAdapterUser(user as User)
    },

    async getUser(id: string) {
      const { data: user, error } = await supabase
        .from('users')
        .select()
        .eq('id', id)
        .single()

      if (error) return null
      return toAdapterUser(user as User)
    },

    async getUserByEmail(email: string) {
      const { data: user, error } = await supabase
        .from('users')
        .select()
        .eq('email', email)
        .single()

      if (error) return null
      return toAdapterUser(user as User)
    },

    async updateUser(data: Partial<AdapterUser> & Pick<AdapterUser, 'id'>) {
      const { data: user, error } = await supabase
        .from('users')
        .update({
          name: data.name,
          email: data.email,
          email_verified: data.emailVerified?.toISOString(),
          image: data.image,
          role: data.role,
        })
        .eq('id', data.id)
        .select()
        .single()

      if (error) throw error
      return toAdapterUser(user as User)
    },

    async deleteUser(userId: string) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error
    },

    async linkAccount(data: any) {
      const { error } = await supabase
        .from('accounts')
        .insert({
          user_id: data.userId,
          type: data.type,
          provider: data.provider,
          provider_account_id: data.providerAccountId,
          refresh_token: data.refresh_token,
          access_token: data.access_token,
          expires_at: data.expires_at,
          token_type: data.token_type,
          scope: data.scope,
          id_token: data.id_token,
          session_state: data.session_state,
        })

      if (error) throw error
    },

    async unlinkAccount(data: { provider: string; providerAccountId: string }) {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('provider', data.provider)
        .eq('provider_account_id', data.providerAccountId)

      if (error) throw error
    },

    async createSession(data: AdapterSession) {
      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          session_token: data.sessionToken,
          user_id: data.userId,
          expires: data.expires.toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return toAdapterSession(session)
    },

    async getSessionAndUser(sessionToken: string) {
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*, user:users(*)')
        .eq('session_token', sessionToken)
        .single()

      if (sessionError) return null
      if (!session) return null

      return {
        session: toAdapterSession(session),
        user: toAdapterUser(session.user as User),
      }
    },

    async updateSession(data: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>) {
      if (!data.userId || !data.expires) return null

      const { data: session, error } = await supabase
        .from('sessions')
        .update({
          expires: data.expires.toISOString(),
        })
        .eq('session_token', data.sessionToken)
        .select()
        .single()

      if (error) throw error
      return toAdapterSession(session)
    },

    async deleteSession(sessionToken: string) {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('session_token', sessionToken)

      if (error) throw error
    },

    async createVerificationToken(data: { identifier: string; token: string; expires: Date }) {
      const { data: verificationToken, error } = await supabase
        .from('verification_tokens')
        .insert({
          identifier: data.identifier,
          token: data.token,
          expires: data.expires.toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return verificationToken
    },

    async useVerificationToken(data: { identifier: string; token: string }) {
      const { data: verificationToken, error } = await supabase
        .from('verification_tokens')
        .delete()
        .eq('identifier', data.identifier)
        .eq('token', data.token)
        .select()
        .single()

      if (error) return null
      return verificationToken
    },
  }
} 