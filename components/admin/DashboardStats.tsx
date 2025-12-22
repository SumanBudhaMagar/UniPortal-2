'use client';


import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
interface DashboardStatsProps {
  
  departmentsCount: number
  hodsCount: number
  examHeadsCount: number
  noHodCount: number

}

export default function DashboardStats({ departmentsCount, hodsCount, examHeadsCount, noHodCount }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">{departmentsCount}</div>
              <div className="text-blue-100">Total Departments</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">{hodsCount}</div>
              <div className="text-green-100">HODs</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">{examHeadsCount}</div>
              <div className="text-purple-100">Exam Heads</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">{noHodCount}</div>
              <div className="text-orange-100">Depts Without HOD</div>
            </CardContent>
          </Card>
        </div>
  )
}
