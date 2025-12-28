"use client"
import React , {useState} from 'react'
import { HomePageDepartments } from "@/lib/type";
import {
  GraduationCap,
  Users,
  X,
} from "lucide-react";

const DepartmentComponent = ({groupedDepartments} : {groupedDepartments : any}) => {
    const [selectedDepartment, setSelectedDepartment] =
    useState<HomePageDepartments | null>(null);
    const categoryColors: { [key: string]: string } = {
        "School of Arts": "bg-gradient-to-br from-pink-100 to-pink-200",
        "School of Education": "bg-gradient-to-br from-green-100 to-green-200",
        "School of Engineering": "bg-gradient-to-br from-blue-100 to-blue-200",
      };
    const handleDepartmentClick = (dept: any) => {
        setSelectedDepartment(dept);
      };
    
    const closeDepartmentModal = () => {
        setSelectedDepartment(null);
      };
  return (
    <>
    <section id="departments" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Department Portals
            </h2>
            <p className="text-xl text-gray-600">
              Explore our departments and their programs
            </p>
          </div>

          <div className="space-y-12">
            {Object.entries(groupedDepartments).map(([category, depts]: [string, any]) => (
              <div key={category}>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-200 pb-2">
                  {category}
                  <span className="text-sm font-normal text-gray-500 ml-3">
                    ({depts.length} departments)
                  </span>
                </h3>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {depts.map((dept: any) => (
                    <button
                      key={dept.id}
                      onClick={() => handleDepartmentClick(dept)}
                      className={`${
                        categoryColors[category] || "bg-gradient-to-br from-gray-100 to-gray-200"
                      } text-black p-6 rounded-xl font-semibold text-lg transition transform hover:scale-105 shadow-lg cursor-pointer hover:shadow-xl`}
                    >
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-600 mb-2">
                          {dept.category}
                        </div>
                        <div className="font-bold">{dept.department_name}</div>
                        <div className="text-sm text-gray-700 mt-2">
                          Students: {dept.total_students}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8 relative max-h-screen overflow-y-auto">
            <button
              onClick={closeDepartmentModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {selectedDepartment.name}
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">
                  <strong>Head of Department:</strong> {selectedDepartment?.head_of_department}
                </span>
              </div>


              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <span className="text-gray-700">
                  <strong>Students:</strong> {selectedDepartment.total_students}{" "}
                  enrolled
                </span>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-700">
                  The {selectedDepartment?.name} department offers comprehensive
                  programs designed to prepare students for successful careers.
                  Our dedicated faculty and modern facilities ensure excellence.
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
    
    </>
  )
}

export default DepartmentComponent
