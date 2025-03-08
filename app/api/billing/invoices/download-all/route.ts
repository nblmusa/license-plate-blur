import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import supabaseServer from "@/lib/supabase-server"; 

export async function GET() {
  try {
    const supabase = supabaseServer();
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all invoices for the user
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (invoicesError) throw invoicesError
    if (!invoices?.length) {
      return NextResponse.json({ error: 'No invoices found' }, { status: 404 })
    }

    // Create a zip file
    const zip = new JSZip()

    // Download each invoice and add to zip
    await Promise.all(invoices.map(async (invoice) => {
      if (!invoice.invoice_pdf) return

      try {
        const response = await fetch(invoice.invoice_pdf)
        const blob = await response.blob()
        const fileName = `invoice-${new Date(invoice.created_at).toISOString().split('T')[0]}.pdf`
        zip.file(fileName, blob)
      } catch (error) {
        console.error(`Failed to download invoice ${invoice.id}:`, error)
      }
    }))

    // Generate zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const arrayBuffer = await zipBlob.arrayBuffer()

    // Return zip file
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=invoices.zip'
      }
    })
  } catch (error) {
    console.error('Error downloading invoices:', error)
    return NextResponse.json(
      { error: 'Failed to download invoices' },
      { status: 500 }
    )
  }
} 