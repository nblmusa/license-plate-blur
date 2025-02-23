"use client"

import { Shield, Lock, Zap, Users, Globe, Award } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function AboutPage() {
  const features = [
    {
      icon: <Shield className="h-8 w-8 text-blue-500" />,
      title: "Privacy First",
      description: "We prioritize your data privacy with state-of-the-art security measures and transparent practices."
    },
    {
      icon: <Lock className="h-8 w-8 text-blue-500" />,
      title: "Secure Processing",
      description: "Advanced encryption and secure processing pipelines ensure your images are protected."
    },
    {
      icon: <Zap className="h-8 w-8 text-blue-500" />,
      title: "Lightning Fast",
      description: "Optimized algorithms and cloud infrastructure deliver rapid license plate masking."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Built for Teams",
      description: "Collaborative features and team management tools for organizations of all sizes."
    },
    {
      icon: <Globe className="h-8 w-8 text-blue-500" />,
      title: "Global Coverage",
      description: "Support for license plates from multiple countries and regions worldwide."
    },
    {
      icon: <Award className="h-8 w-8 text-blue-500" />,
      title: "Industry Leading",
      description: "Setting the standard for automated license plate privacy protection."
    }
  ]

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-founder",
      image: "/team/sarah.jpg",
      bio: "Former privacy tech executive with 15 years of experience in computer vision."
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-founder",
      image: "/team/marcus.jpg",
      bio: "Machine learning expert specializing in computer vision and privacy-preserving AI."
    },
    {
      name: "Dr. Emily Watson",
      role: "Head of Research",
      image: "/team/emily.jpg",
      bio: "PhD in Computer Science, leading our R&D in advanced privacy technologies."
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">
            Protecting Privacy in Visual Data
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            MaskingTech is on a mission to make privacy protection accessible and efficient for everyone. 
            Our advanced AI technology ensures sensitive information in images remains secure while maintaining usability.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="space-y-4">
                <div className="p-2 w-fit rounded-lg bg-blue-50 dark:bg-blue-950">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-3xl font-bold">Our Mission</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We believe in a future where privacy and technology work hand in hand. 
            Our goal is to empower businesses and individuals with tools that protect sensitive information 
            while enabling the benefits of visual data analysis and sharing.
          </p>
        </div>

        {/* Team Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="aspect-[4/3] relative bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Users className="h-20 w-20 text-blue-500/20" />
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{member.role}</p>
                  <p className="text-muted-foreground">{member.bio}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-3xl font-bold">Get in Touch</h2>
          <p className="text-lg text-muted-foreground">
            Have questions about our technology or services? We&apos;d love to hear from you.
          </p>
          <p className="text-blue-600 dark:text-blue-400">
            support@maskingtech.com
          </p>
        </div>
      </div>
    </div>
  )
} 