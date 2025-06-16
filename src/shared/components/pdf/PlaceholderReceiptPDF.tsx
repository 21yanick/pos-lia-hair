import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import type { Expense } from '@/shared/types/expenses'
import type { BusinessSettings } from '@/shared/types/businessSettings'

interface PlaceholderReceiptPDFProps {
  expense: Expense
  archiveLocation?: string
  createdBy?: string
  businessSettings?: BusinessSettings | null
}

// Simple, compact PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 25,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  
  // Compact header
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: 'contain',
    marginBottom: 12,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#000000',
  },
  subtitle: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 20,
  },
  
  // Amount section - clean
  amountSection: {
    marginBottom: 25,
    padding: 15,
    textAlign: 'center',
    borderTop: '1 solid #000000',
    borderBottom: '1 solid #000000',
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  
  // Simple sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
    textTransform: 'uppercase',
  },
  
  // Detail rows - simple
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 10,
    color: '#666666',
    width: '35%',
  },
  detailValue: {
    fontSize: 10,
    color: '#000000',
    width: '65%',
  },
  
  // Archive section - minimal
  archiveSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  archiveTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  archiveText: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 4,
  },
  archiveLocation: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  
  // Warning section - simple
  warningSection: {
    marginBottom: 20,
    padding: 12,
    border: '1 solid #cccccc',
  },
  warningTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 6,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 3,
  },
  
  // Footer - compact
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: '1 solid #e0e0e0',
  },
  footerText: {
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 2,
  },
  
  // Document info - simple list
  documentInfo: {
    marginBottom: 20,
  },
})

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF'
  }).format(amount)
}

const categoryLabels: Record<string, string> = {
  rent: 'Miete',
  supplies: 'Einkauf/Material',
  salary: 'Lohn',
  utilities: 'Nebenkosten',
  insurance: 'Versicherung',
  other: 'Sonstiges'
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'Bargeld',
  bank: 'Banküberweisung'
}

export const PlaceholderReceiptPDF: React.FC<PlaceholderReceiptPDFProps> = ({ 
  expense, 
  archiveLocation = "Physisches Archiv",
  createdBy = "System",
  businessSettings
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Simple Header */}
        <View style={styles.header}>
          {businessSettings?.logo_url && businessSettings?.pdf_show_logo && (
            <Image src={businessSettings.logo_url} style={styles.logo} />
          )}
          <Text style={styles.title}>BELEG-PLATZHALTER</Text>
          <Text style={styles.subtitle}>Physischer Original-Beleg archiviert</Text>
        </View>

        {/* Amount */}
        <View style={styles.amountSection}>
          <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        </View>

        {/* Expense Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ausgaben-Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Beschreibung</Text>
            <Text style={styles.detailValue}>{expense.description}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Kategorie</Text>
            <Text style={styles.detailValue}>{categoryLabels[expense.category] || expense.category}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Zahlungsdatum</Text>
            <Text style={styles.detailValue}>{formatDate(expense.payment_date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Zahlungsmethode</Text>
            <Text style={styles.detailValue}>{paymentMethodLabels[expense.payment_method] || expense.payment_method}</Text>
          </View>

          {expense.supplier_name && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Lieferant</Text>
              <Text style={styles.detailValue}>{expense.supplier_name}</Text>
            </View>
          )}

          {expense.invoice_number && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rechnungsnummer</Text>
              <Text style={styles.detailValue}>{expense.invoice_number}</Text>
            </View>
          )}

          {expense.notes && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notizen</Text>
              <Text style={styles.detailValue}>{expense.notes}</Text>
            </View>
          )}
        </View>

        {/* Archive Information */}
        <View style={styles.archiveSection}>
          <Text style={styles.archiveTitle}>Original-Beleg Archiviert</Text>
          <Text style={styles.archiveText}>Physischer Beleg aufbewahrt in:</Text>
          <Text style={styles.archiveLocation}>{archiveLocation}</Text>
        </View>

        {/* Document Information - Simple List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dokument-Informationen</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Belegnummer</Text>
            <Text style={styles.detailValue}>{expense.receipt_number || expense.id.slice(0, 8)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Erfasst von</Text>
            <Text style={styles.detailValue}>{createdBy}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Erfasst am</Text>
            <Text style={styles.detailValue}>{formatDate(expense.created_at)}</Text>
          </View>
        </View>

        {/* Warning */}
        <View style={styles.warningSection}>
          <Text style={styles.warningTitle}>Wichtiger Hinweis</Text>
          <Text style={styles.warningText}>
            Dieser Platzhalter ersetzt nicht den Original-Beleg.
          </Text>
          <Text style={styles.warningText}>
            Der physische Beleg muss gemäß den gesetzlichen Bestimmungen aufbewahrt werden.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Automatisch generierter Beleg-Platzhalter
          </Text>
          <Text style={styles.footerText}>
            {businessSettings?.company_name || 'POS-LIA-HAIR'} System
          </Text>
        </View>
      </Page>
    </Document>
  )
}