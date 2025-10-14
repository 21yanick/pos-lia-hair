import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type React from 'react'
import type { CartItem, Sale } from '@/shared/hooks/business/useSales'
import type { BusinessSettings } from '@/shared/types/businessSettings'
import { formatDateForDisplay, formatTimeForDisplay } from '@/shared/utils/dateUtils'

interface ReceiptPDFProps {
  sale: Sale
  items: CartItem[]
  businessSettings?: BusinessSettings | null
}

// PDF-Styles für professionelle Quittungen
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },

  // Header Section
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  logoSection: {
    width: '30%',
    alignItems: 'flex-start',
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
    marginBottom: 10,
  },
  titleSection: {
    width: '40%',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#2c3e50',
    letterSpacing: 2,
  },
  companySection: {
    width: '30%',
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
    textAlign: 'right',
  },
  companyTagline: {
    fontSize: 10,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'right',
  },

  // Receipt Info Section
  receiptInfoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 4,
    marginBottom: 20,
  },

  // Customer Section
  customerSection: {
    backgroundColor: '#e8f4fd',
    padding: 15,
    borderRadius: 4,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#3498db',
  },
  customerLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  customerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
  },
  receiptInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptInfoLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#34495e',
    width: '40%',
  },
  receiptInfoValue: {
    fontSize: 11,
    color: '#2c3e50',
    textAlign: 'right',
    width: '60%',
  },

  // Items Section
  itemsSection: {
    marginBottom: 30,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  itemsTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#ecf0f1',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  itemsTableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  itemName: {
    flex: 3,
    fontSize: 11,
    color: '#2c3e50',
  },
  itemNameHeader: {
    flex: 3,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#34495e',
  },
  itemQuantity: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: '#2c3e50',
  },
  itemQuantityHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#34495e',
  },
  itemPrice: {
    flex: 1.5,
    textAlign: 'right',
    fontSize: 11,
    color: '#2c3e50',
  },
  itemPriceHeader: {
    flex: 1.5,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#34495e',
  },
  itemTotal: {
    flex: 1.5,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  itemTotalHeader: {
    flex: 1.5,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#34495e',
  },

  // Total Section
  totalSection: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 4,
    marginBottom: 30,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Footer Section
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 15,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLeft: {
    width: '48%',
  },
  footerRight: {
    width: '48%',
    alignItems: 'flex-end',
  },
  footerText: {
    fontSize: 9,
    color: '#95a5a6',
    marginBottom: 3,
  },
  footerThankYou: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#3498db',
    textAlign: 'center',
    marginBottom: 10,
  },

  // Company details in footer
  companyDetails: {
    fontSize: 8,
    color: '#7f8c8d',
    lineHeight: 1.4,
  },
})

// Zahlungsmethoden-Labels
const getPaymentMethodLabel = (method: string): string => {
  switch (method) {
    case 'cash':
      return 'Barzahlung'
    case 'twint':
      return 'TWINT'
    case 'sumup':
      return 'Kartenzahlung (SumUp)'
    default:
      return method
  }
}

export const ReceiptPDF: React.FC<ReceiptPDFProps> = ({ sale, items, businessSettings }) => {
  // ✅ Use ORIGINAL sale date, not current time (Swiss compliance requirement)
  // Defensive: created_at should always exist (PostgreSQL DEFAULT now()), but TypeScript requires null check
  const saleDate = sale.created_at ? new Date(sale.created_at) : new Date()
  const formattedDate = formatDateForDisplay(saleDate)
  const formattedTime = formatTimeForDisplay(saleDate)

  // Helper function to get company address
  const getCompanyAddress = () => {
    if (!businessSettings) return ''
    const parts = []
    if (businessSettings.company_address) parts.push(businessSettings.company_address)
    if (businessSettings.company_postal_code && businessSettings.company_city) {
      parts.push(`${businessSettings.company_postal_code} ${businessSettings.company_city}`)
    }
    return parts.join('\n')
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Professional Header */}
        <View style={styles.headerContainer}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            {businessSettings?.logo_url && businessSettings?.pdf_show_logo && (
              <Image src={businessSettings.logo_url} style={styles.logo} />
            )}
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>QUITTUNG</Text>
          </View>

          {/* Company Section */}
          <View style={styles.companySection}>
            <Text style={styles.companyName}>
              {businessSettings?.company_name || 'POS LIA HAIR'}
            </Text>
            {businessSettings?.company_tagline && (
              <Text style={styles.companyTagline}>{businessSettings.company_tagline}</Text>
            )}
          </View>
        </View>

        {/* Receipt Information */}
        <View style={styles.receiptInfoContainer}>
          <View style={styles.receiptInfoRow}>
            <Text style={styles.receiptInfoLabel}>Belegnummer:</Text>
            <Text style={styles.receiptInfoValue}>{sale.receipt_number || sale.id}</Text>
          </View>
          <View style={styles.receiptInfoRow}>
            <Text style={styles.receiptInfoLabel}>Datum:</Text>
            <Text style={styles.receiptInfoValue}>{formattedDate}</Text>
          </View>
          <View style={styles.receiptInfoRow}>
            <Text style={styles.receiptInfoLabel}>Uhrzeit:</Text>
            <Text style={styles.receiptInfoValue}>{formattedTime}</Text>
          </View>
        </View>

        {/* Customer Section */}
        <View style={styles.customerSection}>
          <Text style={styles.customerLabel}>Kunde:</Text>
          <Text style={styles.customerName}>{sale.customer_name || 'Laufkundschaft'}</Text>
        </View>

        {/* Items Section */}
        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>VERKAUFTE ARTIKEL</Text>

          {/* Table Header */}
          <View style={styles.itemsTableHeader}>
            <Text style={styles.itemNameHeader}>Artikel</Text>
            <Text style={styles.itemQuantityHeader}>Anz.</Text>
            <Text style={styles.itemPriceHeader}>Preis</Text>
            <Text style={styles.itemTotalHeader}>Total</Text>
          </View>

          {/* Table Rows */}
          {items.map((item) => (
            <View key={item.id} style={styles.itemsTableRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>{item.quantity}×</Text>
              <Text style={styles.itemPrice}>CHF {item.price.toFixed(2)}</Text>
              <Text style={styles.itemTotal}>CHF {item.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Total Section */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>GESAMTBETRAG</Text>
            <Text style={styles.totalAmount}>CHF {sale.total_amount.toFixed(2)}</Text>
          </View>
          <Text style={styles.paymentMethod}>
            Bezahlt mit: {getPaymentMethodLabel(sale.payment_method)}
          </Text>
        </View>

        {/* Professional Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerThankYou}>Vielen Dank für Ihren Besuch!</Text>

          <View style={styles.footerContent}>
            {/* Left: Company Details */}
            <View style={styles.footerLeft}>
              {businessSettings?.pdf_show_company_details && (
                <View>
                  <Text style={styles.companyDetails}>{businessSettings.company_name}</Text>
                  {getCompanyAddress() && (
                    <Text style={styles.companyDetails}>{getCompanyAddress()}</Text>
                  )}
                  {businessSettings.company_phone && (
                    <Text style={styles.companyDetails}>Tel: {businessSettings.company_phone}</Text>
                  )}
                  {businessSettings.company_email && (
                    <Text style={styles.companyDetails}>{businessSettings.company_email}</Text>
                  )}
                  {businessSettings.company_uid && (
                    <Text style={styles.companyDetails}>UID: {businessSettings.company_uid}</Text>
                  )}
                </View>
              )}
            </View>

            {/* Right: Receipt Info */}
            <View style={styles.footerRight}>
              <Text style={styles.footerText}>
                Verkauft: {formattedDate} {formattedTime}
              </Text>
              <Text style={styles.footerText}>Beleg: {sale.receipt_number || sale.id}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
