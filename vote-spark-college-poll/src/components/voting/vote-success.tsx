import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ThumbsUp, Share2, Download } from "lucide-react"

interface VoteSuccessProps {
  email: string
  onReset: () => void
}

export function VoteSuccess({ email, onReset }: VoteSuccessProps) {
  const generateReceipt = () => {
    const receiptData = {
      voterId: email,
      timestamp: new Date().toISOString(),
      electionId: "college-election-2025",
      status: "vote-submitted"
    }
    
    const dataStr = JSON.stringify(receiptData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'voting-receipt.json'
    link.click()
    
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/5 via-background to-primary/5 p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-accent/10 rounded-full">
              <CheckCircle className="h-16 w-16 text-accent" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-accent">Vote Submitted Successfully!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Thank you for participating in the College Election 2024
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Confirmation Details */}
          <div className="bg-accent/5 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-accent" />
              Confirmation Details
            </h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Voter Email:</span>
                <span className="font-medium">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submission Time:</span>
                <span className="font-medium">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Election:</span>
                <span className="font-medium">College Election 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-accent">✓ Verified & Recorded</span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="border-l-4 border-primary pl-4 py-2">
            <h4 className="font-medium text-primary">Security & Privacy</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Your vote has been securely recorded and encrypted. Your identity is verified but your vote choice remains completely anonymous and confidential.
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
            <h4 className="font-medium text-destructive mb-2">Important Notice</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• You cannot vote again in this election</li>
              <li>• Your vote cannot be changed or withdrawn</li>
              <li>• Results will be announced after the voting period ends</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            
            <Button
              onClick={onReset}
              variant="outline"
              className="flex-1 h-12"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Exit Voting Portal
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Issues? Contact the Nearby Member of Election Committee
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}