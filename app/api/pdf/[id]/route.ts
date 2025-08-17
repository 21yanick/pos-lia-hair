import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Enterprise PDF Proxy API
 *
 * Proxies PDF content from Supabase Storage with iframe-friendly headers
 * Maintains organization-scoped security and existing auth patterns
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Next.js 15: Await params
    const { id: documentId } = await params

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 })
    }

    // Enterprise Auth: Authorization header approach
    const authHeader = request.headers.get('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // Initialize Supabase with service role for token validation
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() {
            return undefined
          },
          set() {},
          remove() {},
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    // Validate user with provided token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('[PDF Proxy] Token validation failed:', authError?.message)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    console.log('[PDF Proxy] User authenticated:', user.id)

    // Get document metadata with organization-scoped security
    console.log('[PDF Proxy] Looking for document by reference_id:', documentId)

    // First try by document.id, then by reference_id (transaction/sale ID)
    let { data: document, error: documentError } = await supabase
      .from('documents')
      .select('id, file_path, organization_id, type, reference_id')
      .eq('id', documentId)
      .single()

    // If not found by document.id, try by reference_id
    if (documentError && documentError.code === 'PGRST116') {
      console.log('[PDF Proxy] Not found by id, trying reference_id...')

      const { data: docByRef, error: refError } = await supabase
        .from('documents')
        .select('id, file_path, organization_id, type, reference_id')
        .eq('reference_id', documentId)
        .single()

      document = docByRef
      documentError = refError
    }

    console.log('[PDF Proxy] Document query result:', {
      document,
      error: documentError?.message,
    })

    if (documentError || !document) {
      console.log('[PDF Proxy] Document not found. Checking all documents...')

      // Debug: Show available documents
      const { data: allDocs } = await supabase
        .from('documents')
        .select('id, type, created_at')
        .limit(5)

      console.log('[PDF Proxy] Available documents:', allDocs)

      return NextResponse.json(
        { error: 'Document not found', debug: { documentId, available: allDocs } },
        { status: 404 }
      )
    }

    // Validate user has access to this organization's documents
    console.log('[PDF Proxy] Checking access for user:', user.id, 'org:', document.organization_id)

    const { data: membership, error: membershipError } = await supabase
      .from('organization_users') // ✅ Correct table name
      .select('organization_id, role, active')
      .eq('organization_id', document.organization_id)
      .eq('user_id', user.id)
      .eq('active', true) // Only active memberships
      .single()

    console.log('[PDF Proxy] Membership check:', {
      membership,
      error: membershipError?.message,
    })

    if (!membership) {
      // Debug: Check user's organizations
      const { data: userOrgs } = await supabase
        .from('organization_users') // ✅ Correct table name
        .select('organization_id, role, active')
        .eq('user_id', user.id)
        .eq('active', true)

      console.log('[PDF Proxy] User organizations:', userOrgs)

      return NextResponse.json(
        { error: 'Access denied', debug: { userOrgs, documentOrg: document.organization_id } },
        { status: 403 }
      )
    }

    console.log('[PDF Proxy] Access granted for user:', user.id, 'role:', membership.role)

    // Download PDF from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.file_path)

    if (downloadError || !fileData) {
      return NextResponse.json({ error: 'Failed to load PDF' }, { status: 500 })
    }

    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer()

    // Return PDF with iframe-friendly headers
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${document.type}-${documentId}.pdf"`,
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self'",
        'Cache-Control': 'private, max-age=3600', // 1 hour cache
      },
    })
  } catch (error) {
    console.error('[PDF Proxy] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
