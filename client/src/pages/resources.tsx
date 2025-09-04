import { Link } from "wouter";
import { 
  BookOpen, Download, Calendar, Video, FileText, CheckCircle,
  ArrowRight, Clock, Users, Star, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/layout/marketing-layout";

export default function Resources() {
  const guides = [
    {
      title: "Complete Guide to South African VAT Compliance",
      description: "Everything you need to know about VAT registration, calculations, and submissions",
      downloadUrl: "#",
      pages: 45,
      category: "VAT & Tax"
    },
    {
      title: "SARS Electronic Filing Made Simple",
      description: "Step-by-step guide to electronic tax submissions and avoiding penalties",
      downloadUrl: "#",
      pages: 32,
      category: "SARS"
    },
    {
      title: "Small Business Accounting Best Practices",
      description: "Essential accounting practices for South African small businesses",
      downloadUrl: "#",
      pages: 28,
      category: "Accounting"
    },
    {
      title: "CIPC Compliance Checklist 2025",
      description: "Annual requirements and deadlines for company compliance",
      downloadUrl: "#",
      pages: 15,
      category: "Compliance"
    }
  ];

  const webinars = [
    {
      title: "Mastering VAT Returns in Taxnify",
      date: "15 February 2025",
      time: "2:00 PM SAST",
      duration: "45 minutes",
      presenter: "Sarah Johnson, CA(SA)",
      registrationUrl: "#"
    },
    {
      title: "Setting Up Your Chart of Accounts",
      date: "22 February 2025",
      time: "10:00 AM SAST",
      duration: "30 minutes",
      presenter: "Michael Ndlovu, CMA",
      registrationUrl: "#"
    },
    {
      title: "Advanced Financial Reporting",
      date: "1 March 2025",
      time: "3:00 PM SAST",
      duration: "60 minutes",
      presenter: "Lisa Van Der Merwe, CIMA",
      registrationUrl: "#"
    }
  ];

  const articles = [
    {
      title: "5 Common VAT Mistakes and How to Avoid Them",
      excerpt: "Learn about the most frequent VAT errors made by South African businesses and practical steps to prevent them",
      readTime: "8 min read",
      category: "VAT & Tax",
      publishDate: "10 January 2025"
    },
    {
      title: "Understanding the New POPIA Requirements",
      excerpt: "A comprehensive guide to data protection compliance for South African businesses",
      readTime: "12 min read",
      category: "Compliance",
      publishDate: "5 January 2025"
    },
    {
      title: "Cash Flow Management for Small Businesses",
      excerpt: "Strategies to improve cash flow and maintain healthy business finances",
      readTime: "10 min read",
      category: "Financial Management",
      publishDate: "28 December 2024"
    },
    {
      title: "Year-End Accounting Checklist 2024",
      excerpt: "Essential tasks to complete before your financial year-end",
      readTime: "15 min read",
      category: "Accounting",
      publishDate: "20 December 2024"
    }
  ];

  const importantDates = [
    { date: "25 Jan 2025", event: "VAT201 submission deadline (Nov-Dec 2024)", type: "VAT" },
    { date: "7 Feb 2025", event: "PAYE monthly submission", type: "PAYE" },
    { date: "25 Feb 2025", event: "VAT201 submission deadline (Jan 2025)", type: "VAT" },
    { date: "31 Mar 2025", event: "Annual company returns deadline", type: "CIPC" },
    { date: "30 Apr 2025", event: "Income tax returns deadline", type: "SARS" },
    { date: "31 May 2025", event: "Employment Equity reports", type: "Labour" }
  ];

  return (
    <MarketingLayout>
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Resources & Learning Center
              <span className="block text-emerald-200">Stay Informed, Stay Compliant</span>
            </h1>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto mb-8">
              Access comprehensive guides, webinars, articles, and compliance calendars 
              to help you master South African business regulations and accounting best practices.
            </p>
          </div>
        </div>
      </header>

      {/* Quick Navigation */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="#guides" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
              <BookOpen className="text-emerald-600 mx-auto mb-2" size={24} />
              <span className="text-sm font-medium text-gray-900">Download Guides</span>
            </a>
            <a href="#webinars" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
              <Video className="text-emerald-600 mx-auto mb-2" size={24} />
              <span className="text-sm font-medium text-gray-900">Live Webinars</span>
            </a>
            <a href="#articles" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
              <FileText className="text-emerald-600 mx-auto mb-2" size={24} />
              <span className="text-sm font-medium text-gray-900">Latest Articles</span>
            </a>
            <a href="#calendar" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center">
              <Calendar className="text-emerald-600 mx-auto mb-2" size={24} />
              <span className="text-sm font-medium text-gray-900">Compliance Calendar</span>
            </a>
          </div>
        </div>
      </section>

      {/* Downloadable Guides */}
      <section id="guides" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Free Downloadable Guides</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive guides covering all aspects of South African business compliance and accounting
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {guides.map((guide, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full mb-3">
                      {guide.category}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{guide.title}</h3>
                    <p className="text-gray-600 mb-4">{guide.description}</p>
                    <div className="text-sm text-gray-500 mb-4">{guide.pages} pages • PDF format</div>
                  </div>
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Download className="mr-2" size={16} />
                  Download Free Guide
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Webinars */}
      <section id="webinars" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Webinars</h2>
            <p className="text-xl text-gray-600">Join our expert-led sessions to master Taxnify and stay compliant</p>
          </div>

          <div className="space-y-6">
            {webinars.map((webinar, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  <div className="lg:col-span-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{webinar.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="text-emerald-600" size={16} />
                        <span>{webinar.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="text-emerald-600" size={16} />
                        <span>{webinar.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Video className="text-emerald-600" size={16} />
                        <span>{webinar.duration}</span>
                      </div>
                    </div>
                    <p className="text-gray-600">Presented by {webinar.presenter}</p>
                  </div>
                  <div className="text-center lg:text-right">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Register Free
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section id="articles" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Articles & Insights</h2>
            <p className="text-xl text-gray-600">Stay updated with the latest in South African business and accounting</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map((article, index) => (
              <article key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-3">
                    {article.category}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{article.readTime}</span>
                    <span>{article.publishDate}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                  Read Article
                  <ExternalLink className="ml-2" size={16} />
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Calendar */}
      <section id="calendar" className="py-20 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">2025 Compliance Calendar</h2>
            <p className="text-xl text-gray-600">Never miss an important deadline with our comprehensive calendar</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="space-y-4">
              {importantDates.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Calendar className="text-emerald-600" size={24} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{item.event}</div>
                      <div className="text-sm text-gray-600">{item.type} Compliance</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600">{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Download className="mr-2" size={16} />
                Download Full Calendar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Need More Help?</h2>
            <p className="text-xl text-gray-600">Our support team is here to help you succeed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-blue-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Support</h3>
              <p className="text-gray-600 mb-4">Get help from our qualified accounting and compliance experts</p>
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Contact Support
              </Button>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-emerald-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Knowledge Base</h3>
              <p className="text-gray-600 mb-4">Searchable database of help articles and tutorials</p>
              <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                Browse Articles
              </Button>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="text-purple-600" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Tutorials</h3>
              <p className="text-gray-600 mb-4">Step-by-step video guides for all major features</p>
              <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
                Watch Videos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-emerald-100 mb-8">
            Access all these resources and more when you start your free Taxnify trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
              Start Free Trial
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}