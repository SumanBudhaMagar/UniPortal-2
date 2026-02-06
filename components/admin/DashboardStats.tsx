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
          <Card className="login text-black">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">{departmentsCount}</div>
              <div className="text-black">Total Departments</div>
            </CardContent>
          </Card>
          <Card className="login text-black">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">{hodsCount}</div>
              <div className="text-black">HODs</div>
            </CardContent>
          </Card>
          <Card className="login text-black">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">{examHeadsCount}</div>
              <div className="text-black">Exam Heads</div>
            </CardContent>
          </Card>
          <Card className="login text-black">
            <CardContent className="pt-6">
              <div className="text-4xl font-bold">{noHodCount}</div>
              <div className="text-black">Depts Without HOD</div>
            </CardContent>
          </Card>
        </div>
  )
}
