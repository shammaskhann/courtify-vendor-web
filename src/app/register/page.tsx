import { RegistrationFlow } from '@/components/auth/RegistrationFlow'
import { Logo } from '@/components/common/Logo'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 bg-background">
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      <RegistrationFlow />
    </div>
  )
}
