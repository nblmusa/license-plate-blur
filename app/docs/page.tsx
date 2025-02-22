import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Book, Key, Terminal, AlertTriangle, Cpu, Image, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ApiDocsPage() {
  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
            <Book className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Documentation</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Code className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">
              API Documentation
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Learn how to integrate license plate masking into your application using our powerful REST API.
          </p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <Tabs defaultValue="quickstart" className="space-y-8">
            <TabsList className="w-full justify-start border-b rounded-none p-0 h-12">
              <TabsTrigger value="quickstart" className="gap-2 data-[state=active]:bg-background">
                <Zap className="h-4 w-4" />
                Quick Start
              </TabsTrigger>
              <TabsTrigger value="authentication" className="gap-2 data-[state=active]:bg-background">
                <Key className="h-4 w-4" />
                Authentication
              </TabsTrigger>
              <TabsTrigger value="endpoints" className="gap-2 data-[state=active]:bg-background">
                <Terminal className="h-4 w-4" />
                Endpoints
              </TabsTrigger>
              <TabsTrigger value="errors" className="gap-2 data-[state=active]:bg-background">
                <AlertTriangle className="h-4 w-4" />
                Errors
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quickstart">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Quick Start Guide</h2>
                <p className="mb-6 text-muted-foreground">
                  Get started with the PlateGuard API in minutes. Follow these simple steps to begin masking license plates in your application.
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
                          <pre className="text-sm">npm install @plateguard/sdk</pre>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <pre className="text-sm">pip install plateguard</pre>
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
  ${process.env.NEXT_PUBLIC_APP_URL}/api/process-image \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: multipart/form-data" \\
  -F "image=@/path/to/image.jpg"`}
                        </pre>
                      </div>
                      
                      <p className="mt-4 mb-2">Using the SDK:</p>
                      <div className="p-4 bg-muted rounded-lg">
                        <pre className="text-sm">
{`import { PlateGuard } from '@plateguard/sdk';

const client = new PlateGuard('YOUR_API_KEY');
const result = await client.maskLicensePlate('path/to/image.jpg');`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="authentication">
              <Card className="p-6">
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
                        <pre className="text-sm">Authorization: Bearer lpm_your_api_key_here</pre>
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
            </TabsContent>

            <TabsContent value="endpoints">
              <Card className="p-6">
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
                          <code className="text-sm bg-muted px-2 py-1 rounded">/api/process-image</code>
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
                          <code className="text-sm bg-muted px-2 py-1 rounded">/api/process-batch</code>
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
            </TabsContent>

            <TabsContent value="errors">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
                <p className="mb-6 text-muted-foreground">
                  Learn how to handle API errors effectively. Our API uses conventional HTTP response codes and provides detailed error messages.
                </p>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">HTTP Status Codes</h3>
                    <Card className="overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr className="text-left">
                              <th className="p-3">Status</th>
                              <th className="p-3">Description</th>
                              <th className="p-3">Common Causes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            <tr>
                              <td className="p-3 font-mono">401</td>
                              <td className="p-3">Unauthorized</td>
                              <td className="p-3">Missing or invalid API key</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-mono">403</td>
                              <td className="p-3">Forbidden</td>
                              <td className="p-3">API key lacks permission</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-mono">429</td>
                              <td className="p-3">Too Many Requests</td>
                              <td className="p-3">Rate limit exceeded</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-mono">400</td>
                              <td className="p-3">Bad Request</td>
                              <td className="p-3">Invalid parameters</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-mono">500</td>
                              <td className="p-3">Server Error</td>
                              <td className="p-3">Internal processing error</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Error Response Format</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <pre className="text-sm">
{`{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Your plan's rate limit has been exceeded",
    "details": {
      "limit": 100,
      "reset_at": "2024-03-19T00:00:00Z"
    }
  }
}`}
                        </pre>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        All error responses include a descriptive message and, when relevant, additional details to help resolve the issue.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Rate Limit Headers</h3>
                    <p className="mb-4">The API includes rate limit information in response headers:</p>
                    <div className="p-4 bg-muted rounded-lg">
                      <pre className="text-sm">
{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1679184000`}
                      </pre>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}