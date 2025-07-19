import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";

interface ResourcesSectionProps {
  user: User;
}

const resourceCategories = [
  {
    name: "Engineering",
    color: "bg-blue-500",
    resources: [
      {
        title: "Complete Guide to JEE Preparation",
        description: "Comprehensive strategies for cracking JEE Main and Advanced",
        duration: "15 min read",
        type: "Article",
        link: "#"
      },
      {
        title: "Top Engineering Colleges in India",
        description: "Detailed information about IITs, NITs, and other premier institutions",
        duration: "10 min read",
        type: "Guide",
        link: "#"
      }
    ]
  },
  {
    name: "Creative Arts",
    color: "bg-purple-500",
    resources: [
      {
        title: "Building a Strong Portfolio",
        description: "How to create an impressive portfolio for design and arts courses",
        duration: "12 min read",
        type: "Article",
        link: "#"
      },
      {
        title: "Career Opportunities in Digital Arts",
        description: "Exploring the growing field of digital design and animation",
        duration: "8 min read",
        type: "Article",
        link: "#"
      }
    ]
  },
  {
    name: "Skill Building",
    color: "bg-green-500",
    resources: [
      {
        title: "Python Programming for Beginners",
        description: "Start your coding journey with this comprehensive Python course",
        duration: "2 hours",
        type: "Course",
        link: "#"
      },
      {
        title: "Communication Skills Masterclass",
        description: "Improve your presentation and interpersonal skills",
        duration: "1 hour",
        type: "Video",
        link: "#"
      }
    ]
  },
  {
    name: "Exam Prep",
    color: "bg-orange-500",
    resources: [
      {
        title: "NEET Strategy Guide 2024",
        description: "Latest preparation strategies and tips for NEET aspirants",
        duration: "20 min read",
        type: "Guide",
        link: "#"
      },
      {
        title: "Time Management for Competitive Exams",
        description: "Effective techniques to manage time during exam preparation",
        duration: "7 min read",
        type: "Article",
        link: "#"
      }
    ]
  }
];

const featuredArticles = [
  {
    title: "Top 5 Emerging Careers for the Next Decade",
    description: "Discover the most promising career paths that will dominate the future job market.",
    readTime: "12 min read",
    featured: true
  },
  {
    title: "How to Choose the Right Stream After 10th Grade",
    description: "A comprehensive guide to making the most important academic decision of your life.",
    readTime: "15 min read",
    featured: true
  },
  {
    title: "Understanding the JEE vs. NEET Dilemma",
    description: "Compare these two major entrance exams and decide which path suits you best.",
    readTime: "10 min read",
    featured: true
  },
  {
    title: "Building a Strong College Application Portfolio",
    description: "Tips and strategies to create an outstanding application that stands out.",
    readTime: "18 min read",
    featured: true
  }
];

export const ResourcesSection = ({ user }: ResourcesSectionProps) => {
  const [savedResources, setSavedResources] = useState<string[]>([]);

  const toggleSave = (resourceTitle: string) => {
    setSavedResources(prev => 
      prev.includes(resourceTitle) 
        ? prev.filter(title => title !== resourceTitle)
        : [...prev, resourceTitle]
    );
  };

  const isSaved = (resourceTitle: string) => savedResources.includes(resourceTitle);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Recommended Resources</h2>
        <p className="text-muted-foreground">
          Curated content to support your career journey and skill development
        </p>
      </div>

      {/* Featured Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Featured Articles
          </CardTitle>
          <CardDescription>
            Must-read articles curated by our career experts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredArticles.map((article, index) => (
              <Card key={index} className="border-2 hover:border-primary/20 transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm line-clamp-2">{article.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">{article.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs text-muted-foreground">{article.readTime}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleSave(article.title)}
                        className="h-6 w-6 p-0"
                      >
                        {isSaved(article.title) ? (
                          <BookmarkCheck className="h-3 w-3" />
                        ) : (
                          <Bookmark className="h-3 w-3" />
                        )}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categorized Resources */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Resources by Category</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {resourceCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className={`w-3 h-3 rounded-full ${category.color}`} />
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.resources.map((resource, resourceIndex) => (
                  <div key={resourceIndex} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm line-clamp-1">{resource.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {resource.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {resource.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs text-muted-foreground">{resource.duration}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleSave(resource.title)}
                          className="h-6 w-6 p-0"
                        >
                          {isSaved(resource.title) ? (
                            <BookmarkCheck className="h-3 w-3" />
                          ) : (
                            <Bookmark className="h-3 w-3" />
                          )}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" className="justify-start">
              FAQs
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              Scholarship Alerts
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              Important Exam Dates
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              Career Videos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <h3 className="font-medium mb-2">Coming Soon</h3>
            <p className="text-sm">Stay tuned for our upcoming webinars and virtual career fairs!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};