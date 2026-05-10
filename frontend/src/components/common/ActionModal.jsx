import React from 'react';
import Modal from './Modal';
import AllocationModalContent from './AllocationModalContent';
import AssetEditForm from '../assets/AssetEditForm';
import ConditionReportForm from '../assets/ConditionReportForm';
import UserForm from '../users/UserForm';

/**
 * Registry-based polymorphic modal component.
 * Centralizes all action modals to ensure unified behavior (smooth slide, height sync).
 */
const ActionModal = ({ isOpen, onClose, type, payload, onSuccess, onRefresh }) => {
  if (!type) return null;

  const getModalConfig = () => {
    switch (type) {
      case 'ALLOCATE':
        return {
          title: payload?.brand ? `${payload.brand} ${payload.model}` : 'Asset Allocation',
          subtitle: payload?.serialNumber ? `SN: ${payload.serialNumber}` : 'Assign hardware to member',
          content: (
            <AllocationModalContent 
              assetId={payload?.id}
              assetName={`${payload?.brand} ${payload?.model}`}
              assetSN={payload?.serialNumber}
              onComplete={onClose}
              onSuccess={(userSummary) => {
                if (onSuccess) {
                  onSuccess(payload.id, { status: 'ALLOCATED', currentOwner: userSummary });
                }
              }}
            />
          )
        };

      case 'EDIT_ASSET':
        return {
          title: 'Edit Asset Details',
          subtitle: `Modifying inventory record for SN: ${payload?.serialNumber}`,
          content: (
            <AssetEditForm 
              asset={payload}
              onClose={onClose}
              onUpdate={onSuccess}
              onRefresh={onRefresh}
            />
          )
        };

      case 'REPORT_ISSUE':
        return {
          title: 'Submit Condition Report',
          subtitle: `Reporting issue for ${payload?.brand} ${payload?.model}`,
          content: (
            <ConditionReportForm 
              assetId={payload?.id}
              assetName={`${payload?.brand} ${payload?.model}`}
              onComplete={() => {
                onRefresh?.();
                onClose();
              }}
              onCancel={onClose}
            />
          )
        };

      case 'USER':
        const isEdit = !!payload;
        return {
          title: isEdit ? 'Update Member Authority' : 'Add New Member',
          subtitle: isEdit ? `Managing role and status for ${payload?.email}` : 'Invite a new team member to the platform',
          content: (
            <UserForm 
              user={payload}
              onClose={onClose}
              onRefresh={onRefresh}
            />
          )
        };

      default:
        return { title: 'Action', subtitle: '', content: null };
    }
  };

  const config = getModalConfig();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      subtitle={config.subtitle}
    >
      {config.content}
    </Modal>
  );
};

export default ActionModal;
