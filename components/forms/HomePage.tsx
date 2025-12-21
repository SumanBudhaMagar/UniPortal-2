"use client";
import React, { useState } from "react";

import { useRouter } from "next/navigation";


import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Award,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [selectedDepartment, setSelectedDepartment] = useState(null);

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

  const departments = [
    { 
      name: "Engineering", 
      color: "bg-blue-600 hover:bg-blue-700",
      dean: "Dr. Rajesh Kumar",
      programs: 5,
      students: 1200
    },
    { 
      name: "Medical Sciences", 
      color: "bg-red-600 hover:bg-red-700",
      dean: "Dr. Sunita Sharma",
      programs: 3,
      students: 800
    },
    {
      name: "Business Administration",
      color: "bg-green-600 hover:bg-green-700",
      dean: "Prof. Anil Thapa",
      programs: 4,
      students: 1500
    },
    { 
      name: "Arts & Humanities", 
      color: "bg-purple-600 hover:bg-purple-700",
      dean: "Dr. Maya Gurung",
      programs: 6,
      students: 950
    },
    { 
      name: "Natural Sciences", 
      color: "bg-orange-600 hover:bg-orange-700",
      dean: "Dr. Prakash Adhikari",
      programs: 4,
      students: 700
    },
    { 
      name: "Law", 
      color: "bg-indigo-600 hover:bg-indigo-700",
      dean: "Adv. Binod Karki",
      programs: 2,
      students: 600
    },
    { 
      name: "Education", 
      color: "bg-pink-600 hover:bg-pink-700",
      dean: "Dr. Shanti Devi",
      programs: 3,
      students: 850
    },
    { 
      name: "Computer Science", 
      color: "bg-cyan-600 hover:bg-cyan-700",
      dean: "Dr. Bikram Shrestha",
      programs: 4,
      students: 1100
    },
  ];
  //Redirect functions
   const handleLogin = () => {
  router.push("/login"); // For login
  };

  const handleRegister = () => {
   router.push("/register"); // For registration
  };
   const handleDepartmentClick = (dept) => {
    setSelectedDepartment(dept);
  };

  const closeDepartmentModal = () => {
    setSelectedDepartment(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
                <img src="/favicon.ico" alt="logo" className="w-50"/>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <a
                href="#overview"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Overview
              </a>
              <a
                href="#features"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Features
              </a>
              <a
                href="#departments"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Departments
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Contact
              </a>
            </div>

            <div className="hidden md:flex space-x-4">
            <button
                onClick={handleLogin}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 transition cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={handleRegister}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="flex flex-col space-y-3">
                <a
                  href="#overview"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Overview
                </a>
                <a
                  href="#features"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Features
                </a>
                <a
                  href="#departments"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Departments
                </a>
                <a
                  href="#contact"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Contact
                </a>
                 <button 
  onClick={handleLogin}
  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg flex items-center justify-center gap-2"
>
  
  Login
</button>

<button 
  onClick={handleRegister}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
>
  
  Register
</button>

              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden text-black py-20">
        <div className="absolute inset-0 bg-[url('/kathmandu_university.jpg')] bg-cover bg-center opacity-40"></div>
        <div className="relative z-10 flex items-center justify-center h-full text-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Welcome to UniPortal
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-black max-w-3xl mx-auto">
                Your comprehensive university management solution for seamless
                academic administration, student engagement, and institutional
                excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center justify-center">
                  Explore Portal <ChevronRight className="ml-2 w-5 h-5" />
                </button>
                <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
                  Watch Demo
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              System Overview
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              UniPortal is designed to streamline university operations, enhance
              communication, and provide a unified platform for students,
              faculty, and administrators.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-linear-to-br from-blue-50 to-blue-100 p-8 rounded-xl">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                10,000+
              </div>
              <div className="text-gray-700 font-semibold">Active Students</div>
            </div>
            <div className="bg-linear-to-br from-green-50 to-green-100 p-8 rounded-xl">
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-700 font-semibold">Faculty Members</div>
            </div>
            <div className="bg-linear-to-br from-purple-50 to-purple-100 p-8 rounded-xl">
              <div className="text-4xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-700 font-semibold">
                Programs Offered
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
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

      {/* Departments Portal Section */}
      
      <section id="departments" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Department Portals</h2>
            <p className="text-xl text-gray-600">Explore our departments and their programs</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept, index) => (
              <button
                key={index}
                onClick={() => handleDepartmentClick(dept)}
                className={`${dept.color} text-white p-6 rounded-xl font-semibold text-lg transition transform hover:scale-105 shadow-lg cursor-pointer`}
              >
                {dept.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8 relative max-h-screen overflow-y-auto">
            <button onClick={closeDepartmentModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-3xl font-bold text-gray-900 mb-4">{selectedDepartment.name}</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700"><strong>Dean:</strong> {selectedDepartment.dean}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                <span className="text-gray-700"><strong>Programs:</strong> {selectedDepartment.programs} active programs</span>
              </div>
              
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <span className="text-gray-700"><strong>Students:</strong> {selectedDepartment.students} enrolled</span>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-700">
                  The {selectedDepartment.name} department offers comprehensive programs designed to prepare students for successful careers. Our dedicated faculty and modern facilities ensure excellence.
                </p>
              </div>

              <div className="mt-6 flex gap-4">
                <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  View Programs
                </button>
                <button className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">
                  Contact Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="w-8 h-8" />
                <span className="text-2xl font-bold">UniPortal</span>
              </div>
              <p className="text-gray-400">
                Empowering education through innovative technology solutions.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Admissions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Academics
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Campus Life
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Library
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Research
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@uniportal.edu.np</li>
                <li>Phone: +977 (11) 490-497</li>
                <li>Address: Dhulikhel, Kavre</li>
                <li>Kathmandu University</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>
              &copy; 2024 UniPortal. All rights reserved. Designed for
              excellence in education management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
