"use client"
import React from 'react'
import { GraduationCap } from 'lucide-react'
const Footer = () => {
  return (
    <>
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
    </>
  )
}

export default Footer
