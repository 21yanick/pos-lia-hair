export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      appointment_services: {
        Row: {
          appointment_id: string
          created_at: string | null
          id: string
          item_id: string
          service_duration_minutes: number | null
          service_notes: string | null
          service_price: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          id?: string
          item_id: string
          service_duration_minutes?: number | null
          service_notes?: string | null
          service_price?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          id?: string
          item_id?: string
          service_duration_minutes?: number | null
          service_notes?: string | null
          service_price?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'appointment_services_appointment_id_fkey'
            columns: ['appointment_id']
            isOneToOne: false
            referencedRelation: 'appointments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointment_services_appointment_id_fkey'
            columns: ['appointment_id']
            isOneToOne: false
            referencedRelation: 'appointments_with_services'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointment_services_item_id_fkey'
            columns: ['item_id']
            isOneToOne: false
            referencedRelation: 'items'
            referencedColumns: ['id']
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          end_time: string
          estimated_price: number | null
          id: string
          notes: string | null
          organization_id: string
          start_time: string
          title: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          appointment_date: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          end_time: string
          estimated_price?: number | null
          id?: string
          notes?: string | null
          organization_id: string
          start_time: string
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          appointment_date?: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          end_time?: string
          estimated_price?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          start_time?: string
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'appointments_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customer_activity_summary'
            referencedColumns: ['customer_id']
          },
          {
            foreignKeyName: 'appointments_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          id: string
          ip_address: unknown | null
          is_immutable: boolean | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          record_id: string
          session_id: string | null
          table_name: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown | null
          is_immutable?: boolean | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          record_id: string
          session_id?: string | null
          table_name: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown | null
          is_immutable?: boolean | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          record_id?: string
          session_id?: string | null
          table_name?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_type: string
          bank_name: string
          bic: string | null
          created_at: string
          currency: string
          current_balance: number
          iban: string
          id: string
          is_active: boolean
          last_transaction_date: string | null
          notes: string | null
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          account_name: string
          account_type?: string
          bank_name: string
          bic?: string | null
          created_at?: string
          currency?: string
          current_balance?: number
          iban: string
          id?: string
          is_active?: boolean
          last_transaction_date?: string | null
          notes?: string | null
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_type?: string
          bank_name?: string
          bic?: string | null
          created_at?: string
          currency?: string
          current_balance?: number
          iban?: string
          id?: string
          is_active?: boolean
          last_transaction_date?: string | null
          notes?: string | null
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bank_accounts_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      bank_reconciliation_matches: {
        Row: {
          amount_difference: number | null
          bank_transaction_id: string | null
          confidence_score: number | null
          created_at: string | null
          created_by: string | null
          expense_id: string | null
          id: string
          match_type: string
          notes: string | null
          organization_id: string | null
          provider_report_id: string | null
          reviewed_at: string | null
          sale_id: string | null
          session_id: string
          status: string | null
        }
        Insert: {
          amount_difference?: number | null
          bank_transaction_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          expense_id?: string | null
          id?: string
          match_type: string
          notes?: string | null
          organization_id?: string | null
          provider_report_id?: string | null
          reviewed_at?: string | null
          sale_id?: string | null
          session_id: string
          status?: string | null
        }
        Update: {
          amount_difference?: number | null
          bank_transaction_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          expense_id?: string | null
          id?: string
          match_type?: string
          notes?: string | null
          organization_id?: string | null
          provider_report_id?: string | null
          reviewed_at?: string | null
          sale_id?: string | null
          session_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'bank_reconciliation_matches_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bank_reconciliation_matches_session_id_fkey'
            columns: ['session_id']
            isOneToOne: false
            referencedRelation: 'bank_reconciliation_sessions'
            referencedColumns: ['id']
          },
        ]
      }
      bank_reconciliation_sessions: {
        Row: {
          bank_entries_count: number | null
          bank_entries_total_amount: number | null
          bank_statement_filename: string | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string | null
          created_by: string | null
          id: string
          matched_entries_count: number | null
          month: number
          organization_id: string | null
          status: string | null
          unmatched_entries_count: number | null
          year: number
        }
        Insert: {
          bank_entries_count?: number | null
          bank_entries_total_amount?: number | null
          bank_statement_filename?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          matched_entries_count?: number | null
          month: number
          organization_id?: string | null
          status?: string | null
          unmatched_entries_count?: number | null
          year: number
        }
        Update: {
          bank_entries_count?: number | null
          bank_entries_total_amount?: number | null
          bank_statement_filename?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          matched_entries_count?: number | null
          month?: number
          organization_id?: string | null
          status?: string | null
          unmatched_entries_count?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: 'bank_reconciliation_sessions_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      bank_transactions: {
        Row: {
          amount: number
          bank_account_id: string
          counterparty_iban: string | null
          counterparty_name: string | null
          created_at: string
          currency: string
          description: string
          id: string
          import_filename: string | null
          matched_expense_id: string | null
          matched_sale_id: string | null
          organization_id: string | null
          raw_data: Json | null
          reference: string | null
          status: string
          transaction_date: string
          transaction_number: string | null
          transaction_type: string | null
          value_date: string | null
        }
        Insert: {
          amount: number
          bank_account_id: string
          counterparty_iban?: string | null
          counterparty_name?: string | null
          created_at?: string
          currency?: string
          description: string
          id?: string
          import_filename?: string | null
          matched_expense_id?: string | null
          matched_sale_id?: string | null
          organization_id?: string | null
          raw_data?: Json | null
          reference?: string | null
          status?: string
          transaction_date: string
          transaction_number?: string | null
          transaction_type?: string | null
          value_date?: string | null
        }
        Update: {
          amount?: number
          bank_account_id?: string
          counterparty_iban?: string | null
          counterparty_name?: string | null
          created_at?: string
          currency?: string
          description?: string
          id?: string
          import_filename?: string | null
          matched_expense_id?: string | null
          matched_sale_id?: string | null
          organization_id?: string | null
          raw_data?: Json | null
          reference?: string | null
          status?: string
          transaction_date?: string
          transaction_number?: string | null
          transaction_type?: string | null
          value_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'bank_transactions_bank_account_id_fkey'
            columns: ['bank_account_id']
            isOneToOne: false
            referencedRelation: 'bank_accounts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bank_transactions_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      business_settings: {
        Row: {
          app_logo_dark_storage_path: string | null
          app_logo_dark_url: string | null
          app_logo_light_storage_path: string | null
          app_logo_light_url: string | null
          booking_rules: Json
          company_address: string | null
          company_city: string | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          company_postal_code: string | null
          company_tagline: string | null
          company_uid: string | null
          company_website: string | null
          created_at: string | null
          custom_expense_categories: Json | null
          custom_supplier_categories: Json | null
          default_currency: string | null
          display_preferences: Json
          id: string
          logo_storage_path: string | null
          logo_url: string | null
          organization_id: string
          pdf_show_company_details: boolean | null
          pdf_show_logo: boolean | null
          tax_rate: number | null
          updated_at: string | null
          vacation_periods: Json
          working_hours: Json
        }
        Insert: {
          app_logo_dark_storage_path?: string | null
          app_logo_dark_url?: string | null
          app_logo_light_storage_path?: string | null
          app_logo_light_url?: string | null
          booking_rules?: Json
          company_address?: string | null
          company_city?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_postal_code?: string | null
          company_tagline?: string | null
          company_uid?: string | null
          company_website?: string | null
          created_at?: string | null
          custom_expense_categories?: Json | null
          custom_supplier_categories?: Json | null
          default_currency?: string | null
          display_preferences?: Json
          id?: string
          logo_storage_path?: string | null
          logo_url?: string | null
          organization_id: string
          pdf_show_company_details?: boolean | null
          pdf_show_logo?: boolean | null
          tax_rate?: number | null
          updated_at?: string | null
          vacation_periods?: Json
          working_hours?: Json
        }
        Update: {
          app_logo_dark_storage_path?: string | null
          app_logo_dark_url?: string | null
          app_logo_light_storage_path?: string | null
          app_logo_light_url?: string | null
          booking_rules?: Json
          company_address?: string | null
          company_city?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_postal_code?: string | null
          company_tagline?: string | null
          company_uid?: string | null
          company_website?: string | null
          created_at?: string | null
          custom_expense_categories?: Json | null
          custom_supplier_categories?: Json | null
          default_currency?: string | null
          display_preferences?: Json
          id?: string
          logo_storage_path?: string | null
          logo_url?: string | null
          organization_id?: string
          pdf_show_company_details?: boolean | null
          pdf_show_logo?: boolean | null
          tax_rate?: number | null
          updated_at?: string | null
          vacation_periods?: Json
          working_hours?: Json
        }
        Relationships: [
          {
            foreignKeyName: 'business_settings_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      cash_movements: {
        Row: {
          amount: number
          bank_transaction_id: string | null
          banking_status: string | null
          created_at: string | null
          description: string
          id: string
          movement_number: string | null
          movement_type: string | null
          organization_id: string | null
          reference_id: string | null
          reference_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_transaction_id?: string | null
          banking_status?: string | null
          created_at?: string | null
          description: string
          id?: string
          movement_number?: string | null
          movement_type?: string | null
          organization_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_transaction_id?: string | null
          banking_status?: string | null
          created_at?: string | null
          description?: string
          id?: string
          movement_number?: string | null
          movement_type?: string | null
          organization_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'cash_movements_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'cash_movements_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      customer_notes: {
        Row: {
          block_name: string
          content: string
          created_at: string | null
          created_by: string | null
          customer_id: string
          id: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          block_name: string
          content: string
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          id?: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          block_name?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          id?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'customer_notes_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customer_activity_summary'
            referencedColumns: ['customer_id']
          },
          {
            foreignKeyName: 'customer_notes_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'customer_notes_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      customers: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'customers_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      daily_closure_locks: {
        Row: {
          closure_date: string
          locked_at: string | null
          locked_by: string
          organization_id: string | null
          status: string | null
        }
        Insert: {
          closure_date: string
          locked_at?: string | null
          locked_by: string
          organization_id?: string | null
          status?: string | null
        }
        Update: {
          closure_date?: string
          locked_at?: string | null
          locked_by?: string
          organization_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'daily_closure_locks_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      daily_summaries: {
        Row: {
          cash_difference: number | null
          cash_ending: number | null
          cash_starting: number | null
          closed_at: string | null
          created_at: string
          created_by: string | null
          expenses_bank: number
          expenses_cash: number
          expenses_total: number
          id: string
          notes: string | null
          organization_id: string | null
          report_date: string
          sales_cash: number
          sales_sumup: number
          sales_total: number
          sales_twint: number
          status: string
        }
        Insert: {
          cash_difference?: number | null
          cash_ending?: number | null
          cash_starting?: number | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          expenses_bank?: number
          expenses_cash?: number
          expenses_total?: number
          id?: string
          notes?: string | null
          organization_id?: string | null
          report_date: string
          sales_cash?: number
          sales_sumup?: number
          sales_total?: number
          sales_twint?: number
          status?: string
        }
        Update: {
          cash_difference?: number | null
          cash_ending?: number | null
          cash_starting?: number | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          expenses_bank?: number
          expenses_cash?: number
          expenses_total?: number
          id?: string
          notes?: string | null
          organization_id?: string | null
          report_date?: string
          sales_cash?: number
          sales_sumup?: number
          sales_total?: number
          sales_twint?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: 'daily_summaries_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      document_sequences: {
        Row: {
          created_at: string
          current_number: number
          id: string
          organization_id: string | null
          prefix: string
          reset_yearly: boolean
          sequence_type: string
          suffix: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          current_number?: number
          id?: string
          organization_id?: string | null
          prefix?: string
          reset_yearly?: boolean
          sequence_type: string
          suffix?: string
          updated_at?: string
          year?: number
        }
        Update: {
          created_at?: string
          current_number?: number
          id?: string
          organization_id?: string | null
          prefix?: string
          reset_yearly?: boolean
          sequence_type?: string
          suffix?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: 'document_sequences_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          document_date: string
          document_number: string | null
          file_name: string | null
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          notes: string | null
          organization_id: string | null
          payment_method: string | null
          reference_id: string
          reference_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_date: string
          document_number?: string | null
          file_name?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          reference_id: string
          reference_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_date?: string
          document_number?: string | null
          file_name?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          reference_id?: string
          reference_type?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'documents_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          bank_transaction_id: string | null
          banking_status: string | null
          category: string
          created_at: string | null
          description: string
          id: string
          invoice_number: string | null
          notes: string | null
          organization_id: string
          payment_date: string
          payment_method: string
          receipt_number: string | null
          supplier_id: string | null
          supplier_name: string | null
          user_id: string
        }
        Insert: {
          amount: number
          bank_transaction_id?: string | null
          banking_status?: string | null
          category: string
          created_at?: string | null
          description: string
          id?: string
          invoice_number?: string | null
          notes?: string | null
          organization_id: string
          payment_date: string
          payment_method: string
          receipt_number?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bank_transaction_id?: string | null
          banking_status?: string | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          invoice_number?: string | null
          notes?: string | null
          organization_id?: string
          payment_date?: string
          payment_method?: string
          receipt_number?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'expenses_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'expenses_supplier_id_fkey'
            columns: ['supplier_id']
            isOneToOne: false
            referencedRelation: 'supplier_spending_analysis'
            referencedColumns: ['supplier_id']
          },
          {
            foreignKeyName: 'expenses_supplier_id_fkey'
            columns: ['supplier_id']
            isOneToOne: false
            referencedRelation: 'suppliers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'expenses_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      items: {
        Row: {
          active: boolean | null
          booking_buffer_minutes: number | null
          created_at: string | null
          default_price: number
          deleted: boolean | null
          duration_minutes: number | null
          id: string
          is_favorite: boolean | null
          name: string
          organization_id: string
          requires_booking: boolean | null
          type: string
        }
        Insert: {
          active?: boolean | null
          booking_buffer_minutes?: number | null
          created_at?: string | null
          default_price: number
          deleted?: boolean | null
          duration_minutes?: number | null
          id?: string
          is_favorite?: boolean | null
          name: string
          organization_id: string
          requires_booking?: boolean | null
          type: string
        }
        Update: {
          active?: boolean | null
          booking_buffer_minutes?: number | null
          created_at?: string | null
          default_price?: number
          deleted?: boolean | null
          duration_minutes?: number | null
          id?: string
          is_favorite?: boolean | null
          name?: string
          organization_id?: string
          requires_booking?: boolean | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: 'items_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      monthly_summaries: {
        Row: {
          avg_daily_revenue: number
          created_at: string
          created_by: string | null
          days_in_month: number
          expenses_bank: number
          expenses_cash: number
          expenses_total: number
          id: string
          month: number
          organization_id: string | null
          sales_cash: number
          sales_sumup: number
          sales_total: number
          sales_twint: number
          transaction_count: number
          year: number
        }
        Insert: {
          avg_daily_revenue?: number
          created_at?: string
          created_by?: string | null
          days_in_month: number
          expenses_bank?: number
          expenses_cash?: number
          expenses_total?: number
          id?: string
          month: number
          organization_id?: string | null
          sales_cash?: number
          sales_sumup?: number
          sales_total?: number
          sales_twint?: number
          transaction_count?: number
          year: number
        }
        Update: {
          avg_daily_revenue?: number
          created_at?: string
          created_by?: string | null
          days_in_month?: number
          expenses_bank?: number
          expenses_cash?: number
          expenses_total?: number
          id?: string
          month?: number
          organization_id?: string | null
          sales_cash?: number
          sales_sumup?: number
          sales_total?: number
          sales_twint?: number
          transaction_count?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: 'monthly_summaries_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      organization_users: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'organization_users_invited_by_fkey'
            columns: ['invited_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_users_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'organization_users_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      organizations: {
        Row: {
          active: boolean | null
          address: string | null
          city: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          postal_code: string | null
          settings: Json | null
          slug: string
          uid: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          postal_code?: string | null
          settings?: Json | null
          slug: string
          uid?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          postal_code?: string | null
          settings?: Json | null
          slug?: string
          uid?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      owner_transactions: {
        Row: {
          amount: number
          banking_status: string | null
          created_at: string | null
          description: string
          id: string
          notes: string | null
          organization_id: string | null
          payment_method: string
          related_bank_transaction_id: string | null
          related_expense_id: string | null
          transaction_date: string
          transaction_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          banking_status?: string | null
          created_at?: string | null
          description: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          payment_method: string
          related_bank_transaction_id?: string | null
          related_expense_id?: string | null
          transaction_date: string
          transaction_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          banking_status?: string | null
          created_at?: string | null
          description?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          payment_method?: string
          related_bank_transaction_id?: string | null
          related_expense_id?: string | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'owner_transactions_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      provider_reports: {
        Row: {
          bank_transaction_id: string | null
          created_at: string
          currency: string
          fees: number
          gross_amount: number
          id: string
          net_amount: number
          organization_id: string | null
          provider: string
          raw_data: Json | null
          report_date: string
          report_filename: string | null
          sale_id: string | null
          settlement_date: string | null
          status: string
          transaction_count: number
        }
        Insert: {
          bank_transaction_id?: string | null
          created_at?: string
          currency?: string
          fees: number
          gross_amount: number
          id?: string
          net_amount: number
          organization_id?: string | null
          provider: string
          raw_data?: Json | null
          report_date: string
          report_filename?: string | null
          sale_id?: string | null
          settlement_date?: string | null
          status?: string
          transaction_count: number
        }
        Update: {
          bank_transaction_id?: string | null
          created_at?: string
          currency?: string
          fees?: number
          gross_amount?: number
          id?: string
          net_amount?: number
          organization_id?: string | null
          provider?: string
          raw_data?: Json | null
          report_date?: string
          report_filename?: string | null
          sale_id?: string | null
          settlement_date?: string | null
          status?: string
          transaction_count?: number
        }
        Relationships: [
          {
            foreignKeyName: 'provider_reports_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'provider_reports_sale_id_fkey'
            columns: ['sale_id']
            isOneToOne: false
            referencedRelation: 'sales'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'provider_reports_sale_id_fkey'
            columns: ['sale_id']
            isOneToOne: false
            referencedRelation: 'unmatched_sales_for_provider'
            referencedColumns: ['id']
          },
        ]
      }
      sale_items: {
        Row: {
          id: string
          item_id: string | null
          notes: string | null
          organization_id: string
          price: number
          quantity: number
          sale_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          item_id?: string | null
          notes?: string | null
          organization_id: string
          price: number
          quantity?: number
          sale_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          item_id?: string | null
          notes?: string | null
          organization_id?: string
          price?: number
          quantity?: number
          sale_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sale_items_item_id_fkey'
            columns: ['item_id']
            isOneToOne: false
            referencedRelation: 'items'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sale_items_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sale_items_sale_id_fkey'
            columns: ['sale_id']
            isOneToOne: false
            referencedRelation: 'sales'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sale_items_sale_id_fkey'
            columns: ['sale_id']
            isOneToOne: false
            referencedRelation: 'unmatched_sales_for_provider'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sale_items_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      sales: {
        Row: {
          bank_transaction_id: string | null
          banking_status: string | null
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          gross_amount: number | null
          id: string
          net_amount: number | null
          notes: string | null
          organization_id: string
          payment_method: string
          provider_fee: number | null
          provider_reference_id: string | null
          provider_report_id: string | null
          receipt_number: string | null
          settlement_date: string | null
          settlement_status: string | null
          status: string
          total_amount: number
          user_id: string
        }
        Insert: {
          bank_transaction_id?: string | null
          banking_status?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          gross_amount?: number | null
          id?: string
          net_amount?: number | null
          notes?: string | null
          organization_id: string
          payment_method: string
          provider_fee?: number | null
          provider_reference_id?: string | null
          provider_report_id?: string | null
          receipt_number?: string | null
          settlement_date?: string | null
          settlement_status?: string | null
          status?: string
          total_amount: number
          user_id: string
        }
        Update: {
          bank_transaction_id?: string | null
          banking_status?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          gross_amount?: number | null
          id?: string
          net_amount?: number | null
          notes?: string | null
          organization_id?: string
          payment_method?: string
          provider_fee?: number | null
          provider_reference_id?: string | null
          provider_report_id?: string | null
          receipt_number?: string | null
          settlement_date?: string | null
          settlement_status?: string | null
          status?: string
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sales_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customer_activity_summary'
            referencedColumns: ['customer_id']
          },
          {
            foreignKeyName: 'sales_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sales_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sales_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      suppliers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          category: Database['public']['Enums']['supplier_category'] | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          iban: string | null
          id: string
          is_active: boolean | null
          name: string
          normalized_name: string
          notes: string | null
          organization_id: string | null
          postal_code: string | null
          updated_at: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          category?: Database['public']['Enums']['supplier_category'] | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          iban?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          normalized_name: string
          notes?: string | null
          organization_id?: string | null
          postal_code?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          category?: Database['public']['Enums']['supplier_category'] | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          iban?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          normalized_name?: string
          notes?: string | null
          organization_id?: string | null
          postal_code?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'suppliers_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'suppliers_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          active: boolean | null
          created_at: string | null
          email: string
          id: string
          name: string
          role: string
          username: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          role?: string
          username: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      appointments_with_services: {
        Row: {
          appointment_date: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          end_time: string | null
          estimated_price: number | null
          id: string | null
          notes: string | null
          organization_id: string | null
          services: Json | null
          start_time: string | null
          title: string | null
          total_duration_minutes: number | null
          total_price: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'appointments_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customer_activity_summary'
            referencedColumns: ['customer_id']
          },
          {
            foreignKeyName: 'appointments_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      available_for_bank_matching: {
        Row: {
          amount: number | null
          banking_status: string | null
          date: string | null
          description: string | null
          id: string | null
          item_type: string | null
          organization_id: string | null
        }
        Relationships: []
      }
      customer_activity_summary: {
        Row: {
          avg_transaction_value: number | null
          customer_id: string | null
          customer_name: string | null
          first_purchase_date: string | null
          last_purchase_date: string | null
          organization_id: string | null
          total_appointments: number | null
          total_sales: number | null
          total_spent: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'customers_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      monthly_financial_overview: {
        Row: {
          bank_expenses: number | null
          cash_expenses: number | null
          cash_revenue: number | null
          digital_revenue: number | null
          gross_revenue: number | null
          month: string | null
          net_profit: number | null
          organization_id: string | null
          total_expenses: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'sales_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      sales_performance_summary: {
        Row: {
          avg_transaction_value: number | null
          max_transaction: number | null
          min_transaction: number | null
          month: string | null
          organization_id: string | null
          payment_method: string | null
          total_revenue: number | null
          transaction_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'sales_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      supplier_spending_analysis: {
        Row: {
          avg_transaction_value: number | null
          category: Database['public']['Enums']['supplier_category'] | null
          first_transaction_date: string | null
          last_transaction_date: string | null
          organization_id: string | null
          supplier_id: string | null
          supplier_name: string | null
          total_spent: number | null
          transaction_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'suppliers_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      unified_transactions_view: {
        Row: {
          amount: number | null
          banking_status: string | null
          customer_id: string | null
          customer_name: string | null
          date_only: string | null
          description: string | null
          description_lower: string | null
          document_id: string | null
          has_pdf: boolean | null
          has_real_provider_fees: boolean | null
          id: string | null
          net_amount: number | null
          organization_id: string | null
          payment_method: string | null
          provider_fee: number | null
          provider_report_id: string | null
          receipt_number: string | null
          receipt_number_lower: string | null
          status: string | null
          time_only: string | null
          transaction_date: string | null
          transaction_type: string | null
          type_code: string | null
          user_id: string | null
        }
        Relationships: []
      }
      unmatched_bank_transactions: {
        Row: {
          amount: number | null
          amount_abs: number | null
          bank_account_id: string | null
          bank_account_name: string | null
          booking_date: string | null
          created_at: string | null
          description: string | null
          direction_display: string | null
          id: string | null
          import_batch_id: string | null
          import_date: string | null
          import_filename: string | null
          notes: string | null
          organization_id: string | null
          raw_data: Json | null
          reference: string | null
          status: string | null
          transaction_code: string | null
          transaction_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'bank_transactions_bank_account_id_fkey'
            columns: ['bank_account_id']
            isOneToOne: false
            referencedRelation: 'bank_accounts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bank_transactions_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
      unmatched_provider_reports: {
        Row: {
          created_at: string | null
          currency: string | null
          fees: number | null
          gross_amount: number | null
          id: string | null
          import_date: string | null
          import_filename: string | null
          net_amount: number | null
          notes: string | null
          organization_id: string | null
          payment_method: string | null
          provider: string | null
          provider_display: string | null
          provider_reference: string | null
          provider_transaction_id: string | null
          raw_data: Json | null
          sale_id: string | null
          settlement_date: string | null
          status: string | null
          transaction_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          fees?: number | null
          gross_amount?: number | null
          id?: string | null
          import_date?: string | null
          import_filename?: string | null
          net_amount?: number | null
          notes?: never
          organization_id?: string | null
          payment_method?: never
          provider?: string | null
          provider_display?: never
          provider_reference?: never
          provider_transaction_id?: never
          raw_data?: Json | null
          sale_id?: string | null
          settlement_date?: string | null
          status?: string | null
          transaction_date?: string | null
          updated_at?: string | null
          user_id?: never
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          fees?: number | null
          gross_amount?: number | null
          id?: string | null
          import_date?: string | null
          import_filename?: string | null
          net_amount?: number | null
          notes?: never
          organization_id?: string | null
          payment_method?: never
          provider?: string | null
          provider_display?: never
          provider_reference?: never
          provider_transaction_id?: never
          raw_data?: Json | null
          sale_id?: string | null
          settlement_date?: string | null
          status?: string | null
          transaction_date?: string | null
          updated_at?: string | null
          user_id?: never
        }
        Relationships: [
          {
            foreignKeyName: 'provider_reports_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'provider_reports_sale_id_fkey'
            columns: ['sale_id']
            isOneToOne: false
            referencedRelation: 'sales'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'provider_reports_sale_id_fkey'
            columns: ['sale_id']
            isOneToOne: false
            referencedRelation: 'unmatched_sales_for_provider'
            referencedColumns: ['id']
          },
        ]
      }
      unmatched_sales_for_provider: {
        Row: {
          bank_transaction_id: string | null
          banking_status: string | null
          created_at: string | null
          gross_amount: number | null
          id: string | null
          net_amount: number | null
          notes: string | null
          organization_id: string | null
          payment_display: string | null
          payment_method: string | null
          provider_fee: number | null
          provider_reference_id: string | null
          provider_report_id: string | null
          settlement_date: string | null
          settlement_status: string | null
          status: string | null
          total_amount: number | null
          user_id: string | null
        }
        Insert: {
          bank_transaction_id?: string | null
          banking_status?: string | null
          created_at?: string | null
          gross_amount?: number | null
          id?: string | null
          net_amount?: number | null
          notes?: string | null
          organization_id?: string | null
          payment_display?: never
          payment_method?: string | null
          provider_fee?: number | null
          provider_reference_id?: string | null
          provider_report_id?: string | null
          settlement_date?: string | null
          settlement_status?: string | null
          status?: string | null
          total_amount?: number | null
          user_id?: string | null
        }
        Update: {
          bank_transaction_id?: string | null
          banking_status?: string | null
          created_at?: string | null
          gross_amount?: number | null
          id?: string | null
          net_amount?: number | null
          notes?: string | null
          organization_id?: string | null
          payment_display?: never
          payment_method?: string | null
          provider_fee?: number | null
          provider_reference_id?: string | null
          provider_report_id?: string | null
          settlement_date?: string | null
          settlement_status?: string | null
          status?: string | null
          total_amount?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'sales_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sales_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Functions: {
      atomic_daily_closure: {
        Args: {
          expected_cash_end: number
          target_date: string
          user_id: string
        }
        Returns: {
          cash_variance: number
          error_message: string
          success: boolean
        }[]
      }
      bootstrap_organization_complete: {
        Args: { p_organization_id: string }
        Returns: Json
      }
      bootstrap_organization_sequences: {
        Args: { p_organization_id: string }
        Returns: Json
      }
      bulk_close_daily_summaries: {
        Args: {
          default_cash_ending?: number
          default_cash_starting?: number
          default_notes?: string
          target_dates: string[]
        }
        Returns: {
          error_message: string
          processed_date: string
          success: boolean
          summary_id: string
        }[]
      }
      calculate_daily_summary: {
        Args: { summary_date: string }
        Returns: undefined
      }
      calculate_monthly_summary: {
        Args: { summary_month: number; summary_year: number }
        Returns: undefined
      }
      check_duplicate_references: {
        Args: { p_bank_account_id: string; p_references: string[] }
        Returns: string[]
      }
      check_file_already_imported: {
        Args: { p_bank_account_id: string; p_filename: string }
        Returns: boolean
      }
      check_missing_business_functions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_period_overlap: {
        Args: {
          p_bank_account_id: string
          p_from_date: string
          p_to_date: string
        }
        Returns: boolean
      }
      complete_bank_reconciliation_session: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: boolean
      }
      create_bank_reconciliation_session: {
        Args: {
          p_bank_entries_count: number
          p_bank_entries_total_amount: number
          p_bank_statement_filename: string
          p_month: number
          p_user_id: string
          p_year: number
        }
        Returns: string
      }
      create_bank_transfer_cash_movement: {
        Args: {
          p_amount: number
          p_description: string
          p_direction: string
          p_organization_id: string
          p_user_id: string
        }
        Returns: string
      }
      create_daily_summary_for_date: {
        Args: {
          cash_ending?: number
          cash_starting?: number
          notes?: string
          target_date: string
        }
        Returns: {
          error_message: string
          success: boolean
          summary_id: string
        }[]
      }
      execute_exact_matches: {
        Args: Record<PropertyKey, never>
        Returns: {
          bank_amount: number
          bank_desc: string
          bank_id: string
          difference: number
          provider_amount: number
          provider_id: string
          provider_type: string
        }[]
      }
      find_missing_daily_closures: {
        Args: { end_date: string; start_date: string }
        Returns: {
          has_draft_summary: boolean
          missing_date: string
          sales_count: number
          sales_total: number
        }[]
      }
      generate_document_number: {
        Args: { doc_type: string }
        Returns: string
      }
      get_booking_rules: {
        Args: { p_organization_id: string }
        Returns: Json
      }
      get_current_cash_balance: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_current_cash_balance_for_org: {
        Args: { org_id: string }
        Returns: number
      }
      get_net_profit_for_period: {
        Args: { end_date: string; start_date: string }
        Returns: number
      }
      get_net_revenue_for_period: {
        Args: { end_date: string; start_date: string }
        Returns: number
      }
      get_next_receipt_number: {
        Args: { doc_type: string }
        Returns: string
      }
      get_or_create_supplier: {
        Args: { supplier_name_input: string; user_id_input?: string }
        Returns: string
      }
      get_owner_balance: {
        Args: { user_uuid: string }
        Returns: number
      }
      get_owner_loan_balance: {
        Args: { user_uuid: string }
        Returns: number
      }
      get_revenue_breakdown_for_period: {
        Args: { end_date: string; start_date: string }
        Returns: {
          cash_revenue: number
          gross_revenue: number
          net_revenue: number
          provider_revenue: number
          total_fees: number
        }[]
      }
      get_system_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_working_hours: {
        Args: { p_organization_id: string; p_weekday: string }
        Returns: Json
      }
      gtrgm_compress: {
        Args: { '': unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { '': unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { '': unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { '': unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { '': unknown }
        Returns: unknown
      }
      is_organization_open: {
        Args: { p_date: string; p_organization_id: string; p_time: string }
        Returns: boolean
      }
      normalize_supplier_name: {
        Args: { supplier_name: string }
        Returns: string
      }
      receipt_number_exists: {
        Args: { receipt_num: string; table_name: string }
        Returns: boolean
      }
      reset_sequence_for_year: {
        Args: { doc_type: string }
        Returns: undefined
      }
      run_performance_benchmark: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      set_limit: {
        Args: { '': number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { '': string }
        Returns: string[]
      }
      test_user_automation: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      validate_expense_category: {
        Args: { category_key: string; user_id_param: string }
        Returns: boolean
      }
      validate_rls_configuration: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      validate_system_health: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      validate_system_integrity: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      supplier_category:
        | 'beauty_supplies'
        | 'equipment'
        | 'utilities'
        | 'rent'
        | 'insurance'
        | 'professional_services'
        | 'retail'
        | 'online_marketplace'
        | 'real_estate'
        | 'other'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      supplier_category: [
        'beauty_supplies',
        'equipment',
        'utilities',
        'rent',
        'insurance',
        'professional_services',
        'retail',
        'online_marketplace',
        'real_estate',
        'other',
      ],
    },
  },
} as const
