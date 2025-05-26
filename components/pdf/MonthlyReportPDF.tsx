'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { MonthlyStatsData } from '@/app/(auth)/reports/monthly/components/MonthlyStats'
import type { TransactionItem } from '@/app/(auth)/reports/monthly/components/TransactionsList'

export type MonthlyReportPDFProps = {
  stats: MonthlyStatsData
  transactions: TransactionItem[]
  selectedMonth: string
}

// Hilfsfunktion: Formatiertes Datum für Anzeige
function formatMonthYear(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString("de-CH", { 
    month: "long", 
    year: "numeric"
  })
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 50,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 40,
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000000',
  },
  salesSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#008000',
  },
  expensesSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#CC0000',
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
  salesTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#008000',
  },
  expensesTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#CC0000',
  },
  transactionRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 20,
  },
  transactionDate: {
    fontSize: 11,
    width: 80,
  },
  transactionType: {
    fontSize: 11,
    width: 100,
  },
  transactionAmount: {
    fontSize: 11,
    width: 80,
  },
  transactionPositive: {
    fontSize: 11,
    color: '#008000',
    width: 80,
  },
  transactionNegative: {
    fontSize: 11,
    color: '#CC0000',
    width: 80,
  },
  transactionNote: {
    fontSize: 10,
    color: '#666666',
    marginTop: 10,
    paddingLeft: 20,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
})

export const MonthlyReportPDF: React.FC<MonthlyReportPDFProps> = ({ 
  stats, 
  transactions, 
  selectedMonth 
}) => {
  // Transaktionen sortieren (neueste zuerst) und limitieren
  const sortedTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>MONATSABSCHLUSS</Text>
          <Text style={styles.subtitle}>{formatMonthYear(selectedMonth)}</Text>
        </View>

        {/* Salon-Umsätze */}
        <View style={styles.section}>
          <Text style={styles.salesSectionTitle}>SALON-UMSÄTZE</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Bar:</Text>
            <Text style={styles.value}>CHF {stats.salesCash.toFixed(2)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>TWINT:</Text>
            <Text style={styles.value}>CHF {stats.salesTwint.toFixed(2)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>SumUp:</Text>
            <Text style={styles.value}>CHF {stats.salesSumup.toFixed(2)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.salesTotal}>CHF {stats.salesTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Ausgaben */}
        <View style={styles.section}>
          <Text style={styles.expensesSectionTitle}>AUSGABEN</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Bar:</Text>
            <Text style={styles.value}>CHF {stats.expensesCash.toFixed(2)}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Bank:</Text>
            <Text style={styles.value}>CHF {stats.expensesBank.toFixed(2)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.expensesTotal}>CHF {stats.expensesTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Statistiken */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATISTIKEN</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Tage mit Umsatz:</Text>
            <Text style={styles.value}>{stats.transactionDays} von {stats.daysInMonth}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Ø Tagesumsatz:</Text>
            <Text style={styles.value}>CHF {stats.avgDailyRevenue.toFixed(2)}</Text>
          </View>
        </View>

        {/* Chronologische Transaktionen */}
        {sortedTransactions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CHRONOLOGISCHE TRANSAKTIONEN</Text>
            
            {sortedTransactions.map((transaction) => {
              const date = new Date(transaction.date).toLocaleDateString('de-CH')
              const isRevenue = transaction.type === 'daily_report'
              const type = isRevenue ? 'Tagesabschluss' : 'Ausgabe'
              const amountStyle = isRevenue ? styles.transactionPositive : styles.transactionNegative
              const sign = isRevenue ? '+' : '-'
              
              return (
                <View key={transaction.id} style={styles.transactionRow}>
                  <Text style={styles.transactionDate}>{date}</Text>
                  <Text style={styles.transactionType}>{type}</Text>
                  <Text style={amountStyle}>CHF {sign}{transaction.total.toFixed(2)}</Text>
                </View>
              )
            })}
            
            {transactions.length > 20 && (
              <Text style={styles.transactionNote}>
                ... und {transactions.length - 20} weitere Transaktionen
              </Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            POS LIA HAIR - Monatsabschluss {formatMonthYear(selectedMonth)}
          </Text>
          <Text style={[styles.footerText, { marginTop: 5 }]}>
            Erstellt am: {new Date().toLocaleDateString('de-CH')} um {new Date().toLocaleTimeString('de-CH')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}