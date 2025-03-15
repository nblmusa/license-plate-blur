"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Image as ImageIcon, Download, Upload, Loader2, Shield, Settings, Undo, Redo, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDropzone } from "react-dropzone"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { LogoSettings, DEFAULT_SETTINGS } from "../lib/config"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface EditorState {
  detectionTypes: {
    faces: boolean
    licensePlates: boolean
  }
  maskingStyle: 'blur' | 'solid' | 'logo'
  blurRadius: number
  blurOpacity: number
  solidColor: string
  solidOpacity: number
  logo: {
    enabled: boolean
    position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center'
    size: number
    opacity: number
    url: string
  }
  watermark: {
    enabled: boolean
    text: string
    position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center'
    size: number
    opacity: number
    color: string
  }
  preview: {
    splitView: boolean
    showDetectionAreas: boolean
    splitPosition: number
  }
}

export default function StudioPage() {
  const [image, setImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [editorState, setEditorState] = useState<EditorState>({
    detectionTypes: {
      faces: true,
      licensePlates: true
    },
    maskingStyle: 'blur',
    blurRadius: 20,
    blurOpacity: 100,
    solidColor: '#000000',
    solidOpacity: 100,
    logo: {
      enabled: false,
      position: 'center',
      size: 50,
      opacity: 100,
      url: ''
    },
    watermark: {
      enabled: false,
      text: '© Protected',
      position: 'bottomRight',
      size: 14,
      opacity: 70,
      color: '#ffffff'
    },
    preview: {
      splitView: false,
      showDetectionAreas: true,
      splitPosition: 50
    }
  })
  const { toast } = useToast()

  // Check authentication status
  useState(() => {
    const supabase = createClientComponentClient()
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }
    checkAuth()
  })

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        setImage(result)
        // Reset editor state when new image is loaded
        setEditorState({
          detectionTypes: {
            faces: true,
            licensePlates: true
          },
          maskingStyle: 'blur',
          blurRadius: 20,
          blurOpacity: 100,
          solidColor: '#000000',
          solidOpacity: 100,
          logo: {
            enabled: false,
            position: 'center',
            size: 50,
            opacity: 100,
            url: ''
          },
          watermark: {
            enabled: false,
            text: '© Protected',
            position: 'bottomRight',
            size: 14,
            opacity: 70,
            color: '#ffffff'
          },
          preview: {
            splitView: false,
            showDetectionAreas: true,
            splitPosition: 50
          }
        })
      }
    }
    reader.readAsDataURL(file)

    toast({
      title: "Image loaded",
      description: "Your image has been loaded into the editor.",
    })
  }, [toast])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  })

  const handleProcess = async () => {
    if (!image) return

    setIsProcessing(true)
    try {
      // Extract base64 and content type
      const [header, base64Data] = image.split(',')
      const contentType = header.split(';')[0].split(':')[1]

      // Prepare request body with all masking settings
      const requestBody = {
        image: base64Data,
        contentType,
        processingOptions: {
          detection: {
            faces: editorState.detectionTypes.faces,
            licensePlates: editorState.detectionTypes.licensePlates
          },
          maskingStyle: editorState.maskingStyle,
          blur: {
            radius: editorState.blurRadius,
            opacity: editorState.blurOpacity / 100
          },
          solid: {
            color: editorState.solidColor,
            opacity: editorState.solidOpacity / 100
          },
          logo: editorState.maskingStyle === 'logo' ? {
            url: editorState.logo.url,
            position: editorState.logo.position,
            size: editorState.logo.size,
            opacity: editorState.logo.opacity / 100
          } : null,
          watermark: editorState.watermark.enabled ? {
            text: editorState.watermark.text,
            position: editorState.watermark.position,
            size: editorState.watermark.size,
            opacity: editorState.watermark.opacity / 100,
            color: editorState.watermark.color
          } : null
        },
        isAuthenticated
      }

      // Make API request
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process image')
      }

      const data = await response.json()
      
      // Check if we received a base64 string or a base64 string with data URI
      let processedImageData = data.maskedImage
      if (!processedImageData) {
        throw new Error('No masked image returned from API')
      }

      // If the response doesn't include the data URI prefix, add it
      if (!processedImageData.startsWith('data:')) {
        processedImageData = `data:${contentType};base64,${processedImageData}`
      }

      // Update the processed image with the result
      setProcessedImage(processedImageData)
      
      toast({
        title: "Processing complete",
        description: `Successfully processed image with ${
          [
            editorState.detectionTypes.faces && 'face',
            editorState.detectionTypes.licensePlates && 'license plate'
          ].filter(Boolean).join(' and ')
        } detection.`,
      })

      // Log for debugging
      console.log('Processed image data:', processedImageData.substring(0, 100) + '...')
    } catch (error) {
      console.error('Processing error:', error)
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to process image",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async () => {
    if (!processedImage) return

    const link = document.createElement('a')
    link.href = processedImage
    link.download = 'processed-image.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: "Your processed image is being downloaded.",
    })
  }

  const handleReset = () => {
    setEditorState({
      detectionTypes: {
        faces: true,
        licensePlates: true
      },
      maskingStyle: 'blur',
      blurRadius: 20,
      blurOpacity: 100,
      solidColor: '#000000',
      solidOpacity: 100,
      logo: {
        enabled: false,
        position: 'center',
        size: 50,
        opacity: 100,
        url: ''
      },
      watermark: {
        enabled: false,
        text: '© Protected',
        position: 'bottomRight',
        size: 14,
        opacity: 70,
        color: '#ffffff'
      },
      preview: {
        splitView: false,
        showDetectionAreas: true,
        splitPosition: 50
      }
    })
    toast({
      title: "Settings reset",
      description: "All editor settings have been reset to default values.",
    })
  }

  const imagePreview = (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <Label className="text-lg font-semibold">
              {processedImage ? "Processed Image" : "Original Image"}
            </Label>
          </div>
          {processedImage && (
            <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditorState(prev => ({
                  ...prev,
                  preview: { ...prev.preview, splitView: !prev.preview.splitView }
                }))}
                className="hover:bg-background"
                title="Toggle split view to compare original and processed images"
              >
                {editorState.preview.splitView ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary/20 rounded" />
                    <div className="w-4 h-4 bg-primary/40 rounded" />
                  </div>
                ) : (
                  <div className="w-8 h-4 bg-primary/20 rounded" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditorState(prev => ({
                  ...prev,
                  preview: { ...prev.preview, showDetectionAreas: !prev.preview.showDetectionAreas }
                }))}
                className="hover:bg-background"
                title="Toggle detection area indicators"
              >
                <div className={`w-8 h-4 rounded border-2 ${editorState.preview.showDetectionAreas ? 'border-primary' : 'border-muted-foreground/30'}`} />
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {processedImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="hover:bg-muted/50 font-medium"
              title="Download processed image"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setImage(null)
              setProcessedImage(null)
            }}
            className="hover:bg-destructive/10 hover:text-destructive font-medium"
            title="Clear current image"
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="relative aspect-video bg-muted/50 rounded-xl overflow-hidden shadow-inner">
        {processedImage ? (
          editorState.preview.splitView ? (
            <div className="relative w-full h-full">
              <Image
                src={image!}
                alt="Original"
                fill
                className="object-contain"
                style={{
                  clipPath: `polygon(0 0, ${editorState.preview.splitPosition}% 0, ${editorState.preview.splitPosition}% 100%, 0 100%)`
                }}
              />
              <Image
                src={processedImage}
                alt="Processed"
                fill
                className="object-contain"
                style={{
                  clipPath: `polygon(${editorState.preview.splitPosition}% 0, 100% 0, 100% 100%, ${editorState.preview.splitPosition}% 100%)`
                }}
              />
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-primary/50 cursor-ew-resize group"
                style={{ 
                  left: `${editorState.preview.splitPosition}%`,
                  transform: 'translateX(-50%)'
                }}
                onMouseDown={(e) => {
                  const container = e.currentTarget.parentElement!
                  const startX = e.pageX
                  const startPos = editorState.preview.splitPosition

                  const handleMouseMove = (e: MouseEvent) => {
                    const rect = container.getBoundingClientRect()
                    const newPos = Math.max(0, Math.min(100, startPos + ((e.pageX - startX) / rect.width) * 100))
                    setEditorState(prev => ({
                      ...prev,
                      preview: { ...prev.preview, splitPosition: newPos }
                    }))
                  }

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }

                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/90 group-hover:bg-primary flex items-center justify-center shadow-lg">
                  <div className="w-4 h-0.5 bg-white rounded-full" />
                </div>
                <div className="absolute -left-[1px] inset-y-0 w-[3px] bg-primary/20 group-hover:bg-primary/30" />
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                {Math.round(editorState.preview.splitPosition)}%
              </div>
            </div>
          ) : (
            <Image
              src={processedImage}
              alt="Processed"
              fill
              className="object-contain"
            />
          )
        ) : (
          <>
            <Image
              src={image!}
              alt="Original"
              fill
              className="object-contain"
            />
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <p className="text-sm text-white font-medium animate-pulse">
                    Processing image...
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Detection Area Indicators */}
        {processedImage && editorState.preview.showDetectionAreas && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[20%] left-[30%] w-[100px] h-[60px] border-2 border-primary/80 rounded-md shadow-lg backdrop-blur-[2px]">
              <div className="absolute -top-7 left-0 bg-primary/90 text-white text-xs px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                License Plate
              </div>
            </div>
            <div className="absolute top-[40%] left-[50%] w-[120px] h-[120px] border-2 border-yellow-500/80 rounded-md shadow-lg backdrop-blur-[2px]">
              <div className="absolute -top-7 left-0 bg-yellow-500/90 text-white text-xs px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                Face
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-muted/10">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" asChild className="shrink-0 hover:bg-muted/50">
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Privacy Studio</h1>
                <p className="text-sm text-muted-foreground">
                  Protect sensitive information in your images
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={!image}
                className="hover:bg-muted/50"
              >
                <Undo className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleProcess}
                disabled={!image || isProcessing}
                className="min-w-[100px] bg-background hover:bg-muted/50 font-medium"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Process Image
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={!processedImage}
                className="bg-primary hover:bg-primary/90 font-medium"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Column - Image Preview */}
            <div className="lg:col-span-8 space-y-8">
              {/* Image Upload/Preview Area */}
              <Card className="overflow-hidden border-2 shadow-sm hover:border-primary/50 transition-colors duration-200">
                {image ? imagePreview : (
                  <div
                    {...getRootProps()}
                    className={`aspect-video flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-all
                      ${isDragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-muted hover:border-primary/50 hover:bg-muted/50'}`}
                  >
                    <input {...getInputProps()} />
                    <div className="text-center space-y-6">
                      <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="h-10 w-10 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-medium mb-1">Drop your image here</p>
                        <p className="text-sm text-muted-foreground">
                          or click to select a file
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Supports JPG, PNG and WebP
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Processing History */}
              <Card className="p-6 border-2 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">Recent Activity</h2>
                </div>
                <div className="p-8 border-2 border-dashed rounded-lg bg-muted/5">
                  <p className="text-center text-muted-foreground">
                    No processing history yet
                  </p>
                </div>
              </Card>
            </div>

            {/* Right Column - Settings */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-2 shadow-sm">
                <Tabs defaultValue="detection" className="w-full">
                  <TabsList className="w-full p-1 bg-muted/30">
                    <TabsTrigger 
                      value="detection" 
                      className="flex-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      title="Configure detection settings"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Detection
                    </TabsTrigger>
                    <TabsTrigger 
                      value="masking" 
                      className="flex-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      title="Choose masking style and options"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Masking
                    </TabsTrigger>
                    <TabsTrigger 
                      value="watermark" 
                      className="flex-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      title="Add and customize watermark"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Watermark
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="detection" className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <Label className="text-lg font-semibold">Detection Types</Label>
                        </div>
                        <div className="grid gap-4 p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label className="font-medium">Detect Faces</Label>
                              <p className="text-sm text-muted-foreground">Automatically detect and mask faces in the image</p>
                            </div>
                            <Switch
                              checked={editorState.detectionTypes.faces}
                              onCheckedChange={(checked) => 
                                setEditorState(prev => ({
                                  ...prev,
                                  detectionTypes: { ...prev.detectionTypes, faces: checked }
                                }))
                              }
                              className="data-[state=checked]:bg-primary"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label className="font-medium">Detect License Plates</Label>
                              <p className="text-sm text-muted-foreground">Automatically detect and mask license plates</p>
                            </div>
                            <Switch
                              checked={editorState.detectionTypes.licensePlates}
                              onCheckedChange={(checked) => 
                                setEditorState(prev => ({
                                  ...prev,
                                  detectionTypes: { ...prev.detectionTypes, licensePlates: checked }
                                }))
                              }
                              className="data-[state=checked]:bg-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="masking" className="p-6 space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <ImageIcon className="h-5 w-5 text-primary" />
                          </div>
                          <Label className="text-lg font-semibold">Masking Style</Label>
                        </div>
                        
                        <Tabs 
                          defaultValue={editorState.maskingStyle} 
                          onValueChange={(value: any) => setEditorState(prev => ({ ...prev, maskingStyle: value }))}
                          className="w-full"
                        >
                          <TabsList className="grid w-full grid-cols-3 gap-2 bg-muted/30 rounded-lg p-2">
                            <TabsTrigger 
                              value="blur" 
                              className="flex flex-col items-center gap-2 p-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                              <div className="w-full aspect-video bg-muted rounded-md overflow-hidden relative">
                                <div className="absolute inset-0 backdrop-blur-md" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full bg-foreground/20 backdrop-blur-xl" />
                                </div>
                              </div>
                              <span className="font-medium">Blur</span>
                            </TabsTrigger>
                            <TabsTrigger 
                              value="solid" 
                              className="flex flex-col items-center gap-2 p-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                              <div className="w-full aspect-video bg-muted rounded-md overflow-hidden relative">
                                <div className="absolute inset-0 bg-black/80" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full bg-black" />
                                </div>
                              </div>
                              <span className="font-medium">Solid</span>
                            </TabsTrigger>
                            <TabsTrigger 
                              value="logo" 
                              className="flex flex-col items-center gap-2 p-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                            >
                              <div className="w-full aspect-video bg-muted rounded-md overflow-hidden relative">
                                <div className="absolute inset-0 bg-white/10" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Shield className="w-8 h-8 text-primary" />
                                </div>
                              </div>
                              <span className="font-medium">Logo</span>
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="blur" className="mt-6">
                            <div className="space-y-6 p-4 bg-muted/30 rounded-lg">
                              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                <div className="absolute inset-0 backdrop-blur-[20px]" style={{
                                  backdropFilter: `blur(${editorState.blurRadius}px)`,
                                  opacity: editorState.blurOpacity / 100
                                }} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-16 h-16 rounded-full bg-foreground/20" />
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="font-medium">Blur Radius</Label>
                                    <span className="text-sm font-medium">{editorState.blurRadius}px</span>
                                  </div>
                                  <Slider
                                    value={[editorState.blurRadius]}
                                    min={5}
                                    max={50}
                                    step={1}
                                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                                    onValueChange={([value]) => setEditorState(prev => ({ ...prev, blurRadius: value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="font-medium">Blur Opacity</Label>
                                    <span className="text-sm font-medium">{editorState.blurOpacity}%</span>
                                  </div>
                                  <Slider
                                    value={[editorState.blurOpacity]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                                    onValueChange={([value]) => setEditorState(prev => ({ ...prev, blurOpacity: value }))}
                                  />
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="solid" className="mt-6">
                            <div className="space-y-6 p-4 bg-muted/30 rounded-lg">
                              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                <div className="absolute inset-0" style={{
                                  backgroundColor: editorState.solidColor,
                                  opacity: editorState.solidOpacity / 100
                                }} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-16 h-16 rounded-full" style={{ backgroundColor: editorState.solidColor }} />
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="font-medium">Solid Color</Label>
                                  <div className="flex gap-2">
                                    <div className="relative">
                                      <Input
                                        type="color"
                                        value={editorState.solidColor}
                                        onChange={(e) => setEditorState(prev => ({ ...prev, solidColor: e.target.value }))}
                                        className="w-20 p-1 h-9 cursor-pointer"
                                      />
                                      <div 
                                        className="absolute inset-0 rounded-md pointer-events-none"
                                        style={{ backgroundColor: editorState.solidColor }}
                                      />
                                    </div>
                                    <Input
                                      type="text"
                                      value={editorState.solidColor}
                                      onChange={(e) => setEditorState(prev => ({ ...prev, solidColor: e.target.value }))}
                                      className="flex-1 font-mono"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="font-medium">Opacity</Label>
                                    <span className="text-sm font-medium">{editorState.solidOpacity}%</span>
                                  </div>
                                  <Slider
                                    value={[editorState.solidOpacity]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                                    onValueChange={([value]) => setEditorState(prev => ({ ...prev, solidOpacity: value }))}
                                  />
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="logo" className="mt-6">
                            <div className="space-y-6 p-4 bg-muted/30 rounded-lg">
                              <div className="space-y-2">
                                <Label className="font-medium">Logo Image</Label>
                                <div className="grid gap-4">
                                  <div className="flex gap-2">
                                    <Input
                                      type="text"
                                      value={editorState.logo.url}
                                      onChange={(e) => setEditorState(prev => ({
                                        ...prev,
                                        logo: { ...prev.logo, url: e.target.value }
                                      }))}
                                      placeholder="Enter logo URL"
                                      className="flex-1"
                                    />
                                    <Button
                                      variant="secondary"
                                      onClick={() => {
                                        const input = document.createElement('input')
                                        input.type = 'file'
                                        input.accept = 'image/*'
                                        input.onchange = async (e) => {
                                          const file = (e.target as HTMLInputElement).files?.[0]
                                          if (file) {
                                            const reader = new FileReader()
                                            reader.onload = (e) => {
                                              const result = e.target?.result
                                              if (typeof result === 'string') {
                                                setEditorState(prev => ({
                                                  ...prev,
                                                  logo: { ...prev.logo, url: result }
                                                }))
                                              }
                                            }
                                            reader.readAsDataURL(file)
                                          }
                                        }
                                        input.click()
                                      }}
                                      className="shrink-0"
                                    >
                                      Upload
                                    </Button>
                                  </div>
                                  
                                  {editorState.logo.url && (
                                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                      <Image
                                        src={editorState.logo.url}
                                        alt="Logo preview"
                                        fill
                                        className="object-contain"
                                        style={{
                                          opacity: editorState.logo.opacity / 100
                                        }}
                                        onError={() => {
                                          toast({
                                            title: "Error loading logo",
                                            description: "Please check the URL or upload a different image.",
                                            variant: "destructive",
                                          })
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="font-medium">Logo Position</Label>
                                <div className="grid grid-cols-3 gap-2 p-4 bg-muted rounded-lg aspect-video relative">
                                  {['topLeft', 'topRight', 'bottomLeft', 'bottomRight', 'center'].map((position) => (
                                    <Button
                                      key={position}
                                      variant={editorState.logo.position === position ? "default" : "outline"}
                                      className={`h-8 w-8 p-0 ${
                                        position === 'center' ? 'col-start-2 row-start-2' :
                                        position === 'topLeft' ? 'col-start-1 row-start-1' :
                                        position === 'topRight' ? 'col-start-3 row-start-1' :
                                        position === 'bottomLeft' ? 'col-start-1 row-start-3' :
                                        'col-start-3 row-start-3'
                                      }`}
                                      onClick={() => setEditorState(prev => ({
                                        ...prev,
                                        logo: { ...prev.logo, position: position as any }
                                      }))}
                                    >
                                      <div className="h-2 w-2 bg-current rounded-sm" />
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="font-medium">Logo Size</Label>
                                  <span className="text-sm font-medium">{editorState.logo.size}%</span>
                                </div>
                                <Slider
                                  value={[editorState.logo.size]}
                                  min={10}
                                  max={100}
                                  step={1}
                                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                                  onValueChange={([value]) => setEditorState(prev => ({
                                    ...prev,
                                    logo: { ...prev.logo, size: value }
                                  }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="font-medium">Logo Opacity</Label>
                                  <span className="text-sm font-medium">{editorState.logo.opacity}%</span>
                                </div>
                                <Slider
                                  value={[editorState.logo.opacity]}
                                  min={0}
                                  max={100}
                                  step={1}
                                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                                  onValueChange={([value]) => setEditorState(prev => ({
                                    ...prev,
                                    logo: { ...prev.logo, opacity: value }
                                  }))}
                                />
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="watermark" className="p-6 space-y-6">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <ImageIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <Label className="text-lg font-semibold">Watermark Settings</Label>
                          <p className="text-sm text-muted-foreground">Add a text watermark to your processed image</p>
                        </div>
                        <Switch
                          checked={editorState.watermark.enabled}
                          onCheckedChange={(checked) => setEditorState(prev => ({
                            ...prev,
                            watermark: { ...prev.watermark, enabled: checked }
                          }))}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>

                      {editorState.watermark.enabled && (
                        <div className="space-y-6">
                          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                            <div className="space-y-2">
                              <Label className="font-medium">Watermark Text</Label>
                              <Input
                                value={editorState.watermark.text}
                                onChange={(e) => setEditorState(prev => ({
                                  ...prev,
                                  watermark: { ...prev.watermark, text: e.target.value }
                                }))}
                                className="font-medium"
                                placeholder="Enter watermark text"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="font-medium">Position</Label>
                              <div className="grid grid-cols-3 gap-2 p-4 bg-muted rounded-lg aspect-video relative">
                                {['topLeft', 'topRight', 'center', 'bottomLeft', 'bottomRight'].map((position) => (
                                  <Button
                                    key={position}
                                    variant={editorState.watermark.position === position ? "default" : "outline"}
                                    className={`h-8 p-0 ${
                                      position === 'center' ? 'col-start-2 row-start-2' :
                                      position === 'topLeft' ? 'col-start-1 row-start-1' :
                                      position === 'topRight' ? 'col-start-3 row-start-1' :
                                      position === 'bottomLeft' ? 'col-start-1 row-start-3' :
                                      'col-start-3 row-start-3'
                                    }`}
                                    onClick={() => setEditorState(prev => ({
                                      ...prev,
                                      watermark: { ...prev.watermark, position: position as any }
                                    }))}
                                  >
                                    <span className="text-xs">
                                      {position === 'topLeft' ? 'Top Left' :
                                       position === 'topRight' ? 'Top Right' :
                                       position === 'center' ? 'Center' :
                                       position === 'bottomLeft' ? 'Bottom Left' :
                                       'Bottom Right'}
                                    </span>
                                  </Button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="font-medium">Style</Label>
                              <div className="grid gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-sm text-muted-foreground">Color</Label>
                                    <div className="flex gap-2">
                                      <div className="relative">
                                        <Input
                                          type="color"
                                          value={editorState.watermark.color}
                                          onChange={(e) => setEditorState(prev => ({
                                            ...prev,
                                            watermark: { ...prev.watermark, color: e.target.value }
                                          }))}
                                          className="w-20 p-1 h-8 cursor-pointer"
                                        />
                                        <div 
                                          className="absolute inset-0 rounded-md pointer-events-none"
                                          style={{ backgroundColor: editorState.watermark.color }}
                                        />
                                      </div>
                                      <Input
                                        type="text"
                                        value={editorState.watermark.color}
                                        onChange={(e) => setEditorState(prev => ({
                                          ...prev,
                                          watermark: { ...prev.watermark, color: e.target.value }
                                        }))}
                                        className="flex-1 font-mono h-8 text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-sm text-muted-foreground">Size</Label>
                                    <span className="text-sm font-medium">{editorState.watermark.size}px</span>
                                  </div>
                                  <Slider
                                    value={[editorState.watermark.size]}
                                    min={8}
                                    max={48}
                                    step={1}
                                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                                    onValueChange={([value]) => setEditorState(prev => ({
                                      ...prev,
                                      watermark: { ...prev.watermark, size: value }
                                    }))}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-sm text-muted-foreground">Opacity</Label>
                                    <span className="text-sm font-medium">{editorState.watermark.opacity}%</span>
                                  </div>
                                  <Slider
                                    value={[editorState.watermark.opacity]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                                    onValueChange={([value]) => setEditorState(prev => ({
                                      ...prev,
                                      watermark: { ...prev.watermark, opacity: value }
                                    }))}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Watermark Preview */}
                          <div className="space-y-2">
                            <Label className="font-medium">Preview</Label>
                            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                              <div className={`absolute p-4 ${
                                editorState.watermark.position === 'topLeft' ? 'top-0 left-0' :
                                editorState.watermark.position === 'topRight' ? 'top-0 right-0' :
                                editorState.watermark.position === 'bottomLeft' ? 'bottom-0 left-0' :
                                editorState.watermark.position === 'center' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
                                'bottom-0 right-0'
                              }`}>
                                <p style={{
                                  color: editorState.watermark.color,
                                  fontSize: `${editorState.watermark.size}px`,
                                  opacity: editorState.watermark.opacity / 100,
                                  fontWeight: 500,
                                  textAlign: editorState.watermark.position === 'center' ? 'center' : 'left'
                                }}>
                                  {editorState.watermark.text || 'Watermark Preview'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Pro Features Notice */}
              {!isAuthenticated && (
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">Unlock Pro Features</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Get access to advanced masking tools and batch processing
                      </p>
                      <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90 font-medium">
                        <Link href="/login">Sign In to Get Started</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 