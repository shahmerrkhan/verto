import { SignIn } from '@clerk/clerk-react'

export default function Login() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-base)',
      padding: '24px',
    }}>
      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/signup"
        afterSignInUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: '#7c3aed',
            colorBackground: '#13131a',
            colorText: '#f4f4f5',
            colorTextSecondary: '#9b9ba5',
            colorInputBackground: '#1c1c24',
            colorInputText: '#f4f4f5',
            borderRadius: '10px',
            fontFamily: 'inherit',
          },
         elements: {
            card: { boxShadow: 'none', border: '1px solid rgba(255,255,255,0.08)' },
            footer: { display: 'none' },
            footerAction: { display: 'none' },
            socialButtonsBlockButton: { borderColor: 'rgba(255,255,255,0.12)' },
            socialButtonsBlockButtonText: { color: '#f4f4f5' },
            dividerLine: { backgroundColor: 'rgba(255,255,255,0.1)' },
            dividerText: { color: '#9b9ba5' },
          },
        }}
      />
    </div>
  )
}