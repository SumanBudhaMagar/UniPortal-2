"use client"
import React, {useState} from 'react'
import { useRouter } from "next/navigation";
import {X, Menu} from 'lucide-react';
import Image from 'next/image';

const NavigationComponent = () => {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const handleLogin = () => {
        router.push("/login"); // For login
      };
    
    const handleRegister = () => {
        router.push("/register"); // For registration
      };
    
  return (
    <>
    <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Image src="/favicon.ico" alt="logo" width={200} height={200} />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8">
              <a
                href="#overview"
                className="text-gray-700 hover:text-orange-600 transition"
              >
                Overview
              </a>
              <a
                href="#features"
                className="text-gray-700 hover:text-orange-600 transition"
              >
                Features
              </a>
              <a
                href="#departments"
                className="text-gray-700 hover:text-orange-600 transition"
              >
                Departments
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-orange-600 transition"
              >
                Contact
              </a>
            </div>

            <div className="hidden md:flex space-x-4">
              <button
                onClick={handleLogin}
                className="px-4 py-2 text-orange-400 hover:text-orange-600 transition cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={handleRegister}
                className="px-4 py-2 bg-orange-400 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600"
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
                  className="text-gray-700 hover:text-orange-600"
                >
                  Overview
                </a>
                <a
                  href="#features"
                  className="text-gray-700 hover:text-orange-600"
                >
                  Features
                </a>
                <a
                  href="#departments"
                  className="text-gray-700 hover:text-orange-600"
                >
                  Departments
                </a>
                <a
                  href="#contact"
                  className="text-gray-700 hover:text-orange-600"
                >
                  Contact
                </a>
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 border rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600"
                >
                  Login
                </button>

                <button
                  onClick={handleRegister}
                  className="px-4 py-2 bg-orange-400 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600"
                >
                  Register
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}

export default NavigationComponent
