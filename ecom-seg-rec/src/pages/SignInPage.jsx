import { SignIn } from "@clerk/react";

export default function SignInPage() {
  return (
    <main className="container d-flex justify-content-center align-items-center min-vh-100 py-4">
      <SignIn
        routing="virtual"
        signUpUrl="/signup"
        fallbackRedirectUrl="/"
        appearance={{
          elements: {
            card: "shadow-sm border-0",
            headerTitle: "fw-bold",
            formButtonPrimary: "bg-primary",
          },
        }}
      />
    </main>
  );
}
