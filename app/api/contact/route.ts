import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

async function verifyRecaptcha(token: string) {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  })

  const data = await response.json()
  return data.success
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const firstName = formData.get('firstName')
    const lastName = formData.get('lastName')
    const email = formData.get('email')
    const subject = formData.get('subject')
    const message = formData.get('message')
    const recaptchaToken = formData.get('recaptchaToken')

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message || !recaptchaToken) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.toString())) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Verify reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken.toString())
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { error: 'Invalid reCAPTCHA. Please try again.' },
        { status: 400 }
      )
    }

    // Get Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Store the contact form submission in the database
    const { error: insertError } = await supabase
      .from('contact_submissions')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
          subject: subject,
          message: message,
          status: 'new'
        }
      ])

    if (insertError) {
      console.error('Failed to store contact submission:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit contact form' },
        { status: 500 }
      )
    }

    // Here you could add additional logic like:
    // - Sending notification emails to admins
    // - Integration with a CRM system
    // - Adding to a mailing list (with consent)

    return NextResponse.json({
      message: 'Contact form submitted successfully'
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    )
  }
} 