import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Expense } from '@/modules/expenses'

interface PlaceholderReceiptPDFProps {
  expense: Expense
  archiveLocation?: string
  createdBy?: string
}

// PDF-Styles für Platzhalter-Belege
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    width: '40%',
  },
  detailValue: {
    fontSize: 12,
    color: '#333333',
    width: '60%',
  },
  amountSection: {
    marginBottom: 25,
    padding: 20,
    backgroundColor: '#e3f2fd',
    borderRadius: 5,
    textAlign: 'center',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  archiveSection: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 5,
    border: '2 solid #ffc107',
  },
  archiveTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
    textAlign: 'center',
  },
  archiveText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 5,
  },
  footer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f1f1f1',
    borderRadius: 5,
  },
  footerText: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 3,
  },
  warningBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ffebee',
    borderRadius: 5,
    border: '2 solid #f44336',
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 8,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 10,
    color: '#c62828',
    textAlign: 'center',
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
  createdBy = "System"
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>BELEG-PLATZHALTER</Text>
          <Text style={styles.subtitle}>Physischer Original-Beleg archiviert</Text>
        </View>

        {/* Betrag - Prominent */}
        <View style={styles.amountSection}>
          <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        </View>

        {/* Expense Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ausgaben-Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Beschreibung:</Text>
            <Text style={styles.detailValue}>{expense.description}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Kategorie:</Text>
            <Text style={styles.detailValue}>{categoryLabels[expense.category] || expense.category}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Zahlungsdatum:</Text>
            <Text style={styles.detailValue}>{formatDate(expense.payment_date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Zahlungsmethode:</Text>
            <Text style={styles.detailValue}>{paymentMethodLabels[expense.payment_method] || expense.payment_method}</Text>
          </View>

          {expense.supplier_name && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Lieferant:</Text>
              <Text style={styles.detailValue}>{expense.supplier_name}</Text>
            </View>
          )}

          {expense.invoice_number && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rechnungsnummer:</Text>
              <Text style={styles.detailValue}>{expense.invoice_number}</Text>
            </View>
          )}

          {expense.notes && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notizen:</Text>
              <Text style={styles.detailValue}>{expense.notes}</Text>
            </View>
          )}
        </View>

        {/* Archive Information */}
        <View style={styles.archiveSection}>
          <Text style={styles.archiveTitle}>PHYSISCHER BELEG</Text>
          <Text style={styles.archiveText}>Original-Beleg archiviert in:</Text>
          <Text style={styles.archiveText} style={{fontWeight: 'bold', fontSize: 14}}>
            {archiveLocation}
          </Text>
        </View>

        {/* Document Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dokument-Informationen</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expense-ID:</Text>
            <Text style={styles.detailValue}>{expense.id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Erfasst von:</Text>
            <Text style={styles.detailValue}>{createdBy}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Erfasst am:</Text>
            <Text style={styles.detailValue}>{formatDate(expense.created_at)}</Text>
          </View>
        </View>

        {/* Warning */}
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>WICHTIGER HINWEIS</Text>
          <Text style={styles.warningText}>
            Dieser Platzhalter ersetzt NICHT den Original-Beleg!
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
            POS-LIA-HAIR System • {new Date().toLocaleDateString('de-DE')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}