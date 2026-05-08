/**
 * @fileoverview
 * CreateAssetForm.jsx — Full worked example.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import GlobalErrorAlert from '../errors/GlobalErrorAlert';
import FormFieldError, { hasFieldError } from '../errors/FormFieldError';
import { useCreateAsset } from '../../hooks/useAssetTrack';
import { AssetType } from '../../api/types';
import styles from './CreateAssetForm.module.css';

const EMPTY_FORM = {
  type: '',
  brand: '',
  model: '',
  serialNumber: '',
  purchaseDate: '',
  warrantyExpirationDate: '',
  notes: '',
};

const CreateAssetForm = ({ onSuccess }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const { createAsset, loading, error, clearError } = useCreateAsset();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocus = () => {
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const asset = await createAsset(form);
    if (asset) {
      setForm(EMPTY_FORM);
      onSuccess?.(asset);
    }
  };

  const hasFieldErrors = Array.isArray(error?.fieldErrors) && error.fieldErrors.length > 0;
  const showBanner = error && !hasFieldErrors;

  const ariaProps = (fieldName) => ({
    'aria-describedby': `${fieldName}-error`,
    'aria-invalid': hasFieldError(error?.fieldErrors, fieldName) || undefined,
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {showBanner && (
        <GlobalErrorAlert
          error={error}
          onDismiss={clearError}
          className={styles.form__banner}
        />
      )}

      {hasFieldErrors && (
        <GlobalErrorAlert
          error={{ ...error, message: 'Please fix the highlighted fields below.' }}
          className={styles.form__banner}
        />
      )}

      <div className={styles.field}>
        <label htmlFor="type" className={styles.field__label}>
          Asset Type <span aria-hidden="true">*</span>
        </label>
        <select
          id="type"
          name="type"
          value={form.type}
          onChange={handleChange}
          onFocus={handleFocus}
          className={styles.field__input}
          required
          {...ariaProps('type')}
        >
          <option value="">Select type…</option>
          {Object.values(AssetType).map((t) => (
            <option key={t} value={t}>{t.replace('_', ' ')}</option>
          ))}
        </select>
        <FormFieldError id="type-error" fieldName="type" fieldErrors={error?.fieldErrors} />
      </div>

      <div className={styles.field}>
        <label htmlFor="brand" className={styles.field__label}>
          Brand <span aria-hidden="true">*</span>
        </label>
        <input
          id="brand"
          name="brand"
          type="text"
          value={form.brand}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder="e.g. Dell"
          className={styles.field__input}
          required
          {...ariaProps('brand')}
        />
        <FormFieldError id="brand-error" fieldName="brand" fieldErrors={error?.fieldErrors} />
      </div>

      <div className={styles.field}>
        <label htmlFor="model" className={styles.field__label}>
          Model <span aria-hidden="true">*</span>
        </label>
        <input
          id="model"
          name="model"
          type="text"
          value={form.model}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder="e.g. XPS 15 9530"
          className={styles.field__input}
          required
          {...ariaProps('model')}
        />
        <FormFieldError id="model-error" fieldName="model" fieldErrors={error?.fieldErrors} />
      </div>

      <div className={styles.field}>
        <label htmlFor="serialNumber" className={styles.field__label}>
          Serial Number <span aria-hidden="true">*</span>
        </label>
        <input
          id="serialNumber"
          name="serialNumber"
          type="text"
          value={form.serialNumber}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder="e.g. DL-XPS15-20240512"
          className={styles.field__input}
          required
          {...ariaProps('serialNumber')}
        />
        <FormFieldError id="serialNumber-error" fieldName="serialNumber" fieldErrors={error?.fieldErrors} />
        <span className={styles.field__hint}>
          Uppercase letters, digits, and hyphens only · 4–30 characters
        </span>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="purchaseDate" className={styles.field__label}>
            Purchase Date <span aria-hidden="true">*</span>
          </label>
          <input
            id="purchaseDate"
            name="purchaseDate"
            type="date"
            value={form.purchaseDate}
            onChange={handleChange}
            onFocus={handleFocus}
            className={styles.field__input}
            required
            {...ariaProps('purchaseDate')}
          />
          <FormFieldError id="purchaseDate-error" fieldName="purchaseDate" fieldErrors={error?.fieldErrors} />
        </div>

        <div className={styles.field}>
          <label htmlFor="warrantyExpirationDate" className={styles.field__label}>
            Warranty Expiry <span aria-hidden="true">*</span>
          </label>
          <input
            id="warrantyExpirationDate"
            name="warrantyExpirationDate"
            type="date"
            value={form.warrantyExpirationDate}
            onChange={handleChange}
            onFocus={handleFocus}
            className={styles.field__input}
            required
            {...ariaProps('warrantyExpirationDate')}
          />
          <FormFieldError id="warrantyExpirationDate-error" fieldName="warrantyExpirationDate" fieldErrors={error?.fieldErrors} />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="notes" className={styles.field__label}>
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          onFocus={handleFocus}
          rows={3}
          className={styles.field__input}
          {...ariaProps('notes')}
        />
        <FormFieldError id="notes-error" fieldName="notes" fieldErrors={error?.fieldErrors} />
      </div>

      <button
        type="submit"
        className={styles.form__submit}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? 'Saving asset…' : 'Register Asset'}
      </button>
    </form>
  );
};

export default CreateAssetForm;

CreateAssetForm.propTypes = {
  onSuccess: PropTypes.func,
};

CreateAssetForm.defaultProps = {
  onSuccess: undefined,
};