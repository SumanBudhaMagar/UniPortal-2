"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronRight,
} from "lucide-react";
import { supabase2 } from "@/lib/supabase";
import DepartmentComponent from "./DepartmentComponent";
import Footer from "./Footer";
import NavigationComponent from "./NavigationComponent";
import FeaturesComponent from "./FeaturesComponent";

export default function HomePage() {
 
  const [departmentsList, setDepartmentsList] = useState<any | null>(null);
  const [groupedDepartments, setGroupedDepartments] = useState<any>({});

  const getDepartmentsList = async () => {
    try {
      const { data, error } = await supabase2
        .from("departments")
        .select("*")
        .order("category, department_name");
      
      if (data) {
        setDepartmentsList(data);
        console.log("Departments", data);
        
        // Group departments by category
        const grouped = data.reduce((acc: any, dept: any) => {
          const category = dept.category;
          
          if (!acc[category]) {
            acc[category] = [];
          }
          
          acc[category].push(dept);
          
          return acc;
        }, {});
        
        setGroupedDepartments(grouped);
        console.log("Grouped Departments", grouped);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getDepartmentsList();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <NavigationComponent/>
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
      <FeaturesComponent/>
      {/* Departments Portal Section */}
      <DepartmentComponent groupedDepartments={groupedDepartments}/>
      {/* Footer */}
      <Footer/>
    </div>
  );
}
