'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { siteConfig } from '@/config/site'
import { toWhatsAppLink } from '@/lib/customers'
import { ChevronDown, Mail, MessageCircle, Phone, Clock, UserCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQS = [
  {
    question: 'How do I get my venue approved?',
    answer:
      'Add your venue under Venues, including its address, opening hours and photos. Our team reviews new venues before they go live to players. You can see the approval state on the venue card at any time — no need to chase us for a status update.',
  },
  {
    question: 'How do I charge more during busy hours?',
    answer:
      'Open Courts, edit the court, and go to the Pricing step. Turn on "Enable Peak Pricing", set your peak window (for example 6:00 PM to 9:00 PM), then enter the peak and off-peak rates. You can do this per day of the week if your demand varies.',
  },
  {
    question: 'A customer booked over the phone. Can I add it myself?',
    answer:
      'Yes. Go to Bookings and click "New booking". Pick the venue, court, date and time, then enter the customer\'s name and number. The amount is filled in automatically from that court\'s configured rate, and you can override it if you agreed a different price.',
  },
  {
    question: 'How do I check a customer in when they arrive?',
    answer:
      'On the Bookings page click "Check in". You can scan the QR code from the customer\'s phone using your device camera, or type their booking reference if scanning is not available. Once verified you can mark the booking as completed.',
  },
  {
    question: 'How do I run a discount or promotion?',
    answer:
      'Use the Deals page. You can set a percentage off, a flat discount, a fixed price or a buy-X-get-Y offer, restrict it to certain days or times, cap how many times it can be used, and give it a promo code.',
  },
  {
    question: 'How do I find customers who have stopped booking?',
    answer:
      'Open Customers and choose the "Lapsed" tab. It shows anyone who has not booked in 30 days or more, along with how much they have spent with you. You can message or call them directly from that list.',
  },
  {
    question: 'When and how do I get paid?',
    answer:
      'Payout timing and fees are set out in your vendor agreement. If you are unsure what applies to your account, contact us using any of the options above and we will confirm your specific terms in writing — we will never change your rate without telling you first.',
  },
]

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const whatsappLink = toWhatsAppLink(siteConfig.supportWhatsApp)

  const channels = [
    whatsappLink && {
      label: 'WhatsApp',
      value: siteConfig.supportWhatsApp,
      description: 'Fastest way to reach us. Usually answered within a few hours.',
      href: whatsappLink,
      external: true,
      icon: MessageCircle,
      accent: 'text-success-text bg-success-bg border-success/20',
    },
    siteConfig.supportPhone && {
      label: 'Call us',
      value: siteConfig.supportPhone,
      description: 'Speak to someone on the team directly during support hours.',
      href: `tel:${siteConfig.supportPhone}`,
      external: false,
      icon: Phone,
      accent: 'text-brand bg-brand/10 border-brand/20',
    },
    {
      label: 'Email',
      value: siteConfig.supportEmail,
      description: 'Best for anything that needs a paper trail, like billing questions.',
      href: `mailto:${siteConfig.supportEmail}`,
      external: false,
      icon: Mail,
      accent: 'text-primary bg-surface-variant border-border',
    },
  ].filter(Boolean) as {
    label: string
    value: string
    description: string
    href: string
    external: boolean
    icon: typeof Mail
    accent: string
  }[]

  return (
    <div className="flex flex-col gap-6 pb-8 h-full max-w-4xl mx-auto w-full">
      <PageHeader
        title="Help and Support"
        subtitle="Talk to a real person on the Courtify team — no bots, no ticket queue."
      />

      <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 text-body-sm">
          <span className="flex items-center gap-2 text-secondary">
            <Clock size={16} className="text-brand" />
            {siteConfig.supportHours}
          </span>
          <span className="flex items-center gap-2 text-secondary">
            <UserCheck size={16} className="text-brand" />
            Answered by the team that builds Courtify
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => {
            const Icon = channel.icon
            return (
              <a
                key={channel.label}
                href={channel.href}
                {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-surface hover:border-brand/50 hover:shadow-md transition-all"
              >
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center border', channel.accent)}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-body font-semibold text-primary">{channel.label}</p>
                  <p className="text-body-sm text-brand break-all">{channel.value}</p>
                </div>
                <p className="text-caption text-secondary">{channel.description}</p>
              </a>
            )
          })}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-h4 font-semibold text-primary">Common questions</h3>
          <p className="text-body-sm text-secondary mt-1">
            Quick answers to the things court owners ask us most.
          </p>
        </div>

        <div className="divide-y divide-border">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={faq.question}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-surface-variant/50 transition-colors"
                >
                  <span className="text-body font-medium text-primary">{faq.question}</span>
                  <ChevronDown
                    size={18}
                    className={cn(
                      'text-secondary shrink-0 transition-transform duration-base',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 -mt-1">
                    <p className="text-body-sm text-secondary leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
