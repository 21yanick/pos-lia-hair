'use client'

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type React from 'react'
import type { ReconciliationData } from '@/shared/services/reconciliationService'
import type { BusinessSettings } from '@/shared/types/businessSettings'
import type { MonthlyStatsData } from '@/shared/types/monthly'

export type MonthlyReportPDFProps = {
  stats: MonthlyStatsData
  selectedMonth: string
  businessSettings?: BusinessSettings | null
  reconciliationData?: ReconciliationData | null
}

// Hilfsfunktion: Formatiertes Datum für Anzeige
function formatMonthYear(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('de-CH', {
    month: 'long',
    year: 'numeric',
  })
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '1 solid #000000',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyAddress: {
    fontSize: 11,
    lineHeight: 1.3,
  },
  reportInfo: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 13,
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },

  // Data rows
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    width: 120,
  },
  value: {
    fontSize: 12,
    flex: 1,
  },

  // Totals
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    marginTop: 10,
    borderTop: '1 solid #000000',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    width: 120,
  },
  totalValue: {
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
  },

  // Tables
  table: {
    marginTop: 10,
    border: '1 solid #000000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottom: '1 solid #000000',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderBottom: '0.5 solid #CCCCCC',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 5,
    backgroundColor: '#FAFAFA',
    borderBottom: '0.5 solid #CCCCCC',
  },

  // Table columns
  colSmall: {
    fontSize: 10,
    width: 70,
    paddingRight: 8,
  },
  colMedium: {
    fontSize: 10,
    width: 90,
    paddingRight: 8,
  },
  colLarge: {
    fontSize: 10,
    flex: 1,
    paddingRight: 8,
  },
  colRight: {
    textAlign: 'right',
  },

  // Item details styling
  itemDetails: {
    paddingLeft: 20,
    paddingVertical: 4,
    backgroundColor: '#FAFAFA',
  },
  itemDetail: {
    fontSize: 9,
    color: '#6B7280',
    paddingVertical: 1,
  },
})

export const MonthlyReportPDF: React.FC<MonthlyReportPDFProps> = ({
  stats,
  selectedMonth,
  businessSettings,
  reconciliationData,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>
              {businessSettings?.company_name || 'Unternehmen'}
            </Text>
            <Text style={styles.companyAddress}>
              {businessSettings
                ? [
                    businessSettings.company_address,
                    businessSettings.company_postal_code && businessSettings.company_city
                      ? `${businessSettings.company_postal_code} ${businessSettings.company_city}`
                      : businessSettings.company_city,
                    businessSettings.company_email,
                  ]
                    .filter(Boolean)
                    .join('\n')
                : 'Musterstrasse 1\n1234 Musterort\nhello@example.ch'}
            </Text>
          </View>

          <View style={styles.reportInfo}>
            <Text style={styles.title}>MONATSABSCHLUSS</Text>
            <Text style={styles.subtitle}>{formatMonthYear(selectedMonth)}</Text>
          </View>
        </View>

        {/* Sales Revenue */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Umsätze</Text>

          <View style={styles.dataRow}>
            <Text style={styles.label}>Bar:</Text>
            <Text style={styles.value}>CHF {(stats.salesCash || 0).toFixed(2)}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.label}>TWINT:</Text>
            <Text style={styles.value}>CHF {(stats.salesTwint || 0).toFixed(2)}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.label}>SumUp:</Text>
            <Text style={styles.value}>CHF {(stats.salesSumup || 0).toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>GESAMTUMSATZ:</Text>
            <Text style={styles.totalValue}>CHF {(stats.salesTotal || 0).toFixed(2)}</Text>
          </View>
        </View>

        {/* Expenses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ausgaben</Text>

          <View style={styles.dataRow}>
            <Text style={styles.label}>Bar:</Text>
            <Text style={styles.value}>CHF {(stats.expensesCash || 0).toFixed(2)}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.label}>Bank:</Text>
            <Text style={styles.value}>CHF {(stats.expensesBank || 0).toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>GESAMTAUSGABEN:</Text>
            <Text style={styles.totalValue}>CHF {(stats.expensesTotal || 0).toFixed(2)}</Text>
          </View>
        </View>

        {/* Net Result */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ergebnis</Text>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>NETTO-ERGEBNIS:</Text>
            <Text style={styles.totalValue}>
              CHF {((stats.salesTotal || 0) - (stats.expensesTotal || 0)).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Reconciliation Summary */}
        {reconciliationData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Abgleich-Status</Text>

            <View style={styles.dataRow}>
              <Text style={styles.label}>Provider-Abgleich:</Text>
              <Text style={styles.value}>
                {reconciliationData.providerReconciliation.summary.matchingRate}% (
                {reconciliationData.providerReconciliation.summary.matchedSales} von{' '}
                {reconciliationData.providerReconciliation.summary.totalSales})
              </Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.label}>Bank-Abgleich:</Text>
              <Text style={styles.value}>
                {reconciliationData.bankReconciliation.summary.matchingRate}% (
                {reconciliationData.bankReconciliation.summary.matchedTransactions} von{' '}
                {reconciliationData.bankReconciliation.summary.totalBankTransactions})
              </Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.label}>Offene Positionen:</Text>
              <Text style={styles.value}>
                {reconciliationData.providerReconciliation.summary.unmatchedSales +
                  reconciliationData.bankReconciliation.summary.unmatchedTransactions}
              </Text>
            </View>
          </View>
        )}

        {/* Provider Matches Table */}
        {reconciliationData?.providerReconciliation?.matches &&
          reconciliationData.providerReconciliation.matches.length > 0 && (
            <View style={styles.section} break>
              <Text style={styles.sectionTitle}>Provider-Abgleiche</Text>

              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.colMedium]}>Beleg</Text>
                  <Text style={[styles.colSmall, styles.colRight]}>Betrag</Text>
                  <Text style={[styles.colMedium]}>Datum</Text>
                  <Text style={[styles.colSmall]}>Provider</Text>
                  <Text style={[styles.colSmall, styles.colRight]}>Netto</Text>
                </View>

                {reconciliationData.providerReconciliation.matches.map((match, index) => (
                  <View
                    key={`match-${match.sale.receiptNumber}`}
                    style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                  >
                    <Text style={[styles.colMedium]}>{match.sale.receiptNumber}</Text>
                    <Text style={[styles.colSmall, styles.colRight]}>
                      {match.sale.amount.toFixed(2)}
                    </Text>
                    <Text style={[styles.colMedium]}>{match.sale.date}</Text>
                    <Text style={[styles.colSmall]}>{match.provider.provider.toUpperCase()}</Text>
                    <Text style={[styles.colSmall, styles.colRight]}>
                      {match.provider.netAmount.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        {/* Bank Matches Table */}
        {reconciliationData?.bankReconciliation?.matches &&
          reconciliationData.bankReconciliation.matches.length > 0 && (
            <View style={styles.section} break>
              <Text style={styles.sectionTitle}>Bank-Abgleiche</Text>

              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.colSmall, styles.colRight]}>Betrag</Text>
                  <Text style={[styles.colMedium]}>Datum</Text>
                  <Text style={[styles.colLarge]}>Beschreibung</Text>
                  <Text style={[styles.colSmall]}>Positionen</Text>
                </View>

                {(() => {
                  // Performance: Sort once with optimized date parsing
                  const sortedMatches = reconciliationData.bankReconciliation.matches
                    .slice() // Shallow copy to avoid mutation
                    .sort((a, b) => {
                      // Optimized: Direct date string comparison (faster than parsing)
                      // Swiss date format DD.MM.YYYY can be compared as strings after transformation
                      const dateA = a.bankTransaction.date.split('.').reverse().join('-')
                      const dateB = b.bankTransaction.date.split('.').reverse().join('-')
                      return dateA.localeCompare(dateB)
                    })

                  return sortedMatches.map((match, index) => {
                    // Beträge analysieren: Bank vs. Positionen
                    const itemsTotal = match.matchedItems.reduce(
                      (sum, item) => sum + item.amount,
                      0
                    )
                    const bankAmount = match.bankTransaction.amount
                    const hasDiscrepancy = Math.abs(bankAmount - itemsTotal) > 0.01
                    const isMultipleItems = match.matchedItems.length > 1

                    return (
                      <View
                        key={`bank-${match.bankTransaction.date}-${match.bankTransaction.amount}`}
                      >
                        <View style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                          <Text style={[styles.colSmall, styles.colRight]}>
                            {hasDiscrepancy && isMultipleItems
                              ? `Bank: ${bankAmount.toFixed(2)}\nPositionen: ${itemsTotal.toFixed(2)}`
                              : bankAmount.toFixed(2)}
                          </Text>
                          <Text style={[styles.colMedium]}>{match.bankTransaction.date}</Text>
                          <Text style={[styles.colLarge]}>{match.bankTransaction.description}</Text>
                          <Text style={[styles.colSmall]}>{match.matchedItems.length}x</Text>
                        </View>

                        {/* Positions-Details */}
                        <View style={styles.itemDetails}>
                          {match.matchedItems.map((item, _itemIndex) => (
                            <Text
                              key={`item-${item.description}-${item.amount}`}
                              style={styles.itemDetail}
                            >
                              • {item.description}{' '}
                              {item.settlementDate
                                ? `(${item.settlementDate})`
                                : `(${item.amount.toFixed(2)} CHF)`}
                            </Text>
                          ))}
                        </View>
                      </View>
                    )
                  })
                })()}
              </View>
            </View>
          )}

        {/* Kassenbuch Overview */}
        <View style={styles.section} break>
          <Text style={styles.sectionTitle}>Kassenbuch</Text>

          <View style={styles.dataRow}>
            <Text style={styles.label}>Anfangsbestand:</Text>
            <Text style={styles.value}>CHF 0.00</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.label}>Einnahmen (Bar):</Text>
            <Text style={styles.value}>CHF {(stats.salesCash || 0).toFixed(2)}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.label}>Ausgaben (Bar):</Text>
            <Text style={styles.value}>CHF -{(stats.expensesCash || 0).toFixed(2)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>KASSENENDBESTAND:</Text>
            <Text style={styles.totalValue}>
              CHF {((stats.salesCash || 0) - (stats.expensesCash || 0)).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Detailliertes Kassenbuch */}
        {reconciliationData?.cashMovements && reconciliationData.cashMovements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detailliertes Kassenbuch</Text>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.colMedium]}>Datum</Text>
                <Text style={[styles.colMedium]}>Beleg</Text>
                <Text style={[styles.colLarge]}>Beschreibung</Text>
                <Text style={[styles.colSmall, styles.colRight]}>Betrag</Text>
              </View>

              {reconciliationData.cashMovements
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((movement, index) => (
                  <View
                    key={`cash-${movement.date}-${movement.amount}-${movement.type}`}
                    style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                  >
                    <Text style={[styles.colMedium]}>{movement.date}</Text>
                    <Text style={[styles.colMedium]}>{movement.receiptNumber || '-'}</Text>
                    <Text style={[styles.colLarge]}>{movement.description}</Text>
                    <Text style={[styles.colSmall, styles.colRight]}>
                      {movement.type === 'cash_in' ? '+' : '-'}
                      {movement.amount.toFixed(2)}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  )
}
