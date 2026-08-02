import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Typography } from '@/components/ui/Typography'
import { ROUTES } from '@/lib/constants'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <Typography variant="display" className="mb-4">
        404
      </Typography>
      <Typography variant="h3" color="secondary" className="mb-8">
        Page not found
      </Typography>
      <Link href={ROUTES.DASHBOARD} passHref>
        <Button leftIcon={ArrowLeft}>Back to Dashboard</Button>
      </Link>
    </div>
  )
}
