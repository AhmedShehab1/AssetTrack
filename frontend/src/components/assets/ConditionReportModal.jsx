import React from 'react';
import Modal from '../common/Modal';
import ConditionReportForm from './ConditionReportForm';

const ConditionReportModal = ({ isOpen, onClose, asset }) => {
  if (!asset) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Condition Report"
      subtitle={`SN: ${asset.serialNumber}`}
    >
      <ConditionReportForm
        assetId={asset.id}
        assetName={`${asset.brand} ${asset.model}`}
        onComplete={onClose}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default ConditionReportModal;
