"use client"

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react"
import { useCreateConversation } from "@/core/chat/chat"
import { useGetMe } from "@/core/account/account"
import { useRouter } from "next/navigation"

// ===== Types =====

type ChatWidgetState = {
  isOpen: boolean
  vendorId: string | null
  conversationId: string | null
}

type ChatContextType = {
  state: ChatWidgetState
  openChat: (vendorId: string) => void
  closeChat: () => void
  toggleChat: () => void
}

const ChatContext = createContext<ChatContextType | null>(null)

// ===== Provider =====

export function ChatProvider({ children }: { children: ReactNode }) {
  const { data: me } = useGetMe()
  const router = useRouter()
  const createConversation = useCreateConversation()

  const [state, setState] = useState<ChatWidgetState>({
    isOpen: false,
    vendorId: null,
    conversationId: null,
  })

  const openChat = useCallback(
    async (vendorId: string) => {
      // If user is not logged in, redirect to login
      if (!me) {
        router.push("/login")
        return
      }

      // Open immediately with vendor ID, conversation will be resolved
      setState((prev) => ({
        ...prev,
        isOpen: true,
        vendorId,
        conversationId: null,
      }))

      try {
        const conversation = await createConversation.mutateAsync({
          seller_id: vendorId,
        })
        setState((prev) => ({
          ...prev,
          conversationId: conversation.id,
        }))
      } catch {
        // Keep the widget open but without a conversation
        // The widget will show an error state
      }
    },
    [me, router, createConversation]
  )

  const closeChat = useCallback(() => {
    setState({ isOpen: false, vendorId: null, conversationId: null })
  }, [])

  const toggleChat = useCallback(() => {
    setState((prev) => {
      if (prev.isOpen) {
        return { isOpen: false, vendorId: null, conversationId: null }
      }
      return { ...prev, isOpen: true }
    })
  }, [])

  return (
    <ChatContext.Provider value={{ state, openChat, closeChat, toggleChat }}>
      {children}
    </ChatContext.Provider>
  )
}

// ===== Hook =====

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}
