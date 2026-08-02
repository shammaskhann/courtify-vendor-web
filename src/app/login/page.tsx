import { LoginForm } from '@/components/auth/LoginForm'
import { Logo } from '@/components/common/Logo'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left side - Branding/Image (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-surface border-r border-border items-center justify-center p-12">
        <div className="max-w-md space-y-6">
          <Logo size="lg" />
          <h1 className="text-display font-bold text-primary tracking-tight">
            Manage your courts. Maximize your revenue.
          </h1>
          <p className="text-body-lg text-secondary">
            Courtify Vendor Panel gives you everything you need to run your sports facility efficiently.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full flex justify-center md:hidden mb-8">
          <Logo size="md" />
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
