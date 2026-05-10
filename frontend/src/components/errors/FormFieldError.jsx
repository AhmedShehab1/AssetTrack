import React from 'react';

/**
 * Helper to check if a specific field has an error.
 */
export const hasFieldError = (fieldErrors, fieldName) => {
  return Array.isArray(fieldErrors) && fieldErrors.some((fe) => fe.field === fieldName);
};

const FormFieldError = ({ id, fieldName, fieldErrors, className = '' }) => {
  if (!Array.isArray(fieldErrors)) return null;

  const error = fieldErrors.find((fe) => fe.field === fieldName);
  if (!error) return null;

  return (
    <p
      id={id}
      className={`mt-1 text-xs text-red-600 font-medium ${className}`}
      role="alert"
    >
      {error.message}
    </p>
  );
};

export default FormFieldError;

