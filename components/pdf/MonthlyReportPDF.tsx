'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
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
    padding: 40,
    fontFamily: 'Helvetica',
  },
  
  // Header Section
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    paddingBottom: 25,
    borderBottom: '2 solid #D1D5DB',
    alignItems: 'flex-start',
  },
  logoSection: {
    width: '25%',
    paddingRight: 15,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
  },
  companyInfo: {
    width: '45%',
    paddingRight: 15,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  companyAddress: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 1.5,
  },
  reportInfo: {
    width: '30%',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },

  // Content Sections
  section: {
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 6,
    border: '1 solid #E5E7EB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1F2937',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  salesSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expensesSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#DC2626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Table-like layout
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 2,
    borderRadius: 3,
  },
  dataRowAlt: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 2,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    width: 140,
    color: '#374151',
  },
  value: {
    fontSize: 11,
    color: '#1F2937',
    flex: 1,
  },
  
  // Total sections
  totalSection: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
    border: '1 solid #DBEAFE',
  },
  salesTotalSection: {
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
    border: '1 solid #D1FAE5',
  },
  expensesTotalSection: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
    border: '1 solid #FECACA',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    width: 140,
    color: '#1E40AF',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E40AF',
    flex: 1,
  },
  salesTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
    flex: 1,
  },
  expensesTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC2626',
    flex: 1,
  },
  
  // Statistics section
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statBox: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 6,
    width: '48%',
    border: '1 solid #E5E7EB',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  
  // Transactions Table
  transactionTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    overflow: 'hidden',
  },
  transactionHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottom: '1 solid #E5E7EB',
  },
  transactionRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottom: '0.5 solid #F3F4F6',
  },
  transactionRowAlt: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderBottom: '0.5 solid #F3F4F6',
  },
  
  // Transaction columns
  transactionDate: {
    fontSize: 10,
    width: 80,
    color: '#374151',
  },
  transactionType: {
    fontSize: 10,
    width: 100,
    color: '#374151',
  },
  transactionAmount: {
    fontSize: 10,
    width: 80,
    color: '#1F2937',
    textAlign: 'right',
  },
  transactionPositive: {
    fontSize: 10,
    color: '#059669',
    width: 80,
    textAlign: 'right',
  },
  transactionNegative: {
    fontSize: 10,
    color: '#DC2626',
    width: 80,
    textAlign: 'right',
  },
  
  // Header columns
  headerDateColumn: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 80,
    color: '#1F2937',
  },
  headerTypeColumn: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 100,
    color: '#1F2937',
  },
  headerAmountColumn: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 80,
    color: '#1F2937',
    textAlign: 'right',
  },
  
  transactionNote: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 8,
    paddingHorizontal: 12,
    fontStyle: 'italic',
  },
  
  // Footer
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTop: '1 solid #E5E7EB',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 1.4,
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
        {/* Professional Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoSection}>
            <Image 
              src="/logo.png" 
              style={styles.logo}
            />
          </View>
          
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Lia Hair by Zilfije Rupp</Text>
            <Text style={styles.companyAddress}>
              Römerstrasse 6{'\n'}
              4512 Bellach{'\n'}
              hello@lia-hair.ch
            </Text>
          </View>
          
          <View style={styles.reportInfo}>
            <Text style={styles.title}>MONATSABSCHLUSS</Text>
            <Text style={styles.subtitle}>{formatMonthYear(selectedMonth)}</Text>
          </View>
        </View>

        {/* Sales Revenue */}
        <View style={styles.section}>
          <Text style={styles.salesSectionTitle}>Salon-Umsätze</Text>
          
          <View style={styles.dataRow}>
            <Text style={styles.label}>Bar:</Text>
            <Text style={styles.value}>CHF {stats.salesCash.toFixed(2)}</Text>
          </View>
          
          <View style={styles.dataRowAlt}>
            <Text style={styles.label}>TWINT:</Text>
            <Text style={styles.value}>CHF {stats.salesTwint.toFixed(2)}</Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.label}>SumUp:</Text>
            <Text style={styles.value}>CHF {stats.salesSumup.toFixed(2)}</Text>
          </View>
          
          <View style={styles.salesTotalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GESAMTUMSATZ:</Text>
              <Text style={styles.salesTotal}>CHF {stats.salesTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Expenses */}
        <View style={styles.section}>
          <Text style={styles.expensesSectionTitle}>Ausgaben</Text>
          
          <View style={styles.dataRow}>
            <Text style={styles.label}>Bar:</Text>
            <Text style={styles.value}>CHF {stats.expensesCash.toFixed(2)}</Text>
          </View>
          
          <View style={styles.dataRowAlt}>
            <Text style={styles.label}>Bank:</Text>
            <Text style={styles.value}>CHF {stats.expensesBank.toFixed(2)}</Text>
          </View>
          
          <View style={styles.expensesTotalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GESAMTAUSGABEN:</Text>
              <Text style={styles.expensesTotal}>CHF {stats.expensesTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kennzahlen</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Umsatztage</Text>
              <Text style={styles.statValue}>{stats.transactionDays}/{stats.daysInMonth}</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Ø Tagesumsatz</Text>
              <Text style={styles.statValue}>CHF {stats.avgDailyRevenue.toFixed(0)}</Text>
            </View>
          </View>
          
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>NETTO-ERGEBNIS:</Text>
              <Text style={stats.salesTotal - stats.expensesTotal >= 0 ? styles.salesTotal : styles.expensesTotal}>
                CHF {(stats.salesTotal - stats.expensesTotal).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Transaction History */}
        {sortedTransactions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaktions-Historie ({sortedTransactions.length})</Text>
            
            <View style={styles.transactionTable}>
              <View style={styles.transactionHeader}>
                <Text style={styles.headerDateColumn}>Datum</Text>
                <Text style={styles.headerTypeColumn}>Typ</Text>
                <Text style={styles.headerAmountColumn}>Betrag</Text>
              </View>
              
              {sortedTransactions.map((transaction, index) => {
                const date = new Date(transaction.date).toLocaleDateString('de-CH')
                const isRevenue = transaction.type === 'daily_report'
                const type = isRevenue ? 'Tagesabschluss' : 'Ausgabe'
                const amountStyle = isRevenue ? styles.transactionPositive : styles.transactionNegative
                const sign = isRevenue ? '+' : '-'
                
                return (
                  <View key={transaction.id} style={index % 2 === 0 ? styles.transactionRow : styles.transactionRowAlt}>
                    <Text style={styles.transactionDate}>{date}</Text>
                    <Text style={styles.transactionType}>{type}</Text>
                    <Text style={amountStyle}>CHF {sign}{transaction.total.toFixed(2)}</Text>
                  </View>
                )
              })}
            </View>
            
            {transactions.length > 20 && (
              <Text style={styles.transactionNote}>
                ... und {transactions.length - 20} weitere Transaktionen
              </Text>
            )}
          </View>
        )}

        {/* Professional Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Lia Hair by Zilfije Rupp - Monatsabschluss {formatMonthYear(selectedMonth)}{'\n'}
            Erstellt am: {new Date().toLocaleDateString('de-CH')} um {new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </Page>
    </Document>
  )
}