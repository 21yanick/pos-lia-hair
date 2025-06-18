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
  Loader2,
  CreditCard,
  CheckCircle,
  Download,
  AlertTriangle,
  Wallet,
  Search,
  Calendar,
  AlertCircle,
  Trash2,
  Plus,
  FileText,
  ChevronRight,
  Check,
  Upload,
  ChevronLeft,
  CheckCircle2,
  Zap,
  X,
  Minus,
  Pencil,
  ShoppingBag,
  Smartphone,
  Package,
  Heart,
  Scissors,
  Mail,
  Eye,
  Building,
  Building2,
  Receipt,
  TrendingUp,
  TrendingDown,
  Clock,
  FileUp,
  ArrowLeft,
  DollarSign,
  BookOpen,
  BarChart4
} from 'lucide-react'

// Export commonly used icon types
export type IconType = React.ComponentType<{ className?: string; size?: number }>