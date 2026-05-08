/**
 * @fileoverview
 * AssetRegistrationForm.jsx — Register new hardware assets.
 * Migrated to use useCreateAsset hook with centralized error handling.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import GlobalErrorAlert from '../errors/GlobalErrorAlert';
import FormFieldError, { hasFieldError } from '../errors/FormFieldError';
import { useCreateAsset } from '../../hooks/useAssetTrack';
import { AssetType } from '../../api/types';

const EMPTY_FORM = {
  type: '',
  brand: '',
  model: '',
  serialNumber: '',
  purchaseDate: '',
  warrantyExpirationDate: '',
  notes: '',
};

const AssetRegistrationForm = ({ onSuccess }) => {
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
    <main className="flex-1 overflow-y-auto p-container-padding flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="mb-spacing-lg">
          <h2 className="font-headline-md text-headline-md text-text-heading">Register New Asset</h2>
          <p className="font-body-md text-body-md text-text-body mt-1">Enter the details for the new asset to add it to the registry.</p>
        </div>
        <div className="bg-surface-card rounded-lg shadow-[0_4px_6px_-1px_rgb(0,0,0,0.1)] border border-slate-200 overflow-hidden">
          <form className="p-spacing-lg space-y-spacing-lg" onSubmit={handleSubmit} noValidate>
            {showBanner && (
              <GlobalErrorAlert error={error} onDismiss={clearError} />
            )}

            {hasFieldErrors && (
              <GlobalErrorAlert
                error={{ ...error, message: 'Please fix the highlighted fields below.' }}
              />
            )}

            {/* Core Details Grid */}
            <div>
              <h3 className="font-headline-sm text-headline-sm text-text-heading mb-spacing-md border-b border-slate-100 pb-2">Hardware Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-md">
                <div>
                  <label htmlFor="type" className="block font-label-caps text-label-caps text-text-heading mb-2">
                    Asset Type <span aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="type"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      className="w-full appearance-none bg-white border border-outline-variant rounded-DEFAULT py-2 pl-3 pr-10 font-body-md text-body-md text-text-heading focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                      {...ariaProps('type')}
                    >
                      <option value="">Select type…</option>
                      {Object.values(AssetType).map((t) => (
                        <option key={t} value={t}>{t.replace('_', ' ')}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <span className="material-symbols-outlined text-sm">expand_more</span>
                    </div>
                  </div>
                  <FormFieldError id="type-error" fieldName="type" fieldErrors={error?.fieldErrors} />
                </div>

                <div>
                  <label htmlFor="brand" className="block font-label-caps text-label-caps text-text-heading mb-2">
                    Brand <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="brand"
                    name="brand"
                    type="text"
                    value={form.brand}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    className="w-full bg-white border border-outline-variant rounded-DEFAULT py-2 px-3 font-body-md text-body-md text-text-heading focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400"
                    placeholder="e.g. Dell, Apple"
                    required
                    {...ariaProps('brand')}
                  />
                  <FormFieldError id="brand-error" fieldName="brand" fieldErrors={error?.fieldErrors} />
                </div>

                <div>
                  <label htmlFor="model" className="block font-label-caps text-label-caps text-text-heading mb-2">
                    Model <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="model"
                    name="model"
                    type="text"
                    value={form.model}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    className="w-full bg-white border border-outline-variant rounded-DEFAULT py-2 px-3 font-body-md text-body-md text-text-heading focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400"
                    placeholder="e.g. Latitude 7420"
                    required
                    {...ariaProps('model')}
                  />
                  <FormFieldError id="model-error" fieldName="model" fieldErrors={error?.fieldErrors} />
                </div>

                <div>
                  <label htmlFor="serialNumber" className="block font-label-caps text-label-caps text-text-heading mb-2">
                    Serial Number <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="serialNumber"
                    name="serialNumber"
                    type="text"
                    value={form.serialNumber}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    className="w-full bg-white border border-outline-variant rounded-DEFAULT py-2 px-3 font-data-mono text-data-mono text-text-heading focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400"
                    placeholder="Enter serial/service tag"
                    required
                    {...ariaProps('serialNumber')}
                  />
                  <FormFieldError id="serialNumber-error" fieldName="serialNumber" fieldErrors={error?.fieldErrors} />
                  <span className="text-xs text-slate-500 mt-1 block">
                    Uppercase letters, digits, and hyphens only · 4–30 characters
                  </span>
                </div>
              </div>
            </div>

            {/* Lifecycle Grid */}
            <div>
              <h3 className="font-headline-sm text-headline-sm text-text-heading mb-spacing-md border-b border-slate-100 pb-2">Lifecycle Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-md">
                <div>
                  <label htmlFor="purchaseDate" className="block font-label-caps text-label-caps text-text-heading mb-2">
                    Purchase Date <span aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">calendar_today</span>
                    <input
                      id="purchaseDate"
                      name="purchaseDate"
                      type="date"
                      value={form.purchaseDate}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      className="w-full bg-white border border-outline-variant rounded-DEFAULT py-2 pl-10 pr-3 font-body-md text-body-md text-text-heading focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-slate-600"
                      required
                      {...ariaProps('purchaseDate')}
                    />
                  </div>
                  <FormFieldError id="purchaseDate-error" fieldName="purchaseDate" fieldErrors={error?.fieldErrors} />
                </div>

                <div>
                  <label htmlFor="warrantyExpirationDate" className="block font-label-caps text-label-caps text-text-heading mb-2">
                    Warranty Expiration <span aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">verified_user</span>
                    <input
                      id="warrantyExpirationDate"
                      name="warrantyExpirationDate"
                      type="date"
                      value={form.warrantyExpirationDate}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      className="w-full bg-white border border-outline-variant rounded-DEFAULT py-2 pl-10 pr-3 font-body-md text-body-md text-text-heading focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-slate-600"
                      required
                      {...ariaProps('warrantyExpirationDate')}
                    />
                  </div>
                  <FormFieldError id="warrantyExpirationDate-error" fieldName="warrantyExpirationDate" fieldErrors={error?.fieldErrors} />
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h3 className="font-headline-sm text-headline-sm text-text-heading mb-spacing-md border-b border-slate-100 pb-2">Additional Details</h3>
              <div>
                <label htmlFor="notes" className="block font-label-caps text-label-caps text-text-heading mb-2">
                  Condition Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  className="w-full bg-white border border-outline-variant rounded-DEFAULT py-2 px-3 font-body-md text-body-md text-text-heading focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder-slate-400 resize-none"
                  placeholder="Note any existing damage, included accessories, or special configurations..."
                  rows="4"
                  {...ariaProps('notes')}
                />
                <FormFieldError id="notes-error" fieldName="notes" fieldErrors={error?.fieldErrors} />
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex justify-end gap-3 pt-spacing-md">
              <button
                className="px-4 py-2 font-body-md text-body-md font-medium text-slate-600 bg-white border border-slate-300 rounded-DEFAULT hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors"
                type="button"
                onClick={() => setForm(EMPTY_FORM)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 font-body-md text-body-md font-medium text-white bg-primary rounded-DEFAULT hover:bg-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
                aria-busy={loading}
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
                {loading ? 'Saving asset…' : 'Save Asset'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default AssetRegistrationForm;

AssetRegistrationForm.propTypes = {
  onSuccess: PropTypes.func,
};

AssetRegistrationForm.defaultProps = {
  onSuccess: undefined,
};
