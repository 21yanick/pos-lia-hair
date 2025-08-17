// POS Module Public API
// Definiert was andere Module und die App importieren können

export { ConfirmationDialog } from './components/ConfirmationDialog'
export { DeleteConfirmDialog } from './components/DeleteConfirmDialog'
export { EditPriceDialog } from './components/EditPriceDialog'
export { PaymentDialog } from './components/PaymentDialog'
// Main Page Component - Das ist meist das einzige was die App braucht
export { POSPage } from './components/POSPage'
// Individual Components (für spezielle Anwendungsfälle)
export { ProductGrid } from './components/ProductGrid'
export { ShoppingCart } from './components/ShoppingCart'

// Main Hooks - Public API
export { usePOS } from './hooks/usePOS'

// Types - Public API
export type {
  CartItem,
  CreateSaleData,
  PaymentMethod,
  ProductTab,
  Sale,
  TransactionResult,
} from './types'

// Individual hooks werden NICHT exportiert - sie sind Implementierungsdetails
// usePOSState, useSales sind nur intern im POS Modul verfügbar
