export default function OnboardingProgress({ currentStep, totalSteps }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'DM Sans, sans-serif' }}>
          Step {currentStep} of {totalSteps}
        </span>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', fontFamily: 'DM Sans, sans-serif' }}>
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>
      <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(currentStep / totalSteps) * 100}%`, backgroundColor: '#f59e0b', borderRadius: '2px', transition: 'width 0.4s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </div>
      <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', backgroundColor: i < currentStep ? '#f59e0b' : 'rgba(255,255,255,0.06)', transition: 'background 0.3s ease' }} />
        ))}
      </div>
    </div>
  )
}