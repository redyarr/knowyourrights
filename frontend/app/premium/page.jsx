"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Crown,
  Check,
  X,
  Star,
  Zap,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

export default function PremiumPage() {
  const [billingPeriod, setBillingPeriod] = useState("monthly") // monthly or annual
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  })
  const [submittingPayment, setSubmittingPayment] = useState(false)

  // Accordion state
  const [openFaq, setOpenFaq] = useState(null)

  const handleOpenCheckout = (plan) => {
    setSelectedPlan(plan)
    setIsCheckoutOpen(true)
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.name) {
      toast.error("Please fill in all credit card details")
      return
    }

    setSubmittingPayment(true)
    setTimeout(() => {
      toast.success(`Welcome to Premium! You have successfully upgraded to ${selectedPlan.name}.`)
      setIsCheckoutOpen(false)
      setSelectedPlan(null)
      setCardDetails({ number: "", expiry: "", cvc: "", name: "" })
      setSubmittingPayment(false)
    }, 1800)
  }

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  const plans = [
    {
      id: "member",
      name: "Member Pro",
      tagline: "For individuals seeking premier counsel",
      price: billingPeriod === "monthly" ? 19 : 15,
      features: [
        "Priority case posting (top of lawyers' lists)",
        "Verified Client badge next to your queries",
        "Direct connection to top 5% verified advocates",
        "Access to basic legal contract generator",
        "Ad-free interface navigation",
      ],
      icon: Star,
      color: "from-blue-600 to-indigo-600 text-white",
      buttonText: "Upgrade Member Pro",
    },
    {
      id: "lawyer",
      name: "Lawyer Elite",
      tagline: "For attorneys wanting high client visibility",
      price: billingPeriod === "monthly" ? 49 : 39,
      features: [
        "Gold Verified Advocate badge on search",
        "Unlimited network connection requests",
        "First-choice candidate listing on posted cases",
        "Detailed profile views analytics",
        "Priority 24/7 legal support helpline",
        "Write unlimited legal resource articles",
      ],
      icon: Crown,
      color: "from-amber-500 to-orange-600 text-white",
      buttonText: "Join Lawyer Elite",
      popular: true,
    },
  ]

  const comparisons = [
    { feature: "Verified Profile Badge", free: false, pro: true, elite: true },
    { feature: "Case Postings Limit", free: "3 Cases", pro: "Unlimited", elite: "N/A" },
    { feature: "Direct Attorney Messaging", free: "Limited", pro: "Unlimited", elite: "Unlimited" },
    { feature: "Search Rank Priority", free: "Standard", pro: "High", elite: "Featured" },
    { feature: "Network Connection Limit", free: "5 / Month", pro: "N/A", elite: "Unlimited" },
    { feature: "Profile Views Analytics", free: false, pro: false, elite: true },
    { feature: "Priority Support Helpline", free: false, pro: true, elite: true },
  ]

  const testimonials = [
    {
      quote: "Upgrading to Lawyer Elite expanded my family law clientele tenfold. The verified badge builds immediate trust.",
      author: "Sarah Jenkins, Esq.",
      role: "Family Law Attorney",
      rating: 5,
    },
    {
      quote: "Being able to post my civil suit priority-style matched me with an amazing advocate in less than 3 hours.",
      author: "Marcus Vance",
      role: "Small Business Owner",
      rating: 5,
    },
  ]

  const faqs = [
    {
      q: "Can I cancel my subscription at any time?",
      a: "Yes, you can cancel your subscription at any time from your account settings. You will retain access to your premium benefits until the end of your billing cycle.",
    },
    {
      q: "How does the annual billing discount work?",
      a: "By selecting annual billing, you pay for the full year upfront and save 20% compared to paying the monthly subscription fee every month.",
    },
    {
      q: "Is my payment information secure?",
      a: "Yes, all transactions are processed through industry-standard secure payment channels and SSL encryption. We never store raw credit card details.",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-20%] w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-50%] right-[-20%] w-[600px] h-[600px] rounded-full bg-amber-950/10 blur-[120px] pointer-events-none"></div>

        <div className="max-w-3xl mx-auto relative z-10">
          <Badge className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold mb-4 px-3 py-1">
            <Crown className="h-3.5 w-3.5 mr-1" /> LEGALNET PREMIUM
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Unlock LegalNet Elite Benefits</h1>
          <p className="text-slate-300 mt-3 text-lg max-w-xl mx-auto">
            Scale your legal network, get verified credential tags, and connect directly with high-profile clients.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center gap-2 bg-slate-800 p-1 rounded-full border border-slate-700 mt-8">
            <Button
              variant={billingPeriod === "monthly" ? "default" : "ghost"}
              className={`rounded-full h-8 text-xs font-semibold ${
                billingPeriod === "monthly" ? "bg-white text-slate-950" : "text-slate-300 hover:text-white"
              }`}
              onClick={() => setBillingPeriod("monthly")}
            >
              Monthly Billing
            </Button>
            <Button
              variant={billingPeriod === "annual" ? "default" : "ghost"}
              className={`rounded-full h-8 text-xs font-semibold ${
                billingPeriod === "annual" ? "bg-white text-slate-950" : "text-slate-300 hover:text-white"
              }`}
              onClick={() => setBillingPeriod("annual")}
            >
              Annual Billing
              <span className="ml-1 text-[9px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                Save 20%
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-4 mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {plans.map((plan) => {
          const IconComponent = plan.icon
          return (
            <Card
              key={plan.id}
              className={`border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative bg-white dark:bg-slate-900 transition duration-200 hover:-translate-y-1 ${
                plan.popular ? "ring-2 ring-amber-500 dark:ring-amber-500" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Popular Upgrade
                </div>
              )}

              <CardHeader className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${plan.color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <CardDescription>{plan.tagline}</CardDescription>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold tracking-tight">${plan.price}</span>
                  <span className="ml-1 text-slate-500 text-sm">/month</span>
                </div>
                {billingPeriod === "annual" && (
                  <span className="text-[10px] text-emerald-500 font-bold block mt-1">Billed annually (${plan.price * 12}/year)</span>
                )}
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4">
                <Separator />
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Included benefits</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button
                  className={`w-full font-bold shadow-md ${
                    plan.popular
                      ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  onClick={() => handleOpenCheckout(plan)}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="max-w-4xl mx-auto px-4 mt-20">
        <h2 className="text-2xl font-bold text-center mb-8">Compare Plan Features</h2>
        <Card className="border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4 font-bold text-slate-800 dark:text-slate-200">Features</th>
                  <th className="p-4 font-bold text-slate-800 dark:text-slate-200">Free</th>
                  <th className="p-4 font-bold text-slate-800 dark:text-slate-200">Member Pro</th>
                  <th className="p-4 font-bold text-slate-800 dark:text-slate-200">Lawyer Elite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {comparisons.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="p-4 text-slate-500">
                      {typeof row.free === "boolean" ? (
                        row.free ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-slate-300" />
                      ) : (
                        row.free
                      )}
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-slate-300" />
                      ) : (
                        row.pro
                      )}
                    </td>
                    <td className="p-4 text-blue-600 dark:text-blue-400 font-bold">
                      {typeof row.elite === "boolean" ? (
                        row.elite ? <Check className="h-4 w-4 text-emerald-500" /> : <X className="h-4 w-4 text-slate-300" />
                      ) : (
                        row.elite
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Testimonials */}
      <div className="max-w-4xl mx-auto px-4 mt-20">
        <h2 className="text-2xl font-bold text-center mb-8">What Members Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((test, idx) => (
            <Card key={idx} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow p-6">
              <div className="flex gap-1.5 mb-4">
                {[...Array(test.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs italic leading-relaxed text-slate-600 dark:text-slate-400 mb-4">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white text-[10px] font-bold">
                    {test.author[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h5 className="text-xs font-bold">{test.author}</h5>
                  <span className="text-[10px] text-slate-400">{test.role}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Accordion FAQs */}
      <div className="max-w-3xl mx-auto px-4 mt-20">
        <h2 className="text-2xl font-bold text-center mb-8">Premium FAQs</h2>
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow divide-y divide-slate-100 dark:divide-slate-800">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div key={idx} className="p-4">
                <button
                  className="w-full flex items-center justify-between font-bold text-sm text-left hover:text-blue-600 transition"
                  onClick={() => toggleFaq(idx)}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {isOpen && (
                  <p className="text-xs text-slate-500 leading-relaxed mt-2.5 bg-slate-50 dark:bg-slate-950/45 p-3 rounded-lg border">
                    {faq.a}
                  </p>
                )}
              </div>
            )
          })}
        </Card>
      </div>

      {/* Checkout Dialog */}
      {selectedPlan && (
        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <form onSubmit={handlePaymentSubmit}>
              <DialogHeader className="mb-4">
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Secure Upgrade Checkout
                </DialogTitle>
                <DialogDescription>
                  You are upgrading to <strong>{selectedPlan.name}</strong> on the <strong>{billingPeriod}</strong> billing cycle at <strong>${selectedPlan.price}/month</strong>.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="e.g. Jane Doe"
                    required
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    maxLength={16}
                    required
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cardExpiry">Expiration Date</Label>
                    <Input
                      id="cardExpiry"
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cardCvc">CVC Code</Label>
                    <Input
                      id="cardCvc"
                      placeholder="123"
                      maxLength={3}
                      type="password"
                      required
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsCheckoutOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={submittingPayment}>
                  {submittingPayment ? "Processing Payment..." : `Authorize Payment`}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
