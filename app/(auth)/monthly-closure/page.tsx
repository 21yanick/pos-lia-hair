"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  CreditCard,
  Building,
  Eye,
  Lock
} from "lucide-react"
import { useToast } from "@/lib/hooks/core/useToast"
import { useMonthlySummaries } from "@/lib/hooks/business/useMonthlySummaries"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentYearMonth, getMonthOptions, formatMonthYear } from "@/lib/utils/reportHelpers"

// Wizard Steps
import { DataCheckStep } from "./components/steps/DataCheckStep"
import { SettlementStep } from "./components/steps/SettlementStep"
import { BankReconciliationStep } from "./components/steps/BankReconciliationStep"
import { ReviewStep } from "./components/steps/ReviewStep"
import { ClosureStep } from "./components/steps/ClosureStep"

type WizardStep = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'data-check',
    title: 'Datencheck',
    description: 'Vollständigkeit der Transaktionen prüfen',
    icon: <FileText size={20} />,
    status: 'pending'
  },
  {
    id: 'settlement',
    title: 'Settlement',
    description: 'TWINT/SumUp CSV importieren',
    icon: <CreditCard size={20} />,
    status: 'pending'
  },
  {
    id: 'bank-reconciliation', 
    title: 'Bank Reconciliation',
    description: 'Bank Statement abgleichen',
    icon: <Building size={20} />,
    status: 'pending'
  },
  {
    id: 'review',
    title: 'Kontrolle',
    description: 'Finale Zahlen und Belege prüfen',
    icon: <Eye size={20} />,
    status: 'pending'
  },
  {
    id: 'closure',
    title: 'Abschluss',
    description: 'PDF erstellen und Monat sperren',
    icon: <Lock size={20} />,
    status: 'pending'
  }
]

export default function MonthlyClosurePage() {
  const { toast } = useToast()
  const { checkMonthClosure } = useMonthlySummaries()
  
  // State
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentYearMonth())
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [stepStatuses, setStepStatuses] = useState<Record<string, WizardStep['status']>>({
    'data-check': 'in_progress',
    'settlement': 'pending',
    'bank-reconciliation': 'pending', 
    'review': 'pending',
    'closure': 'pending'
  })
  const [stepData, setStepData] = useState<Record<string, any>>({})
  const [monthIsClosed, setMonthIsClosed] = useState(false)
  const [closedSummary, setClosedSummary] = useState<any>(null)

  const currentStep = WIZARD_STEPS[currentStepIndex]
  const formattedMonthYear = formatMonthYear(selectedMonth)
  const progress = ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100

  // Prüfen ob Monat bereits abgeschlossen ist
  useEffect(() => {
    const checkClosure = async () => {
      const [year, month] = selectedMonth.split('-').map(Number)
      const result = await checkMonthClosure(year, month)
      
      if (result.isClosed && result.summary) {
        setMonthIsClosed(true)
        setClosedSummary(result.summary)
        // Direkt zu Step 5 (Closure) springen um Zusammenfassung zu zeigen
        setCurrentStepIndex(4)
        setStepStatuses({
          'data-check': 'completed',
          'settlement': 'completed', 
          'bank-reconciliation': 'completed',
          'review': 'completed',
          'closure': 'completed'
        })
      } else {
        setMonthIsClosed(false)
        setClosedSummary(null)
        // Reset to first step for new closure
        setCurrentStepIndex(0)
        setStepStatuses({
          'data-check': 'in_progress',
          'settlement': 'pending',
          'bank-reconciliation': 'pending', 
          'review': 'pending',
          'closure': 'pending'
        })
      }
    }
    
    checkClosure()
  }, [selectedMonth])

  // Step completion handler
  const completeStep = (stepId: string, data?: any) => {
    setStepStatuses(prev => ({
      ...prev,
      [stepId]: 'completed'
    }))
    
    if (data) {
      setStepData(prev => ({
        ...prev,
        [stepId]: data
      }))
    }

    // Enable next step
    const nextIndex = currentStepIndex + 1
    if (nextIndex < WIZARD_STEPS.length) {
      const nextStepId = WIZARD_STEPS[nextIndex].id
      setStepStatuses(prev => ({
        ...prev,
        [nextStepId]: 'in_progress'
      }))
    }
  }

  // Navigation
  const goToNextStep = () => {
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    // Only allow going to completed steps or current step
    const targetStep = WIZARD_STEPS[stepIndex]
    const targetStatus = stepStatuses[targetStep.id]
    
    if (targetStatus === 'completed' || stepIndex <= currentStepIndex) {
      setCurrentStepIndex(stepIndex)
    }
  }

  // Month change handler
  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth)
    // Reset wizard to beginning
    setCurrentStepIndex(0)
    setStepStatuses({
      'data-check': 'in_progress',
      'settlement': 'pending',
      'bank-reconciliation': 'pending',
      'review': 'pending', 
      'closure': 'pending'
    })
    setStepData({})
  }

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'data-check':
        return (
          <DataCheckStep
            selectedMonth={selectedMonth}
            onComplete={(data) => completeStep('data-check', data)}
            onNext={goToNextStep}
          />
        )
      case 'settlement':
        return (
          <SettlementStep
            selectedMonth={selectedMonth}
            dataCheckResult={stepData['data-check']}
            onComplete={(data) => completeStep('settlement', data)}
            onNext={goToNextStep}
          />
        )
      case 'bank-reconciliation':
        return (
          <BankReconciliationStep
            selectedMonth={selectedMonth}
            settlementResult={stepData['settlement']}
            onComplete={(data) => completeStep('bank-reconciliation', data)}
            onNext={goToNextStep}
          />
        )
      case 'review':
        return (
          <ReviewStep
            selectedMonth={selectedMonth}
            allStepData={stepData}
            onComplete={(data) => completeStep('review', data)}
            onNext={goToNextStep}
          />
        )
      case 'closure':
        return (
          <ClosureStep
            selectedMonth={selectedMonth}
            allStepData={stepData}
            onComplete={(data) => completeStep('closure', data)}
            isAlreadyClosed={monthIsClosed}
            closedSummary={closedSummary}
          />
        )
      default:
        return <div>Unbekannter Schritt</div>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Monatsabschluss</h1>
          <p className="text-muted-foreground">
            Geführter Prozess für {formattedMonthYear}
          </p>
        </div>

        {/* Month Selector */}
        <Select value={selectedMonth} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getMonthOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Fortschritt</span>
          <span>{Math.round(progress)}% abgeschlossen</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="grid grid-cols-5 gap-2">
        {WIZARD_STEPS.map((step, index) => {
          const status = stepStatuses[step.id]
          const isActive = index === currentStepIndex
          const isClickable = status === 'completed' || index <= currentStepIndex
          
          return (
            <button
              key={step.id}
              onClick={() => isClickable && goToStep(index)}
              disabled={!isClickable}
              className={`
                p-3 rounded-lg border text-left transition-all
                ${isActive 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : status === 'completed'
                  ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/20 dark:text-green-400'
                  : status === 'blocked'
                  ? 'border-muted bg-muted/50 text-muted-foreground cursor-not-allowed'
                  : 'border-muted bg-background hover:bg-muted/50'
                }
                ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                {status === 'completed' ? (
                  <CheckCircle2 size={16} className="text-green-600" />
                ) : status === 'blocked' ? (
                  <AlertCircle size={16} className="text-muted-foreground" />
                ) : (
                  step.icon
                )}
                <span className="font-medium text-sm">{step.title}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {step.description}
              </p>
            </button>
          )
        })}
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {currentStep.icon}
            <div>
              <CardTitle>{currentStep.title}</CardTitle>
              <CardDescription>{currentStep.description}</CardDescription>
            </div>
            <Badge variant={stepStatuses[currentStep.id] === 'completed' ? 'default' : 'secondary'}>
              Schritt {currentStepIndex + 1} von {WIZARD_STEPS.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      {!monthIsClosed && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goToPrevStep}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft size={16} className="mr-1" />
            Zurück
          </Button>

          {currentStepIndex < WIZARD_STEPS.length - 1 && (
            <Button
              onClick={goToNextStep}
              disabled={stepStatuses[currentStep.id] !== 'completed'}
            >
              Weiter
              <ChevronRight size={16} className="ml-1" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}