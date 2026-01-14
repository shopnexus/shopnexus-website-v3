import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Users,
  Target,
  Heart,
  Award,
  Globe,
  Truck,
  Shield,
  Headphones,
} from "lucide-react"

const stats = [
  { label: "Happy Customers", value: "500K+" },
  { label: "Products", value: "50K+" },
  { label: "Countries", value: "25+" },
  { label: "Team Members", value: "200+" },
]

const values = [
  {
    icon: Heart,
    title: "Customer First",
    description: "Every decision we make starts with our customers in mind.",
  },
  {
    icon: Award,
    title: "Quality Products",
    description: "We curate only the best products from trusted brands.",
  },
  {
    icon: Globe,
    title: "Sustainability",
    description: "Committed to eco-friendly practices and sustainable sourcing.",
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description: "Your data and transactions are always protected.",
  },
]

const team = [
  { name: "Sarah Chen", role: "CEO & Founder", image: null },
  { name: "Michael Park", role: "CTO", image: null },
  { name: "Emily Rodriguez", role: "Head of Design", image: null },
  { name: "David Kim", role: "Head of Operations", image: null },
]

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold mb-4">About ShopNexus</h1>
        <p className="text-lg text-muted-foreground">
          We&apos;re on a mission to make online shopping delightful, affordable,
          and accessible to everyone around the world.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map((stat) => (
          <Card key={stat.label} className="text-center">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Story */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              ShopNexus was founded in 2020 with a simple idea: create an online
              marketplace that puts customers first. What started as a small
              team of five has grown into a global platform serving millions.
            </p>
            <p>
              We believe shopping should be easy, enjoyable, and trustworthy.
              That&apos;s why we work tirelessly to bring you the best products
              at competitive prices, with world-class customer service.
            </p>
            <p>
              Today, we partner with thousands of brands and sellers worldwide,
              offering everything from fashion to electronics, home goods to
              beauty products.
            </p>
          </div>
        </div>
        <div className="bg-muted rounded-xl aspect-video flex items-center justify-center">
          <Users className="h-24 w-24 text-muted-foreground/30" />
        </div>
      </div>

      <Separator className="my-16" />

      {/* Values */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">Our Values</h2>
          <p className="text-muted-foreground">What drives us every day</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator className="my-16" />

      {/* Team */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">Leadership Team</h2>
          <p className="text-muted-foreground">Meet the people behind ShopNexus</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <Card key={member.name}>
              <CardContent className="pt-6 text-center">
                <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator className="my-16" />

      {/* Why Choose Us */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">Why Choose ShopNexus?</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: Truck,
              title: "Fast & Free Shipping",
              description: "Free shipping on orders over $50. Express delivery available.",
            },
            {
              icon: Shield,
              title: "Secure Shopping",
              description: "100% secure payment processing and data protection.",
            },
            {
              icon: Headphones,
              title: "24/7 Support",
              description: "Our customer service team is here to help anytime.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div key={title} className="text-center">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
            Join millions of happy customers and discover amazing products at great prices.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="secondary" asChild>
              <Link href="/">Shop Now</Link>
            </Button>
            <Button variant="outline" className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
