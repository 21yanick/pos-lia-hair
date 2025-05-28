'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
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
  dateInfo: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 6,
  },
  reportId: {
    fontSize: 10,
    color: '#9CA3AF',
  },

  // Content Sections
  section: {
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 8,
    border: '1 solid #E5E7EB',
    boxShadow: '0 1 3 0 rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingBottom: 8,
    borderBottom: '1 solid #E5E7EB',
  },
  
  // Table-like layout
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginBottom: 6,
    alignItems: 'center',
  },
  dataRowAlt: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 0,
    backgroundColor: '#F9FAFB',
    marginBottom: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    width: 150,
    color: '#374151',
    fontWeight: '500',
  },
  value: {
    fontSize: 12,
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  boldValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    textAlign: 'right',
  },
  
  // Total row
  totalSection: {
    backgroundColor: '#F0F9FF',
    padding: 15,
    borderRadius: 6,
    marginTop: 15,
    border: '2 solid #0EA5E9',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 150,
    color: '#0C4A6E',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0C4A6E',
    flex: 1,
    textAlign: 'right',
  },
  
  // Differences
  differencePositive: {
    fontSize: 11,
    color: '#059669',
    fontWeight: 'bold',
    flex: 1,
  },
  differenceNegative: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: 'bold',
    flex: 1,
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
  timeColumn: {
    fontSize: 10,
    width: 60,
    color: '#374151',
  },
  methodColumn: {
    fontSize: 10,
    width: 80,
    color: '#374151',
  },
  amountColumn: {
    fontSize: 10,
    width: 80,
    color: '#1F2937',
    textAlign: 'right',
  },
  
  // Header columns
  headerTimeColumn: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 60,
    color: '#1F2937',
  },
  headerMethodColumn: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 80,
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
  
  // Notes section
  notesSection: {
    backgroundColor: '#FFFBEB',
    border: '1 solid #FDE68A',
    borderRadius: 6,
    padding: 16,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  notesText: {
    fontSize: 11,
    color: '#451A03',
    lineHeight: 1.4,
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
            <Text style={styles.title}>TAGESABSCHLUSS</Text>
            <Text style={styles.dateInfo}>{formatDateForDisplay(summary.report_date)}</Text>
            <Text style={styles.reportId}>ID: {summary.id}</Text>
          </View>
        </View>

        {/* Sales by Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Umsätze nach Zahlungsart</Text>
          
          <View style={styles.dataRow}>
            <Text style={styles.label}>Bar:</Text>
            <Text style={styles.value}>CHF {summary.sales_cash.toFixed(2)}</Text>
          </View>
          
          <View style={styles.dataRowAlt}>
            <Text style={styles.label}>TWINT:</Text>
            <Text style={styles.value}>CHF {summary.sales_twint.toFixed(2)}</Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.label}>SumUp:</Text>
            <Text style={styles.value}>CHF {summary.sales_sumup.toFixed(2)}</Text>
          </View>
          
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GESAMTUMSATZ:</Text>
              <Text style={styles.totalValue}>CHF {summary.sales_total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Cash Balance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bargeld-Bestand</Text>
          
          <View style={styles.dataRow}>
            <Text style={styles.label}>Anfangsbestand:</Text>
            <Text style={styles.value}>CHF {summary.cash_starting.toFixed(2)}</Text>
          </View>
          
          <View style={styles.dataRowAlt}>
            <Text style={styles.label}>+ Bareinnahmen:</Text>
            <Text style={styles.value}>CHF {summary.sales_cash.toFixed(2)}</Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.label}>Erwarteter Endbestand:</Text>
            <Text style={styles.value}>CHF {(summary.cash_starting + summary.sales_cash).toFixed(2)}</Text>
          </View>
          
          <View style={styles.dataRowAlt}>
            <Text style={styles.label}>Tatsächlicher Endbestand:</Text>
            <Text style={styles.boldValue}>CHF {summary.cash_ending.toFixed(2)}</Text>
          </View>
          
          {summary.cash_difference !== 0 && (
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Differenz:</Text>
                <Text style={summary.cash_difference > 0 ? styles.differencePositive : styles.differenceNegative}>
                  CHF {summary.cash_difference.toFixed(2)}
                  {summary.cash_difference > 0 ? ' (Überschuss)' : ' (Fehlbetrag)'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Transactions */}
        {transactions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transaktionen ({transactions.length})</Text>
            
            <View style={styles.transactionTable}>
              <View style={styles.transactionHeader}>
                <Text style={styles.headerTimeColumn}>Zeit</Text>
                <Text style={styles.headerMethodColumn}>Zahlungsart</Text>
                <Text style={styles.headerAmountColumn}>Betrag</Text>
              </View>
              
              {transactions.slice(0, 25).map((transaction, index) => (
                <View key={transaction.id} style={index % 2 === 0 ? styles.transactionRow : styles.transactionRowAlt}>
                  <Text style={styles.timeColumn}>{transaction.time}</Text>
                  <Text style={styles.methodColumn}>{getPaymentMethodText(transaction.method)}</Text>
                  <Text style={styles.amountColumn}>CHF {transaction.amount.toFixed(2)}</Text>
                </View>
              ))}
            </View>
            
            {transactions.length > 25 && (
              <Text style={styles.transactionNote}>
                ... und {transactions.length - 25} weitere Transaktionen
              </Text>
            )}
          </View>
        )}

        {/* Notes */}
        {summary.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notizen</Text>
            <Text style={styles.notesText}>{summary.notes}</Text>
          </View>
        )}

        {/* Professional Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Lia Hair by Zilfije Rupp - Tagesabschluss vom {formatDateForDisplay(summary.report_date)}{'\n'}
            Erstellt am: {new Date().toLocaleDateString('de-CH')} um {new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </Page>
    </Document>
  )
}