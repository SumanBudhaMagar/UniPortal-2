import React from 'react'
import { GraduationCap, Users, BookOpen, Calendar, FileText, Award } from 'lucide-react';

const FeaturesComponent = () => {
    const features = [
        {
          icon: <Users className="w-8 h-8" />,
          title: "Student Management",
          description:
            "Comprehensive student records, enrollment tracking, and academic progress monitoring in one place.",
        },
        {
          icon: <BookOpen className="w-8 h-8" />,
          title: "Course Administration",
          description:
            "Efficient course scheduling, curriculum management, and assignment tracking for all programs.",
        },
        {
          icon: <Calendar className="w-8 h-8" />,
          title: "Attendance System",
          description:
            "Digital attendance tracking with real-time notifications and automated reporting.",
        },
        {
          icon: <FileText className="w-8 h-8" />,
          title: "Grade Management",
          description:
            "Streamlined grading system with grade publishing, transcript generation, and analytics.",
        },
        {
          icon: <Award className="w-8 h-8" />,
          title: "Certification",
          description:
            "Digital certificates, degree verification, and credential management system.",
        },
        {
          icon: <GraduationCap className="w-8 h-8" />,
          title: "Alumni Portal",
          description:
            "Connect with graduates, track career progress, and maintain lifelong engagement.",
        },
      ];
  return (
    <>
    <section
        id="features"
        className="py-20 bg-linear-to-br from-slate-50 to-slate-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to manage your institution efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default FeaturesComponent
