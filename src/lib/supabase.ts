import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (we'll define these based on your schema)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          contact_number?: string
          address?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          contact_number?: string
          address?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          contact_number?: string
          address?: string
          updated_at?: string
        }
      }
      creditors: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          phone?: string
          company?: string
          address?: string
          notes?: string
          status: 'approved' | 'pending'
          rating: number
          total_loans: number
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          phone?: string
          company?: string
          address?: string
          notes?: string
          status?: 'approved' | 'pending'
          rating?: number
          total_loans?: number
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string
          phone?: string
          company?: string
          address?: string
          notes?: string
          status?: 'approved' | 'pending'
          rating?: number
          total_loans?: number
          total_amount?: number
          updated_at?: string
        }
      }
      loan_applications: {
        Row: {
          id: string
          applicant_id: string
          creditor_id: string
          amount: number
          term_months: number
          interest_rate: number
          purpose: string
          status: 'pending' | 'approved' | 'rejected' | 'modified'
          date: string
          due_date: string
          credit_history: string
          market_conditions: string
          modified_terms?: string
          requires_co_maker?: boolean
          requires_documents?: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          applicant_id: string
          creditor_id: string
          amount: number
          term_months: number
          interest_rate: number
          purpose: string
          status?: 'pending' | 'approved' | 'rejected' | 'modified'
          date: string
          due_date: string
          credit_history: string
          market_conditions: string
          modified_terms?: string
          requires_co_maker?: boolean
          requires_documents?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          applicant_id?: string
          creditor_id?: string
          amount?: number
          term_months?: number
          interest_rate?: number
          purpose?: string
          status?: 'pending' | 'approved' | 'rejected' | 'modified'
          date?: string
          due_date?: string
          credit_history?: string
          market_conditions?: string
          modified_terms?: string
          requires_co_maker?: boolean
          requires_documents?: boolean
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          loan_id: string
          type: 'NEW_LOAN_REQUEST' | 'LOAN_MODIFIED' | 'LOAN_ACCEPTED'
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          loan_id: string
          type: 'NEW_LOAN_REQUEST' | 'LOAN_MODIFIED' | 'LOAN_ACCEPTED'
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          loan_id?: string
          type?: 'NEW_LOAN_REQUEST' | 'LOAN_MODIFIED' | 'LOAN_ACCEPTED'
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          loan_id: string
          payer_id: string
          receiver_id: string
          amount: number
          date: string
          status: 'pending' | 'completed' | 'failed' | 'cancelled'
          payment_method: 'bank_transfer' | 'cash' | 'check' | 'digital_wallet'
          reference?: string
          notes?: string
          created_at: string
        }
        Insert: {
          id?: string
          loan_id: string
          payer_id: string
          receiver_id: string
          amount: number
          date: string
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          payment_method: 'bank_transfer' | 'cash' | 'check' | 'digital_wallet'
          reference?: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          loan_id?: string
          payer_id?: string
          receiver_id?: string
          amount?: number
          date?: string
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          payment_method?: 'bank_transfer' | 'cash' | 'check' | 'digital_wallet'
          reference?: string
          notes?: string
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          currency: 'USD' | 'EUR' | 'GBP' | 'JPY'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          currency?: 'USD' | 'EUR' | 'GBP' | 'JPY'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          currency?: 'USD' | 'EUR' | 'GBP' | 'JPY'
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
      [_ in never]: never
    }
  }
}

