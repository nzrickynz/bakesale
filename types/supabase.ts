export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string
          email_verified: string | null
          image: string | null
          password_hash: string
          role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'VOLUNTEER' | 'PUBLIC'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          email: string
          email_verified?: string | null
          image?: string | null
          password_hash: string
          role?: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'VOLUNTEER' | 'PUBLIC'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string
          email_verified?: string | null
          image?: string | null
          password_hash?: string
          role?: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'VOLUNTEER' | 'PUBLIC'
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          description: string
          facebook_url: string | null
          instagram_url: string | null
          website_url: string | null
          created_at: string
          updated_at: string
          admin_id: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          description: string
          facebook_url?: string | null
          instagram_url?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
          admin_id: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          description?: string
          facebook_url?: string | null
          instagram_url?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
          admin_id?: string
        }
      }
      listings: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          image_url: string | null
          quantity: number | null
          created_at: string
          updated_at: string
          cause_id: string
          volunteer_id: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          image_url?: string | null
          quantity?: number | null
          created_at?: string
          updated_at?: string
          cause_id: string
          volunteer_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          image_url?: string | null
          quantity?: number | null
          created_at?: string
          updated_at?: string
          cause_id?: string
          volunteer_id?: string
        }
      }
      orders: {
        Row: {
          id: string
          buyer_email: string
          payment_status: string
          fulfillment_status: string
          created_at: string
          updated_at: string
          listing_id: string
          creator_id: string
        }
        Insert: {
          id?: string
          buyer_email: string
          payment_status: string
          fulfillment_status: string
          created_at?: string
          updated_at?: string
          listing_id: string
          creator_id: string
        }
        Update: {
          id?: string
          buyer_email?: string
          payment_status?: string
          fulfillment_status?: string
          created_at?: string
          updated_at?: string
          listing_id?: string
          creator_id?: string
        }
      }
      causes: {
        Row: {
          id: string
          title: string
          description: string
          image_url: string | null
          target_goal: number | null
          start_date: string
          end_date: string | null
          status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
          created_at: string
          updated_at: string
          organization_id: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          image_url?: string | null
          target_goal?: number | null
          start_date: string
          end_date?: string | null
          status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
          created_at?: string
          updated_at?: string
          organization_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image_url?: string | null
          target_goal?: number | null
          start_date?: string
          end_date?: string | null
          status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
          created_at?: string
          updated_at?: string
          organization_id?: string
        }
      }
      donations: {
        Row: {
          id: string
          amount: number
          created_at: string
          updated_at: string
          status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
          cause_id: string
        }
        Insert: {
          id?: string
          amount: number
          created_at?: string
          updated_at?: string
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
          cause_id: string
        }
        Update: {
          id?: string
          amount?: number
          created_at?: string
          updated_at?: string
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
          cause_id?: string
        }
      }
      user_organizations: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'VOLUNTEER' | 'PUBLIC'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          role?: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'VOLUNTEER' | 'PUBLIC'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          role?: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'VOLUNTEER' | 'PUBLIC'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'VOLUNTEER' | 'PUBLIC'
      cause_status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
      payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
      invitation_status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
      order_status: 'ORDERED' | 'IN_PROGRESS' | 'READY' | 'FULFILLED'
    }
  }
} 