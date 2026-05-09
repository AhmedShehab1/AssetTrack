import React from 'react';
import Modal from '../common/Modal';
import AllocationModalContent from '../common/AllocationModalContent';

const AllocationModal = ({ isOpen, onClose, asset }) => {
  if (!asset) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={asset.brand + ' ' + asset.model}
      subtitle={`SN: ${asset.serialNumber}`}
    >
      <AllocationModalContent 
        assetId={asset.id} 
        assetName={`${asset.brand} ${asset.model}`}
        assetSN={asset.serialNumber}
        onComplete={onClose}
      />
    </Modal>
  );
};

export default AllocationModal;
