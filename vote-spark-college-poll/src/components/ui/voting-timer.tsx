import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface VotingTimerProps {
  endTime: Date
  className?: string
}

export function VotingTimer({ endTime, className }: VotingTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState("")
  const [isExpired, setIsExpired] = React.useState(false)

  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = endTime.getTime() - now

      if (distance < 0) {
        setIsExpired(true)
        setTimeLeft("Voting Closed")
        clearInterval(timer)
      } else {
        const hours = Math.floor(distance / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  return (
    <div
      className={cn(
        "flex items-center space-x-2 px-4 py-2 rounded-lg border",
        isExpired 
          ? "bg-destructive/10 border-destructive text-destructive" 
          : "bg-primary/10 border-primary text-primary",
        className
      )}
    >
      <Clock className="h-4 w-4" />
      <span className="font-mono font-medium">
        {isExpired ? "Voting Closed" : `Time Left: ${timeLeft}`}
      </span>
    </div>
  )
}