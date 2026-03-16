import './LoadingSpinner.css'

type LoadingSpinnerProps = {
  label?: string
}

export default function LoadingSpinner({ label = 'Cargando…' }: LoadingSpinnerProps) {
  return (
    <div className="spinner" role="status" aria-label={label}>
      <div className="spinnerRing" />
      <span className="spinnerLabel">{label}</span>
    </div>
  )
}
