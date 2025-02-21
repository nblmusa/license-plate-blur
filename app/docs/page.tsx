import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code } from "lucide-react"

export default function ApiDocsPage() {
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Code className="h-8 w-8" />
          <h1 className="text-4xl font-bold">API Documentation</h1>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-xl text-muted-foreground mb-8">
            Learn how to integrate license plate masking into your application using our REST API.
          </p>

          <Tabs defaultValue="quickstart" className="space-y-8">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
              <TabsTrigger value="authentication">Authentication</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
            </TabsList>

            <TabsContent value="quickstart">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
                <p className="mb-4">
                  Get started with the PlateGuard API in minutes. Follow these steps to mask your first license plate.
                </p>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">1. Get your API key</h3>
                  <p>Generate an API key from your dashboard.</p>

                  <h3 className="text-xl font-semibold">2. Make your first request</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="text-sm">
{`curl -X POST \\
  ${process.env.NEXT_PUBLIC_APP_URL}/api/process-image \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "image=@/path/to/image.jpg"`}
                    </pre>
                  </div>

                  <h3 className="text-xl font-semibold">3. Get the result</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="text-sm">
{`{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "masked_url": "https://example.com/masked-image.jpg"
  }
}`}
                    </pre>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="authentication">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Authentication</h2>
                <p className="mb-4">
                  All API requests must include your API key in the Authorization header.
                </p>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">API Key</h3>
                  <p>Include your API key in the Authorization header:</p>
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="text-sm">
                      Authorization: Bearer YOUR_API_KEY
                    </pre>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-2">Rate Limits</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Basic: 100 requests/month</li>
                      <li>Pro: 1,000 requests/month</li>
                      <li>Enterprise: Unlimited requests</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">API Endpoints</h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Process Image</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="font-mono bg-muted p-2 rounded inline-block">POST /api/process-image</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Request Body</h4>
                        <p className="mb-2">Form data:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>image: File (required) - The image to process</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Response</h4>
                        <div className="p-4 bg-muted rounded-lg">
                          <pre className="text-sm">
{`{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "masked_url": "https://example.com/masked-image.jpg"
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
                <p className="mb-4">
                  The API uses conventional HTTP response codes to indicate the success or failure of requests.
                </p>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Error Codes</h3>
                  <ul className="space-y-4">
                    <li>
                      <p className="font-semibold">401 Unauthorized</p>
                      <p className="text-muted-foreground">Missing or invalid API key</p>
                    </li>
                    <li>
                      <p className="font-semibold">429 Too Many Requests</p>
                      <p className="text-muted-foreground">API call limit reached</p>
                    </li>
                    <li>
                      <p className="font-semibold">400 Bad Request</p>
                      <p className="text-muted-foreground">Invalid request parameters</p>
                    </li>
                    <li>
                      <p className="font-semibold">500 Internal Server Error</p>
                      <p className="text-muted-foreground">Server error processing the request</p>
                    </li>
                  </ul>

                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-2">Error Response Format</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <pre className="text-sm">
{`{
  "error": "Error message describing what went wrong"
}`}
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