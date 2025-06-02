import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Sale, CartItem } from '@/shared/hooks/business/useSales'

interface ReceiptPDFProps {
  sale: Sale
  items: CartItem[]
}

// PDF-Styles für Quittungen
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'left',
  },
  info: {
    fontSize: 12,
    marginBottom: 8,
    color: '#333333',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  itemsContainer: {
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    fontSize: 11,
  },
  itemName: {
    flex: 2,
    fontSize: 11,
  },
  itemQuantity: {
    flex: 0.5,
    textAlign: 'center',
    fontSize: 11,
  },
  itemPrice: {
    flex: 1,
    textAlign: 'right',
    fontSize: 11,
  },
  itemTotal: {
    flex: 1,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: 'bold',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    marginVertical: 10,
  },
  totalSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#333333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentMethod: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666666',
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
  },
  businessInfo: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 5,
  }
})

// Zahlungsmethoden-Labels
const getPaymentMethodLabel = (method: string): string => {
  switch (method) {
    case 'cash': return 'Barzahlung'
    case 'twint': return 'TWINT'
    case 'sumup': return 'Kartenzahlung (SumUp)'
    default: return method
  }
}

export const ReceiptPDF: React.FC<ReceiptPDFProps> = ({ sale, items }) => {
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('de-CH')
  const formattedTime = currentDate.toLocaleTimeString('de-CH')
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>QUITTUNG</Text>
          <Text style={styles.businessInfo}>POS LIA HAIR</Text>
          <Text style={styles.businessInfo}>Ihr Friseursalon</Text>
        </View>

        {/* Belegdaten */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={styles.infoLabel}>Belegnummer:</Text>
            <Text style={styles.info}>{sale.receipt_number || sale.id}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={styles.infoLabel}>Datum:</Text>
            <Text style={styles.info}>{formattedDate}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={styles.infoLabel}>Uhrzeit:</Text>
            <Text style={styles.info}>{formattedTime}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Artikel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ARTIKEL</Text>
          
          {/* Tabellen-Header */}
          <View style={[styles.itemRow, { marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#cccccc', paddingBottom: 4 }]}>
            <Text style={[styles.itemName, { fontWeight: 'bold' }]}>Artikel</Text>
            <Text style={[styles.itemQuantity, { fontWeight: 'bold' }]}>Anz.</Text>
            <Text style={[styles.itemPrice, { fontWeight: 'bold' }]}>Preis</Text>
            <Text style={[styles.itemTotal, { fontWeight: 'bold' }]}>Total</Text>
          </View>

          {/* Artikel-Liste */}
          <View style={styles.itemsContainer}>
            {items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <Text style={styles.itemPrice}>CHF {item.price.toFixed(2)}</Text>
                <Text style={styles.itemTotal}>CHF {item.total.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Gesamtsumme */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>GESAMTBETRAG:</Text>
            <Text style={styles.totalAmount}>CHF {sale.total_amount.toFixed(2)}</Text>
          </View>
          <Text style={styles.paymentMethod}>
            Bezahlt mit: {getPaymentMethodLabel(sale.payment_method)}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.businessInfo}>Vielen Dank für Ihren Besuch!</Text>
          <Text style={styles.businessInfo}>
            Erstellt am: {formattedDate} um {formattedTime}
          </Text>
        </View>
      </Page>
    </Document>
  )
}