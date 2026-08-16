import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getLivestockByFarm } from '../api/livestockApi'
import { createMilkBatch } from '../api/milkBatchApi'
import { resolveErrorMessage } from '../api/errors'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../auth/useAuth'
import { useMyFarms } from '../hooks/useMyFarms'

const STATUS_TONES = { ACTIVE: 'success', SOLD: 'neutral', DECEASED: 'danger' }

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function validate({ batchCode, collectionDate, quantityLitres, selectedIds }) {
  if (!batchCode.trim()) return 'Please enter a batch code.'
  if (!collectionDate) return 'Please select a collection date.'
  const qty = Number(quantityLitres)
  if (!quantityLitres || Number.isNaN(qty) || qty <= 0) {
    return 'Please enter a quantity greater than 0.'
  }
  if (selectedIds.length === 0) return 'Select at least one animal.'
  return ''
}

export default function MilkBatchFormPage() {
  const navigate = useNavigate()
  const { userId } = useAuth()
  const { farms, loading: farmsLoading, error: farmsError, primaryFarm } = useMyFarms()

  const [livestock, setLivestock] = useState([])
  const [livestockLoading, setLivestockLoading] = useState(false)
  const [livestockError, setLivestockError] = useState('')

  const [batchCode, setBatchCode] = useState('')
  const [collectionDate, setCollectionDate] = useState(todayIsoDate())
  const [quantityLitres, setQuantityLitres] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!primaryFarm) return
    setLivestockLoading(true)
    getLivestockByFarm(primaryFarm.id)
      .then(setLivestock)
      .catch((err) => setLivestockError(resolveErrorMessage(err)))
      .finally(() => setLivestockLoading(false))
  }, [primaryFarm])

  function toggleAnimal(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validate({ batchCode, collectionDate, quantityLitres, selectedIds })
    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError('')
    setSubmitting(true)
    try {
      const created = await createMilkBatch({
        batchCode: batchCode.trim(),
        farmId: primaryFarm.id,
        collectedById: userId,
        collectionDate,
        quantityLitres: Number(quantityLitres),
        livestockIds: selectedIds,
      })
      navigate(`/milk-batches/${created.id}`, {
        replace: true,
        state: { successMessage: `Batch ${created.batchCode} was created successfully.` },
      })
    } catch (err) {
      setFormError(resolveErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (farmsLoading) return <LoadingState label="Loading your farm…" />
  if (farmsError) return <ErrorState message={farmsError} />

  if (farms.length === 0) {
    return (
      <div className="page page--narrow">
        <h1>Create Milk Batch</h1>
        <div className="alert alert--danger" role="alert">
          You need a registered farm before you can record a milk batch.
        </div>
        <Link to="/farms/new" className="btn btn--ghost">
          Create Farm
        </Link>
      </div>
    )
  }

  return (
    <div className="page page--narrow">
      <h1>Create Milk Batch</h1>

      {formError && (
        <div className="alert alert--danger" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="card">
        <div className="field">
          <label htmlFor="batchCode">
            Batch code <span className="required">*</span>
          </label>
          <input
            id="batchCode"
            type="text"
            value={batchCode}
            onChange={(e) => setBatchCode(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="collectionDate">
            Collection date <span className="required">*</span>
          </label>
          <input
            id="collectionDate"
            type="date"
            value={collectionDate}
            onChange={(e) => setCollectionDate(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="quantityLitres">
            Quantity (litres) <span className="required">*</span>
          </label>
          <input
            id="quantityLitres"
            type="number"
            min="0.01"
            step="0.01"
            value={quantityLitres}
            onChange={(e) => setQuantityLitres(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="field">
          <label>
            Animals <span className="required">*</span>
          </label>

          {livestockLoading && <p>Loading animals…</p>}
          {!livestockLoading && livestockError && <p className="card__note">{livestockError}</p>}
          {!livestockLoading && !livestockError && livestock.length === 0 && (
            <p className="field-note">
              No livestock registered yet.{' '}
              <Link to="/livestock/new">Add an animal</Link> first.
            </p>
          )}
          {!livestockLoading && !livestockError && livestock.length > 0 && (
            <div className="checkbox-list">
              {livestock.map((animal) => (
                <label key={animal.id} className="checkbox-list__item">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(animal.id)}
                    onChange={() => toggleAnimal(animal.id)}
                    disabled={submitting}
                  />
                  <span>
                    {animal.tagNumber} — {animal.species}
                  </span>
                  <StatusBadge tone={STATUS_TONES[animal.status] ?? 'neutral'}>
                    {animal.status}
                  </StatusBadge>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <Link to="/milk-batches" className="btn btn--ghost">
            Cancel
          </Link>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Milk Batch'}
          </button>
        </div>
      </form>
    </div>
  )
}
