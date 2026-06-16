"use client"

import Link from 'next/link'
import { Scale, Heart } from 'lucide-react'
import { Separator } from './ui/separator'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: "Platform",
      links: [
        { label: "About Us", href: "/aboutus" },
        { label: "Help Center", href: "/help" },
        { label: "Jobs & Cases", href: "/jobs" },
        { label: "Premium", href: "/premium" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", href: "/aboutus#terms" },
        { label: "Privacy Policy", href: "/aboutus#privacy" },
        { label: "Cookie Policy", href: "/aboutus#cookies" },
        { label: "Disclaimer", href: "/aboutus#disclaimer" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "My Network", href: "/mynetwork" },
        { label: "Groups", href: "/groups" },
        { label: "Resources", href: "/aboutus" },
        { label: "Feedback", href: "/help" },
      ],
    },
  ]

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800/80 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-8 sm:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Scale className="h-4 w-4 text-white" />
                </div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                  LegalNet
                </span>
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px]">
                Connecting people with verified legal professionals. Justice made accessible.
              </p>
            </div>

            {/* Link columns */}
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-200/80 dark:bg-slate-800/80" />

        {/* Bottom bar */}
        <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            © {currentYear} KnowYourRights / LegalNet. All rights reserved.
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <span className="font-semibold">Disclaimer:</span> This platform does not constitute legal advice.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
