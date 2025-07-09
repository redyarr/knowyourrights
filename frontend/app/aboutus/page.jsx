"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import CountUp from 'react-countup'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Users, Scale, Gavel, Globe, 
  ArrowRight, Check, 
  ShieldCheck, Heart, Award,
  UserCheck, BookOpen, MessageCircle
} from 'lucide-react'

const AboutUs = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLawyers: 0, 
    totalConnections: 0,
    legalConsultations: 0,
    dailyActiveUsers: 0,
    successfulCases: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/aboutus-stats', {
          method: 'GET',
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set fallback stats for demo
        setStats({
          totalUsers: 2547,
          totalLawyers: 342,
          totalConnections: 1829,
          legalConsultations: 1156,
          dailyActiveUsers: 423,
          successfulCases: 892
        });
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Mission Section */}
      <MissionSection />
      
      {/* Stats Section */}
      <StatsSection stats={stats} />
      
      {/* Services Section */}
      <ServicesSection />

      {/* For Lawyers Section */}
      <LawyersSection />
      
      {/* Team Section */}
      <TeamSection />
      
      {/* Contact CTA Section */}
      <ContactCTASection />
    </div>
  )
}

const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50 to-background dark:from-blue-950/20 dark:to-background pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 lg:pt-32 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center space-y-4 text-center lg:text-left"
          >
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter leading-tight">
                Empowering Justice Through <span className="text-blue-600 dark:text-blue-400">Legal Innovation</span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground dark:text-muted-foreground text-base sm:text-lg md:text-xl mx-auto lg:mx-0">
                Connecting individuals with verified legal professionals, providing accessible legal guidance, and building a community where justice is within everyone's reach.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button className="px-4 sm:px-6 text-sm sm:text-base" size="lg" asChild>
                <Link href="/">
                  Explore Legal Network <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-sm sm:text-base" asChild>
                <Link href="#for-lawyers">
                  Join as a Lawyer
                </Link>
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto lg:mx-0 relative aspect-video w-full max-w-[600px] overflow-hidden rounded-xl shadow-2xl"
          >
            <Image 
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Legal professionals collaborating" 
              width={600}
              height={400}
              quality={100}
              className="object-cover w-full h-full"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const MissionSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <section ref={ref} className="py-8 sm:py-12 md:py-16 lg:py-20 bg-background dark:bg-background w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">Our Mission: Making Legal Help Accessible</h2>
          <p className="max-w-[900px] text-muted-foreground dark:text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed">
            We believe that everyone deserves access to quality legal guidance. Our platform bridges the gap between individuals seeking legal help and verified legal professionals, creating a trusted community where legal expertise meets real-world needs.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
          {[{
            icon: ShieldCheck,
            title: "Verified Legal Professionals",
            description: "Every lawyer on our platform is thoroughly verified and certified, ensuring you receive advice from qualified legal experts you can trust."
          },
          {
            icon: Heart,
            title: "Community-Driven Support",
            description: "Building a supportive legal community where knowledge is shared, connections are made, and justice becomes more accessible to everyone."
          },
          {
            icon: Scale,
            title: "Equal Access to Justice",
            description: "Breaking down barriers to legal services by providing affordable, accessible, and transparent legal guidance for individuals and businesses."
          }].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
              className="w-full"
            >
              <Card className="h-full border-l-4 border-l-blue-500 dark:border-l-blue-400 bg-card dark:bg-card hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-4 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-foreground dark:text-foreground">{item.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground dark:text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const StatsSection = ({ stats }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const statsItems = [
    { 
      icon: Users, 
      label: "Active Users", 
      value: stats.totalUsers,
      suffix: "+",
      color: "text-blue-500 dark:text-blue-400" 
    },
    { 
      icon: UserCheck, 
      label: "Verified Lawyers",
      value: stats.totalLawyers,
      suffix: "+",
      color: "text-emerald-500 dark:text-emerald-400" 
    },
    { 
      icon: MessageCircle, 
      label: "Legal Consultations",
      value: stats.legalConsultations,
      suffix: "+",
      color: "text-amber-500 dark:text-amber-400" 
    },
    { 
      icon: Award, 
      label: "Successful Cases",
      value: stats.successfulCases,
      suffix: "+",
      decimals: 0,
      color: "text-green-500 dark:text-green-400" 
    },
  ]

  return (
    <section ref={ref} className="py-8 sm:py-12 md:py-16 lg:py-20 bg-muted/50 dark:bg-muted/20 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">Impact by Numbers</h2>
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground dark:text-muted-foreground">Building trust through transparency and proven results</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
          {statsItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
            >
              <Card className="h-full border shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card dark:bg-card">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-center mb-3 sm:mb-4">
                    <div className={`rounded-full p-2 sm:p-3 ${item.color.replace('text', 'bg')}/10 dark:${item.color.replace('text', 'bg')}/20`}>
                      <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${item.color}`} />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-foreground dark:text-foreground">
                    {inView && (
                      <>
                        <CountUp
                          start={0}
                          end={item.value || 0}
                          duration={2.5}
                          separator=","
                          decimals={item.decimals || 0}
                          decimal="."
                          useEasing={true}
                        />
                        {item.suffix}
                      </>
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground dark:text-muted-foreground text-center mt-2">{item.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional stats row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {inView && (
                        <>
                          <CountUp
                            start={0}
                            end={stats.dailyActiveUsers || 0}
                            duration={2.5}
                            separator=","
                          />
                        </>
                      )}
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium">Daily Active Users</p>
                  </div>
                  <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                      {inView && (
                        <>
                          <CountUp
                            start={0}
                            end={stats.totalConnections || 0}
                            duration={2.5}
                            separator=","
                          />
                          +
                        </>
                      )}
                    </h3>
                    <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium">Professional Connections Made</p>
                  </div>
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const ServicesSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <section ref={ref} className="py-8 sm:py-12 md:py-16 lg:py-20 bg-background dark:bg-background w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">How It Works</h2>
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground dark:text-muted-foreground">Get legal help in three simple steps</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
          {[{
            step: "01",
            title: "Find Legal Experts",
            description: "Browse through our network of verified lawyers specializing in various legal areas. Use filters to find professionals that match your specific needs and location."
          },
          {
            step: "02",
            title: "Connect & Consult",
            description: "Send connection requests to lawyers you'd like to work with. Schedule consultations, ask questions, and get professional legal advice through our secure platform."
          },
          {
            step: "03",
            title: "Get Legal Solutions",
            description: "Receive personalized legal guidance, document reviews, case strategies, and ongoing support from qualified professionals who understand your situation."
          }].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
              className="relative w-full"
            >
              <div className="border-t-4 border-blue-500 dark:border-blue-400 pt-8 sm:pt-10 px-4 sm:px-6 bg-white dark:bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="absolute top-0 -translate-y-1/2 left-4 sm:left-6 bg-blue-500 dark:bg-blue-600 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold text-base sm:text-lg">
                  {item.step}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-foreground">{item.title}</h3>
                <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed text-sm sm:text-base">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center mt-8 sm:mt-12"
        >
          <Button size="lg" className="text-sm sm:text-base" asChild>
            <Link href="/">
              Start Your Legal Journey <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

const LawyersSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <section id="for-lawyers" ref={ref} className="py-8 sm:py-12 md:py-16 lg:py-20 bg-muted/50 dark:bg-muted/20 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="mx-auto lg:mx-0 order-2 lg:order-1 relative aspect-video w-full max-w-[600px] overflow-hidden rounded-xl shadow-2xl"
          >
            <Image 
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Legal professionals at work" 
              width={600}
              height={400}
              quality={100}
              className="object-cover w-full h-full"
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center space-y-4 order-1 lg:order-2 text-center lg:text-left"
          >
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">For Legal Professionals</h2>
              <p className="max-w-[600px] text-muted-foreground dark:text-muted-foreground text-base sm:text-lg md:text-xl mx-auto lg:mx-0">
                Join our network of verified lawyers and expand your practice while helping those who need legal guidance most.
              </p>
            </div>
            
            <ul className="space-y-3 max-w-[600px] mx-auto lg:mx-0">
              {[
                "Expand your client base through our verified network",
                "Share legal insights and build your professional reputation",
                "Connect with other legal professionals and collaborate",
                "Flexible consultation options - in-person or virtual",
                "Secure payment processing and client management tools"
              ].map((benefit, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
                  className="flex items-center gap-3 text-left"
                >
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-foreground text-sm sm:text-base">{benefit}</span>
                </motion.li>
              ))}
            </ul>
            
            <div className="pt-4 flex justify-center lg:justify-start">
              <Button size="lg" className="text-sm sm:text-base" asChild>
                <Link href="/register">
                  Join Our Network <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const TeamSection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  const team = [
    {
      name: "Sarah Chen",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b04b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Former corporate lawyer with 15 years of experience in legal technology."
    },
    {
      name: "Michael Rodriguez",
      role: "Chief Technology Officer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Software engineer specializing in secure, scalable legal platforms."
    },
    {
      name: "Dr. Emily Watson",
      role: "Head of Legal Affairs",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Constitutional law expert ensuring platform compliance and user protection."
    },
    {
      name: "James Thompson",
      role: "Community Manager",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      description: "Building bridges between legal professionals and those seeking help."
    }
  ]

  return (
    <section ref={ref} className="py-8 sm:py-12 md:py-16 lg:py-20 bg-background dark:bg-background w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">Meet Our Team</h2>
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground dark:text-muted-foreground">Passionate professionals dedicated to making legal help accessible</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 bg-card dark:bg-card">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="mb-4 overflow-hidden rounded-full aspect-square mx-auto relative w-20 h-20 sm:w-24 sm:h-24">
                    <Image 
                      src={member.image} 
                      alt={member.name} 
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold mb-1 text-foreground dark:text-foreground">{member.name}</h3>
                  <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">{member.role}</p>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground leading-relaxed">{member.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const ContactCTASection = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <section ref={ref} className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 text-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center space-y-6 text-center"
        >
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">Ready to Get Started?</h2>
            <p className="max-w-[900px] text-blue-100 dark:text-blue-100 text-base sm:text-lg md:text-xl leading-relaxed mx-auto">
              Join thousands of users who have found the legal help they need. Whether you're seeking legal advice or looking to expand your legal practice, we're here to help.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="secondary" className="text-sm sm:text-base" asChild>
              <Link href="/">
                Find Legal Help Now
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-600 dark:hover:text-blue-700 text-sm sm:text-base" asChild>
              <Link href="/contact">
                Contact Our Team
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 w-full max-w-4xl">
            {[{
              icon: BookOpen,
              title: "Comprehensive Legal Resources",
              description: "Access guides, articles, and resources covering various areas of law"
            },
            {
              icon: ShieldCheck,
              title: "Verified Professional Network",
              description: "Connect with thoroughly vetted and certified legal professionals"
            },
            {
              icon: MessageCircle,
              title: "24/7 Support Community",
              description: "Get support from our community and customer service team"
            }].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 + (index * 0.1) }}
                className="text-center"
              >
                <div className="mb-4 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/20 dark:bg-white/20 text-white mx-auto">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-blue-100 dark:text-blue-100 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutUs