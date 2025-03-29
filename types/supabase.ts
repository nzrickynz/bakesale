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
          stripe_account_id: string | null
          admin_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          description: string
          facebook_url?: string | null
          instagram_url?: string | null
          website_url?: string | null
          stripe_account_id?: string | null
          admin_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          description?: string
          facebook_url?: string | null
          instagram_url?: string | null
          website_url?: string | null
          stripe_account_id?: string | null
          admin_id?: string
          created_at?: string
          updated_at?: string
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
          organization_id: string
          created_at: string
          updated_at: string
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
          organization_id: string
          created_at?: string
          updated_at?: string
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
          organization_id?: string
          created_at?: string
          updated_at?: string
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
          stripe_product_id: string | null
          stripe_price_id: string | null
          stripe_payment_link: string | null
          cause_id: string
          volunteer_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          image_url?: string | null
          quantity?: number | null
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          stripe_payment_link?: string | null
          cause_id: string
          volunteer_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          image_url?: string | null
          quantity?: number | null
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          stripe_payment_link?: string | null
          cause_id?: string
          volunteer_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          buyer_email: string
          payment_status: string
          fulfillment_status: string
          listing_id: string
          creator_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          buyer_email: string
          payment_status: string
          fulfillment_status: string
          listing_id: string
          creator_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          buyer_email?: string
          payment_status?: string
          fulfillment_status?: string
          listing_id?: string
          creator_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          amount: number
          status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
          cause_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          amount: number
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
          cause_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          amount?: number
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
          cause_id?: string
          created_at?: string
          updated_at?: string
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