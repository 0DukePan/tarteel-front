'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { RegitrationSuccess } from "./registration-seccess"
import { RegistrationForm } from "./registration-form"
import { Alert } from "./ui/alert"
import { AlertCircle } from "lucide-react"

export function RegistrationSection () {
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegistrationSuccess = (data: any) => {
    setRegistrationData(data);
    setRegistrationComplete(true);
    setErrorMessage(null);
  };

  const handleStartOver = () => {
    setRegistrationComplete(false);
    setRegistrationData(null);
    setErrorMessage(null);
  };

  return (
    <section id="registration" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Register Your Child</h2>
            <p className="text-xl text-gray-600">Begin your child's journey in Islamic education. Fill out the form below to register</p>
          </div>

          <Card className="border-0 shadow-2xl">
            <CardHeader className="bg-emerald-50 rounded-t-lg">
              <CardTitle className="text-2xl text-center text-emerald-800">
                {registrationComplete ? 'Registration Successful!' : 'Student Registration Form'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <span>{errorMessage}</span>
                </Alert>
              )}
              {registrationComplete ? (
                <RegitrationSuccess data={registrationData} onStartOver={handleStartOver} />
              ) : (
                <RegistrationForm
                  onSuccess={handleRegistrationSuccess}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
