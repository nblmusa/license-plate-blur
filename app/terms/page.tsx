import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Lock, Scale, Image as ImageIcon, Server, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <Button 
            variant="ghost" 
            className="w-fit -ml-4 mb-2" 
            asChild
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground mt-2">
              Last updated: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Scale className="h-5 w-5" />
              <h2 className="text-xl font-semibold m-0">Agreement to Terms</h2>
            </div>
            <p>
              Welcome to MaskingTech. By accessing or using our license plate masking service (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). These Terms constitute a legally binding agreement between you and MaskingTech (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). If you disagree with any part of these terms, you must not use our Service.
            </p>

            <div className="flex items-center gap-2 text-primary mt-8 mb-4">
              <ImageIcon className="h-5 w-5" />
              <h2 className="text-xl font-semibold m-0">Image Processing & Storage</h2>
            </div>
            <p>
              Our Service processes images to detect and mask license plates. By using our Service, you acknowledge and agree that:
            </p>
            <ul>
              <li>You have the right to upload and process the images you submit</li>
              <li>You will not upload images containing sensitive, confidential, or personal information beyond license plates</li>
              <li>Processed images are stored temporarily (maximum 30 days) unless you explicitly save them</li>
              <li>Original images are deleted immediately after processing</li>
              <li>We maintain logs of processing activities for security and compliance purposes</li>
            </ul>

            <div className="flex items-center gap-2 text-primary mt-8 mb-4">
              <Lock className="h-5 w-5" />
              <h2 className="text-xl font-semibold m-0">Privacy & Security</h2>
            </div>
            <p>
              We implement industry-standard security measures to protect your data. Our security practices include:
            </p>
            <ul>
              <li>End-to-end encryption for all data transmission using TLS 1.3</li>
              <li>Secure image processing in isolated environments</li>
              <li>Regular security audits and penetration testing</li>
              <li>Strict access controls and authentication mechanisms</li>
              <li>Compliance with GDPR and other applicable data protection regulations</li>
            </ul>

            <div className="flex items-center gap-2 text-primary mt-8 mb-4">
              <Shield className="h-5 w-5" />
              <h2 className="text-xl font-semibold m-0">Acceptable Use Policy</h2>
            </div>
            <p>
              You agree to use our Service only for lawful purposes and in accordance with these Terms. Prohibited activities include:
            </p>
            <ul>
              <li>Using the Service for any illegal purpose or to violate any laws</li>
              <li>Attempting to bypass our security measures or access unauthorized areas</li>
              <li>Interfering with or disrupting the Service or servers</li>
              <li>Automated scraping or bulk processing without explicit authorization</li>
              <li>Sharing, reselling, or redistributing our Service without permission</li>
              <li>Using the Service to process images you don&apos;t have rights to</li>
            </ul>

            <div className="flex items-center gap-2 text-primary mt-8 mb-4">
              <Server className="h-5 w-5" />
              <h2 className="text-xl font-semibold m-0">Service Plans & Limitations</h2>
            </div>
            <p>
              Our Service is available through different subscription plans. Each plan has specific limitations:
            </p>
            <ul>
              <li>Free Plan: Limited to 100 images per month with basic features</li>
              <li>Pro Plan: Up to 1,000 images per month with advanced features</li>
              <li>Enterprise Plan: Custom limits and features based on agreement</li>
            </ul>
            <p>
              We reserve the right to:
            </p>
            <ul>
              <li>Modify plan features and limitations with reasonable notice</li>
              <li>Implement rate limiting to ensure service stability</li>
              <li>Suspend accounts that exceed their plan limits</li>
              <li>Change pricing with 30 days notice for existing subscribers</li>
            </ul>

            <div className="flex items-center gap-2 text-primary mt-8 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="text-xl font-semibold m-0">API Usage & Integration</h2>
            </div>
            <p>
              When using our API, you agree to:
            </p>
            <ul>
              <li>Keep your API keys secure and not share them with third parties</li>
              <li>Implement proper error handling in your integrations</li>
              <li>Not exceed your plan&apos;s API rate limits</li>
              <li>Properly attribute MaskingTech when required</li>
              <li>Maintain compatibility with our API versioning</li>
            </ul>

            <h3 className="text-lg font-semibold mt-8 mb-4">Intellectual Property</h3>
            <p>
              The Service, including all software, algorithms, designs, and content, is protected by copyright, trademark, and other intellectual property laws. You agree that:
            </p>
            <ul>
              <li>Our AI models and detection algorithms remain our exclusive property</li>
              <li>You may not reverse engineer or decompile our software</li>
              <li>You retain rights to your original images</li>
              <li>You grant us limited rights to process your images for the Service</li>
              <li>Our trademarks and branding may not be used without permission</li>
            </ul>

            <h3 className="text-lg font-semibold mt-8 mb-4">Disclaimer of Warranties</h3>
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, whether express or implied. We specifically disclaim:
            </p>
            <ul>
              <li>100% accuracy in license plate detection and masking</li>
              <li>Uninterrupted or error-free service availability</li>
              <li>Suitability for specific use cases without prior testing</li>
              <li>Compatibility with all image formats and qualities</li>
              <li>Retention of image quality in all processing scenarios</li>
            </ul>

            <h3 className="text-lg font-semibold mt-8 mb-4">Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by law, MaskingTech shall not be liable for:
            </p>
            <ul>
              <li>Any indirect, incidental, or consequential damages</li>
              <li>Loss of data, profits, or business opportunities</li>
              <li>Any damages exceeding the amount paid for the Service in the last 12 months</li>
              <li>Issues arising from third-party integrations or services</li>
              <li>Damages from unauthorized access or data breaches despite our security measures</li>
            </ul>

            <h3 className="text-lg font-semibold mt-8 mb-4">Changes to Terms</h3>
            <p>
              We may modify these Terms at any time. We will notify you of material changes through:
            </p>
            <ul>
              <li>Email notifications to your registered address</li>
              <li>Notices in your dashboard or account area</li>
              <li>Service announcements on our website</li>
            </ul>
            <p>
              Your continued use of the Service after such modifications constitutes acceptance of the updated Terms. If you disagree with the changes, you must stop using the Service.
            </p>

            <h3 className="text-lg font-semibold mt-8 mb-4">Contact Information</h3>
            <p>
              For questions about these Terms or our Service, please contact us:
            </p>
            <ul>
              <li>Support: support@maskingtech.com</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
} 