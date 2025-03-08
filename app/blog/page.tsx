import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, ArrowRight, Tag } from "lucide-react"
import Link from "next/link"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  date: string
  readTime: string
  category: string
  slug: string
  featured?: boolean
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Future of Privacy in Visual Data",
    excerpt: "As visual data becomes increasingly prevalent in our digital world, protecting sensitive information has never been more crucial...",
    date: "2024-03-20",
    readTime: "5 min read",
    category: "Privacy",
    slug: "future-of-privacy-visual-data",
    featured: true
  },
  {
    id: "2",
    title: "Understanding License Plate Privacy Laws",
    excerpt: "A comprehensive guide to international regulations and best practices for handling license plate data in visual content...",
    date: "2024-03-18",
    readTime: "8 min read",
    category: "Legal",
    slug: "license-plate-privacy-laws",
    featured: true
  },
  {
    id: "3",
    title: "AI in Privacy Protection: A Deep Dive",
    excerpt: "Exploring how artificial intelligence is revolutionizing the way we protect sensitive information in images and videos...",
    date: "2024-03-15",
    readTime: "6 min read",
    category: "Technology",
    slug: "ai-privacy-protection-deep-dive"
  },
  {
    id: "4",
    title: "Best Practices for Image Privacy",
    excerpt: "Essential guidelines for maintaining privacy when working with images containing sensitive information...",
    date: "2024-03-12",
    readTime: "4 min read",
    category: "Guidelines",
    slug: "best-practices-image-privacy"
  },
  {
    id: "5",
    title: "The Rise of Privacy-First Solutions",
    excerpt: "How growing privacy concerns are shaping the development of new technologies and solutions...",
    date: "2024-03-10",
    readTime: "7 min read",
    category: "Industry",
    slug: "rise-of-privacy-first-solutions"
  }
]

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured)
  const recentPosts = blogPosts.filter(post => !post.featured)

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">
            MaskingTech Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Insights and updates on privacy technology, industry trends, and best practices
          </p>
        </div>

        {/* Featured Posts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Featured Articles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredPosts.map(post => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="aspect-[16/9] relative bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950" />
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span>{post.category}</span>
                    <span>•</span>
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  <p className="text-muted-foreground">{post.excerpt}</p>
                  <div className="pt-2">
                    <Button variant="link" className="px-0" asChild>
                      <Link href={`/blog/${post.slug}`} className="flex items-center gap-2">
                        Read More <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Recent Articles</h2>
          <div className="grid gap-6">
            {recentPosts.map(post => (
              <Card key={post.id} className="hover:shadow-lg transition-all duration-300">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatDate(post.date)}</span>
                    <span>•</span>
                    <Tag className="h-4 w-4" />
                    <span>{post.category}</span>
                    <span>•</span>
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  <p className="text-muted-foreground">{post.excerpt}</p>
                  <div className="pt-2">
                    <Button variant="link" className="px-0" asChild>
                      <Link href={`/blog/${post.slug}`} className="flex items-center gap-2">
                        Read More <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 