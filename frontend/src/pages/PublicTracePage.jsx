import { useParams } from 'react-router-dom'
import Logo from '../components/Logo'

export default function PublicTracePage() {
  const { token } = useParams()

  return (
    <div className="public-trace">
      <div className="public-trace__card">
        <Logo />
        <h1>Product Trace</h1>
        <p>Full traceability details for this product are coming in a future update.</p>
        <p className="public-trace__token">
          Token: <code>{token}</code>
        </p>
      </div>
    </div>
  )
}
