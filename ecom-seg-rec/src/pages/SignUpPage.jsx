import { SignUp } from '@clerk/react';

export default function SignUpPage() {
  return (
    <main className="container d-flex justify-content-center align-items-center min-vh-100 py-4">
      <SignUp
        routing="virtual"
        signInUrl="/signin"
        fallbackRedirectUrl="/"
        appearance={{
          elements: {
            card: 'shadow-sm border-0',
            headerTitle: 'fw-bold',
            formButtonPrimary: 'bg-primary',
          },
        }}
      />
    </main>
  );
}
