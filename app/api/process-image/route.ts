import { NextResponse } from 'next/server'
import sharp, { Blend } from 'sharp'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { detectAndMask } from '@/app/lib/image-processing'

export const dynamic = 'force-dynamic'

async function uploadToStorage(
  supabase: any,
  buffer: Buffer,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('processed-images')
    .upload(path, buffer, {
      contentType: 'image/jpeg',
      upsert: true
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('processed-images')
    .getPublicUrl(path)

  return publicUrl
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    const isAuthenticated = !!session

    let file: File | null = null
    let logo: File | null = null
    let logoSettings: string | null = null
    let watermarkSettings: any = null

    const contentType = request.headers.get('content-type')

    // Try to parse as FormData first
    if (contentType?.includes('multipart/form-data')) {
      try {
        const formData = await request.formData()
        const entries = Array.from(formData.entries())
        console.log('FormData entries:', entries.map(([key, value]) => ({
          key,
          type: value instanceof File ? 'File' : 'string',
          fileDetails: value instanceof File ? {
            name: value.name,
            type: value.type,
            size: value.size
          } : null
        })))
        
        file = formData.get('file') as File
        logo = formData.get('logo') as File | null
        logoSettings = formData.get('logoSettings') as string | null
        watermarkSettings = formData.get('watermarkSettings') ? 
          JSON.parse(formData.get('watermarkSettings') as string) : 
          null
      } catch (error) {
        console.error('FormData parsing error:', error)
        return NextResponse.json({
          error: 'Failed to parse form data',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 400 })
      }
    } 
    // Try JSON if not FormData
    else if (contentType?.includes('application/json')) {
      try {
        const body = await request.json()
        
        if (body.image) {
          const base64Data = body.image.split(',')[1] || body.image // Handle both with and without data URL prefix
          const binaryData = Buffer.from(base64Data, 'base64')
          const filename = body.filename || 'image.jpg'
          file = new File([binaryData], filename, { type: 'image/jpeg' })
        }
        
        if (body.logo) {
          const logoBase64 = body.logo.split(',')[1] || body.logo
          logo = new File([Buffer.from(logoBase64, 'base64')], 'logo.png', { type: 'image/png' })
        }
        
        // Handle processing options
        if (body.processingOptions) {
          logoSettings = JSON.stringify(body.processingOptions.logo)
          watermarkSettings = body.processingOptions.watermark
        }

        // Store watermark settings
        if (body.watermarkSettings) {
          watermarkSettings = body.watermarkSettings
        }

        console.log('watermarkSettings1', watermarkSettings)
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError)
        return NextResponse.json({
          error: 'Failed to parse JSON body',
          details: jsonError instanceof Error ? jsonError.message : 'Unknown error'
        }, { status: 400 })
      }
    } else {
      console.error('Unsupported content type:', contentType)
      return NextResponse.json({
        error: 'Unsupported content type',
        expected: 'multipart/form-data or application/json',
        received: contentType
      }, { status: 400 })
    }

    if (!file) {
      console.error('No file found in request')
      return NextResponse.json({
        error: 'No file provided or invalid format',
        contentType,
        isFormData: contentType?.includes('multipart/form-data'),
        isJson: contentType?.includes('application/json')
      }, { status: 400 })
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Convert logo to Buffer if provided
    let logoBuffer: Buffer | undefined
    let parsedLogoSettings: any | undefined

    if (logo) {
      const logoArrayBuffer = await logo.arrayBuffer()
      logoBuffer = Buffer.from(logoArrayBuffer)
    }

    if (logoSettings) {
      try {
        parsedLogoSettings = JSON.parse(logoSettings)
      } catch (error) {
        console.error('Error parsing logo settings:', error)
      }
    }

    // Process the image
    console.log('Starting image processing with buffer size:', buffer.length)
    const result = await detectAndMask(
      buffer,
      logoBuffer,
      parsedLogoSettings,
      watermarkSettings
    )
    console.log('Processing result:', {
      hasProcessedImage: !!result.processedImage,
      processedImageSize: result.processedImage?.length,
      detectedPlates: result.detectedPlates,
      hasError: !!result.error,
      error: result.error?.message
    })

    let processedImage = result.processedImage

    // Create thumbnail from the processed image
    console.log('Creating thumbnail from processed image')
    const thumbnail = await sharp(processedImage)
      .resize(320, 240, { 
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer()

    // Upload processed image and thumbnail if authenticated
    let processedImageUrl: string | null = null
    let thumbnailUrl: string | null = null

    if (isAuthenticated && session) {
      console.log('User is authenticated, uploading to storage')
      const userId = session.user.id
      const timestamp = Date.now()
      const filename = file.name.replace(/\.[^/.]+$/, '')
      
      try {
        // Upload processed image
        processedImageUrl = await uploadToStorage(
          supabase,
          processedImage,
          `${userId}/${timestamp}_${filename}_processed.jpg`
        )
        console.log('Processed image uploaded successfully:', processedImageUrl)

        // Upload thumbnail of the processed image
        thumbnailUrl = await uploadToStorage(
          supabase,
          thumbnail,
          `${userId}/${timestamp}_${filename}_thumb.jpg`
        )
        console.log('Thumbnail uploaded successfully:', thumbnailUrl)

        // Record the processed image in the database
        const { error: dbError } = await supabase
          .from('processed_images')
          .insert([{
            user_id: userId,
            filename: file.name,
            license_plates_detected: result.detectedPlates,
            processed_url: processedImageUrl,
            thumbnail_url: thumbnailUrl,
            metadata: {
              originalSize: buffer.length,
              processedSize: processedImage.length,
              logoApplied: !!logoBuffer
            }
          }])

        if (dbError) {
          console.error('Database insert error:', dbError)
          throw dbError
        }

        // Update user stats
        const { error: statsError } = await supabase.rpc(
          'update_user_stats',
          { 
            p_user_id: userId,
            p_plates_detected: result.detectedPlates
          }
        )

        if (statsError) {
          console.error('Stats update error:', statsError)
          throw statsError
        }
      } catch (uploadError) {
        console.error('Upload/database error:', uploadError)
        throw uploadError
      }
    }

    // Convert Buffer to base64 string for response
    console.log('Converting processed image to base64, size:', processedImage.length)
    const imageContentType = file.type || 'image/jpeg'
    const base64Image = `data:${imageContentType};base64,${processedImage.toString('base64')}`

    return NextResponse.json({
      success: true,
      maskedImage: base64Image,
      metadata: {
        licensePlatesDetected: result.detectedPlates,
        originalSize: buffer.length,
        processedSize: processedImage.length,
        logoApplied: !!logoBuffer,
        contentType: imageContentType
      },
      processedImageUrl,
      thumbnailUrl
    })
  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
}