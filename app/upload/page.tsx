"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Image as ImageIcon, ArrowLeft, Download, Loader2, Shield } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

export default function UploadPage() {
  const [image, setImage] = useState<string | null>(null)
  const [maskedImage, setMaskedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const processImage = useCallback(async (imageData: string) => {
    if (!imageData) {
      console.log('No image data available')
      return
    }

    try {
      setIsProcessing(true)
      setProgress(0)
      console.log('Starting image processing...')
      
      // Extract the base64 data and content type from the image string
      const [header, base64Data] = imageData.split(',')
      const contentType = header.split(';')[0].split(':')[1]

      if (!base64Data) {
        throw new Error('Invalid image data format')
      }
      
      console.log('Making API call with content type:', contentType)
      
      // Make API call to process the image
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: base64Data,
          filename: 'image.jpg',
          contentType: contentType,
        }),
      })

      console.log('API Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process image')
      }

      setProgress(50)
      const data = await response.json()
      console.log('API Response data:', data)

      if (!data.maskedImage) {
        throw new Error('No masked image returned from API')
      }

      setProgress(100)
      setIsProcessing(false)
      setMaskedImage(data.maskedImage)
      
      toast({
        title: "Success!",
        description: `License plate${data.metadata.licensePlatesDetected > 1 ? 's' : ''} masked successfully.`,
      })
    } catch (error) {
      console.error('Processing error:', error)
      setIsProcessing(false)
      setProgress(0)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process image. Please try again.",
        variant: "destructive",
      })
    }
  }, [image, toast])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      console.log('File dropped:', file.name, file.type)
      
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 10MB.",
          variant: "destructive",
        })
        return
      }

      try {
        const imageData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            console.log('FileReader onload triggered')
            const result = e.target?.result
            if (typeof result === 'string') {
              resolve(result)
            } else {
              reject(new Error('Failed to read file as data URL'))
            }
          }
          reader.onerror = (e) => {
            console.error('FileReader error:', e)
            reject(new Error('Failed to read file'))
          }
          reader.readAsDataURL(file)
        })

        console.log('Image data loaded, length:', imageData.length)
        setImage(imageData)
        setMaskedImage(null)
        await processImage(imageData)
      } catch (error) {
        console.error('Error reading file:', error)
        toast({
          title: "Error",
          description: "Failed to read the image file.",
          variant: "destructive",
        })
      }
    }
  }, [processImage, toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false
  })

  const handleTryAnother = () => {
    setImage(null)
    setMaskedImage(null)
    setProgress(0)
  }

  const handleDownload = () => {
    if (maskedImage) {
      const link = document.createElement('a')
      link.href = maskedImage
      link.download = 'masked-image.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Download started",
        description: "Your masked image is being downloaded.",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Upload Image</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Upload an image to automatically detect and mask license plates
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="p-6 border-b bg-muted/50">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Upload Image</h2>
                </div>
              </div>
              <div className="p-6">
                <div
                  {...getRootProps()}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50 hover:bg-muted/50'}`}
                >
                  <input {...getInputProps()} />
                  <div>
                    <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    {isDragActive ? (
                      <p className="text-primary font-medium">Drop the image here...</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-medium">Drag & drop an image here</p>
                        <p className="text-sm text-muted-foreground">or click to select a file</p>
                        <p className="text-xs text-muted-foreground mt-4">
                          Supported formats: JPEG, PNG, WebP • Max size: 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {image && (
              <Card className="overflow-hidden">
                <div className="p-6 border-b bg-muted/50">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Original Image</h2>
                  </div>
                </div>
                <div className="relative aspect-video bg-muted/50">
                  <Image
                    src={image}
                    alt="Original"
                    fill
                    className="object-contain p-4"
                    priority
                  />
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            {maskedImage ? (
              <Card className="overflow-hidden">
                <div className="p-6 border-b bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Masked Image</h2>
                  </div>
                </div>
                <div className="relative aspect-video bg-muted/50">
                  <Image
                    src={maskedImage}
                    alt="Masked"
                    fill
                    className="object-contain p-4"
                    priority
                  />
                </div>
                <div className="p-6 bg-muted/50 border-t">
                  <div className="flex justify-end gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleTryAnother}
                    >
                      Try Another
                    </Button>
                    <Button 
                      onClick={handleDownload}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </Card>
            ) : image ? (
              <Card className="overflow-hidden">
                <div className="p-6 border-b bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Processing</h2>
                  </div>
                </div>
                <div className="p-12">
                  <div className="text-center space-y-6">
                    {isProcessing ? (
                      <>
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        </div>
                        <div className="space-y-4">
                          <p className="font-medium">Processing your image...</p>
                          <div className="w-full max-w-xs mx-auto">
                            <Progress value={progress} className="h-2" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Detecting and masking license plates
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-muted-foreground">Preparing preview...</p>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="p-6 border-b bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Preview</h2>
                  </div>
                </div>
                <div className="p-12">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">No Image Selected</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload an image to see the preview
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <Card className="overflow-hidden">
              <div className="p-6 border-b bg-muted/50">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Privacy & Security</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Note:</span>{" "}
                  All images are processed securely and are not stored on our servers.
                  The masked images are generated client-side for your privacy.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}