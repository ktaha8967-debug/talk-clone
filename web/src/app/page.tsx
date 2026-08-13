"use client"

import { Navbar, Hero, Features, HowItWorks, Pricing, FAQ, CTA, Footer } from "@/components/marketing"

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </>
  )
}
