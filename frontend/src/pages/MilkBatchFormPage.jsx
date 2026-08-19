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

function generateRandomBatchCode() {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  const randomNum = Math.floor(100 + Math.random() * 900)
  return `BATCH-${dateStr}-${randomNum}`
}

function validate({ batchCode, collectionDate, quantityLitres, selectedIds }) {
  if (!batchCode.trim()) return 'Please enter a batch code.'
  if (!collectionDate) return 'Please select a collection date.'
  const qty = Number(quantityLitres)
  if (!quantityLitres || Number.isNaN(qty) || qty <= 0) {
    return 'Please enter a valid milk quantity greater than 0 litres.'
  }
  if (selectedIds.length === 0) return 'Please select at least one cow/animal for this milk batch.'
  return ''
}

export default function MilkBatchFormPage() {
  const navigate = useNavigate()
  const { userId } = useAuth()
  const { farms, loading: farmsLoading, error: farmsError, primaryFarm } = useMyFarms()

  const [livestock, setLivestock] = useState([])
  const [livestockLoading, setLivestockLoading] = useState(false)
  const [livestockError, setLivestockError] = useState('')

  const [batchCode, setBatchCode] = useState(generateRandomBatchCode())
  const [collectionDate, setCollectionDate] = useState(todayIsoDate())
  const [quantityLitres, setQuantityLitres] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!primaryFarm) return
    setLivestockLoading(true)
    getLivestockByFarm(primaryFarm.id)
      .then((data) => {
        setLivestock(data)
        // Automatically select the first animal if available for convenience
        if (data.length > 0) {
          setSelectedIds([data[0].id])
        }
      })
      .catch((err) => setLivestockError(resolveErrorMessage(err)))
      .finally(() => setLivestockLoading(false))
  }, [primaryFarm])

  function toggleAnimal(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function selectAllAnimals() {
    if (selectedIds.length === livestock.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(livestock.map((a) => a.id))
    }
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
        state: { successMessage: `Milk Batch ${created.batchCode} was recorded successfully!` },
      })
    } catch (err) {
      setFormError(resolveErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (farmsLoading) return <LoadingState label="Loading farm details…" />
  if (farmsError) return <ErrorState message={farmsError} />

  if (farms.length === 0) {
    return (
      <div className="page page--narrow">
        <h1>🥛 Create Milk Batch</h1>
        <div className="alert alert--danger" role="alert">
          You need a registered farm before recording milk batches.
        </div>
        <Link to="/farms/new" className="btn btn--primary">
          + Create Farm
        </Link>
      </div>
    )
  }

  return (
    <div className="page page--narrow">
      <div className="page__header">
        <div>
          <h1>🥛 Log New Milk Collection Batch</h1>
          <p className="page__note">Record milk volume and select cows included in this collection batch.</p>
        </div>
      </div>

      {formError && (
        <div className="alert alert--danger" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="card">
        <div className="field">
          <label htmlFor="batchCode">
            Batch Reference Code <span className="required">*</span>
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              id="batchCode"
              type="text"
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value)}
              disabled={submitting}
              placeholder="e.g. BATCH-2026-001"
              required
            />
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setBatchCode(generateRandomBatchCode())}
              title="Generate new code"
            >
              🔄 Auto
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="collectionDate">
            Collection Date <span className="required">*</span>
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
            Milk Quantity (Litres) <span className="required">*</span>
          </label>
          <input
            id="quantityLitres"
            type="number"
            min="0.01"
            step="0.1"
            placeholder="e.g. 250"
            value={quantityLitres}
            onChange={(e) => setQuantityLitres(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ margin: 0 }}>
              Select Cows / Animals Included <span className="required">*</span>
            </label>
            {livestock.length > 0 && (
              <button
                type="button"
                className="btn btn--ghost"
                style={{ padding: '2px 10px', fontSize: '0.8rem' }}
                onClick={selectAllAnimals}
              >
                {selectedIds.length === livestock.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {livestockLoading && <p>Loading farm livestock…</p>}
          {!livestockLoading && livestockError && <p className="card__note">{livestockError}</p>}
          {!livestockLoading && !livestockError && livestock.length === 0 && (
            <p className="field-note">
              No cows registered yet.{' '}
              <Link to="/livestock/new">Click here to add your first cow</Link>.
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
                    <strong>🐄 {animal.tagNumber}</strong> ({animal.species})
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
            {submitting ? 'Saving Batch…' : '🥛 Save Milk Batch'}
          </button>
        </div>
      </form>
    </div>
  )
}
