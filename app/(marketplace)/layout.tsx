import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ChatProvider } from "@/components/chat/chat-context"
import { ChatWidget } from "@/components/chat/chat-widget"

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ChatProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </div>
    </ChatProvider>
  )
}
