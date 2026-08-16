export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="state state--loading">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}
