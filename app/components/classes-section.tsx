'use client'
import { useClassStore } from "@/lib/store/class-store";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "./ui/loading-spinner";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, User, Users } from "lucide-react";

export function ClassesSection(){
    const {classes , loading , error , fetchClasses} = useClassStore()
    const [selectedAge , setSelectedAge] = useState<number | null>(null)

    useEffect(() => {
        fetchClasses(selectedAge || undefined)

    } , [selectedAge , fetchClasses])

    const ageGroups = [
        {
            label : 'All',
            value : null
        },
        {
            label : '5-6 years',
            value : 6
        },
        {
            label : '7-10 years',
            value : 8
        },
        {
            label : '10-12 years',
            value : 11
        },
        {
            label : '12-15 years',
            value : 13
        }
    ]

    if (loading) {
        return (
          <section id="classes" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Loading classes...</p>
              </div>
            </div>
          </section>
        )
      }
    
      if (error) {
        return (
          <section id="classes" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <p className="text-red-600">Error loading classes: {error}</p>
                <Button onClick={() => fetchClasses()} className="mt-4">
                  Try Again
                </Button>
              </div>
            </div>
          </section>
        )
      }
      return (
        <section id="classes" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Available Classes</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Choose from our variety of classes designed for different age groups and skill levels.
              </p>
    
              <div className="flex flex-wrap justify-center gap-3">
                {ageGroups.map((group) => (
                  <Button
                    key={group.label}
                    variant={selectedAge === group.value ? "default" : "outline"}
                    onClick={() => setSelectedAge(group.value)}
                    className={selectedAge === group.value ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  >
                    {group.label}
                  </Button>
                ))}
              </div>
            </div>
    
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {classes.map((classItem) => (
                <Card key={classItem.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl text-gray-900">{classItem.name}</CardTitle>
                      <Badge
                        variant={classItem.isFull ? "destructive" : "secondary"}
                        className={classItem.isFull ? "" : "bg-emerald-100 text-emerald-800"}
                      >
                        {classItem.isFull ? "Full" : `${classItem.availableSpots} spots left`}
                      </Badge>
                    </div>
                    {classItem.teacher && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        {classItem.teacher.name}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>
                          {classItem.startTime} - {classItem.endTime}
                        </span>
                      </div>
    
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>
                          Ages {classItem.ageMin}-{classItem.ageMax} years
                        </span>
                      </div>
    
                      <div className="flex items-center text-gray-600">
                        <span className="text-sm">
                          {classItem.currentStudents}/{classItem.maxStudents} students enrolled
                        </span>
                      </div>
    
                      {classItem.teacher?.specialization && (
                        <div className="text-sm text-gray-600">
                          <strong>Focus:</strong> {classItem.teacher.specialization}
                        </div>
                      )}
    
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        disabled={classItem.isFull}
                        onClick={() => {
                          document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" })
                        }}
                      >
                        {classItem.isFull ? "Class Full" : "Register for This Class"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
    
            {classes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No classes available for the selected age group.</p>
              </div>
            )}
          </div>
        </section>
      )
    }