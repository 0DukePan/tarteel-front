'use client'

import { Calendar, CheckCircle2, Mail, Phone } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"

interface RegistrationSuccessProps {
    data : any,
    onStartOver : () => void
}
export  function RegitrationSuccess({data , onStartOver} : RegistrationSuccessProps)  {
    return (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
          </div>
    
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">Registration Submitted Successfully!</h3>
            <p className="text-gray-600">
              Thank you for registering your child with our Quran school. We have received your request and will review
              it shortly.
            </p>
          </div>
    
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-6">
              <h4 className="font-semibold text-emerald-800 mb-4">What happens next?</h4>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800">Email Confirmation</p>
                    <p className="text-sm text-emerald-700">You will receive a confirmation email within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800">Phone Call</p>
                    <p className="text-sm text-emerald-700">Our staff will contact you to discuss class placement</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800">Class Start</p>
                    <p className="text-sm text-emerald-700">Once approved, your child can begin attending classes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
    
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Registration ID:</strong> {data.studentId}
            </p>
            <p className="text-sm text-gray-600 mt-1">Please keep this ID for your records</p>
          </div>
    
          <Button
            onClick={onStartOver}
            variant="outline"
            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 bg-transparent"
          >
            Register Another Child
          </Button>
        </div>
      )
}