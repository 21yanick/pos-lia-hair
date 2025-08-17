/**
 * Centralized Icon Exports
 *
 * This file consolidates all lucide-react icons used across the application
 * to enable better tree-shaking and reduce bundle size.
 *
 * Instead of importing icons individually throughout the app,
 * import them from this centralized location.
 */

// Most used icons (20+ uses)
export {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BarChart4,
  BookOpen,
  Building,
  Building2,
  Calendar,
  Check,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  FileText,
  FileUp,
  Heart,
  Loader2,
  Mail,
  Minus,
  Package,
  Pencil,
  Plus,
  Receipt,
  Scissors,
  Search,
  ShoppingBag,
  Smartphone,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  Wallet,
  X,
  Zap,
} from 'lucide-react'

// Export commonly used icon types
export type IconType = React.ComponentType<{ className?: string; size?: number }>
