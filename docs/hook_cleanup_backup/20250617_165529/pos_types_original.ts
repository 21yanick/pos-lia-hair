// POS Module Types
// Exportiert alle POS-spezifischen Types für externe Verwendung

export type { PaymentMethod, ProductTab, TransactionResult } from './hooks/usePOSState'
export type { Sale, SaleInsert, SaleUpdate, SaleItem, SaleItemInsert, CartItem, CreateSaleData } from '@/shared/hooks/business/useSales'