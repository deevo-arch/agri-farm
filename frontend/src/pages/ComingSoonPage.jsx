export default function ComingSoonPage({ title }) {
  return (
    <div className="coming-soon">
      <div className="coming-soon__icon" aria-hidden="true">
        🚧
      </div>
      <h1>{title}</h1>
      <p>This area is coming in a future update.</p>
    </div>
  )
}
