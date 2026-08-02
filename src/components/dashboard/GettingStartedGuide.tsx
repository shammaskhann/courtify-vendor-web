import Link from 'next/link'
import { Building2, Layers, CalendarDays, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export function GettingStartedGuide() {
  return (
    <div className="bg-surface border border-brand/30 rounded-xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex-1 z-10">
        <h2 className="text-h3 font-semibold text-primary mb-2">Welcome to Courtify Vendor Panel!</h2>
        <p className="text-body text-secondary mb-6 max-w-xl">
          It looks like you don't have any data yet. Follow these simple steps to get your sports facility online and start receiving bookings.
        </p>
        
        <div className="flex flex-col gap-4">
          <Link 
            href={ROUTES.VENUES}
            className="group flex items-center p-4 rounded-lg border border-border bg-surface hover:bg-brand/5 hover:border-brand/30 transition-all duration-base"
          >
            <div className="w-10 h-10 rounded-full bg-surface-variant text-primary group-hover:bg-brand group-hover:text-[#1C1C1E] flex items-center justify-center transition-colors shrink-0">
              <Building2 size={20} />
            </div>
            <div className="ml-4 flex-1">
              <h4 className="text-body font-semibold text-primary">1. Create a Venue</h4>
              <p className="text-caption text-secondary">Add your facility details, location, and amenities.</p>
            </div>
            <ArrowRight size={18} className="text-tertiary group-hover:text-brand transition-colors" />
          </Link>
          
          <Link 
            href={ROUTES.COURTS}
            className="group flex items-center p-4 rounded-lg border border-border bg-surface hover:bg-brand/5 hover:border-brand/30 transition-all duration-base"
          >
            <div className="w-10 h-10 rounded-full bg-surface-variant text-primary group-hover:bg-brand group-hover:text-[#1C1C1E] flex items-center justify-center transition-colors shrink-0">
              <Layers size={20} />
            </div>
            <div className="ml-4 flex-1">
              <h4 className="text-body font-semibold text-primary">2. Add Courts</h4>
              <p className="text-caption text-secondary">Define sport types, availability, and pricing rules.</p>
            </div>
            <ArrowRight size={18} className="text-tertiary group-hover:text-brand transition-colors" />
          </Link>
          
          <div className="group flex items-center p-4 rounded-lg border border-border bg-surface opacity-70">
            <div className="w-10 h-10 rounded-full bg-surface-variant text-tertiary flex items-center justify-center shrink-0">
              <CalendarDays size={20} />
            </div>
            <div className="ml-4 flex-1">
              <h4 className="text-body font-semibold text-primary">3. Start Receiving Bookings</h4>
              <p className="text-caption text-secondary">Once your courts are active, customers can book them on the app.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden md:flex flex-col items-center justify-center shrink-0 z-10 w-64 h-64 bg-surface-variant rounded-full p-8 text-center border-4 border-surface shadow-inner">
        <div className="text-6xl mb-2">🏆</div>
        <p className="text-body-sm font-medium text-primary">Get ready to grow your sports business!</p>
      </div>
    </div>
  )
}
