import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: January 2026</p>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8 prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using ShopNexus (&quot;Service&quot;), you agree to be bound by these Terms of Service
              (&quot;Terms&quot;). If you disagree with any part of these terms, you may not access the Service.
              These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Use of Service</h2>
            <p className="text-muted-foreground mb-4">
              You agree to use the Service only for lawful purposes and in accordance with these Terms.
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Use the Service in any way that violates any applicable law or regulation</li>
              <li>Engage in any conduct that restricts or inhibits anyone&apos;s use of the Service</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use any robot, spider, or other automatic device to access the Service</li>
              <li>Introduce any viruses, trojan horses, or other harmful material</li>
              <li>Impersonate or attempt to impersonate the Company or another user</li>
            </ul>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Account Registration</h2>
            <p className="text-muted-foreground mb-4">
              To access certain features, you may need to register for an account. When you register, you agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              We reserve the right to refuse service, terminate accounts, or remove content at our sole discretion.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Products and Purchases</h2>
            <p className="text-muted-foreground mb-4">
              When you make a purchase through our Service:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You represent that you are authorized to use the payment method provided</li>
              <li>Prices are subject to change without notice</li>
              <li>We reserve the right to refuse or cancel any order for any reason</li>
              <li>Product descriptions are as accurate as possible but may contain errors</li>
              <li>Colors and images may vary from actual products</li>
            </ul>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Third-Party Vendors</h2>
            <p className="text-muted-foreground">
              ShopNexus is a marketplace that connects buyers with third-party vendors. While we strive to
              ensure quality, we are not responsible for the products or services offered by third-party
              vendors. Each vendor is responsible for their own products, shipping, and customer service.
              Disputes regarding vendor products should first be directed to the vendor, then to our
              customer support if unresolved.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Shipping and Delivery</h2>
            <p className="text-muted-foreground">
              Shipping times are estimates and not guaranteed. We are not responsible for delays caused
              by carriers, customs, or other circumstances beyond our control. Risk of loss and title
              for items pass to you upon delivery to the carrier. You are responsible for providing
              accurate shipping information.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Returns and Refunds</h2>
            <p className="text-muted-foreground">
              Our return and refund policy is available on our Help Center. By making a purchase, you
              acknowledge and accept our return policy. Certain items may be excluded from returns as
              specified in the product listing.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Intellectual Property</h2>
            <p className="text-muted-foreground">
              The Service and its original content, features, and functionality are owned by ShopNexus
              and are protected by international copyright, trademark, patent, trade secret, and other
              intellectual property laws. You may not copy, modify, distribute, sell, or lease any part
              of our Service without express written permission.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. User Content</h2>
            <p className="text-muted-foreground mb-4">
              You retain ownership of content you submit (reviews, comments, etc.), but you grant us a
              non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display such
              content. You represent that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You own or have rights to the content you submit</li>
              <li>Your content does not infringe on any third party&apos;s rights</li>
              <li>Your content is accurate and not misleading</li>
              <li>Your content does not violate any law or regulation</li>
            </ul>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER
              EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR
              ERROR-FREE. WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SHOPNEXUS SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA,
              OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY
              SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST TWELVE MONTHS.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the laws of the State of
              New York, without regard to its conflict of law provisions. Any disputes shall be resolved
              in the courts located in New York County, New York.
            </p>
          </section>

          <Separator className="my-6" />

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">13. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. We will notify users of any material
              changes by posting the new Terms on this page and updating the &quot;Last updated&quot; date. Your
              continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold mb-4">14. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <ul className="text-muted-foreground space-y-1">
              <li>Email: legal@shopnexus.com</li>
              <li>Address: 123 Commerce Street, New York, NY 10001</li>
              <li>Phone: +1 (800) 123-4567</li>
            </ul>
          </section>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          See also our{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
