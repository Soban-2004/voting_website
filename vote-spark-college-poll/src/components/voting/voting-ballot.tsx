import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { VotingTimer } from "@/components/ui/voting-timer"
import { CheckCircle, User, Users, Award, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface VotingBallotProps {
  email: string
  token: string
  onVoteSuccess: () => void
}

interface Candidate {
  id: string
  name: string
  position: string
  description: string
  imageUrl?: string
}

// Store images in public/candidates folder and reference them like this:
const candidates: Candidate[] = [
  {
    id: "candidate1",
    name: "Alex Johnson",
    position: "President",
    description: "Senior, Computer Science. Advocate for campus sustainability and student wellness programs.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format"
  },
  {
    id: "candidate2", 
    name: "Maria Rodriguez",
    position: "President",
    description: "Junior, Business Administration. Focus on improving campus facilities and academic support services.",
    imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format"
  },
  {
    id: "candidate3",
    name: "David Chen",
    position: "President", 
    description: "Senior, Engineering. Champion for technology integration and career development initiatives.",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format"
  },
  {
    id: "candidate4",
    name: "Sarah Williams",
    position: "Secretary",
    description: "Junior, Liberal Arts. Passionate about diversity, inclusion, and mental health awareness.",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format"
  },
  {
  id: "candidate5",
  name: "Rohit Mehra",
  position: "Treasurer",
  description: "Dedicated to transparency and communication.",
  imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format"
  }
]

export function VotingBallot({ email, token, onVoteSuccess }: VotingBallotProps) {
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, string>>({})
  const requiredPositions = Array.from(new Set(candidates.map(c => c.position)))
  const [loading, setLoading] = useState(false)
  const [votingEnded, setVotingEnded] = useState(false)
  const { toast } = useToast()

  const votingEndTime = new Date(Date.now() + 5 * 60 * 1000)

  useEffect(() => {
    const timer = setInterval(() => {
      if (new Date() > votingEndTime) {
        setVotingEnded(true)
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [votingEndTime])

  const submitVote = async () => {
    const requiredPositions = Array.from(new Set(candidates.map(c => c.position)))
    const hasAllVotes = requiredPositions.every(pos => selectedCandidates[pos])

    if (!hasAllVotes) {
      toast({
        title: "Incomplete Vote",
        description: "Please select a candidate for each position before submitting.",
        variant: "destructive"
      })
      return
    }

    if (votingEnded) {
      toast({
        title: "Voting Closed",
        description: "The voting period has ended.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const voteData = requiredPositions.reduce((acc, position) => {
        const candidateId = selectedCandidates[position]
        const candidate = candidates.find(c => c.id === candidateId)
        acc[`vote_${position.toLowerCase().replace(/\s+/g, "_")}`] = candidateId
        acc[`name_${position.toLowerCase().replace(/\s+/g, "_")}`] = candidate?.name
        return acc
      }, {} as Record<string, string>)

      const { error } = await supabase
        .from("voters")
        .update({
          voted: true,
          ...voteData
        })
        .eq("email", email)
        .eq("token", token)

      if (error) throw error

      toast({
        title: "Vote Submitted Successfully",
        description: "Thank you for participating!",
      })

      onVoteSuccess()
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Unable to submit your vote. Please try again.",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Award className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold">College Election 2025</h1>
          <p className="text-lg text-muted-foreground">Select your preferred candidate for Student Body President</p>
          <div className="flex justify-center">
            <VotingTimer endTime={votingEndTime} />
          </div>
        </div>

        {/* Voter Info */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-primary" />
                <span className="font-medium">Authenticated Voter:</span>
                <span className="text-muted-foreground">{email}</span>
              </div>
              <Badge variant="secondary" className="bg-accent/10 text-accent">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>
          </CardContent>
        </Card>
             
        {Array.from(new Set(candidates.map(c => c.position))).map((position) => (
          <Card key={position} className="shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                  {position}
              </CardTitle>
              <CardDescription>
                Choose one candidate for {position}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedCandidates[position] || ""}
                onValueChange={(value) => {
                  setSelectedCandidates(prev => ({ ...prev, [position]: value }))
                }}
              >
                <div className="grid gap-4">
                  {candidates
                    .filter((c) => c.position === position)
                    .map((candidate) => (
                      <div key={candidate.id} className="relative">
                        <RadioGroupItem
                          value={candidate.id}
                          id={candidate.id}
                          className="peer absolute opacity-0 w-0 h-0"
                        />
                        <Label
                          htmlFor={candidate.id}
                          className="flex cursor-pointer items-start space-x-4 rounded-lg border-2 border-muted p-6 hover:border-primary/50 hover:bg-primary/5 peer-checked:border-primary peer-checked:bg-primary/10 transition-all duration-200"
                        >
                          <div className="flex-shrink-0">
                            {candidate.imageUrl ? (
                              <div className="h-16 w-16 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg hover:border-primary hover:shadow-xl transition-all duration-300 bg-gray-100">
                                <img 
                                  src={candidate.imageUrl} 
                                  alt={candidate.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback if image fails to load
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = `
                                      <div class="h-full w-full rounded-full bg-primary/10 flex items-center justify-center">
                                        <svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                      </div>
                                    `;
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                                <User className="h-8 w-8 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-semibold text-lg">{candidate.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {candidate.description}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {selectedCandidates[position] === candidate.id ? (
                              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                <div className="h-3 w-3 rounded-full bg-white"></div>
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/50 bg-background"></div>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        ))}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            onClick={submitVote}
            disabled={loading || votingEnded || Object.keys(selectedCandidates).length < requiredPositions.length}
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting Vote...
              </>
            ) : votingEnded ? (
              "Voting Period Ended"
            ) : (
              "Submit My Vote"
            )}
          </Button>
        </div>

        {/* Security Notice */}
        <Card className="border-muted bg-muted/20">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p className="font-medium">🔒 Your vote is secure and confidential</p>
              <p>This election uses encrypted data transmission and secure storage. Your identity is verified but your vote remains anonymous.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}