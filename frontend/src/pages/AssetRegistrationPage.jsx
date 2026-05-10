import React from 'react';
import { useNavigate } from 'react-router-dom';
import AssetRegistrationForm from '../components/assets/AssetRegistrationForm';
import { ChevronLeft } from 'lucide-react';
import Button from '../components/common/Button';

const AssetRegistrationPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Redirect to assets list or dashboard on success
    navigate('/assets');
  };

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="mb-8 px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/assets')} 
          icon={ChevronLeft}
          className="mb-4"
        >
          Back to Assets
        </Button>
        <h1 className="text-3xl font-extrabold text-text-heading">Asset Inventory</h1>
        <p className="text-text-body mt-2">Manage and track your organization's hardware assets.</p>
      </div>

      <div className="px-4">
        <AssetRegistrationForm 
          onSuccess={handleSuccess} 
          onCancel={() => navigate('/assets')} 
        />
      </div>
    </div>
  );
};

export default AssetRegistrationPage;
