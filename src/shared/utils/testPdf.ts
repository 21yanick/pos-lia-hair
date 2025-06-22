/**
 * Test PDF utilities for debugging
 */

export const testPdf = {
  /**
   * Create a simple test PDF as data URL
   */
  createTestPDF(): string {
    // Simple PDF content in base64
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 100
>>
stream
BT
/F1 12 Tf
100 700 Td
(TEST PDF - Android Chrome Debug) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000125 00000 n 
0000000259 00000 n 
0000000410 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
500
%%EOF`

    // Convert to base64 data URL
    const base64 = btoa(pdfContent)
    return `data:application/pdf;base64,${base64}`
  },

  /**
   * Get a public test PDF URL
   */
  getPublicTestPDF(): string {
    // Mozilla's sample PDF - no CORS issues
    return 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
  },

  /**
   * Test current PDF functionality
   */
  async testPDFOpen(method: 'data-url' | 'public-url' = 'data-url') {
    const { pdfManager } = await import('@/shared/services/pdfManager')
    
    const url = method === 'data-url' 
      ? this.createTestPDF()
      : this.getPublicTestPDF()
    
    console.log('🧪 Testing PDF with:', method, url.substring(0, 100) + '...')
    
    pdfManager.open('test-pdf', url)
  }
}

// Make globally accessible for testing
if (typeof window !== 'undefined') {
  (window as any).testPdf = testPdf
}