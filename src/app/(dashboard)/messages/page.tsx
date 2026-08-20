'use client'

import { useState, useEffect, useRef } from 'react'
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getThreads, getMessages, sendMessage, markThreadAsRead } from '@/lib/api/chatApi'
import { useStompClient } from '@/hooks/useStompClient'
import { useAuth } from '@/contexts/AuthContext'
import { Send, User as UserIcon, Inbox, Search, Edit, MoreHorizontal, Info, CheckCheck, Check, Paperclip, Loader2, X } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { uploadImage } from '@/lib/api/uploadApi'
import { toast } from 'react-hot-toast'
import type { ChatThreadDto, ChatMessageDto } from '@/types/models'
import { useSearchParams, useRouter } from 'next/navigation'

export default function MessagesPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  const threadIdParam = searchParams.get('threadId')
  const activeThreadId = threadIdParam ? Number(threadIdParam) : null

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { data: threads = [], isLoading: isLoadingThreads } = useQuery({
    queryKey: ['chat-threads'],
    queryFn: getThreads,
  })

  const activeThread = threads.find(t => t.id === activeThreadId)

  const { 
    data: messagesData, 
    isLoading: isLoadingMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['chat-messages', activeThreadId],
    queryFn: ({ pageParam = 0 }) => getMessages(activeThreadId!, pageParam, 50),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.page + 1,
    enabled: !!activeThreadId,
  })

  const messages = [...(messagesData?.pages.flatMap(p => p.content) || [])].reverse()

  const { ref: topRef, inView: topInView } = useInView()
  
  useEffect(() => {
    if (topInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [topInView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Mark as read when active thread changes
  useEffect(() => {
    if (activeThreadId && activeThread?.unreadCount && activeThread.unreadCount > 0) {
      markThreadAsRead(activeThreadId).then(() => {
        queryClient.invalidateQueries({ queryKey: ['chat-threads'] })
      })
    }
  }, [activeThreadId, activeThread?.unreadCount, queryClient])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // STOMP WebSocket
  useStompClient({
    userId: user?.id,
    threadId: activeThreadId || undefined,
    onMessage: (msg: ChatMessageDto) => {
      // Update messages cache
      queryClient.setQueryData(['chat-messages', activeThreadId], (old: any) => {
        if (!old) return old
        // Check if message already exists
        const exists = old.pages.some((p: any) => p.content.some((m: ChatMessageDto) => m.id === msg.id))
        if (exists) return old
        
        // Add to first page
        const newPages = [...old.pages]
        if (newPages.length > 0) {
          newPages[0] = { ...newPages[0], content: [msg, ...newPages[0].content] }
        }
        return {
          ...old,
          pages: newPages
        }
      })

      // Also update the latestMessage in threads cache
      queryClient.setQueryData(['chat-threads'], (oldThreads: ChatThreadDto[]) => {
        if (!oldThreads) return oldThreads
        return oldThreads.map(t => {
          if (t.id === msg.threadId) {
            return { ...t, latestMessage: msg, updatedAt: msg.createdAt }
          }
          return t
        }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      })
    },
    onGlobalMessage: (msg: ChatMessageDto) => {
      // If we're already looking at the thread, handled by onMessage.
      if (msg.threadId === activeThreadId) return

      // Update threads list to show unread or latest message
      queryClient.invalidateQueries({ queryKey: ['chat-threads'] })
    },
    onRead: (payload) => {
      if (payload.threadId === activeThreadId) {
        queryClient.setQueryData(['chat-messages', activeThreadId], (old: any) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((p: any) => ({
              ...p,
              content: p.content.map((m: ChatMessageDto) => m.senderId !== payload.readBy ? { ...m, isRead: true } : m)
            }))
          }
        })
      }
    }
  })

  const sendMutation = useMutation({
    mutationFn: ({ content, type, url }: { content: string, type: string, url?: string }) => sendMessage(activeThreadId!, content, type, url),
    onSuccess: () => {
      setInput('')
    }
  })

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !selectedFile) return
    if (!activeThreadId) return

    if (selectedFile) {
      setIsUploading(true)
      try {
        const url = await uploadImage(selectedFile)
        sendMutation.mutate({ content: input.trim() || 'Sent an image', type: 'IMAGE', url })
      } catch (err: any) {
        toast.error('Failed to upload image')
        setIsUploading(false)
        return
      }
      setIsUploading(false)
      setSelectedFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } else if (input.trim()) {
      sendMutation.mutate({ content: input.trim(), type: 'TEXT' })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeThreadId) return

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-112px)] -mt-2 -mx-2 bg-[#121214] text-[#E4E4E5] rounded-xl overflow-hidden border border-[#2A2A2D] shadow-sm font-sans">
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar / Threads List */}
        <div className="w-80 border-r border-[#2A2A2D] bg-[#17171A] flex flex-col shrink-0">

          <div className="p-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-xl text-white tracking-tight">Messages</h2>
                <p className="text-xs text-[#8B8B8F] mt-0.5">Player Communications</p>
              </div>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2A2A2D] transition-colors text-[#A1A1A5]">
                <Edit size={16} />
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-[#8B8B8F]" />
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full bg-[#1C1C1F] border border-[#2A2A2D] rounded-xl py-2 pl-9 pr-12 text-sm text-[#E4E4E5] placeholder:text-[#8B8B8F] focus:outline-none focus:border-[#4B4B52] transition-colors"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#2A2A2D] text-[#8B8B8F]">⌘K</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            {isLoadingThreads ? (
              <div className="p-8 text-center text-[#8B8B8F] text-sm">Loading...</div>
            ) : threads.length === 0 ? (
              <div className="p-8 text-center text-[#8B8B8F] text-sm">No messages yet.</div>
            ) : (
              <div className="space-y-1">
                {threads.map((thread) => {
                  const isActive = thread.id === activeThreadId
                  const otherName = thread.participantTwoName || 'Unknown Player'

                  return (
                    <button
                      key={thread.id}
                      onClick={() => router.push(`/messages?threadId=${thread.id}`)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-200 group flex items-center gap-3 relative ${isActive ? 'bg-[#212124]' : 'hover:bg-[#1C1C1F]'
                        }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-[#D4F84F]" />
                      )}

                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-[#A3A369] flex items-center justify-center text-white font-bold text-sm">
                          {getInitials(otherName)}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#D4F84F] rounded-full border-[2.5px] border-[#212124]"></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className={`font-semibold text-sm truncate pr-2 ${isActive ? 'text-[#D4F84F]' : 'text-white'}`}>
                            {otherName}
                          </span>
                          <span className="text-[10px] text-[#8B8B8F] shrink-0">
                            {new Date(thread.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-[#A1A1A5]">
                          {thread.threadType === 'BOOKING' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4F84F] opacity-80 shrink-0"></span>
                          )}
                          <p className="truncate">
                            {thread.threadType === 'BOOKING' ? `Booking #${thread.referenceId}` : 'General Inquiry'}
                          </p>
                        </div>
                      </div>

                      {thread.unreadCount > 0 && !isActive && (
                        <span className="bg-[#D4F84F] text-[#121214] text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm shrink-0">
                          {thread.unreadCount}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#2A2A2D] mt-auto">
            <div className="flex items-center justify-between hover:bg-[#1C1C1F] p-2 -mx-2 rounded-xl cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black border border-[#2A2A2D] flex items-center justify-center text-white font-bold text-xs">
                  N
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">You</p>
                  <p className="text-xs text-[#22C55E] font-medium">Online</p>
                </div>
              </div>
              <MoreHorizontal size={16} className="text-[#8B8B8F]" />
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-[#121214] relative">
          {!activeThreadId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-[#8B8B8F]">
                <Inbox size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-[#2A2A2D] flex items-center justify-between shrink-0 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-[#A3A369] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {getInitials(activeThread?.participantTwoName || 'PL')}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#D4F84F] rounded-full border-[2.5px] border-[#121214]"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] text-white">{activeThread?.participantTwoName || 'Player'}</h3>
                    <p className="text-xs text-[#A1A1A5] font-medium flex items-center gap-1.5 mt-0.5">
                      {activeThread?.threadType === 'BOOKING' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4F84F] opacity-80"></span>
                      )}
                      Booking #{activeThread?.referenceId}
                    </p>
                  </div>
                </div>
                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#2A2A2D] transition-colors text-[#A1A1A5]">
                  <Info size={18} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {hasNextPage && (
                  <div ref={topRef} className="flex justify-center my-4">
                    {isFetchingNextPage ? <Loader2 className="animate-spin text-[#8B8B8F]" size={20} /> : <div className="h-5" />}
                  </div>
                )}

                <div className="flex justify-center mb-6">
                  <span className="bg-[#2A2A2D] text-[#A1A1A5] text-xs font-medium px-3 py-1 rounded-full">Today</span>
                </div>

                {isLoadingMessages ? (
                  <div className="text-center text-[#8B8B8F] text-sm">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-60">
                    <Inbox size={48} className="text-[#8B8B8F] mb-4" />
                    <p className="text-[#8B8B8F] font-medium">Say hello to {activeThread?.participantTwoName || 'Player'}!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.senderId.toString() === user?.id?.toString()
                    const prevMsg = messages[index - 1]
                    const isConsecutive = prevMsg && prevMsg.senderId === msg.senderId

                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isConsecutive ? '-mt-4' : 'mt-2'}`}>
                        <div className={`flex gap-3 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isMe && !isConsecutive && (
                            <div className="w-9 h-9 rounded-full bg-[#1C1C1F] border border-[#2A2A2D] flex items-center justify-center text-[#8B8B8F] shrink-0 mt-auto">
                              <UserIcon size={16} />
                            </div>
                          )}
                          {!isMe && isConsecutive && <div className="w-9 shrink-0" />}

                          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`px-4 py-2.5 shadow-sm text-[15px] ${isMe
                                ? 'bg-[#D4F84F] text-[#121214] rounded-2xl rounded-tr-sm font-medium'
                                : 'bg-[#212124] text-[#E4E4E5] rounded-2xl rounded-tl-sm'
                                }`}
                            >
                              {msg.messageType === 'IMAGE' && msg.attachmentUrl ? (
                                <div className="mb-2">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={msg.attachmentUrl} alt="attachment" className="max-w-[200px] sm:max-w-xs rounded-xl" />
                                </div>
                              ) : null}
                              {msg.content && msg.content !== 'Sent an image' && (
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              )}
                            </div>
                            <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-medium ${isMe ? 'text-[#8B8B8F] justify-end w-full' : 'text-[#8B8B8F] justify-start w-full'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                              {isMe && (
                                <span className={msg.isRead ? "text-[#D4F84F]" : "text-[#8B8B8F]"}>
                                  {msg.isRead ? <CheckCheck size={14} strokeWidth={2.5} /> : <Check size={14} strokeWidth={2.5} />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} className="h-1" />
              </div>

              {/* Chat Input */}
              <div className="p-4 px-6 pb-6 shrink-0 bg-gradient-to-t from-[#121214] to-transparent">
                <div className="max-w-5xl mx-auto flex flex-col items-center">
                  <form onSubmit={handleSend} className="w-full flex flex-col gap-3 bg-[#1C1C1F] border border-[#2A2A2D] focus-within:border-[#4B4B52] focus-within:ring-1 focus-within:ring-[#4B4B52] rounded-2xl p-2.5 transition-all shadow-lg">
                    {previewUrl && (
                      <div className="relative inline-block ml-2 mt-2 self-start">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previewUrl} alt="Preview" className="h-20 rounded-md object-cover border border-[#2A2A2D]" />
                        <button 
                          type="button" 
                          onClick={() => { setSelectedFile(null); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="absolute -top-2 -right-2 bg-[#2A2A2D] text-[#8B8B8F] hover:text-white rounded-full p-0.5 shadow flex items-center justify-center"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                    <div className="w-full flex items-end gap-3">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="rounded-xl shrink-0 w-11 h-11 flex items-center justify-center text-[#8B8B8F] hover:bg-[#2A2A2D] hover:text-[#E4E4E5] transition-colors mb-0.5"
                      >
                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
                      </button>
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSend(e)
                          }
                        }}
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent border-none px-3 py-3 text-[15px] text-[#E4E4E5] placeholder:text-[#8B8B8F] focus:outline-none focus:ring-0 resize-none min-h-[48px] max-h-32"
                        disabled={sendMutation.isPending || isUploading}
                        rows={1}
                      />
                      <button
                        type="submit"
                        className="rounded-xl shrink-0 w-11 h-11 flex items-center justify-center bg-[#D4F84F] hover:bg-[#c3e647] text-[#121214] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
                        disabled={(!input.trim() && !selectedFile) || sendMutation.isPending || isUploading}
                      >
                        <Send size={18} strokeWidth={2.5} className="ml-1" />
                      </button>
                    </div>
                  </form>
                  <p className="text-[#8B8B8F] text-[11px] font-medium mt-3">
                    Press Shift + Enter for new line
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
