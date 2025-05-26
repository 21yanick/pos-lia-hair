'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatDateForDisplay } from '@/lib/utils/dateUtils'
import type { DailySummary, TransactionItem } from '@/app/(auth)/reports/daily/utils/dailyTypes'

export type DailyReportPDFProps = {
  summary: DailySummary
  transactions: TransactionItem[]
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 50,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000000',
  },
  dateInfo: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reportId: {
    fontSize: 12,
    marginBottom: 20,
    color: '#666666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000000',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 20,
  },
  label: {
    fontSize: 12,
    width: 120,
    color: '#000000',
  },
  value: {
    fontSize: 12,
    color: '#000000',
  },
  boldValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 20,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 120,
    color: '#000000',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  differencePositive: {
    fontSize: 12,
    color: '#008000',
    fontWeight: 'bold',
  },
  differenceNegative: {
    fontSize: 12,
    color: '#CC0000',
    fontWeight: 'bold',
  },
  transactionHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 20,
    fontWeight: 'bold',
  },
  transactionRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 20,
  },
  timeColumn: {
    fontSize: 11,
    width: 60,
  },
  methodColumn: {
    fontSize: 11,
    width: 80,
  },
  amountColumn: {
    fontSize: 11,
    width: 80,
  },
  transactionNote: {
    fontSize: 10,
    color: '#666666',
    marginTop: 10,
    paddingLeft: 20,
  },
})

export const DailyReportPDF: React.FC<DailyReportPDFProps> = ({ summary, transactions }) => {
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Bar'
      case 'twint': return 'TWINT'
      case 'sumup': return 'SumUp'
      default: return method
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>TAGESABSCHLUSS</Text>
          <Text style={styles.dateInfo}>Datum: {formatDateForDisplay(summary.report_date)}</Text>
          <Text style={styles.reportId}>Bericht-ID: {summary.id}</Text>
        </View>

        {/* Umsätze nach Zahlungsart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UMSÄTZE NACH ZAHLUNGSART</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Bar:</Text>
            <Text style={styles.value}>CHF {summary.sales_cash.toFixed(2)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>TWINT:</Text>
            <Text style={styles.value}>CHF {summary.sales_twint.toFixed(2)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>SumUp:</Text>
            <Text style={styles.value}>CHF {summary.sales_sumup.toFixed(2)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValue}>CHF {summary.sales_total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Bargeld-Bestand */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BARGELD-BESTAND</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Anfangsbestand:</Text>
            <Text style={styles.value}>CHF {summary.cash_starting.toFixed(2)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>+ Bareinnahmen:</Text>
            <Text style={styles.value}>CHF {summary.sales_cash.toFixed(2)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Endbestand:</Text>
            <Text style={styles.boldValue}>CHF {summary.cash_ending.toFixed(2)}</Text>
          </View>
          
          {summary.cash_difference !== 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Differenz:</Text>
              <Text style={summary.cash_difference > 0 ? styles.differencePositive : styles.differenceNegative}>
                CHF {summary.cash_difference.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Transaktionen */}
        {transactions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TRANSAKTIONEN</Text>
            
            <View style={styles.transactionHeader}>
              <Text style={[styles.timeColumn, { fontWeight: 'bold' }]}>Zeit</Text>
              <Text style={[styles.methodColumn, { fontWeight: 'bold' }]}>Zahlungsart</Text>
              <Text style={[styles.amountColumn, { fontWeight: 'bold' }]}>Betrag</Text>
            </View>
            
            {transactions.slice(0, 30).map((transaction) => (
              <View key={transaction.id} style={styles.transactionRow}>
                <Text style={styles.timeColumn}>{transaction.time}</Text>
                <Text style={styles.methodColumn}>{getPaymentMethodText(transaction.method)}</Text>
                <Text style={styles.amountColumn}>CHF {transaction.amount.toFixed(2)}</Text>
              </View>
            ))}
            
            {transactions.length > 30 && (
              <Text style={styles.transactionNote}>
                ... und {transactions.length - 30} weitere Transaktionen
              </Text>
            )}
          </View>
        )}

        {/* Notizen */}
        {summary.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NOTIZEN</Text>
            <Text style={styles.value}>{summary.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={{ marginTop: 'auto', paddingTop: 20 }}>
          <Text style={{ fontSize: 10, color: '#666666', textAlign: 'center' }}>
            POS LIA HAIR - Tagesabschluss vom {formatDateForDisplay(summary.report_date)}
          </Text>
          <Text style={{ fontSize: 10, color: '#666666', textAlign: 'center', marginTop: 5 }}>
            Erstellt am: {new Date().toLocaleString('de-CH')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}