/**
 * Customer Assignment Guards
 *
 * Smart decision logic for PDF regeneration safety
 * - 90% cases: Silent (best UX)
 * - 10% cases: Prompt (safety)
 */

/**
 * Determine if user prompt is needed before PDF regeneration
 *
 * Decision Matrix:
 * - NULL → Customer: ✅ Silent (Laufkundschaft → Named)
 * - Customer → NULL: ✅ Silent (GDPR removal OK)
 * - Customer A → Customer B: ❌ MUST PROMPT (Dangerous!)
 * - Same Customer: ✅ Skip (no change)
 *
 * @param oldCustomerId - Current customer ID (or null)
 * @param newCustomerId - New customer ID (or null)
 * @returns true if user prompt required, false if silent OK
 */
export const shouldPromptBeforeRegeneration = (
  oldCustomerId: string | null,
  newCustomerId: string | null
): boolean => {
  // ✅ SAFE: No change
  if (oldCustomerId === newCustomerId) {
    return false // Skip regeneration entirely
  }

  // ✅ SAFE: Laufkundschaft → Named customer
  if (oldCustomerId === null && newCustomerId !== null) {
    return false // Silent OK
  }

  // ✅ SAFE: Named customer → Laufkundschaft (GDPR removal)
  if (oldCustomerId !== null && newCustomerId === null) {
    return false // Silent OK
  }

  // ❌ DANGEROUS: Customer A → Customer B
  if (oldCustomerId !== null && newCustomerId !== null && oldCustomerId !== newCustomerId) {
    return true // MUST PROMPT!
  }

  return false
}

/**
 * Check if regeneration is needed at all
 *
 * @returns true if customer actually changed
 */
export const needsRegeneration = (
  oldCustomerId: string | null,
  newCustomerId: string | null
): boolean => {
  return oldCustomerId !== newCustomerId
}

/**
 * Get user-friendly description of the customer change
 *
 * Used for toast notifications and prompts
 */
export const getCustomerChangeDescription = (
  oldCustomerName: string | null,
  newCustomerName: string | null
): string => {
  if (oldCustomerName === null && newCustomerName !== null) {
    return `Laufkundschaft → ${newCustomerName}`
  }
  if (oldCustomerName !== null && newCustomerName === null) {
    return `${oldCustomerName} → Laufkundschaft`
  }
  if (oldCustomerName !== null && newCustomerName !== null) {
    return `${oldCustomerName} → ${newCustomerName}`
  }
  return 'Keine Änderung'
}

/**
 * Generate warning prompt message for dangerous changes
 */
export const getWarningPromptMessage = (
  oldCustomerName: string,
  newCustomerName: string | null
): string => {
  return (
    `⚠️ Achtung: Kunde ändern\n\n` +
    `Die Rechnung hat bereits einen Kunden:\n\n` +
    `Alt:  ${oldCustomerName}\n` +
    `Neu:  ${newCustomerName || 'Laufkundschaft'}\n\n` +
    `Möchtest du die Rechnung neu generieren?\n\n` +
    `⚠️ Die alte Rechnung wird archiviert\n` +
    `✅ Belegnummer bleibt gleich\n` +
    `✅ Datum/Betrag bleiben unverändert`
  )
}
