export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cash_movements: {
        Row: {
          id: string
          amount: number
          type: 'cash_in' | 'cash_out'
          description: string
          reference_type: 'sale' | 'expense' | 'adjustment' | null
          reference_id: string | null
          user_id: string
          created_at: string | null
          bank_transaction_id: string | null
          banking_status: 'unmatched' | 'matched'
          movement_type: 'cash_operation' | 'bank_transfer'
        }
        Insert: {
          id?: string
          amount: number
          type: 'cash_in' | 'cash_out'
          description: string
          reference_type?: 'sale' | 'expense' | 'adjustment' | null
          reference_id?: string | null
          user_id: string
          created_at?: string | null
          bank_transaction_id?: string | null
          banking_status?: 'unmatched' | 'matched'
          movement_type?: 'cash_operation' | 'bank_transfer'
        }
        Update: {
          id?: string
          amount?: number
          type?: 'cash_in' | 'cash_out'
          description?: string
          reference_type?: 'sale' | 'expense' | 'adjustment' | null
          reference_id?: string | null
          user_id?: string
          created_at?: string | null
          bank_transaction_id?: string | null
          banking_status?: 'unmatched' | 'matched'
          movement_type?: 'cash_operation' | 'bank_transfer'
        }
        Relationships: [
          {
            foreignKeyName: "cash_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      daily_summaries: {
        Row: {
          id: string
          report_date: string
          sales_cash: number
          sales_twint: number
          sales_sumup: number
          sales_total: number
          expenses_cash: number
          expenses_bank: number
          expenses_total: number
          cash_starting: number
          cash_ending: number
          cash_difference: number
          status: 'draft' | 'closed'
          notes: string | null
          created_by: string | null  // NEW: Audit trail (who created)
          user_id: string | null     // CHANGED: Now optional for compatibility
          created_at: string | null
          closed_at: string | null
        }
        Insert: {
          id?: string
          report_date: string
          sales_cash?: number
          sales_twint?: number
          sales_sumup?: number
          sales_total?: number
          expenses_cash?: number
          expenses_bank?: number
          expenses_total?: number
          cash_starting?: number
          cash_ending?: number
          cash_difference?: number
          status?: 'draft' | 'closed'
          notes?: string | null
          created_by?: string | null  // NEW: Optional for insert
          user_id?: string | null     // CHANGED: Now optional
          created_at?: string | null
          closed_at?: string | null
        }
        Update: {
          id?: string
          report_date?: string
          sales_cash?: number
          sales_twint?: number
          sales_sumup?: number
          sales_total?: number
          expenses_cash?: number
          expenses_bank?: number
          expenses_total?: number
          cash_starting?: number
          cash_ending?: number
          cash_difference?: number
          status?: 'draft' | 'closed'
          notes?: string | null
          created_by?: string | null  // NEW: Can be updated
          user_id?: string | null     // CHANGED: Now optional
          created_at?: string | null
          closed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_summaries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          type: 'receipt' | 'daily_report' | 'monthly_report' | 'yearly_report' | 'expense_receipt'
          reference_id: string
          file_path: string
          file_name: string | null
          file_size: number | null
          mime_type: string | null
          reference_type: 'sale' | 'expense' | 'report' | null
          notes: string | null
          payment_method: 'cash' | 'twint' | 'sumup' | 'bank' | null
          document_date: string
          user_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          type: 'receipt' | 'daily_report' | 'monthly_report' | 'yearly_report' | 'expense_receipt'
          reference_id: string
          file_path: string
          file_name?: string | null
          file_size?: number | null
          mime_type?: string | null
          reference_type?: 'sale' | 'expense' | 'report' | null
          notes?: string | null
          payment_method?: 'cash' | 'twint' | 'sumup' | 'bank' | null
          document_date: string
          user_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          type?: 'receipt' | 'daily_report' | 'monthly_report' | 'yearly_report' | 'expense_receipt'
          reference_id?: string
          file_path?: string
          file_name?: string | null
          file_size?: number | null
          mime_type?: string | null
          reference_type?: 'sale' | 'expense' | 'report' | null
          notes?: string | null
          payment_method?: 'cash' | 'twint' | 'sumup' | 'bank' | null
          document_date?: string
          user_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      expenses: {
        Row: {
          id: string
          amount: number
          description: string
          category: 'rent' | 'supplies' | 'salary' | 'utilities' | 'insurance' | 'other'
          payment_method: 'bank' | 'cash'
          payment_date: string
          supplier_name: string | null
          invoice_number: string | null
          notes: string | null
          user_id: string
          created_at: string | null
          // Belegnummer System
          receipt_number: string | null
          bank_transaction_id: string | null
          banking_status: 'unmatched' | 'matched'
        }
        Insert: {
          id?: string
          amount: number
          description: string
          category: 'rent' | 'supplies' | 'salary' | 'utilities' | 'insurance' | 'other'
          payment_method: 'bank' | 'cash'
          payment_date: string
          supplier_name?: string | null
          invoice_number?: string | null
          notes?: string | null
          user_id: string
          created_at?: string | null
          // Belegnummer System (auto-generated by trigger)
          receipt_number?: string | null
          bank_transaction_id?: string | null
          banking_status?: 'unmatched' | 'matched'
        }
        Update: {
          id?: string
          amount?: number
          description?: string
          category?: 'rent' | 'supplies' | 'salary' | 'utilities' | 'insurance' | 'other'
          payment_method?: 'bank' | 'cash'
          payment_date?: string
          supplier_name?: string | null
          invoice_number?: string | null
          notes?: string | null
          user_id?: string
          created_at?: string | null
          // Belegnummer System
          receipt_number?: string | null
          bank_transaction_id?: string | null
          banking_status?: 'unmatched' | 'matched'
        }
        Relationships: [
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      items: {
        Row: {
          id: string
          name: string
          default_price: number
          type: 'service' | 'product'
          is_favorite: boolean | null
          active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          default_price: number
          type: 'service' | 'product'
          is_favorite?: boolean | null
          active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          default_price?: number
          type?: 'service' | 'product'
          is_favorite?: boolean | null
          active?: boolean | null
          created_at?: string | null
        }
        Relationships: []  // CHANGED: No user_id relationship anymore (shared resources)
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string | null
          item_id: string | null
          price: number
          notes: string | null
        }
        Insert: {
          id?: string
          sale_id?: string | null
          item_id?: string | null
          price: number
          notes?: string | null
        }
        Update: {
          id?: string
          sale_id?: string | null
          item_id?: string | null
          price?: number
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          }
        ]
      }
      sales: {
        Row: {
          id: string
          total_amount: number
          payment_method: 'cash' | 'twint' | 'sumup'
          status: 'completed' | 'cancelled' | 'refunded'
          notes: string | null
          user_id: string
          created_at: string | null
          // Belegnummer System
          receipt_number: string | null
          // Settlement tracking fields (Phase 1)
          gross_amount: number | null
          provider_fee: number | null
          net_amount: number | null
          settlement_status: 'pending' | 'settled' | 'failed' | 'weekend_delay' | 'charged_back' | null
          settlement_date: string | null
          provider_reference_id: string | null
          // New Banking System fields
          provider_report_id: string | null
          bank_transaction_id: string | null
          banking_status: 'unmatched' | 'provider_matched' | 'bank_matched' | 'fully_matched'
        }
        Insert: {
          id?: string
          total_amount: number
          payment_method: 'cash' | 'twint' | 'sumup'
          status?: 'completed' | 'cancelled' | 'refunded'
          notes?: string | null
          user_id: string
          created_at?: string | null
          // Belegnummer System (auto-generated by trigger)
          receipt_number?: string | null
          // Settlement tracking fields (Phase 1)
          gross_amount?: number | null
          provider_fee?: number | null
          net_amount?: number | null
          settlement_status?: 'pending' | 'settled' | 'failed' | 'weekend_delay' | 'charged_back' | null
          settlement_date?: string | null
          provider_reference_id?: string | null
          // New Banking System fields
          provider_report_id?: string | null
          bank_transaction_id?: string | null
          banking_status?: 'unmatched' | 'provider_matched' | 'bank_matched' | 'fully_matched'
        }
        Update: {
          id?: string
          total_amount?: number
          payment_method?: 'cash' | 'twint' | 'sumup'
          status?: 'completed' | 'cancelled' | 'refunded'
          notes?: string | null
          user_id?: string
          created_at?: string | null
          // Belegnummer System
          receipt_number?: string | null
          // Settlement tracking fields (Phase 1)
          gross_amount?: number | null
          provider_fee?: number | null
          net_amount?: number | null
          settlement_status?: 'pending' | 'settled' | 'failed' | 'weekend_delay' | 'charged_back' | null
          settlement_date?: string | null
          provider_reference_id?: string | null
          // New Banking System fields
          provider_report_id?: string | null
          bank_transaction_id?: string | null
          banking_status?: 'unmatched' | 'provider_matched' | 'bank_matched' | 'fully_matched'
        }
        Relationships: [
          {
            foreignKeyName: "sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      monthly_summaries: {
        Row: {
          id: string
          year: number
          month: number
          sales_cash: number
          sales_twint: number
          sales_sumup: number
          sales_total: number
          expenses_cash: number
          expenses_bank: number
          expenses_total: number
          transaction_count: number
          avg_daily_revenue: number
          status: 'draft' | 'closed'
          notes: string | null
          created_by: string | null  // NEW: Audit trail (who created)
          user_id: string | null     // CHANGED: Now optional for compatibility
          created_at: string | null
          closed_at: string | null
        }
        Insert: {
          id?: string
          year: number
          month: number
          sales_cash?: number
          sales_twint?: number
          sales_sumup?: number
          sales_total?: number
          expenses_cash?: number
          expenses_bank?: number
          expenses_total?: number
          transaction_count?: number
          avg_daily_revenue?: number
          status?: 'draft' | 'closed'
          notes?: string | null
          created_by?: string | null  // NEW: Optional for insert
          user_id?: string | null     // CHANGED: Now optional
          created_at?: string | null
          closed_at?: string | null
        }
        Update: {
          id?: string
          year?: number
          month?: number
          sales_cash?: number
          sales_twint?: number
          sales_sumup?: number
          sales_total?: number
          expenses_cash?: number
          expenses_bank?: number
          expenses_total?: number
          transaction_count?: number
          avg_daily_revenue?: number
          status?: 'draft' | 'closed'
          notes?: string | null
          created_by?: string | null  // NEW: Can be updated
          user_id?: string | null     // CHANGED: Now optional
          created_at?: string | null
          closed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_summaries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      bank_accounts: {
        Row: {
          id: string
          name: string
          bank_name: string
          iban: string | null
          account_number: string | null
          current_balance: number
          last_statement_date: string | null
          is_active: boolean
          user_id: string
          created_at: string
          updated_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          name: string
          bank_name: string
          iban?: string | null
          account_number?: string | null
          current_balance?: number
          last_statement_date?: string | null
          is_active?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          name?: string
          bank_name?: string
          iban?: string | null
          account_number?: string | null
          current_balance?: number
          last_statement_date?: string | null
          is_active?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      bank_transactions: {
        Row: {
          id: string
          bank_account_id: string
          transaction_date: string
          booking_date: string | null
          amount: number
          description: string
          reference: string | null
          transaction_code: string | null
          import_batch_id: string | null
          import_filename: string | null
          import_date: string
          raw_data: Json | null
          status: 'unmatched' | 'matched' | 'ignored'
          user_id: string
          created_at: string
          updated_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          bank_account_id: string
          transaction_date: string
          booking_date?: string | null
          amount: number
          description: string
          reference?: string | null
          transaction_code?: string | null
          import_batch_id?: string | null
          import_filename?: string | null
          import_date?: string
          raw_data?: Json | null
          status?: 'unmatched' | 'matched' | 'ignored'
          user_id: string
          created_at?: string
          updated_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          bank_account_id?: string
          transaction_date?: string
          booking_date?: string | null
          amount?: number
          description?: string
          reference?: string | null
          transaction_code?: string | null
          import_batch_id?: string | null
          import_filename?: string | null
          import_date?: string
          raw_data?: Json | null
          status?: 'unmatched' | 'matched' | 'ignored'
          user_id?: string
          created_at?: string
          updated_at?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      provider_reports: {
        Row: {
          id: string
          provider: 'twint' | 'sumup'
          transaction_date: string
          settlement_date: string | null
          gross_amount: number
          fees: number
          net_amount: number
          provider_transaction_id: string | null
          provider_reference: string | null
          payment_method: string | null
          currency: string
          import_filename: string
          import_date: string
          raw_data: Json | null
          sale_id: string | null
          status: 'unmatched' | 'matched' | 'discrepancy'
          user_id: string
          created_at: string
          updated_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          provider: 'twint' | 'sumup'
          transaction_date: string
          settlement_date?: string | null
          gross_amount: number
          fees?: number
          net_amount: number
          provider_transaction_id?: string | null
          provider_reference?: string | null
          payment_method?: string | null
          currency?: string
          import_filename: string
          import_date?: string
          raw_data?: Json | null
          sale_id?: string | null
          status?: 'unmatched' | 'matched' | 'discrepancy'
          user_id: string
          created_at?: string
          updated_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          provider?: 'twint' | 'sumup'
          transaction_date?: string
          settlement_date?: string | null
          gross_amount?: number
          fees?: number
          net_amount?: number
          provider_transaction_id?: string | null
          provider_reference?: string | null
          payment_method?: string | null
          currency?: string
          import_filename?: string
          import_date?: string
          raw_data?: Json | null
          sale_id?: string | null
          status?: 'unmatched' | 'matched' | 'discrepancy'
          user_id?: string
          created_at?: string
          updated_at?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_reports_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      transaction_matches: {
        Row: {
          id: string
          bank_transaction_id: string
          matched_type: 'sale' | 'expense' | 'provider_batch' | 'cash_movement'
          matched_id: string
          matched_amount: number
          match_confidence: number
          match_type: 'automatic' | 'manual' | 'suggested'
          matched_by: string | null
          matched_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          bank_transaction_id: string
          matched_type: 'sale' | 'expense' | 'provider_batch' | 'cash_movement'
          matched_id: string
          matched_amount: number
          match_confidence?: number
          match_type?: 'automatic' | 'manual' | 'suggested'
          matched_by?: string | null
          matched_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          bank_transaction_id?: string
          matched_type?: 'sale' | 'expense' | 'provider_batch' | 'cash_movement'
          matched_id?: string
          matched_amount?: number
          match_confidence?: number
          match_type?: 'automatic' | 'manual' | 'suggested'
          matched_by?: string | null
          matched_at?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_matches_bank_transaction_id_fkey"
            columns: ["bank_transaction_id"]
            isOneToOne: false
            referencedRelation: "bank_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_matches_matched_by_fkey"
            columns: ["matched_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          name: string
          username: string
          email: string
          role: 'admin' | 'staff'
          active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          username: string
          email: string
          role?: 'admin' | 'staff'
          active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          username?: string
          email?: string
          role?: 'admin' | 'staff'
          active?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      recent_missing_closures: {
        Row: {
          missing_date: string | null
          sales_count: number | null
          sales_total: number | null
          has_draft_summary: boolean | null
          days_ago: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_daily_summary: {
        Args: {
          summary_date: string
        }
        Returns: undefined
      }
      calculate_monthly_summary: {
        Args: {
          summary_year: number
          summary_month: number
        }
        Returns: undefined
      }
      get_current_cash_balance: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      find_missing_daily_closures: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: {
          missing_date: string
          sales_count: number
          sales_total: number
          has_draft_summary: boolean
        }[]
      }
      validate_monthly_closure_prerequisites: {
        Args: {
          check_year: number
          check_month: number
        }
        Returns: {
          is_valid: boolean
          missing_count: number
          missing_dates: string[]
        }[]
      }
      create_daily_summary_for_date: {
        Args: {
          target_date: string
          cash_starting?: number
          cash_ending?: number
          notes?: string
        }
        Returns: {
          success: boolean
          summary_id: string | null
          error_message: string | null
        }[]
      }
      bulk_close_daily_summaries: {
        Args: {
          target_dates: string[]
          default_cash_starting?: number
          default_cash_ending?: number
          default_notes?: string
        }
        Returns: {
          processed_date: string
          success: boolean
          summary_id: string | null
          error_message: string | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never