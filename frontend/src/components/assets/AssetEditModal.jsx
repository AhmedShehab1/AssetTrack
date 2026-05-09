import React, { useState, useEffect } from 'react';
import { Save, X, Box, Info, Calendar, ShieldCheck, Tag } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { useUpdateAsset } from '../../hooks/api/useAssets';
import { AssetType, AssetStatus } from '../../api/types';
import GlobalErrorAlert from '../errors/GlobalErrorAlert';
import FormFieldError from '../errors/FormFieldError';

const AssetEditModal = ({ isOpen, onClose, asset, onRefresh }) => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyExpirationDate: '',
    status: '',
    notes: '',
  });

  const { updateAsset, loading, error, clearError } = useUpdateAsset();

  useEffect(() => {
    if (asset && isOpen) {
      setFormData({
        brand: asset.brand || '',
        model: asset.model || '',
        serialNumber: asset.serialNumber || '',
        purchaseDate: asset.purchaseDate || '',
        warrantyExpirationDate: asset.warrantyExpirationDate || '',
        status: asset.status || '',
        notes: asset.notes || '',
      });
    }
  }, [asset, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateAsset(asset.id, formData);
    if (result) {
      onRefresh?.();
      onClose();
    }
  };

  if (!asset) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Asset Details"
      subtitle={`Modifying inventory record for SN: ${asset.serialNumber}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6 font-sans">
        {error && <GlobalErrorAlert error={error} onDismiss={clearError} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="BRAND"
            name="brand"
            icon={Box}
            value={formData.brand}
            onChange={handleChange}
            error={error?.fieldErrors?.find(fe => fe.field === 'brand')?.message}
          />
          <Input 
            label="MODEL"
            name="model"
            icon={Info}
            value={formData.model}
            onChange={handleChange}
            error={error?.fieldErrors?.find(fe => fe.field === 'model')?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="SERIAL NUMBER"
            name="serialNumber"
            icon={Tag}
            value={formData.serialNumber}
            onChange={handleChange}
            error={error?.fieldErrors?.find(fe => fe.field === 'serialNumber')?.message}
          />
          <div className="flex flex-col space-y-1.5 w-full">
            <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">LIFECYCLE STATUS</label>
            <div className="relative">
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold text-text-heading focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary appearance-none transition-all"
              >
                {Object.values(AssetStatus).map(s => (
                  <option 
                    key={s} 
                    value={s}
                    disabled={s === 'DECOMMISSIONED' && asset.status === 'ALLOCATED'}
                  >
                    {s.replace('_', ' ')} {s === 'DECOMMISSIONED' && asset.status === 'ALLOCATED' ? '(Return to inventory first)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="PURCHASE DATE"
            name="purchaseDate"
            type="date"
            icon={Calendar}
            value={formData.purchaseDate}
            onChange={handleChange}
          />
          <Input 
            label="WARRANTY EXPIRATION"
            name="warrantyExpirationDate"
            type="date"
            icon={ShieldCheck}
            value={formData.warrantyExpirationDate}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Administrative Notes</label>
          <textarea 
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Technical specs, procurement details, etc..."
            className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm text-text-heading focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant mt-10">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="primary" icon={Save} loading={loading} disabled={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssetEditModal;
