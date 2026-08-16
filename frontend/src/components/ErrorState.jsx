export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
