import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createLivestock } from '../api/livestockApi'
import { resolveErrorMessage } from '../api/errors'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import { useMyFarms } from '../hooks/useMyFarms'

const SPECIES_OPTIONS = ['COW', 'BUFFALO', 'GOAT', 'SHEEP', 'OTHER']

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10)
}

function validate({ tagNumber, species, dateOfBirth, effectiveFarmId }) {
  if (!tagNumber.trim()) return 'Please enter a tag number.'
  if (!species) return 'Please select a species.'
  if (!effectiveFarmId) return 'Please select a farm.'
  if (dateOfBirth && dateOfBirth > todayIsoDate()) return 'Date of birth cannot be in the future.'
  return ''
}

export default function LivestockFormPage() {
  const navigate = useNavigate()
  const { farms, loading: farmsLoading, error: farmsError } = useMyFarms()

  const [tagNumber, setTagNumber] = useState('')
  const [species, setSpecies] = useState('COW')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [farmId, setFarmId] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const effectiveFarmId = farms.length === 1 ? farms[0].id : farmId

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validate({ tagNumber, species, dateOfBirth, effectiveFarmId })
    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError('')
    setSubmitting(true)
    try {
      const created = await createLivestock({
        tagNumber: tagNumber.trim(),
        species,
        dateOfBirth: dateOfBirth || null,
        farmId: Number(effectiveFarmId),
      })
      navigate('/livestock', {
        replace: true,
        state: { successMessage: `${created.tagNumber} was added successfully.` },
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
        <h1>Add Livestock</h1>
        <div className="alert alert--danger" role="alert">
          You need a registered farm before you can add livestock.
        </div>
        <Link to="/livestock" className="btn btn--ghost">
          Back to Livestock
        </Link>
      </div>
    )
  }

  return (
    <div className="page page--narrow">
      <h1>Add Livestock</h1>

      {formError && (
        <div className="alert alert--danger" role="alert">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="card">
        <div className="field">
          <label htmlFor="tagNumber">
            Tag number <span className="required">*</span>
          </label>
          <input
            id="tagNumber"
            type="text"
            value={tagNumber}
            onChange={(e) => setTagNumber(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="species">
            Species <span className="required">*</span>
          </label>
          <select
            id="species"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            disabled={submitting}
            required
          >
            {SPECIES_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0) + option.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="dateOfBirth">Date of birth</label>
          <input
            id="dateOfBirth"
            type="date"
            value={dateOfBirth}
            max={todayIsoDate()}
            onChange={(e) => setDateOfBirth(e.target.value)}
            disabled={submitting}
          />
        </div>

        {farms.length > 1 && (
          <div className="field">
            <label htmlFor="farmId">
              Farm <span className="required">*</span>
            </label>
            <select
              id="farmId"
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              disabled={submitting}
              required
            >
              <option value="">Select a farm…</option>
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {farms.length === 1 && (
          <p className="field-note">
            Adding to farm: <strong>{farms[0].name}</strong>
          </p>
        )}

        <div className="form-actions">
          <Link to="/livestock" className="btn btn--ghost">
            Cancel
          </Link>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add Livestock'}
          </button>
        </div>
      </form>
    </div>
  )
}
