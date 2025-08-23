// POS Module Types
// Exportiert alle POS-spezifischen Types für externe Verwendung

export type {
  PaymentMethod,
  ProductTab,
  TransactionResult,
} from '@/shared/hooks/business/usePOSState' // V6.1 Pattern 16: Import Path Correction
export type {
  CartItem,
  CreateSaleData,
  Sale,
  SaleInsert,
  SaleItem,
  SaleItemInsert,
  SaleUpdate,
} from '@/shared/hooks/business/useSales'
