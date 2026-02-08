"use client"

import { motion, animate, useMotionValue } from "framer-motion"
import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

const plans = [
  {
    name: "Free",
    description: "Essentials to get started",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "Basic automation",
      "Comment reply",
      "Community support",
    ],
    extras: ["Community support", "Single user"],
    cta: "Start Free",
  },
  {
    name: "Smart AI",
    description: "For creators and teams",
    priceMonthly: 59,
    // yearly: 2 months free -> 10 months pricing
    priceYearly: 59 * 10,
    features: [
      "AI response generation",
      "Advanced analytics",
      "Priority support",
    ],
    extras: ["Team seats", "Onboarding session", "99.9% uptime SLA"],
    cta: "Upgrade",
    popular: true,
  },
]

const BillingToggle = ({ billing, setBilling }: { billing: 'monthly' | 'yearly'; setBilling: (b: 'monthly' | 'yearly') => void }) => {
  return (
    <div role="tablist" aria-label="Billing frequency" className="inline-flex items-center rounded-full bg-slate-900/50 p-1 text-sm">
      <button
        role="tab"
        aria-selected={billing === 'monthly'}
        onClick={() => setBilling('monthly')}
        className={`rounded-full px-3 py-1 transition-colors ${billing === 'monthly' ? 'bg-blue-600 text-white' : 'text-blue-200'}`}
      >
        Monthly
      </button>
      <button
        role="tab"
        aria-selected={billing === 'yearly'}
        onClick={() => setBilling('yearly')}
        className={`ml-1 rounded-full px-3 py-1 transition-colors ${billing === 'yearly' ? 'bg-blue-600 text-white' : 'text-blue-200'}`}
      >
        Yearly
      </button>
      <span className="ml-3 text-xs text-blue-300">Save 2 months with yearly</span>
    </div>
  )
}

const trackEvent = (name: string, payload?: any) => {
  // Basic tracking hook (pushes to dataLayer if present)
  try {
    if (typeof (window as any).dataLayer !== 'undefined') {
      ;(window as any).dataLayer.push({ event: name, ...payload })
    } else {
      // Fallback: custom event so external analytics can catch it
      window.dispatchEvent(new CustomEvent('analytics', { detail: { event: name, ...payload } }))
    }
  } catch (e) {
    // ignore
    console.debug('trackEvent disabled', e)
  }
}

const AnimatedPrice = ({ value, format }: { value: number; format: (v:number)=>string }) => {
  const mv = useMotionValue(value)
  const [display, setDisplay] = useState<number>(value)

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.6, ease: 'easeOut' })
    const unsubscribe = mv.on('change', (v) => setDisplay(Math.round(v)))
    return () => {
      controls.stop()
      unsubscribe()
    }
  }, [value, mv])

  return (
    <motion.span aria-live="polite" className="text-4xl font-bold text-white">
      {format(display)}
    </motion.span>
  )
}

const PricingHomepage = () => {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>(() => {
    try {
      const saved = localStorage.getItem('billingPreference')
      return (saved === 'yearly' ? 'yearly' : 'monthly')
    } catch (e) {
      return 'monthly'
    }
  })
  const [expanded, setExpanded] = useState<number | null>(null)
  const [liveMessage, setLiveMessage] = useState('')

  const formatPrice = (val: number) => (val === 0 ? '$0' : `$${val}`)

  useEffect(() => {
    try {
      localStorage.setItem('billingPreference', billing)
    } catch (e) {
      // ignore
    }
    setLiveMessage(billing === 'monthly' ? 'Monthly pricing selected' : 'Yearly pricing selected')
    // Clear message after a short while so screen readers don't repeat
    const t = setTimeout(() => setLiveMessage(''), 1200)
    return () => clearTimeout(t)
  }, [billing])

  return (
    <section
      id="pricing"
      className="relative bg-slate-950 py-20 md:py-28"
    >
      <div className="container px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-blue-200">
            Choose a plan that fits your workflow. Upgrade anytime.
          </p>

          {/* Billing toggle */}
          <div className="mt-6 flex items-center justify-center">
            <BillingToggle billing={billing} setBilling={setBilling} />
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ type: 'spring', stiffness: 280 }}
            >
              <Card
                className={`relative flex h-full flex-col justify-between overflow-hidden border-white/10 bg-slate-900/60 backdrop-blur ${
                  plan.popular
                    ? "ring-2 ring-blue-500 shadow-xl"
                    : ""
                }`}
              >
                {plan.popular && (
                  <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </motion.div>
                )}

                <CardHeader>
                  <CardTitle className="text-xl text-white">
                    {plan.name}
                  </CardTitle>
                  <p className="text-sm text-blue-300">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price */}
                          <div className="flex items-baseline gap-2">
                    <AnimatedPrice value={billing === 'monthly' ? plan.priceMonthly : plan.priceYearly} format={formatPrice} />

                    <span className="text-sm text-blue-300">
                      {billing === 'monthly' ? '/month' : '/year'}
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-blue-200"
                      >
                        <CheckCircle className="h-4 w-4 text-blue-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="flex flex-col gap-2">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full">
                    <Button
                      aria-label={`${plan.name} plan, ${billing === 'monthly' ? formatPrice(plan.priceMonthly) : formatPrice(plan.priceYearly)} ${billing}`}
                      data-analytics="select-plan"
                      data-plan={plan.name}
                      data-billing={billing}
                      onClick={() => {
                        trackEvent('select_plan', { plan: plan.name, billing })
                      }}
                      className={`w-full ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </motion.div>

                  <div className="flex items-center justify-between w-full">
                    <button
                      onClick={() => setExpanded(expanded === index ? null : index)}
                      aria-expanded={expanded === index}
                      aria-controls={`plan-details-${index}`}
                      className="text-sm text-blue-300 hover:text-blue-200"
                    >
                      {expanded === index ? 'Hide details' : 'Compare details'}
                    </button>
                    {plan.priceYearly > plan.priceMonthly && billing === 'yearly' && (
                      <span className="text-xs text-green-300">You save 2 months</span>
                    )}
                  </div>

                  <motion.div
                    id={`plan-details-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={expanded === index ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className={`overflow-hidden w-full`}
                    aria-hidden={expanded !== index}
                  >
                    <div className="mt-3 rounded border border-white/6 bg-slate-900/40 p-3 text-sm text-blue-200">
                      <strong className="block mb-1 text-white">Included:</strong>
                      <ul className="list-inside list-disc space-y-1">
                        {(plan.extras || []).map((ex, i) => (
                          <li key={i}>{ex}</li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default PricingHomepage