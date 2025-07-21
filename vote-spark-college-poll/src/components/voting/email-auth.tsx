import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Loader2, Mail, Shield, Vote } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"


interface EmailAuthProps {
  onAuthSuccess: (email: string, token: string ) => void
}


export function EmailAuth({ onAuthSuccess }: EmailAuthProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [sentToken, setSentToken] = useState('')
  const { toast } = useToast()
  

  const isValidCollegeEmail = (email: string) => {
    const collegeDomains = ['eec.srmrmp.edu.in']; // Add your actual domain(s) here
    return collegeDomains.some(domain => email.endsWith(`@${domain}`));
    // return true // For demo purposes, assume all emails are valid
  }

  const sendOTP = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your college email address.",
        variant: "destructive"
      })
      return
    }

    if (!isValidCollegeEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please use your official college email address.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Generate a 6-digit OTP
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString()
      setSentToken(generatedOTP)
      
      // Check if user already voted
      const { data: existingVoter } = await supabase
        .from('voters')
        .select('voted, email')
        .eq('email', email)
        .single()

      if (existingVoter?.voted) {
        toast({
          title: "Already Voted",
          description: "You have already cast your vote in this election.",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      // In a real implementation, send OTP via email service
      // // For demo purposes, we'll show the OTP in console
      console.log(`OTP for ${email}: ${generatedOTP}`)    
      // const { error: emailError } = await supabase.functions.invoke('send-otp', {
      //   body: {
      //     email: email,
      //     otp: generatedOTP
      //   }
      // })

      // if (emailError) {
      //   throw new Error('Failed to send OTP email')
      // }

      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${email}. Check your inbox.`,
      })
      
  setStep('otp')
    } catch (error) {
      console.error('Error sending OTP:', error)
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  const verifyOTP = async () => {
    if (otp !== sentToken) {
      toast({
        title: "Invalid OTP",
        description: "The verification code you entered is incorrect.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Generate a unique voting token
      const votingToken = crypto.randomUUID()
      
      // Create or update voter record
      const { error } = await supabase
        .from('voters')
        .upsert({
          email,
          token: votingToken,
          voted: false
        })

      if (error) throw error

      toast({
        title: "Verification Successful",
        description: "You are now authenticated to vote.",
      })
      
      onAuthSuccess(email, votingToken)
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Unable to authenticate. Please try again.",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Vote className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">College Election 2025</CardTitle>
          <CardDescription>
            Secure voting with email verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'email' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  College Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="reg.no@eec.srmrmp.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
              </div>
              <Button 
                onClick={sendOTP}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Shield className="h-12 w-12 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">Enter Verification Code</h3>
                  <p className="text-sm text-muted-foreground">
                    We sent a 6-digit code to {email}<br></br>(Check your inbox or spam folder)
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={verifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Access Ballot'
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => setStep('email')}
                  className="w-full"
                >
                  Back to Email
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
    
  )
}