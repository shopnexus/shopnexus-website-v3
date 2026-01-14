import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: January 2026</p>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8 prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground mb-4">
              Welcome to ShopNexus (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your
              personal information and your right to privacy. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you visit our website or make a purchase.
            </p>
            <p className="text-muted-foreground">
              Please read this privacy policy carefully. If you do not agree with the terms of this
              privacy policy, please do not access the site.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Personal identification information (name, email address, phone number)</li>
              <li>Billing and shipping addresses</li>
              <li>Payment information (processed securely through our payment providers)</li>
              <li>Order history and preferences</li>
              <li>Account credentials</li>
              <li>Communications with our customer service team</li>
            </ul>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect for various purposes, including to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Process and fulfill your orders</li>
              <li>Send transactional emails (order confirmations, shipping updates)</li>
              <li>Provide customer support</li>
              <li>Personalize your shopping experience</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Information Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We may share your information in the following situations:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Service Providers:</strong> We share data with third parties that perform services on our behalf (payment processing, shipping, email delivery)</li>
              <li><strong>Vendors:</strong> When you purchase from a third-party vendor on our marketplace, we share necessary order information with them</li>
              <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational security measures to protect your
              personal information. These include encryption, secure servers, and regular security audits.
              However, no method of transmission over the Internet is 100% secure, and we cannot guarantee
              absolute security.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Cookies and Tracking</h2>
            <p className="text-muted-foreground mb-4">
              We use cookies and similar tracking technologies to collect information about your browsing
              activities. These help us:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Remember your preferences and settings</li>
              <li>Keep you logged in</li>
              <li>Understand how you use our website</li>
              <li>Deliver personalized advertisements</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              You can control cookies through your browser settings.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your personal data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, please contact us at privacy@shopnexus.com.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground">
              Our services are not directed to individuals under 16 years of age. We do not knowingly
              collect personal information from children. If we become aware that we have collected
              personal information from a child, we will take steps to delete that information.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of any changes
              by posting the new privacy policy on this page and updating the &quot;Last updated&quot; date.
              You are advised to review this policy periodically for any changes.
            </p>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about this privacy policy or our privacy practices, please contact us:
            </p>
            <ul className="text-muted-foreground space-y-1">
              <li>Email: privacy@shopnexus.com</li>
              <li>Address: 123 Commerce Street, New York, NY 10001</li>
              <li>Phone: +1 (800) 123-4567</li>
            </ul>
          </section>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          See also our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  )
}
