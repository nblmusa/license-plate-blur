"use client"

import { useCallback, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, Image as ImageIcon, ArrowLeft, Download, Loader2, Shield, X, ImagePlus, Settings, Keyboard, History, Lock, Stamp } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAnalytics } from "@/hooks/useAnalytics"
import { LogoSettings, DEFAULT_SETTINGS, POSITIONS } from "../lib/config"

type LogoPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface ProcessingOptions {
  confidenceThreshold: number;
  borderColor: string;
  borderWidth: number;
  maskingStyle: 'blur' | 'solid' | 'pixelate';
  blurStrength: number;
  solidColor: string;
  pixelateSize: number;
}

interface WatermarkSettings {
  text: string;
  position: string;
  size: number;
  opacity: number;
  color: string;
  font: string;
}

interface ProcessImageParams {
  imageData: string;
  filename: string;
  isAuthenticated: boolean;
  processingOptions: ProcessingOptions;
  logo?: string | null;
  logoSettings?: LogoSettings;
  useWatermark?: boolean;
  watermarkSettings?: WatermarkSettings;
}

async function processImage({
  imageData,
  filename,
  isAuthenticated,
  processingOptions,
  logo,
  logoSettings,
  useWatermark,
  watermarkSettings
}: ProcessImageParams) {
  // Extract base64 and content type
  const [header, base64Data] = imageData.split(',')
  const contentType = header.split(';')[0].split(':')[1]

  // Prepare request body
  const requestBody: any = {
    image: base64Data,
    filename,
    contentType,
    processingOptions,
    isAuthenticated,
  }

  // Add logo if provided
  if (logo) {
    const [, logoBase64Data] = logo.split(',')
    if (logoBase64Data) {
      requestBody.logo = logoBase64Data
      requestBody.logoSettings = logoSettings
    }
  }

  // Add watermark settings if needed
  if (!isAuthenticated || useWatermark) {
    requestBody.watermarkSettings = useWatermark ? watermarkSettings : {
      text: 'Sign up to remove watermark',
      position: 'bottom-right',
      size: 20,
      opacity: 70,
      color: '#ffffff',
      font: 'Arial'
    }
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
  if (!data.maskedImage) {
    throw new Error('No masked image returned from API')
  }

  return data
}

export default function UploadPage() {
  const [image, setImage] = useState<string | null>(null)
  const [logo, setLogo] = useState<string | null>(null)
  const [maskedImage, setMaskedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [useLogo, setUseLogo] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    position: 'center',
    size: 100,
    opacity: 100,
    maskType: 'blur',
    blur: {
      radius: 30,
      opacity: 1
    }
  })
  const [batchQueue, setBatchQueue] = useState<Array<{
    id: string;
    file: File;
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: number;
    result?: string;
    error?: string;
  }>>([])
  const [isBatchProcessing, setIsBatchProcessing] = useState(false)
  const { toast } = useToast()
  const [processingOptions, setProcessingOptions] = useState({
    confidenceThreshold: 0.5,
    borderColor: '#ffffff',
    borderWidth: 2,
    maskingStyle: 'blur' as 'blur' | 'solid' | 'pixelate',
    blurStrength: 20,
    solidColor: '#000000',
    pixelateSize: 10
  })
  const [totalSize, setTotalSize] = useState(0)
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const [processingHistory, setProcessingHistory] = useState<Array<{
    id: string;
    filename: string;
    timestamp: string;
    settings: typeof processingOptions;
    logoSettings?: typeof logoSettings;
    usedLogo: boolean;
    detections: number;
  }>>([])
  const analytics = useAnalytics()
  const [watermark, setWatermark] = useState<string | null>(null)
  const [watermarkSettings, setWatermarkSettings] = useState({
    text: 'Watermark',
    position: 'bottom-right',
    size: 20,
    opacity: 70,
    color: '#000000',
    font: 'Arial'
  })
  const [useWatermark, setUseWatermark] = useState(false)

  // Check authentication status
  useEffect(() => {
    const supabase = createClientComponentClient()
    
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Modified processBatchQueue to include analytics
  const processBatchQueue = useCallback(async () => {
    if (isBatchProcessing || batchQueue.length === 0) return

    setIsBatchProcessing(true)
    let currentQueue = [...batchQueue]

    // Track batch processing start
    analytics.trackProcessingStart(batchQueue.length)
    const startTime = Date.now()

    for (let i = 0; i < currentQueue.length; i++) {
      const item = currentQueue[i]
      if (item.status !== 'pending') continue

      try {
        // Track individual file upload
        analytics.trackImageUpload(item.file.type, item.file.size)

        // Update status to processing
        currentQueue = currentQueue.map((qItem, index) => 
          index === i ? { ...qItem, status: 'processing' as const } : qItem
        )
        setBatchQueue(currentQueue)

        // Read file
        const imageData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result
            if (typeof result === 'string') {
              resolve(result)
            } else {
              reject(new Error('Failed to read file'))
            }
          }
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(item.file)
        })

        // Process image
        const data = await processImage({
          imageData,
          filename: item.file.name,
          isAuthenticated,
          processingOptions,
          logo: useLogo ? logo : null,
          logoSettings: useLogo ? logoSettings : undefined,
          useWatermark,
          watermarkSettings
        })

        // Add to history
        setProcessingHistory(prev => [{
          id: Math.random().toString(36).slice(2),
          filename: item.file.name,
          timestamp: new Date().toISOString(),
          settings: { ...processingOptions },
          logoSettings: useLogo ? { ...logoSettings } : undefined,
          usedLogo: useLogo,
          detections: data.metadata.licensePlatesDetected
        }, ...prev.slice(0, 9)]) // Keep last 10 items

        // Update item as completed
        currentQueue = currentQueue.map((qItem, index) => 
          index === i ? { 
            ...qItem, 
            status: 'completed' as const, 
            progress: 100,
            result: data.maskedImage 
          } : qItem
        )
        setBatchQueue(currentQueue)

        // Set the preview image for the first processed image
        if (i === 0) {
          setMaskedImage(data.maskedImage)
        }

        toast({
          title: `Processed ${item.file.name}`,
          description: `License plate${data.metadata.licensePlatesDetected > 1 ? 's' : ''} masked successfully.${!isAuthenticated ? ' (Free Version - Watermark Added)' : ''}`,
        })

        // Track successful processing
        analytics.trackFeatureUsage('license_plate_masking', true)

      } catch (error) {
        // Track processing error
        analytics.trackProcessingError(error instanceof Error ? error.message : 'Unknown error')
        analytics.trackFeatureUsage('license_plate_masking', false)

        // Update item as error
        currentQueue = currentQueue.map((qItem, index) => 
          index === i ? { 
            ...qItem, 
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Failed to process image'
          } : qItem
        )
        setBatchQueue(currentQueue)

        toast({
          title: `Error processing ${item.file.name}`,
          description: error instanceof Error ? error.message : "Failed to process image",
          variant: "destructive",
        })
      }
    }

    // Track batch processing completion
    analytics.trackProcessingComplete(batchQueue.length, Date.now() - startTime)
    setIsBatchProcessing(false)
  }, [batchQueue, isBatchProcessing, logo, logoSettings, useLogo, processingOptions, toast, isAuthenticated, analytics, useWatermark, watermarkSettings])

  // Start processing when queue changes
  useEffect(() => {
    processBatchQueue()
  }, [batchQueue, processBatchQueue])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    // Calculate total size
    const newTotalSize = acceptedFiles.reduce((acc, file) => acc + file.size, 0)
    setTotalSize(prevSize => prevSize + newTotalSize)

    // Set preview for the first image
    const file = acceptedFiles[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        setImage(result)
      }
    }
    reader.readAsDataURL(file)

    // Add files to batch queue
    const newItems = acceptedFiles.map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      status: 'pending' as const,
      progress: 0
    }))
    
    setBatchQueue(prev => [...prev, ...newItems])

    toast({
      title: "Files added to queue",
      description: `Added ${acceptedFiles.length} file${acceptedFiles.length > 1 ? 's' : ''} to processing queue.`,
    })
  }, [toast])

  const onLogoDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0] // Only take the first file

    // Validate file type
    if (!['image/png', 'image/webp'].includes(file.type)) {
      toast({
        title: "Error",
        description: "Logo must be PNG or WebP format with transparency",
        variant: "destructive",
      })
      return
    }

    // Validate file size
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "Error",
        description: "Logo file size must be less than 2MB",
        variant: "destructive",
      })
      return
    }

      const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        // Create an image element to check dimensions
        const img = document.createElement('img')
        img.onload = () => {
          setLogo(result)
          setUseLogo(true)
          toast({
            title: "Logo uploaded successfully",
            description: "Your logo has been added and will be used for masking.",
          })
          if (batchQueue.length > 0) {
            processBatchQueue()
          }
        }
        img.src = result
      }
    }
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read logo file",
        variant: "destructive",
      })
    }
    reader.readAsDataURL(file)
  }, [toast, processBatchQueue, batchQueue.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  })

  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps, isDragActive: isLogoDragActive } = useDropzone({
    onDrop: onLogoDrop,
    accept: {
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    multiple: false,
    maxSize: 2 * 1024 * 1024 // 2MB
  })

  const downloadAll = useCallback(() => {
    const completedItems = batchQueue.filter(item => item.status === 'completed' && item.result)
    
    completedItems.forEach(item => {
      const link = document.createElement('a')
      link.href = item.result!
      link.download = `masked-${item.file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })

    if (completedItems.length > 0) {
      toast({
        title: "Download started",
        description: `Downloading ${completedItems.length} processed image${completedItems.length > 1 ? 's' : ''}.`,
      })
    }
  }, [batchQueue, toast])

  const clearCompleted = useCallback(() => {
    setBatchQueue(prev => prev.filter(item => item.status !== 'completed'))
    toast({
      title: "Queue cleared",
      description: "Completed items removed from queue.",
    })
  }, [toast])

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if input or textarea is focused
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Existing shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault()
        const uploadInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (uploadInput) uploadInput.click()
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        if (batchQueue.some(item => item.status === 'completed')) {
          downloadAll()
        }
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault()
        const logoInput = document.querySelector('input[accept="image/png,image/webp"]') as HTMLInputElement
        if (logoInput) logoInput.click()
      }

      // New shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault()
        setUseLogo(prev => !prev)
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (batchQueue.some(item => item.status === 'completed')) {
          clearCompleted()
        }
      }

      // Show shortcuts dialog
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        const shortcutsButton = document.querySelector('[title="Keyboard Shortcuts"]') as HTMLButtonElement
        if (shortcutsButton) shortcutsButton.click()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [batchQueue, downloadAll, clearCompleted])

  function ShortcutsDialog() {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4" title="Keyboard Shortcuts">
            <Keyboard className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">File Operations</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Upload Files</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘/Ctrl + U</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Upload Logo</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘/Ctrl + L</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Download All</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘/Ctrl + D</kbd>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Navigation</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Toggle Logo</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘/Ctrl + T</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Clear Queue</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘/Ctrl + K</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Show Shortcuts</span>
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Some shortcuts may not work if a dialog or input field is focused.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  function HistoryDialog() {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute top-4 right-16" title="Processing History">
            <History className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Processing History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {processingHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No processing history yet
              </p>
            ) : (
              <div className="space-y-4">
                {processingHistory.map(item => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{item.filename}</h3>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Detection Settings</p>
                        <ul className="mt-1 space-y-1">
                          <li>Confidence: {item.settings.confidenceThreshold * 100}%</li>
                          <li>Style: {item.settings.maskingStyle}</li>
                          {item.settings.maskingStyle === 'blur' && (
                            <li>Blur: {item.settings.blurStrength}</li>
                          )}
                        </ul>
                      </div>
                      {item.usedLogo && item.logoSettings && (
                        <div>
                          <p className="text-muted-foreground">Logo Settings</p>
                          <ul className="mt-1 space-y-1">
                            <li>Position: {item.logoSettings.position}</li>
                            <li>Size: {item.logoSettings.size}%</li>
                            <li>Opacity: {item.logoSettings.opacity}%</li>
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <Shield className="h-4 w-4" />
                      <span>{item.detections} license plate{item.detections !== 1 ? 's' : ''} detected</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => {
                        setProcessingOptions(item.settings)
                        if (item.logoSettings) {
                          setLogoSettings(item.logoSettings)
                          setUseLogo(true)
                        }
                        toast({
                          title: "Settings restored",
                          description: "Processing settings have been restored from history.",
                        })
                      }}
                    >
                      Restore These Settings
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Track file download
  const handleDownload = useCallback(async (item: typeof batchQueue[0]) => {
    try {
      analytics.trackDownloadStart('image', 1)
      const link = document.createElement('a')
      link.href = item.result!
      link.download = `masked-${item.file.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      analytics.trackDownloadComplete('image', 1)
    } catch (error) {
      analytics.trackApiError('download', error instanceof Error ? error.message : 'Download failed')
      toast({
        title: "Error downloading image",
        description: error instanceof Error ? error.message : "Download failed",
        variant: "destructive",
      })
    }
  }, [analytics, toast])

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild className="shrink-0">
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Upload Image</h1>
                <p className="text-sm text-muted-foreground">
                  Upload an image to automatically detect and mask license plates
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {isAuthenticated ? 'Pro Account' : 'Free Version'}
              </Button>
              <HistoryDialog />
              <ShortcutsDialog />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Column - Controls */}
            <div className="lg:col-span-5 space-y-6">
              {/* Upload Card with improved visual feedback */}
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="p-4 border-b bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Upload Image</h2>
                  </div>
                </div>
                <div className="p-4">
                  <div
                    {...getRootProps()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ease-in-out
                      ${isDragActive ? 'border-primary bg-primary/5 scale-[0.98] shadow-inner' : 'border-muted hover:border-primary/50 hover:bg-muted/50'}`}
                    title="Upload Files (Ctrl/Cmd + U)"
                  >
                    <input {...getInputProps()} />
                    <div className={`transition-transform duration-300 ${isDragActive ? 'scale-105' : ''}`}>
                      <div className={`mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center
                        ${isDragActive ? 'animate-bounce' : 'animate-pulse'}`}>
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      {isDragActive ? (
                        <div className="space-y-2">
                          <p className="text-primary font-medium animate-pulse">Release to upload files</p>
                          <p className="text-sm text-primary/80">Your files will be processed automatically</p>
                        </div>
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

              {/* Logo Upload with improved layout */}
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="p-6 border-b bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImagePlus className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold">Custom Logo (Optional)</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={useLogo}
                        onCheckedChange={(checked) => {
                          setUseLogo(checked)
                          if (image) processBatchQueue()
                        }}
                        disabled={!logo}
                      />
                      <Label>Use Logo</Label>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {logo ? (
                    <div className="space-y-6">
                      <div className="relative">
                        <div className="relative aspect-video bg-muted/50 rounded-lg overflow-hidden">
                          <Image
                            src={logo}
                            alt="Logo"
                            fill
                            className="object-contain p-4"
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2"
                          onClick={() => {
                            setLogo(null)
                            setUseLogo(false)
                            processBatchQueue()
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Logo Customization Controls */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Position</Label>
                          <Select
                            value={logoSettings.position}
                            onValueChange={(value: LogoPosition) => {
                              setLogoSettings(prev => ({ ...prev, position: value }))
                              processBatchQueue()
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="top-left">Top Left</SelectItem>
                              <SelectItem value="top-right">Top Right</SelectItem>
                              <SelectItem value="bottom-left">Bottom Left</SelectItem>
                              <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Size</Label>
                            <span className="text-sm text-muted-foreground">{logoSettings.size}%</span>
                          </div>
                          <Slider
                            value={[logoSettings.size]}
                            onValueChange={(value) => {
                              setLogoSettings(prev => ({ ...prev, size: value[0] }))
                              processBatchQueue()
                            }}
                            min={10}
                            max={200}
                            step={5}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Opacity</Label>
                            <span className="text-sm text-muted-foreground">{logoSettings.opacity}%</span>
                          </div>
                          <Slider
                            value={[logoSettings.opacity]}
                            onValueChange={(value) => {
                              setLogoSettings(prev => ({ ...prev, opacity: value[0] }))
                              processBatchQueue()
                            }}
                            min={10}
                            max={100}
                            step={5}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      {...getLogoRootProps()}
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                        ${isLogoDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50 hover:bg-muted/50'}`}
                    >
                      <input {...getLogoInputProps()} />
                      <div className="space-y-2">
                        <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <ImagePlus className="h-5 w-5 text-primary" />
                        </div>
                        <p className="font-medium text-sm">Add a custom logo</p>
                        <p className="text-xs text-muted-foreground">
                          PNG or WebP with transparency • Max size: 2MB
                        </p>
                      </div>
                </div>
              )}
            </div>
          </Card>

              {/* Processing Options in an accordion */}
              <Card className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="p-6 border-b bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Processing Options</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Confidence Threshold */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Detection Confidence</Label>
                        <span className="text-sm text-muted-foreground">{processingOptions.confidenceThreshold * 100}%</span>
                      </div>
                      <Slider
                        value={[processingOptions.confidenceThreshold * 100]}
                        onValueChange={(value) => {
                          setProcessingOptions(prev => ({ ...prev, confidenceThreshold: value[0] / 100 }))
                          processBatchQueue()
                        }}
                        min={10}
                        max={100}
                        step={5}
                      />
                      <p className="text-sm text-muted-foreground">
                        Higher values mean more accurate but fewer detections
                      </p>
                    </div>

                    {/* Masking Style */}
                    <div className="space-y-2">
                      <Label>Masking Style</Label>
                      <Select
                        value={processingOptions.maskingStyle}
                        onValueChange={(value: 'blur' | 'solid' | 'pixelate') => {
                          setProcessingOptions(prev => ({ ...prev, maskingStyle: value }))
                          processBatchQueue()
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select masking style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blur">Gaussian Blur</SelectItem>
                          <SelectItem value="solid">Solid Color</SelectItem>
                          <SelectItem value="pixelate">Pixelate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Style-specific options */}
                    {processingOptions.maskingStyle === 'blur' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Blur Strength</Label>
                          <span className="text-sm text-muted-foreground">{processingOptions.blurStrength}</span>
                        </div>
                        <Slider
                          value={[processingOptions.blurStrength]}
                          onValueChange={(value) => {
                            setProcessingOptions(prev => ({ ...prev, blurStrength: value[0] }))
                            processBatchQueue()
                          }}
                          min={5}
                          max={50}
                          step={5}
                        />
                      </div>
                    )}

                    {processingOptions.maskingStyle === 'solid' && (
                      <div className="space-y-2">
                        <Label>Solid Color</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={processingOptions.solidColor}
                            onChange={(e) => {
                              setProcessingOptions(prev => ({ ...prev, solidColor: e.target.value }))
                              processBatchQueue()
                            }}
                            className="w-20 p-1 h-8"
                          />
                          <Input
                            type="text"
                            value={processingOptions.solidColor}
                            onChange={(e) => {
                              setProcessingOptions(prev => ({ ...prev, solidColor: e.target.value }))
                              processBatchQueue()
                            }}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    )}

                    {processingOptions.maskingStyle === 'pixelate' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Pixel Size</Label>
                          <span className="text-sm text-muted-foreground">{processingOptions.pixelateSize}px</span>
                        </div>
                        <Slider
                          value={[processingOptions.pixelateSize]}
                          onValueChange={(value) => {
                            setProcessingOptions(prev => ({ ...prev, pixelateSize: value[0] }))
                            processBatchQueue()
                          }}
                          min={5}
                          max={30}
                          step={1}
                        />
                      </div>
                    )}

                    {/* Border Options */}
                    <div className="space-y-4">
                      <Label>Border Style</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={processingOptions.borderColor}
                              onChange={(e) => {
                                setProcessingOptions(prev => ({ ...prev, borderColor: e.target.value }))
                                processBatchQueue()
                              }}
                              className="w-20 p-1 h-8"
                            />
                            <Input
                              type="text"
                              value={processingOptions.borderColor}
                              onChange={(e) => {
                                setProcessingOptions(prev => ({ ...prev, borderColor: e.target.value }))
                                processBatchQueue()
                              }}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Width</Label>
                            <span className="text-sm text-muted-foreground">{processingOptions.borderWidth}px</span>
                          </div>
                          <Slider
                            value={[processingOptions.borderWidth]}
                            onValueChange={(value) => {
                              setProcessingOptions(prev => ({ ...prev, borderWidth: value[0] }))
                              processBatchQueue()
                            }}
                            min={0}
                            max={10}
                            step={1}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Preview and Queue */}
            <div className="lg:col-span-7 space-y-6">
              {/* Preview Area with improved layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {image && (
                  <Card className="overflow-hidden transition-shadow hover:shadow-md">
                    <div className="p-4 border-b bg-muted/50">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Original</h2>
                      </div>
                    </div>
                    <div className="relative aspect-[4/3] bg-muted/50">
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

          {maskedImage ? (
                  <Card className="overflow-hidden transition-shadow hover:shadow-md group">
                    <div className="p-4 border-b bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          <h2 className="text-lg font-semibold">Masked</h2>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setMaskedImage(null)
                              processBatchQueue()
                            }}
                          >
                            Try Another
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="relative aspect-[4/3] bg-muted/50 group/image">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity" />
                <Image
                  src={maskedImage}
                  alt="Masked"
                  fill
                        className="object-contain p-4"
                        priority
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover/image:opacity-100 transition-opacity">
                        <Button 
                          onClick={downloadAll}
                          className="w-full gap-2"
                          title="Download All (Ctrl/Cmd + D)"
                        >
                          <Download className="h-4 w-4" />
                          Download
                </Button>
                      </div>
              </div>
            </Card>
          ) : image ? (
                  <Card className="overflow-hidden transition-shadow hover:shadow-md">
                    <div className="p-12">
                      <div className="text-center space-y-6">
                        {isBatchProcessing ? (
                          <>
                            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center relative">
                              <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                              <Shield className="h-8 w-8 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-4">
                              <p className="font-medium">Processing your images...</p>
                              <div className="w-full max-w-xs mx-auto relative">
                                <Progress value={Number(progress)} className="h-2" />
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 min-w-[4rem] text-sm text-muted-foreground">
                                  {progress}%
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground animate-pulse">
                                Detecting and masking license plates
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                              <div className="animate-pulse">
                                <ImageIcon className="h-8 w-8 text-primary" />
                              </div>
                            </div>
                            <p className="text-muted-foreground animate-pulse">Preparing preview...</p>
                          </>
                        )}
                      </div>
              </div>
            </Card>
                ) : null}
              </div>

              {/* Batch Processing Queue with improved visualization */}
              {batchQueue.length > 0 && (
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  <div className="p-4 border-b bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Processing Queue</h2>
                        <div className="ml-2 text-sm text-muted-foreground">
                          ({batchQueue.filter(item => item.status === 'completed').length}/{batchQueue.length})
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearCompleted}
                          disabled={!batchQueue.some(item => item.status === 'completed')}
                          className="relative group"
                        >
                          Clear Completed
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {batchQueue.filter(item => item.status === 'completed').length}
                          </span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={downloadAll}
                          disabled={!batchQueue.some(item => item.status === 'completed')}
                          className="relative group"
                        >
                          Download All
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-[10px] text-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {batchQueue.filter(item => item.status === 'completed').length}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y">
                    {batchQueue.map(item => (
                      <div 
                        key={item.id} 
                        className={`p-4 transition-all duration-300 ${
                          item.status === 'completed' ? 'hover:bg-primary/5' :
                          item.status === 'error' ? 'hover:bg-destructive/5' :
                          'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className={`flex-1 space-y-2 ${item.status === 'completed' ? 'cursor-pointer hover:opacity-90' : ''}`}
                            onClick={() => {
                              if (item.status === 'completed' && item.result) {
                                setMaskedImage(item.result)
                              }
                            }}
                          >
                            <div className="flex items-center gap-4">
                              {item.status === 'completed' && item.result ? (
                                <div className="relative w-12 h-12 rounded-lg bg-muted/50 overflow-hidden shrink-0 ring-1 ring-muted group/thumb">
                                  <Image
                                    src={item.result}
                                    alt={item.file.name}
                                    fill
                                    className="object-cover transition-transform group-hover/thumb:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-muted/50 shrink-0 flex items-center justify-center">
                                  {item.status === 'processing' ? (
                                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                  ) : item.status === 'error' ? (
                                    <X className="h-6 w-6 text-destructive" />
                                  ) : (
                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                  )}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4">
                                  <p className="font-medium truncate">{item.file.name}</p>
                                  <span className={`text-sm whitespace-nowrap flex items-center gap-1 ${
                                    item.status === 'completed' ? 'text-primary' :
                                    item.status === 'error' ? 'text-destructive' :
                                    'text-muted-foreground'
                                  }`}>
                                    {item.status === 'completed' && (
                                      <>✓ Done</>
                                    )}
                                    {item.status === 'processing' && (
                                      <>
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Processing
                                      </>
                                    )}
                                    {item.status === 'error' && (
                                      <>✕ Error</>
                                    )}
                                    {item.status === 'pending' && (
                                      <>⋯ Pending</>
                                    )}
                                  </span>
                                </div>
                                <Progress 
                                  value={item.progress} 
                                  className={`h-1 ${
                                    item.status === 'completed' ? 'bg-primary/20' :
                                    item.status === 'error' ? 'bg-destructive/20' :
                                    'bg-muted'
                                  }`} 
                                />
                                {item.error && (
                                  <p className="text-sm text-destructive mt-1 animate-pulse">{item.error}</p>
                                )}
                              </div>
                            </div>
                            {item.status === 'completed' && (
                              <p className="text-xs text-muted-foreground">Click to view in preview</p>
                            )}
                          </div>
                          {item.status === 'completed' && item.result && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                handleDownload(item)
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Total Size</span>
                        <span className="whitespace-nowrap">
                          {(totalSize / (1024 * 1024)).toFixed(1)}MB / {MAX_FILE_SIZE / (1024 * 1024)}MB
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300" 
                          style={{ 
                            width: `${Math.min((totalSize / MAX_FILE_SIZE) * 100, 100)}%`,
                            backgroundColor: totalSize > MAX_FILE_SIZE ? 'var(--destructive)' : undefined
                          }} 
                        />
                      </div>
                      {totalSize > MAX_FILE_SIZE && (
                        <p className="text-xs text-destructive animate-pulse">
                          Total size exceeds the maximum limit
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Privacy Notice with improved design */}
              <Card className="overflow-hidden transition-shadow hover:shadow-md bg-primary/5 border-primary/20">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Privacy & Security</h2>
                      <p className="text-sm text-muted-foreground">
                        All images are processed securely and are not stored on our servers.
                        The masked images are generated client-side for your privacy.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Login Prompt for non-authenticated users */}
              {!isAuthenticated && (
                <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Free Version - Watermark Applied</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Sign in to remove watermarks and access premium features.
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/login">Sign In</Link>
                      </Button>
                    </div>
              </div>
            </Card>
          )}

              {/* Watermark Section */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Stamp className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Watermark</h2>
                  <div className="flex-grow" />
                  <Switch
                    id="use-watermark"
                    checked={useWatermark}
                    onCheckedChange={setUseWatermark}
                  />
                  <Label htmlFor="use-watermark">Use Watermark</Label>
                </div>

                {useWatermark && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Watermark Text</Label>
                      <Input
                        value={watermarkSettings.text}
                        onChange={(e) => setWatermarkSettings(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="Enter watermark text"
                        maxLength={50}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Position</Label>
                      <Select
                        value={watermarkSettings.position}
                        onValueChange={(value) => setWatermarkSettings(prev => ({ ...prev, position: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {POSITIONS.map((position: string) => (
                            <SelectItem key={position} value={position}>
                              {position.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Font</Label>
                      <Select
                        value={watermarkSettings.font}
                        onValueChange={(value) => setWatermarkSettings(prev => ({ ...prev, font: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                          <SelectItem value="Courier">Courier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={watermarkSettings.color}
                          onChange={(e) => setWatermarkSettings(prev => ({ ...prev, color: e.target.value }))}
                          className="w-20 p-1 h-8"
                        />
                        <Input
                          type="text"
                          value={watermarkSettings.color}
                          onChange={(e) => setWatermarkSettings(prev => ({ ...prev, color: e.target.value }))}
                          className="flex-1"
                          placeholder="#000000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Size (%)</Label>
                        <span className="text-sm text-gray-500">{watermarkSettings.size}%</span>
                      </div>
                      <Slider
                        value={[watermarkSettings.size]}
                        min={5}
                        max={100}
                        step={1}
                        onValueChange={(value) => setWatermarkSettings(prev => ({ ...prev, size: value[0] }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Opacity (%)</Label>
                        <span className="text-sm text-gray-500">{watermarkSettings.opacity}%</span>
                      </div>
                      <Slider
                        value={[watermarkSettings.opacity]}
                        min={10}
                        max={100}
                        step={1}
                        onValueChange={(value) => setWatermarkSettings(prev => ({ ...prev, opacity: value[0] }))}
                      />
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}