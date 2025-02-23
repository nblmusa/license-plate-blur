"use client"

import { useEffect } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    grecaptcha: any
    onRecaptchaLoad: () => void
  }
}

interface ReCAPTCHAProps {
  onVerify: (token: string) => void
}

export function ReCAPTCHA({ onVerify }: ReCAPTCHAProps) {
  useEffect(() => {
    // Define the callback function that will be called when reCAPTCHA loads
    window.onRecaptchaLoad = () => {
      window.grecaptcha.ready(() => {
        window.grecaptcha.render('recaptcha-container', {
          sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
          callback: onVerify,
        })
      })
    }

    return () => {
      // Cleanup
      delete (window as any).onRecaptchaLoad
    }
  }, [onVerify])

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`}
        strategy="lazyOnload"
      />
      <div id="recaptcha-container" className="mt-4" />
    </>
  )
} 