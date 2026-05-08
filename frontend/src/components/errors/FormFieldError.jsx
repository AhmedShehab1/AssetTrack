/**
 * @fileoverview
 * FormFieldError — Inline field-level validation message.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FieldErrorShape } from '../../api/types';
import styles from './FormFieldError.module.css';

export const hasFieldError = (fieldErrors, fieldName) =>
  Array.isArray(fieldErrors) &&
  fieldErrors.some((e) => e.field === fieldName);

export const getFieldMessages = (fieldErrors, fieldName) => {
  if (!Array.isArray(fieldErrors)) return [];
  return fieldErrors
    .filter((e) => e.field === fieldName)
    .map((e) => e.message);
};

const FormFieldError = ({
  fieldName,
  fieldErrors,
  id,
  showAll,
  className,
}) => {
  const messages = getFieldMessages(fieldErrors, fieldName);

  if (messages.length === 0) return null;

  const displayMessages = showAll ? messages : [messages[0]];
  const rootClass = [styles.fieldError, className].filter(Boolean).join(' ');

  return (
    <span id={id} role="alert" aria-live="polite" className={rootClass}>
      {displayMessages.map((msg) => (
        <span key={`${fieldName}-${msg}`} className={styles.fieldError__message}>
          <span className={styles.fieldError__bullet} aria-hidden="true">
            ▲
          </span>
          {msg}
        </span>
      ))}
    </span>
  );
};

FormFieldError.propTypes = {
  fieldName: PropTypes.string.isRequired,
  fieldErrors: PropTypes.arrayOf(FieldErrorShape),
  id: PropTypes.string,
  showAll: PropTypes.bool,
  className: PropTypes.string,
};

FormFieldError.defaultProps = {
  fieldErrors: [],
  id: undefined,
  showAll: false,
  className: '',
};

export default FormFieldError;