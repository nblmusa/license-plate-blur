'use client'
import { Card } from "@/components/ui/card"
import { Code, Book, Key, Terminal, AlertTriangle, Cpu, Image, Zap, Gauge, Shield, Wrench, FileCode, Laptop, GitBranch, Search, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useState } from "react"

export default function ApiDocsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("quickstart")

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement> | null, sectionId: string) => {
    if (e) e.preventDefault()
    scrollToSection(sectionId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            <span className="font-semibold">Documentation</span>
          </div>
          <div className="flex-1 px-4">
            <div className="relative max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">API v1.0</Badge>
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs">All Systems Operational</Badge>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4">
        <div className="py-10 lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
          {/* Sticky Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-[5.5rem] h-[calc(100vh-5.5rem)] overflow-y-auto pb-10">
              <nav className="space-y-6">
                <div>
                  <div className="font-semibold mb-2">Getting Started</div>
                  <div className="space-y-1">
                    <a 
                      href="#quickstart" 
                      onClick={(e) => handleNavClick(e, 'quickstart')}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors",
                        activeTab === 'quickstart' && "bg-muted"
                      )}
                    >
                      <Zap className="h-4 w-4" />
                      Quick Start
                    </a>
                    <a 
                      href="#guides" 
                      onClick={(e) => handleNavClick(e, 'guides')}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors",
                        activeTab === 'guides' && "bg-muted"
                      )}
                    >
                      <Book className="h-4 w-4" />
                      Guides
                    </a>
                  </div>
                </div>

                <div>
                  <div className="font-semibold mb-2">API Reference</div>
                  <div className="space-y-1">
                    <a 
                      href="#authentication" 
                      onClick={(e) => handleNavClick(e, 'authentication')}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors",
                        activeTab === 'authentication' && "bg-muted"
                      )}
                    >
                      <Key className="h-4 w-4" />
                      Authentication
                    </a>
                    <a 
                      href="#endpoints" 
                      onClick={(e) => handleNavClick(e, 'endpoints')}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors",
                        activeTab === 'endpoints' && "bg-muted"
                      )}
                    >
                      <Terminal className="h-4 w-4" />
                      Endpoints
                    </a>
                    <a 
                      href="#advanced" 
                      onClick={(e) => handleNavClick(e, 'advanced')}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors",
                        activeTab === 'advanced' && "bg-muted"
                      )}
                    >
                      <Cpu className="h-4 w-4" />
                      Advanced
                    </a>
                  </div>
                </div>

                <div>
                  <div className="font-semibold mb-2">Developer Tools</div>
                  <div className="space-y-1">
                    <a 
                      href="#sdks" 
                      onClick={(e) => handleNavClick(e, 'sdks')}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors",
                        activeTab === 'sdks' && "bg-muted"
                      )}
                    >
                      <FileCode className="h-4 w-4" />
                      SDKs
                    </a>
                    <a 
                      href="#recipes" 
                      onClick={(e) => handleNavClick(e, 'recipes')}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors",
                        activeTab === 'recipes' && "bg-muted"
                      )}
                    >
                      <Laptop className="h-4 w-4" />
                      Recipes
                    </a>
                    <a 
                      href="#troubleshooting" 
                      onClick={(e) => handleNavClick(e, 'troubleshooting')}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors",
                        activeTab === 'troubleshooting' && "bg-muted"
                      )}
                    >
                      <Wrench className="h-4 w-4" />
                      Troubleshooting
                    </a>
                  </div>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <main className="min-h-[calc(100vh-5.5rem)] lg:border-l lg:pl-8">
            {/* Hero Section */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">
                API Documentation
              </h1>
              <p className="mt-4 text-xl text-muted-foreground max-w-2xl">
                Learn how to integrate license plate masking into your application using our powerful REST API.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Card 
                  className="inline-flex items-center gap-2 px-4 py-2 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => scrollToSection('quickstart')}
                >
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-medium">Quick Start</span>
                  <ChevronRight className="h-4 w-4" />
                </Card>
                <Card 
                  className="inline-flex items-center gap-2 px-4 py-2 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => scrollToSection('guides')}
                >
                  <Book className="h-4 w-4 text-primary" />
                  <span className="font-medium">View Guides</span>
                  <ChevronRight className="h-4 w-4" />
                </Card>
              </div>
            </div>

            <div className="space-y-16">
              {/* Quick Start Section */}
              <section id="quickstart" className="scroll-mt-20">
                <Card className="p-6 border-primary/10 dark:border-primary/20">
                  <h2 className="text-2xl font-bold mb-4">Quick Start Guide</h2>
                  <p className="mb-6 text-muted-foreground">
                    Get started with the MaskingTech API in minutes. Follow these simple steps to begin masking license plates in your application.
                  </p>

                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">1</div>
                        <h3 className="text-xl font-semibold">Get your API key</h3>
                      </div>
                      <div className="ml-10">
                        <p className="mb-2">Generate an API key from your dashboard:</p>
                        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                          <li>Navigate to the <span className="font-mono text-primary">Settings</span> page</li>
                          <li>Select the <span className="font-mono text-primary">API</span> tab</li>
                          <li>Click <span className="font-mono text-primary">Generate New Key</span></li>
                        </ol>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">2</div>
                        <h3 className="text-xl font-semibold">Install the SDK (Optional)</h3>
                      </div>
                      <div className="ml-10">
                        <p className="mb-2">Install our official SDK for your preferred language:</p>
                        <div className="space-y-2">
                          <div className="p-3 bg-muted rounded-lg">
                            <pre className="text-sm">npm install @maskingtech/sdk</pre>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <pre className="text-sm">pip install masktech</pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">3</div>
                        <h3 className="text-xl font-semibold">Make your first request</h3>
                      </div>
                      <div className="ml-10">
                        <p className="mb-2">Using cURL:</p>
                        <div className="p-4 bg-muted rounded-lg">
                          <pre className="text-sm overflow-x-auto">
{`curl -X POST \\
  ${process.env.NEXT_PUBLIC_API_URL}/process-image \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: multipart/form-data" \\
  -F "image=@/path/to/image.jpg"`}
                          </pre>
                        </div>
                        
                        <p className="mt-4 mb-2">Using the SDK:</p>
                        <div className="p-4 bg-muted rounded-lg">
                          <pre className="text-sm">
{`import { MaskingTech } from '@maskingtech/sdk';

const client = new MaskingTech('YOUR_API_KEY');
const result = await client.maskLicensePlate('path/to/image.jpg');`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              {/* Guides Section */}
              <section id="guides" className="scroll-mt-20">
                <Card className="p-6 border-primary/10 dark:border-primary/20">
                  <h2 className="text-2xl font-bold mb-4">Implementation Guides</h2>
                  <p className="mb-6 text-muted-foreground">
                    Step-by-step guides to help you implement common features and solve specific use cases.
                  </p>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Getting Started Guides</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Card className="p-4 hover:shadow-lg transition-all">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            Basic Implementation
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Learn how to implement basic license plate masking in your application.
                          </p>
                          <Badge variant="secondary">10 min read</Badge>
                        </Card>
                        <Card className="p-4 hover:shadow-lg transition-all">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            Security Best Practices
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Secure your integration with our recommended security practices.
                          </p>
                          <Badge variant="secondary">15 min read</Badge>
                        </Card>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Advanced Topics</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Card className="p-4 hover:shadow-lg transition-all">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Gauge className="h-4 w-4 text-primary" />
                            Performance Optimization
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Optimize your integration for high-volume processing.
                          </p>
                          <Badge variant="secondary">20 min read</Badge>
                        </Card>
                        <Card className="p-4 hover:shadow-lg transition-all">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-primary" />
                            CI/CD Integration
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Automate your image processing workflow.
                          </p>
                          <Badge variant="secondary">25 min read</Badge>
                        </Card>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              {/* Authentication Section */}
              <section id="authentication" className="scroll-mt-20">
                <Card className="p-6 border-primary/10 dark:border-primary/20">
                  <h2 className="text-2xl font-bold mb-4">Authentication</h2>
                  <p className="mb-6 text-muted-foreground">
                    Secure your API requests using API key authentication. All requests must include your API key in the Authorization header.
                  </p>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">API Key Format</h3>
                      <div className="space-y-4">
                        <p>Your API key should be included in the Authorization header using the Bearer scheme:</p>
                        <div className="p-4 bg-muted rounded-lg">
                          <pre className="text-sm">Authorization: Bearer your_api_key_here</pre>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <AlertTriangle className="h-4 w-4" />
                          <p>Never share your API key or commit it to version control.</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Rate Limits</h3>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <Card className="p-4 border-blue-100/30 dark:border-blue-800/30">
                          <Badge variant="secondary" className="mb-2">Basic</Badge>
                          <ul className="space-y-2 text-sm">
                            <li>• 100 requests/month</li>
                            <li>• 5MB max file size</li>
                            <li>• Standard processing</li>
                          </ul>
                        </Card>
                        <Card className="p-4 border-blue-100/30 dark:border-blue-800/30">
                          <Badge variant="secondary" className="mb-2">Pro</Badge>
                          <ul className="space-y-2 text-sm">
                            <li>• 1,000 requests/month</li>
                            <li>• 25MB max file size</li>
                            <li>• Priority processing</li>
                          </ul>
                        </Card>
                        <Card className="p-4 border-blue-100/30 dark:border-blue-800/30">
                          <Badge variant="secondary" className="mb-2">Enterprise</Badge>
                          <ul className="space-y-2 text-sm">
                            <li>• Unlimited requests</li>
                            <li>• 100MB max file size</li>
                            <li>• Custom limits</li>
                          </ul>
                        </Card>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              {/* Endpoints Section */}
              <section id="endpoints" className="scroll-mt-20">
                <Card className="p-6 border-primary/10 dark:border-primary/20">
                  <h2 className="text-2xl font-bold mb-4">API Endpoints</h2>
                  <p className="mb-6 text-muted-foreground">
                    Explore our API endpoints and their capabilities. All endpoints are HTTPS-only and return JSON responses.
                  </p>

                  <div className="space-y-12">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <Image className="h-5 w-5" />
                        <h3 className="text-xl font-semibold">Process Image</h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge>POST</Badge>
                            <code className="text-sm bg-muted px-2 py-1 rounded">/process-image</code>
                          </div>
                          <p className="text-muted-foreground">
                            Upload and process an image to mask license plates.
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Request Parameters</h4>
                          <Card className="overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-muted">
                                  <tr className="text-left">
                                    <th className="p-3">Parameter</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Required</th>
                                    <th className="p-3">Description</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  <tr>
                                    <td className="p-3 font-mono">image</td>
                                    <td className="p-3">File</td>
                                    <td className="p-3">Yes</td>
                                    <td className="p-3">The image file to process</td>
                                  </tr>
                                  <tr>
                                    <td className="p-3 font-mono">maskType</td>
                                    <td className="p-3">String</td>
                                    <td className="p-3">No</td>
                                    <td className="p-3">Type of masking (blur/solid)</td>
                                  </tr>
                                  <tr>
                                    <td className="p-3 font-mono">quality</td>
                                    <td className="p-3">Number</td>
                                    <td className="p-3">No</td>
                                    <td className="p-3">Output image quality (1-100)</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </Card>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Response Format</h4>
                          <div className="p-4 bg-muted rounded-lg">
                            <pre className="text-sm">
{`{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "masked_url": "https://example.com/masked-image.jpg",
    "metadata": {
      "licensePlatesDetected": 2,
      "originalSize": 1024000,
      "processedSize": 980000
    }
  }
}`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <Cpu className="h-5 w-5" />
                        <h3 className="text-xl font-semibold">Batch Processing</h3>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge>POST</Badge>
                            <code className="text-sm bg-muted px-2 py-1 rounded">/process-batch</code>
                          </div>
                          <p className="text-muted-foreground">
                            Process multiple images in a single request.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Request Format</h4>
                          <div className="p-4 bg-muted rounded-lg">
                            <pre className="text-sm">
{`{
  "images": [
    {
      "url": "https://example.com/image1.jpg",
      "maskType": "blur"
    },
    {
      "url": "https://example.com/image2.jpg",
      "maskType": "solid"
    }
  ],
  "options": {
    "quality": 90,
    "parallel": true
  }
}`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              {/* Advanced Section */}
              <section id="advanced" className="scroll-mt-20">
                <Card className="p-6 border-primary/10 dark:border-primary/20">
                  <h2 className="text-2xl font-bold mb-4">Advanced Features</h2>
                  <p className="mb-6 text-muted-foreground">
                    Explore advanced capabilities and configurations to get the most out of the MaskingTech API.
                  </p>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Batch Processing</h3>
                      <div className="space-y-4">
                        <p>Process multiple images in a single request for improved performance:</p>
                        <div className="p-4 bg-muted rounded-lg">
                          <pre className="text-sm">
{`POST /batch-process
Content-Type: multipart/form-data

images[]: file1.jpg
images[]: file2.jpg
images[]: file3.jpg`}</pre>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Masking Configurations</h3>
                      <div className="space-y-4">
                        <p>Customize the masking behavior with advanced options:</p>
                        <Card className="overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-muted">
                                <tr className="text-left">
                                  <th className="p-3">Option</th>
                                  <th className="p-3">Type</th>
                                  <th className="p-3">Description</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                <tr>
                                  <td className="p-3 font-mono">maskStyle</td>
                                  <td className="p-3">String</td>
                                  <td className="p-3">blur, solid, pixelate, or custom pattern</td>
                                </tr>
                                <tr>
                                  <td className="p-3 font-mono">detectionConfidence</td>
                                  <td className="p-3">Number</td>
                                  <td className="p-3">Minimum confidence threshold (0-1)</td>
                                </tr>
                                <tr>
                                  <td className="p-3 font-mono">preserveMetadata</td>
                                  <td className="p-3">Boolean</td>
                                  <td className="p-3">Keep original image metadata</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </Card>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Webhooks</h3>
                      <div className="space-y-4">
                        <p>Configure webhooks to receive real-time processing updates:</p>
                        <div className="p-4 bg-muted rounded-lg">
                          <pre className="text-sm">
{`POST /configure-webhook
{
  "url": "https://your-domain.com/webhook",
  "events": ["process.complete", "process.failed"],
  "secret": "your_webhook_secret"
}`}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              {/* SDKs Section */}
              <section id="sdks" className="scroll-mt-20">
                <Card className="p-6 border-primary/10 dark:border-primary/20">
                  <h2 className="text-2xl font-bold mb-4">SDKs & Libraries</h2>
                  <p className="mb-6 text-muted-foreground">
                    Official SDKs and community libraries to integrate MaskingTech in your preferred programming language.
                  </p>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Official SDKs</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Card className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-primary/10 rounded">
                              <Code className="h-4 w-4 text-primary" />
                            </div>
                            <h4 className="font-semibold">JavaScript/TypeScript</h4>
                          </div>
                          <div className="space-y-2">
                            <div className="p-2 bg-muted rounded">
                              <pre className="text-sm">npm install @maskingtech/sdk</pre>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Full TypeScript support, React hooks, and Node.js compatibility
                            </p>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-primary/10 rounded">
                              <Code className="h-4 w-4 text-primary" />
                            </div>
                            <h4 className="font-semibold">Python</h4>
                          </div>
                          <div className="space-y-2">
                            <div className="p-2 bg-muted rounded">
                              <pre className="text-sm">pip install masktech</pre>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Async support, Django integration, and type hints
                            </p>
                          </div>
                        </Card>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Code Examples</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">JavaScript Example</h4>
                          <div className="p-4 bg-muted rounded-lg">
                            <pre className="text-sm">
{`import { MaskingTech } from '@maskingtech/sdk';

const client = new MaskingTech(process.env.API_KEY);

// Process a single image
const result = await client.maskLicensePlate({
  image: imageFile,
  maskStyle: 'blur',
  quality: 90
});

// Batch processing
const results = await client.batchProcess({
  images: [file1, file2, file3],
  maskStyle: 'solid'
});`}</pre>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Python Example</h4>
                          <div className="p-4 bg-muted rounded-lg">
                            <pre className="text-sm">
{`from masktech import MaskingTech

client = MaskingTech(api_key="your_api_key")

# Process a single image
result = client.mask_license_plate(
    image_path="path/to/image.jpg",
    mask_style="blur",
    quality=90
)

# Batch processing
results = client.batch_process(
    image_paths=["image1.jpg", "image2.jpg"],
    mask_style="solid"
)`}</pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Framework Integrations</h3>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <Card className="p-4">
                          <h4 className="font-semibold mb-2">React</h4>
                          <p className="text-sm text-muted-foreground">
                            Hooks and components for React applications
                          </p>
                        </Card>
                        <Card className="p-4">
                          <h4 className="font-semibold mb-2">Django</h4>
                          <p className="text-sm text-muted-foreground">
                            Django app with model fields and template tags
                          </p>
                        </Card>
                        <Card className="p-4">
                          <h4 className="font-semibold mb-2">Laravel</h4>
                          <p className="text-sm text-muted-foreground">
                            Laravel package with Facade and middleware
                          </p>
                        </Card>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              {/* Recipes Section */}
              <section id="recipes" className="scroll-mt-20">
                <Card className="p-6 border-primary/10 dark:border-primary/20">
                  <h2 className="text-2xl font-bold mb-4">SDK Recipes</h2>
                  <p className="mb-6 text-muted-foreground">
                    Ready-to-use code recipes for common use cases and integrations.
                  </p>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">React Integration</h3>
                      <div className="p-4 bg-muted rounded-lg">
                        <pre className="text-sm">
{`import { useMaskingTech } from '@maskingtech/react';

function ImageUploader() {
  const { maskImage, isProcessing } = useMaskingTech();
  
  const handleUpload = async (file) => {
    try {
      const result = await maskImage({
        file,
        onProgress: (progress) => {
          console.log(\`Processing: \${progress}%\`);
        }
      });
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      {isProcessing && <LoadingSpinner />}
    </div>
  );
}`}</pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Batch Processing with Progress</h3>
                      <div className="p-4 bg-muted rounded-lg">
                        <pre className="text-sm">
{`import { MaskingTech } from '@maskingtech/sdk';

async function processBatch(files) {
  const client = new MaskingTech(process.env.API_KEY);
  
  const results = await client.batchProcess({
    images: files,
    options: {
      concurrent: 3,
      retries: 2,
      onProgress: (current, total) => {
        const progress = (current / total) * 100;
        updateProgressBar(progress);
      }
    }
  });

  return results;
}`}</pre>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              {/* Troubleshooting Section */}
              <section id="troubleshooting" className="scroll-mt-20">
                <Card className="p-6 border-primary/10 dark:border-primary/20">
                  <h2 className="text-2xl font-bold mb-4">Troubleshooting Guide</h2>
                  <p className="mb-6 text-muted-foreground">
                    Common issues and their solutions to help you debug your integration.
                  </p>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Common Issues</h3>
                      <div className="space-y-4">
                        <Card className="p-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            Rate Limit Exceeded
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            If you're hitting rate limits, consider:
                          </p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>Implementing request queuing</li>
                            <li>Using batch processing</li>
                            <li>Upgrading your plan</li>
                          </ul>
                        </Card>

                        <Card className="p-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            Image Processing Failures
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Common causes and solutions:
                          </p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>Verify image format support</li>
                            <li>Check file size limits</li>
                            <li>Validate image dimensions</li>
                          </ul>
                        </Card>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Debug Mode</h3>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Enable debug mode to get detailed logs:
                        </p>
                        <div className="p-4 bg-muted rounded-lg">
                          <pre className="text-sm">
{`const client = new MaskingTech({
  apiKey: process.env.API_KEY,
  debug: true,
  logLevel: 'verbose'
});`}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            </div>
          </main>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="border-t">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">Next: {activeTab === 'quickstart' ? 'Authentication' : 'Quick Start'}</span>
            </div>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-sm text-primary hover:underline"
            >
              Back to top
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}