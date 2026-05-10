/**
 * @fileoverview
 * AssetRegistrationForm.jsx — Register new hardware assets.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Save, X, Box, Info, Calendar, ShieldCheck, Tag } from 'lucide-react';
import GlobalErrorAlert from '../errors/GlobalErrorAlert';
import FormFieldError, { hasFieldError } from '../errors/FormFieldError';
import { useCreateAsset } from '../../hooks/useAssetTrack';
import { AssetType } from '../../api/types';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

const EMPTY_FORM = {
  type: '',
  brand: '',
  model: '',
  serialNumber: '',
  purchaseDate: '',
  warrantyExpirationDate: '',
  notes: '',
};

const AssetRegistrationForm = ({ onSuccess, onCancel }) => {
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

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl" padding="p-8">
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <div className="border-b border-outline-variant pb-5 mb-8">
          <h2 className="text-2xl font-extrabold text-text-heading flex items-center gap-3">
            <Box className="text-primary" size={28} />
            Register New Hardware
          </h2>
          <p className="text-text-body text-sm mt-2 font-medium">Add a new technical asset to the organizational inventory.</p>
        </div>

        {showBanner && (
          <GlobalErrorAlert error={error} onDismiss={clearError} />
        )}

        {hasFieldErrors && (
          <GlobalErrorAlert
            error={{ ...error, message: 'Please correct the highlighted errors in the form.' }}
          />
        )}

        {/* Core Identity Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest border-l-4 border-primary pl-3">
            Identity & Classification
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-1.5 w-full">
              <label htmlFor="type" className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.08em] mb-0.5">
                ASSET TYPE *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Tag className="h-4.5 w-4.5 text-gray-400" size={18} strokeWidth={1.5} />
                </div>
                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  className={`
                    block w-full pl-10 pr-10 py-3.5 
                    bg-white border border-gray-200 
                    rounded-xl text-gray-900 text-sm appearance-none
                    focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary
                    transition-all duration-200
                    ${hasFieldError(error?.fieldErrors, 'type') ? 'border-red-500 ring-red-500/10' : ''}
                  `}
                  required
                >
                  <option value="">Select Category...</option>
                  {Object.values(AssetType).map((t) => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400">
                  <Save className="h-4 w-4" size={16} />
                </div>
              </div>
              <FormFieldError fieldName="type" fieldErrors={error?.fieldErrors} />
            </div>

            <Input
              label="SERIAL NUMBER / TAG *"
              name="serialNumber"
              placeholder="e.g. SN-8239-X"
              icon={Tag}
              value={form.serialNumber}
              onChange={handleChange}
              onFocus={handleFocus}
              error={error?.fieldErrors?.find(fe => fe.field === 'serialNumber')?.message}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="BRAND *"
              name="brand"
              placeholder="e.g. Dell, Apple, Lenovo"
              icon={Box}
              value={form.brand}
              onChange={handleChange}
              onFocus={handleFocus}
              error={error?.fieldErrors?.find(fe => fe.field === 'brand')?.message}
              required
            />
            <Input
              label="MODEL *"
              name="model"
              placeholder="e.g. Latitude 5420, MacBook Pro"
              icon={Info}
              value={form.model}
              onChange={handleChange}
              onFocus={handleFocus}
              error={error?.fieldErrors?.find(fe => fe.field === 'model')?.message}
              required
            />
          </div>
        </div>

        {/* Lifecycle Section */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest border-l-4 border-primary pl-3">
            Lifecycle & Warranty
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="PURCHASE DATE *"
              name="purchaseDate"
              type="date"
              icon={Calendar}
              value={form.purchaseDate}
              onChange={handleChange}
              onFocus={handleFocus}
              error={error?.fieldErrors?.find(fe => fe.field === 'purchaseDate')?.message}
              required
            />
            <Input
              label="WARRANTY EXPIRATION *"
              name="warrantyExpirationDate"
              type="date"
              icon={ShieldCheck}
              value={form.warrantyExpirationDate}
              onChange={handleChange}
              onFocus={handleFocus}
              error={error?.fieldErrors?.find(fe => fe.field === 'warrantyExpirationDate')?.message}
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <label htmlFor="notes" className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.08em]">
            CONDITION NOTES (OPTIONAL)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={form.notes}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="Document initial condition, included accessories..."
            className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end items-center gap-4 pt-6 border-t border-outline-variant mt-10">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel || (() => setForm(EMPTY_FORM))}
            icon={X}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
            icon={Save}
          >
            {loading ? 'Registering...' : 'Register Asset'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AssetRegistrationForm;

AssetRegistrationForm.propTypes = {
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};
