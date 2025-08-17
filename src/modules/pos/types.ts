// POS Module Types
// Exportiert alle POS-spezifischen Types für externe Verwendung

export type {
  CartItem,
  CreateSaleData,
  Sale,
  SaleInsert,
  SaleItem,
  SaleItemInsert,
  SaleUpdate,
} from '@/shared/hooks/business/useSales'
export type { PaymentMethod, ProductTab, TransactionResult } from './hooks/usePOSState'
