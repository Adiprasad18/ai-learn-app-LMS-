import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        afterSignUpUrl="/dashboard"
        redirectUrl="/dashboard"
      />
    </div>
  )
}