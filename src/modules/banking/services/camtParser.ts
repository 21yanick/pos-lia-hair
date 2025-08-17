// =====================================================
// CAMT.053 XML Parser - Raiffeisen Bank Statement Import
// =====================================================
// Purpose: Parse Swiss CAMT.053 XML files into TypeScript objects
// Standard: ISO 20022 CAMT.053.001.08

import type {
  CAMTAccount,
  CAMTBalance,
  CAMTBankTransactionCode,
  CAMTDocument,
  CAMTEntry,
  CAMTImportResult,
  CAMTStatement,
} from '../types/camt'

// =====================================================
// XML NAMESPACE CONSTANTS
// =====================================================

const CAMT_NAMESPACE = 'urn:iso:std:iso:20022:tech:xsd:camt.053.001.08'

// =====================================================
// MAIN PARSER FUNCTION
// =====================================================

export async function parseCAMTXML(xmlContent: string): Promise<CAMTImportResult> {
  try {
    // Parse XML string to DOM
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')

    // Check for XML parsing errors
    const parseError = xmlDoc.querySelector('parsererror')
    if (parseError) {
      return {
        success: false,
        errors: [`XML Parse Error: ${parseError.textContent}`],
        warnings: [],
      }
    }

    // Validate CAMT.053 structure
    const documentElement = xmlDoc.querySelector('Document')
    if (!documentElement) {
      return {
        success: false,
        errors: ['Invalid CAMT.053 file: Missing Document root element'],
        warnings: [],
      }
    }

    // Parse document
    const document = await parseDocument(documentElement)

    return {
      success: true,
      document,
      errors: [],
      warnings: [],
    }
  } catch (error) {
    return {
      success: false,
      errors: [`Parser Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
    }
  }
}

// =====================================================
// DOCUMENT PARSER
// =====================================================

async function parseDocument(documentElement: Element): Promise<CAMTDocument> {
  const bkToCstmrStmt = documentElement.querySelector('BkToCstmrStmt')
  if (!bkToCstmrStmt) {
    throw new Error('Missing BkToCstmrStmt element')
  }

  // Parse Group Header
  const grpHdr = bkToCstmrStmt.querySelector('GrpHdr')
  if (!grpHdr) {
    throw new Error('Missing GrpHdr element')
  }

  const messageId = getTextContent(grpHdr, 'MsgId')
  const creationDateTime = parseDateTime(getTextContent(grpHdr, 'CreDtTm'))
  const additionalInfo = getTextContent(grpHdr, 'AddtlInf') || ''

  // Parse Statement
  const stmtElement = bkToCstmrStmt.querySelector('Stmt')
  if (!stmtElement) {
    throw new Error('Missing Stmt element')
  }

  const statement = await parseStatement(stmtElement)

  return {
    messageId,
    creationDateTime,
    additionalInfo,
    statement,
  }
}

// =====================================================
// STATEMENT PARSER
// =====================================================

async function parseStatement(stmtElement: Element): Promise<CAMTStatement> {
  // Statement metadata
  const statementId = getTextContent(stmtElement, 'Id')
  const electronicSequenceNumber = parseInt(getTextContent(stmtElement, 'ElctrncSeqNb') || '0')
  const creationDateTime = parseDateTime(getTextContent(stmtElement, 'CreDtTm'))

  // Time period
  const frToDt = stmtElement.querySelector('FrToDt')
  if (!frToDt) {
    throw new Error('Missing FrToDt element')
  }

  const fromDateTime = parseDateTime(getTextContent(frToDt, 'FrDtTm'))
  const toDateTime = parseDateTime(getTextContent(frToDt, 'ToDtTm'))

  // Account information
  const account = parseAccount(stmtElement.querySelector('Acct'))

  // Balances
  const balanceElements = stmtElement.querySelectorAll('Bal')
  let openingBalance: CAMTBalance | null = null
  let closingBalance: CAMTBalance | null = null

  for (const balElement of balanceElements) {
    const balance = parseBalance(balElement)
    if (balance.type === 'OPBD') {
      openingBalance = balance
    } else if (balance.type === 'CLBD') {
      closingBalance = balance
    }
  }

  if (!openingBalance || !closingBalance) {
    throw new Error('Missing opening or closing balance')
  }

  // Entries (transactions)
  const entryElements = stmtElement.querySelectorAll('Ntry')
  const entries: CAMTEntry[] = []

  for (const entryElement of entryElements) {
    try {
      const entry = parseEntry(entryElement)
      entries.push(entry)
    } catch (error) {
      // console.warn(`Failed to parse entry: ${error}`)
      // Continue with other entries
    }
  }

  return {
    statementId,
    electronicSequenceNumber,
    creationDateTime,
    fromDateTime,
    toDateTime,
    account,
    openingBalance,
    closingBalance,
    entries,
  }
}

// =====================================================
// ACCOUNT PARSER
// =====================================================

function parseAccount(acctElement: Element | null): CAMTAccount {
  if (!acctElement) {
    throw new Error('Missing Acct element')
  }

  const idElement = acctElement.querySelector('Id')
  const iban = getTextContent(idElement, 'IBAN')
  const currency = getTextContent(acctElement, 'Ccy')

  const ownerElement = acctElement.querySelector('Ownr')
  const ownerName = getTextContent(ownerElement, 'Nm')

  const servicerElement = acctElement.querySelector('Svcr FinInstnId')
  const servicerName = getTextContent(servicerElement, 'Nm')

  return {
    iban,
    currency,
    ownerName,
    servicerName,
  }
}

// =====================================================
// BALANCE PARSER
// =====================================================

function parseBalance(balElement: Element): CAMTBalance {
  const tpElement = balElement.querySelector('Tp CdOrPrtry')
  const type = getTextContent(tpElement, 'Cd') as 'OPBD' | 'CLBD'

  const amtElement = balElement.querySelector('Amt')
  const amount = parseFloat(amtElement?.textContent || '0')

  const creditDebitIndicator = getTextContent(balElement, 'CdtDbtInd') as 'CRDT' | 'DBIT'

  const dtElement = balElement.querySelector('Dt')
  const date = parseDate(getTextContent(dtElement, 'Dt'))

  return {
    type,
    amount,
    creditDebitIndicator,
    date,
  }
}

// =====================================================
// ENTRY (TRANSACTION) PARSER
// =====================================================

function parseEntry(entryElement: Element): CAMTEntry {
  // Amount and currency
  const amtElement = entryElement.querySelector('Amt')
  if (!amtElement) {
    throw new Error('Missing Amt element in entry')
  }

  const amount = parseFloat(amtElement.textContent || '0')
  const currency = amtElement.getAttribute('Ccy') || 'CHF'

  // Credit/Debit indicator
  const creditDebitIndicator = getTextContent(entryElement, 'CdtDbtInd') as 'CRDT' | 'DBIT'

  // Reversal indicator
  const reversalIndicator = getTextContent(entryElement, 'RvslInd') === 'true'

  // Status
  const status = getTextContent(entryElement.querySelector('Sts'), 'Cd') as 'BOOK' | 'PDNG'

  // Dates
  const bookingDate = parseDate(getTextContent(entryElement.querySelector('BookgDt'), 'Dt'))
  const valueDate = parseDate(getTextContent(entryElement.querySelector('ValDt'), 'Dt'))

  // Bank reference
  const accountServiceReference = getTextContent(entryElement, 'AcctSvcrRef')

  // Bank transaction code
  const bankTransactionCode = parseBankTransactionCode(entryElement.querySelector('BkTxCd'))

  // Description
  const description = getTextContent(entryElement, 'AddtlNtryInf') || ''

  return {
    amount,
    currency,
    creditDebitIndicator,
    reversalIndicator,
    bookingDate,
    valueDate,
    accountServiceReference,
    bankTransactionCode,
    description,
    status,
  }
}

// =====================================================
// BANK TRANSACTION CODE PARSER
// =====================================================

function parseBankTransactionCode(
  bkTxCdElement: Element | null
): CAMTBankTransactionCode | undefined {
  if (!bkTxCdElement) return undefined

  const domnElement = bkTxCdElement.querySelector('Domn')
  if (!domnElement) return undefined

  const domain = getTextContent(domnElement, 'Cd')

  const fmlyElement = domnElement.querySelector('Fmly')
  if (!fmlyElement) return { domain }

  const family = getTextContent(fmlyElement, 'Cd')
  const subfamily = getTextContent(fmlyElement, 'SubFmlyCd')

  const prtryElement = bkTxCdElement.querySelector('Prtry')
  const proprietary = getTextContent(prtryElement, 'Cd')

  return {
    domain,
    family,
    subfamily: subfamily || undefined,
    proprietary: proprietary || undefined,
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function getTextContent(parent: Element | null, selector: string): string {
  if (!parent) return ''
  const element = parent.querySelector(selector)
  return element?.textContent?.trim() || ''
}

function parseDate(dateString: string): Date {
  if (!dateString) throw new Error('Missing date')
  return new Date(dateString)
}

function parseDateTime(dateTimeString: string): Date {
  if (!dateTimeString) throw new Error('Missing datetime')
  return new Date(dateTimeString)
}

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

export function validateCAMTDocument(document: CAMTDocument): CAMTValidationError[] {
  const errors: CAMTValidationError[] = []

  // Validate statement
  const statement = document.statement

  // Check required fields
  if (!statement.statementId) {
    errors.push({
      type: 'MISSING_FIELD',
      field: 'statementId',
      message: 'Statement ID is required',
    })
  }

  if (!statement.account.iban) {
    errors.push({
      type: 'MISSING_FIELD',
      field: 'account.iban',
      message: 'Account IBAN is required',
    })
  }

  // Validate entries
  statement.entries.forEach((entry, index) => {
    if (!entry.accountServiceReference) {
      errors.push({
        type: 'MISSING_FIELD',
        field: 'accountServiceReference',
        message: 'Account Service Reference is required',
        entryIndex: index,
      })
    }

    if (entry.amount <= 0) {
      errors.push({
        type: 'INVALID_AMOUNT',
        field: 'amount',
        message: 'Amount must be positive',
        entryIndex: index,
      })
    }
  })

  return errors
}

// =====================================================
// EXPORTS
// =====================================================
// All types are exported from '../types/camt'
