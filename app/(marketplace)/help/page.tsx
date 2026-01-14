"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Search,
  Package,
  CreditCard,
  Truck,
  RotateCcw,
  User,
  Shield,
  HelpCircle,
  MessageSquare,
  Mail,
  ChevronRight,
} from "lucide-react"

const categories = [
  {
    id: "orders",
    icon: Package,
    title: "Orders & Tracking",
    description: "Track orders, order issues, cancellations",
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Payments & Billing",
    description: "Payment methods, invoices, refunds",
  },
  {
    id: "shipping",
    icon: Truck,
    title: "Shipping & Delivery",
    description: "Delivery times, shipping costs, addresses",
  },
  {
    id: "returns",
    icon: RotateCcw,
    title: "Returns & Refunds",
    description: "Return policy, how to return, refund status",
  },
  {
    id: "account",
    icon: User,
    title: "Account & Profile",
    description: "Account settings, password, preferences",
  },
  {
    id: "security",
    icon: Shield,
    title: "Privacy & Security",
    description: "Data protection, account security",
  },
]

const faqs: Record<string, Array<{ question: string; answer: string }>> = {
  orders: [
    {
      question: "How do I track my order?",
      answer: "You can track your order by going to your Account > Orders and clicking on the specific order. You'll see real-time tracking information and estimated delivery date.",
    },
    {
      question: "Can I cancel my order?",
      answer: "You can cancel your order if it hasn't been shipped yet. Go to Account > Orders, find your order, and click 'Cancel Order'. If the order has already shipped, you'll need to wait for delivery and then request a return.",
    },
    {
      question: "What if my order arrives damaged?",
      answer: "If your order arrives damaged, please take photos of the damage and contact us within 48 hours. Go to Account > Orders, select the order, and click 'Report Issue'. We'll arrange a replacement or refund.",
    },
    {
      question: "Can I modify my order after placing it?",
      answer: "Order modifications are limited once placed. If your order hasn't been processed yet, contact customer support immediately. We'll try our best to accommodate changes, but we cannot guarantee modifications.",
    },
  ],
  payments: [
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers in select regions.",
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, we use industry-standard SSL encryption and are PCI DSS compliant. We never store your full card details on our servers.",
    },
    {
      question: "When will I be charged?",
      answer: "Your payment is processed when you place your order. For pre-orders or backorders, you'll be charged when the item ships.",
    },
    {
      question: "Can I get an invoice for my order?",
      answer: "Yes, invoices are automatically sent to your email after purchase. You can also download invoices from Account > Orders > Order Details.",
    },
  ],
  shipping: [
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. Delivery times may vary based on your location and product availability.",
    },
    {
      question: "Do you offer free shipping?",
      answer: "Yes! We offer free standard shipping on orders over $50. Express shipping is available for an additional fee.",
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to over 25 countries. International shipping times and costs vary by destination. You can see shipping options at checkout.",
    },
    {
      question: "Can I change my shipping address?",
      answer: "You can change your shipping address before the order ships. Go to Account > Orders and click 'Edit Address'. Once shipped, the address cannot be changed.",
    },
  ],
  returns: [
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for most items. Products must be unused, in original packaging, and with all tags attached. Some items like personalized products are final sale.",
    },
    {
      question: "How do I start a return?",
      answer: "Go to Account > Orders, select the order, and click 'Request Return'. Choose the items you want to return and select a reason. You'll receive a prepaid shipping label via email.",
    },
    {
      question: "How long do refunds take?",
      answer: "Once we receive your return, refunds are processed within 5-7 business days. The refund will appear on your original payment method within 1-2 billing cycles.",
    },
    {
      question: "Can I exchange an item instead of returning it?",
      answer: "Yes! When requesting a return, select 'Exchange' instead of 'Refund'. Choose the new size/color you want, and we'll ship it as soon as we receive your return.",
    },
  ],
  account: [
    {
      question: "How do I create an account?",
      answer: "Click 'Sign Up' in the top right corner. You can register with your email address or sign up using Google or Apple for faster access.",
    },
    {
      question: "How do I reset my password?",
      answer: "Click 'Sign In', then 'Forgot Password'. Enter your email address and we'll send you a password reset link. The link expires in 24 hours.",
    },
    {
      question: "Can I delete my account?",
      answer: "Yes, you can delete your account from Account > Settings > Delete Account. Please note this action is permanent and will delete all your order history and saved information.",
    },
    {
      question: "How do I update my email address?",
      answer: "Go to Account > Profile and click 'Edit' next to your email. You'll need to verify the new email address before the change takes effect.",
    },
  ],
  security: [
    {
      question: "How do you protect my data?",
      answer: "We use advanced encryption, secure servers, and follow industry best practices. We never sell your personal information to third parties. Read our Privacy Policy for details.",
    },
    {
      question: "What should I do if I suspect unauthorized access?",
      answer: "Immediately change your password and contact our support team. We'll help secure your account and investigate any suspicious activity.",
    },
    {
      question: "Do you use cookies?",
      answer: "Yes, we use cookies to improve your shopping experience. You can manage cookie preferences in your browser settings. See our Cookie Policy for more information.",
    },
  ],
}

export default function HelpPage() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const allFaqs = Object.entries(faqs).flatMap(([category, questions]) =>
    questions.map((q) => ({ ...q, category }))
  )

  const filteredFaqs = search
    ? allFaqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(search.toLowerCase()) ||
          faq.answer.toLowerCase().includes(search.toLowerCase())
      )
    : selectedCategory
    ? faqs[selectedCategory] || []
    : []

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Search our help center or browse categories below
        </p>

        {/* Search */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for answers..."
            className="pl-12 h-12 text-lg"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSelectedCategory(null)
            }}
          />
        </div>
      </div>

      {/* Search Results */}
      {search && (
        <div className="max-w-3xl mx-auto mb-12">
          <p className="text-sm text-muted-foreground mb-4">
            {filteredFaqs.length} result{filteredFaqs.length !== 1 ? "s" : ""} for &quot;{search}&quot;
          </p>
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-2">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`search-${index}`}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No results found. Try a different search term or browse our categories.
                </p>
                <Button variant="outline" onClick={() => setSearch("")}>
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Categories */}
      {!search && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <category.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Category FAQs */}
          {selectedCategory && (
            <div className="max-w-3xl mx-auto mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Categories
                </Button>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {categories.find((c) => c.id === selectedCategory)?.title}
                </span>
              </div>

              <Accordion type="single" collapsible className="space-y-2">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </>
      )}

      {/* Contact CTA */}
      <Card className="max-w-3xl mx-auto bg-muted/50">
        <CardContent className="p-8 text-center">
          <MessageSquare className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Still need help?</h2>
          <p className="text-muted-foreground mb-6">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/contact">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
