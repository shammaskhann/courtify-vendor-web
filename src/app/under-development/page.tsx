import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { ROUTES } from '@/lib/constants'
import { ArrowLeft, Wrench } from 'lucide-react'

export default function UnderDevelopment() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="h-24 w-24 rounded-full bg-surface-variant flex items-center justify-center mb-6">
        <Wrench size={48} className="text-brand" />
      </div>
      <Typography variant="h2" className="mb-2">
        Coming Soon
      </Typography>
      <Typography variant="body" color="secondary" className="mb-8 max-w-md">
        This feature is currently under development. Check back later for updates!
      </Typography>
      <Link href={ROUTES.DASHBOARD} passHref>
        <Button leftIcon={ArrowLeft}>Back to Dashboard</Button>
      </Link>
    </div>
  )
}
