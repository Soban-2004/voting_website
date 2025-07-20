import React, { useState } from "react"
import { EmailAuth } from "@/components/voting/email-auth"
import { VotingBallot } from "@/components/voting/voting-ballot"
import { VoteSuccess } from "@/components/voting/vote-success"

type VotingState = 'auth' | 'voting' | 'success'

const Index = () => {
  const [state, setState] = useState<VotingState>('auth')
  const [voterEmail, setVoterEmail] = useState('')
  const [voterToken, setVoterToken] = useState('')

  const handleAuthSuccess = (email: string, token: string) => {
    setVoterEmail(email)
    setVoterToken(token)
    setState('voting')
  }

  const handleVoteSuccess = () => {
    setState('success')
  }

  const handleReset = () => {
    setState('auth')
    setVoterEmail('')
    setVoterToken('')
  }

  return (
    <>
      {state === 'auth' && (
        <EmailAuth onAuthSuccess={handleAuthSuccess} />
      )}
      {state === 'voting' && (
        <VotingBallot 
          email={voterEmail}
          token={voterToken}
          onVoteSuccess={handleVoteSuccess}
        />
      )}
      {state === 'success' && (
        <VoteSuccess 
          email={voterEmail}
          onReset={handleReset}
        />
      )}
    </>
  )
};

export default Index;
