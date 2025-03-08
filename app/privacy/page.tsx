import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Lock, Eye, Database, Globe, Bell, FileText, Settings } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
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
              <Shield className="h-5 w-5" />
              <h2 className="text-xl font-semibold m-0">Overview</h2>
            </div>
            <p>
              At MaskingTech, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our license plate masking service. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the service.
            </p>

            <div className="flex items-center gap-2 text-primary mt-8 mb-4">
              <Database className="h-5 w-5" />
              <h2 className="text-xl font-semibold m-0">Information We Collect</h2>
            </div>
            <h3 className="text-lg font-semibold mt-4 mb-2">Personal Information</h3>
            <p>We collect information that you provide directly to us:</p>
            <ul className="space-y-2 list-none pl-0">
              {[
                "Account information (email address, full name, username, password hash)",
                "Billing details (payment method, transaction history, invoicing preferences)",
                "Usage statistics (login times, feature usage, processing history)",
                "User preferences (notification settings, UI preferences, API configurations)",
                "Support communication (tickets, feedback, feature requests, bug reports)",
                "Device information (browser type, IP address, timezone, operating system)"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  - <span>{item}</span>
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold mt-4 mb-2">Image Data</h3>
            <p>When you use our Service, we process:</p>
            <ul className="space-y-2 list-none pl-0">
              {[
                "Uploaded images for license plate detection and masking",
                "Image metadata (timestamp, size, format, resolution, EXIF data if present)",
                "Detected license plate coordinates and confidence scores (during processing)",
                "Masking parameters and settings selected by the user",
                "Processing status and completion information",
                "Error logs and debugging information when processing fails"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  - <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 text-primary mt-8 mb-4">
              <Eye className="h-5 w-5" />
              <h2 className="text-xl font-semibold m-0">How We Use Your Information</h2>
            </div>
            <p>We use the collected information for:</p>
            <ul className="space-y-2 list-none pl-0">
              {[
                "Operating and improving our license plate masking service",
                "Processing payments and managing subscriptions through our secure payment provider",
                "Sending essential service notifications and updates about your account",
                "Providing customer support and responding to your inquiries",
                "Analyzing service performance and optimizing detection algorithms",
                "Investigating and preventing security incidents or abuse",
                "Complying with legal obligations and enforcing our terms",
                "Generating anonymous usage statistics to improve our service",
                "Communicating about new features and service improvements"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  - <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 text-primary mt-8 mb-4">
              <Lock className="h-5 w-5" />
              <h2 className="text-xl font-semibold m-0">Data Security</h2>
            </div>
            <p>
              We implement robust security measures to protect your data:
            </p>
            <ul className="space-y-2 list-none pl-0">
              {[
                "TLS 1.3 encryption for all data transmission and API communications",
                "Secure, containerized processing environments with regular security updates",
                "Multi-factor authentication options for account security",
                "Automated threat detection and intrusion prevention systems",
                "Regular penetration testing and vulnerability assessments",
                "Strict access controls with role-based permissions",
                "Real-time security monitoring and incident response procedures",
                "Regular security training for all employees with access to systems",
                "Secure backup systems with encryption at rest"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  - <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 text-primary mt-8 mb-4">
              <Globe className="h-5 w-5" />
              <h2 className="text-xl font-semibold m-0">International Data Transfers</h2>
            </div>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place:
            </p>
            <ul className="space-y-2 list-none pl-0">
              {[
                "Compliance with EU-US and Swiss-US Privacy Shield Frameworks",
                "Standard contractual clauses approved by the European Commission",
                "Data processing agreements with all third-party service providers",
                "Regular audits of data protection and privacy compliance",
                "Transparency about server locations and data processing centers",
                "Local data storage options where required by law",
                "Documentation of all international data transfers"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  - <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 text-primary mt-8 mb-4">
              <FileText className="h-5 w-5" />
              <h2 className="text-xl font-semibold m-0">Data Retention</h2>
            </div>
            <p>We retain your information according to these principles:</p>
            <ul className="space-y-2 list-none pl-0">
              {[
                "Account information: Retained while account is active, deleted 30 days after account closure",
                "Original images: Deleted immediately after successful processing",
                "Processed images: Stored for 30 days, then automatically deleted unless saved to your account",
                "Payment information: Retained for 7 years as required by tax regulations",
                "Usage logs: 90 days retention for security and performance monitoring",
                "Support tickets: Kept for 2 years to maintain service quality",
                "Audit logs: Retained for 1 year for security purposes",
                "Backup data: Maximum 30-day retention with encryption"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  - <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 text-primary mt-8 mb-4">
              <Settings className="h-5 w-5" />
              <h2 className="text-xl font-semibold m-0">Your Privacy Rights</h2>
            </div>
            <p>You have the right to:</p>
            <ul className="space-y-2 list-none pl-0">
              {[
                "Access and download a copy of your personal data",
                "Correct or update any inaccurate personal information",
                "Request deletion of your personal data (right to be forgotten)",
                "Restrict or object to processing of your data",
                "Export your data in a machine-readable format",
                "Withdraw consent for optional data processing",
                "Lodge a complaint with your local data protection authority",
                "Receive notification of any data breaches affecting your information",
                "Opt-out of non-essential communications"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  - <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 text-primary mt-8 mb-4">
              <Bell className="h-5 w-5" />
              <h2 className="text-xl font-semibold m-0">Updates to This Policy</h2>
            </div>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by:
            </p>
            <ul className="space-y-2 list-none pl-0">
              {[
                "Publishing the updated policy on our website with a changelog",
                "Sending an email notification to your registered email address",
                "Displaying a prominent notice in your account dashboard",
                "Requiring acknowledgment of major policy changes",
                "Providing at least 30 days notice before significant changes",
                "Maintaining an archive of previous policy versions"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  - <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              Your continued use of the Service after any modification indicates your acceptance of the updated policy.
            </p>

            <h3 className="text-lg font-semibold mt-8 mb-4">Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul className="space-y-2 list-none pl-0">
              {[
                "Privacy Officer: privacy@maskingtech.com",
                "Data Protection Officer: dpo@maskingtech.com",
                "General Support: support@maskingtech.com",
                "Security Team: security@maskingtech.com",
                "Legal Department: legal@maskingtech.com",
                "Physical Address: MaskingTech Inc., 123 Privacy Drive, Security Valley, CA 94025",
                "Response Time: We aim to respond to privacy inquiries within 48 hours"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  - <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
} 