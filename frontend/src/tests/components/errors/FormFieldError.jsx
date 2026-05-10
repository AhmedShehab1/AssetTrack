/**
 * @fileoverview
 * FormFieldError — Inline field-level validation message.
 *
 * Sits directly beneath an <input> (or any form control).  It receives the
 * full `fieldErrors` array from an `ApiError` (HTTP 400) and the name of the
 * field it guards.  It filters, finds the first matching error, and renders it.
 *
 * Rendering nothing when there is no matching error makes it safe to always
 * mount — no conditional rendering needed at the call site.
 *
 * @example
 * <label htmlFor="serialNumber">Serial Number</label>
 * <input
 *   id="serialNumber"
 *   name="serialNumber"
 *   aria-describedby="serialNumber-error"
 *   aria-invalid={hasFieldError(fieldErrors, 'serialNumber')}
 * />
 * <FormFieldError
 *   id="serialNumber-error"
 *   fieldName="serialNumber"
 *   fieldErrors={apiError?.fieldErrors}
 * />
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FieldErrorShape } from '../../api/types';
import styles from './FormFieldError.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// Pure helper — exported so forms can check before submitting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true when `fieldErrors` contains at least one error for `fieldName`.
 *
 * @param {import('../../api/types').FieldError[] | undefined} fieldErrors
 * @param {string} fieldName
 * @returns {boolean}
 */
export const hasFieldError = (fieldErrors, fieldName) =>
  Array.isArray(fieldErrors) &&
  fieldErrors.some((e) => e.field === fieldName);

/**
 * Returns all error messages for a given field, or an empty array.
 *
 * @param {import('../../api/types').FieldError[] | undefined} fieldErrors
 * @param {string} fieldName
 * @returns {string[]}
 */
export const getFieldMessages = (fieldErrors, fieldName) => {
  if (!Array.isArray(fieldErrors)) return [];
  return fieldErrors
    .filter((e) => e.field === fieldName)
    .map((e) => e.message);
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders the first (or all) validation messages for a specific form field.
 *
 * @param {object}        props
 * @param {string}        props.fieldName   - Must match `FieldError.field` exactly.
 * @param {FieldError[]}  [props.fieldErrors] - Array from `ApiError.fieldErrors`.
 * @param {string}        [props.id]         - Set to match the input's `aria-describedby`.
 * @param {boolean}       [props.showAll]    - When true, render all messages; default: first only.
 * @param {string}        [props.className]  - Additional CSS class(es).
 */
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
    <span
      id={id}
      role="alert"
      aria-live="polite"
      className={rootClass}
    >
      {displayMessages.map((msg, i) => (
        <span key={i} className={styles.fieldError__message}>
          {/* Decorative triangle pointer */}
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
  /** The field name to look up — must match `FieldError.field` from the server. */
  fieldName: PropTypes.string.isRequired,
  /** The full `fieldErrors` array from an `ApiError` object. */
  fieldErrors: PropTypes.arrayOf(FieldErrorShape),
  /** Should match `aria-describedby` on the associated input. */
  id: PropTypes.string,
  /** Render all messages for the field instead of just the first. */
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
