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
          name: string
          username: string
          email: string
          role: 'admin' | 'staff'
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          username: string
          email: string
          role: 'admin' | 'staff'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          username?: string
          email?: string
          role?: 'admin' | 'staff'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          name: string
          default_price: number
          type: 'service' | 'product'
          description: string | null
          is_favorite: boolean
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          default_price: number
          type: 'service' | 'product'
          description?: string | null
          is_favorite?: boolean
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          default_price?: number
          type?: 'service' | 'product'
          description?: string | null
          is_favorite?: boolean
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      monthly_reports: {
        Row: {
          id: string
          year: number
          month: number
          total_revenue: number
          cash_total: number
          twint_total: number
          sumup_total: number
          status: 'draft' | 'closed'
          notes: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          year: number
          month: number
          total_revenue?: number
          cash_total?: number
          twint_total?: number
          sumup_total?: number
          status: 'draft' | 'closed'
          notes?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          year?: number
          month?: number
          total_revenue?: number
          cash_total?: number
          twint_total?: number
          sumup_total?: number
          status?: 'draft' | 'closed'
          notes?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      daily_reports: {
        Row: {
          id: string
          date: string
          cash_total: number
          twint_total: number
          sumup_total: number
          starting_cash: number
          ending_cash: number
          status: 'draft' | 'closed'
          notes: string | null
          monthly_report_id: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          cash_total?: number
          twint_total?: number
          sumup_total?: number
          starting_cash: number
          ending_cash: number
          status: 'draft' | 'closed'
          notes?: string | null
          monthly_report_id?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          cash_total?: number
          twint_total?: number
          sumup_total?: number
          starting_cash?: number
          ending_cash?: number
          status?: 'draft' | 'closed'
          notes?: string | null
          monthly_report_id?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          total_amount: number
          payment_method: 'cash' | 'twint' | 'sumup'
          status: 'completed' | 'cancelled' | 'refunded'
          notes: string | null
          daily_report_id: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          total_amount: number
          payment_method: 'cash' | 'twint' | 'sumup'
          status: 'completed' | 'cancelled' | 'refunded'
          notes?: string | null
          daily_report_id?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          total_amount?: number
          payment_method?: 'cash' | 'twint' | 'sumup'
          status?: 'completed' | 'cancelled' | 'refunded'
          notes?: string | null
          daily_report_id?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      transaction_items: {
        Row: {
          id: string
          transaction_id: string
          item_id: string
          price: number
          notes: string | null
        }
        Insert: {
          id?: string
          transaction_id: string
          item_id: string
          price: number
          notes?: string | null
        }
        Update: {
          id?: string
          transaction_id?: string
          item_id?: string
          price?: number
          notes?: string | null
        }
      }
      cash_register: {
        Row: {
          id: string
          date: string
          type: 'income' | 'expense'
          amount: number
          description: string
          daily_report_id: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          type: 'income' | 'expense'
          amount: number
          description: string
          daily_report_id?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          type?: 'income' | 'expense'
          amount?: number
          description?: string
          daily_report_id?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          type: 'receipt' | 'daily_report' | 'monthly_report' | 'supplier_invoice'
          reference_id: string
          file_path: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          type: 'receipt' | 'daily_report' | 'monthly_report' | 'supplier_invoice'
          reference_id: string
          file_path: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'receipt' | 'daily_report' | 'monthly_report' | 'supplier_invoice'
          reference_id?: string
          file_path?: string
          user_id?: string
          created_at?: string
        }
      }
      supplier_invoices: {
        Row: {
          id: string
          supplier_name: string
          invoice_number: string
          amount: number
          invoice_date: string
          due_date: string
          status: 'pending' | 'paid'
          payment_date: string | null
          notes: string | null
          document_id: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier_name: string
          invoice_number: string
          amount: number
          invoice_date: string
          due_date: string
          status: 'pending' | 'paid'
          payment_date?: string | null
          notes?: string | null
          document_id?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supplier_name?: string
          invoice_number?: string
          amount?: number
          invoice_date?: string
          due_date?: string
          status?: 'pending' | 'paid'
          payment_date?: string | null
          notes?: string | null
          document_id?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      business_settings: {
        Row: {
          id: string
          business_name: string
          address_street: string
          address_city: string
          address_zip: string
          contact_phone: string
          contact_email: string
          receipt_footer_text: string | null
          show_logo: boolean
          additional_info: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          business_name: string
          address_street: string
          address_city: string
          address_zip: string
          contact_phone: string
          contact_email: string
          receipt_footer_text?: string | null
          show_logo?: boolean
          additional_info?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          address_street?: string
          address_city?: string
          address_zip?: string
          contact_phone?: string
          contact_email?: string
          receipt_footer_text?: string | null
          show_logo?: boolean
          additional_info?: string | null
          updated_at?: string
        }
      }
      register_status: {
        Row: {
          id: string
          date: string
          status: 'open' | 'closed'
          starting_amount: number
          ending_amount: number | null
          opened_at: string
          closed_at: string | null
          notes: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          status: 'open' | 'closed'
          starting_amount: number
          ending_amount?: number | null
          opened_at: string
          closed_at?: string | null
          notes?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          status?: 'open' | 'closed'
          starting_amount?: number
          ending_amount?: number | null
          opened_at?: string
          closed_at?: string | null
          notes?: string | null
          user_id?: string
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
      [_ in never]: never
    }
  }
}