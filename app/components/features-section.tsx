import { Card, CardContent } from "../components/ui/card"
import { BookOpen, Users, Award, Heart, Clock, Star } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: BookOpen,
      title: "Comprehensive Curriculum",
      description: "Structured learning path covering Quran recitation, Tajweed, Arabic language, and Islamic studies.",
    },
    {
      icon: Users,
      title: "Expert Teachers",
      description: "Qualified Islamic scholars with years of experience in teaching children the Holy Quran.",
    },
    {
      icon: Award,
      title: "Age-Appropriate Classes",
      description: "Classes designed specifically for different age groups from 5 to 14 years old.",
    },
    {
      icon: Heart,
      title: "Nurturing Environment",
      description: "Safe, supportive, and encouraging atmosphere that fosters love for Islamic learning.",
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Multiple time slots available throughout the day to accommodate different schedules.",
    },
    {
      icon: Star,
      title: "Individual Attention",
      description: "Small class sizes ensure each student receives personalized guidance and support.",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose Our Quran School?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide a comprehensive Islamic education that combines traditional teaching methods with modern
            pedagogical approaches to ensure effective learning.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8 text-center">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}