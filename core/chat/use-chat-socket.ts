import { useCallback, useEffect, useRef, useState } from 'react'
import { getQueryClient } from '@/lib/queryclient/query-client'
import type { ChatMessage } from './chat'

// ===== Types =====

type WSMessageEnvelope = {
  type: string
  data: any
}

type SendMessagePayload = {
  conversation_id: string
  type: 'Text' | 'Image' | 'System'
  content: string
  metadata?: Record<string, any>
}

type ReadReceipt = {
  conversation_id: string
  reader_id: string
}

// ===== Constants =====

const BASE_URL = 'https://shopnexus.hopto.org/api/v1/'
const MAX_RETRIES = 5
const BASE_DELAY_MS = 1000

function getWsUrl(): string {
  // Convert http(s) base URL to ws(s) and point to /ws/chat
  const url = new URL(BASE_URL)
  const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  const token = globalThis?.localStorage?.getItem?.('token') ?? ''
  return `${wsProtocol}//${url.host}/ws/chat?token=${encodeURIComponent(token)}`
}

// ===== Hook =====

export function useChatSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const retryCountRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<ChatMessage | null>(null)

  const connect = useCallback(() => {
    // Don't connect if unmounted or already connected
    if (!mountedRef.current) return
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) return

    const token = globalThis?.localStorage?.getItem?.('token')
    if (!token?.length) return

    const ws = new WebSocket(getWsUrl())
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) {
        ws.close()
        return
      }
      retryCountRef.current = 0
      setIsConnected(true)
    }

    ws.onclose = () => {
      setIsConnected(false)
      if (!mountedRef.current) return
      scheduleReconnect()
    }

    ws.onerror = () => {
      // onclose will fire after onerror, reconnect is handled there
    }

    ws.onmessage = (event) => {
      try {
        const envelope: WSMessageEnvelope = JSON.parse(event.data)
        handleServerMessage(envelope)
      } catch {
        // Ignore malformed messages
      }
    }
  }, [])

  const scheduleReconnect = useCallback(() => {
    if (retryCountRef.current >= MAX_RETRIES) return
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)

    const delay = BASE_DELAY_MS * Math.pow(2, retryCountRef.current)
    retryCountRef.current += 1

    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null
      connect()
    }, delay)
  }, [connect])

  const handleServerMessage = useCallback((envelope: WSMessageEnvelope) => {
    const queryClient = getQueryClient()

    switch (envelope.type) {
      case 'new_message': {
        const msg = envelope.data as ChatMessage
        setLastMessage(msg)
        // Invalidate messages for this conversation and the conversations list
        queryClient.invalidateQueries({
          queryKey: ['chat', 'conversation', msg.conversation_id, 'messages'],
        })
        queryClient.invalidateQueries({
          queryKey: ['chat', 'conversation'],
        })
        break
      }
      case 'read_receipt': {
        const receipt = envelope.data as ReadReceipt
        queryClient.invalidateQueries({
          queryKey: ['chat', 'conversation', receipt.conversation_id, 'messages'],
        })
        queryClient.invalidateQueries({
          queryKey: ['chat', 'conversation'],
        })
        break
      }
      case 'error': {
        console.error('[chat-socket] server error:', envelope.data?.message)
        break
      }
    }
  }, [])

  const sendMessage = useCallback((payload: SendMessagePayload) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return
    const envelope: WSMessageEnvelope = {
      type: 'send_message',
      data: payload,
    }
    wsRef.current.send(JSON.stringify(envelope))
  }, [])

  const markRead = useCallback((conversationId: string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return
    const envelope: WSMessageEnvelope = {
      type: 'mark_read',
      data: { conversation_id: conversationId },
    }
    wsRef.current.send(JSON.stringify(envelope))
  }, [])

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])

  return { sendMessage, markRead, isConnected, lastMessage }
}
