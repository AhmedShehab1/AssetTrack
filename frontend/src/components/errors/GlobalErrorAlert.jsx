/**
 * @fileoverview
 * GlobalErrorAlert — Displays top-level ApiError messages.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ApiErrorShape } from '../../api/types';
import styles from './GlobalErrorAlert.module.css';

const statusMeta = (status) => {
  if (status === 0) return { modifier: 'network', icon: '⚡' };
  if (status === 401) return { modifier: 'auth', icon: '🔒' };
  if (status === 403) return { modifier: 'auth', icon: '🚫' };
  if (status === 404) return { modifier: 'info', icon: '🔍' };
  if (status === 409) return { modifier: 'warning', icon: '⚠️' };
  if (status >= 500) return { modifier: 'server', icon: '🔧' };
  return { modifier: 'error', icon: '✕' };
};

const GlobalErrorAlert = ({ error, onDismiss, className }) => {
  if (!error) return null;

  const { modifier, icon } = statusMeta(error.status);
  const rootClass = [
    styles.alert,
    styles[`alert--${modifier}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div role="alert" aria-live="assertive" className={rootClass}>
      <span className={styles.alert__icon} aria-hidden="true">
        {icon}
      </span>

      <div className={styles.alert__body}>
        <p className={styles.alert__message}>{error.message}</p>

        {(error.status >= 500 || error.status === 0) && (
          <p className={styles.alert__detail}>
            {error.status === 0
              ? 'Could not connect to the server.'
              : `Server error (HTTP ${error.status}). Please try again or contact support.`}
          </p>
        )}
      </div>

      {onDismiss && (
        <button
          type="button"
          className={styles.alert__dismiss}
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  );
};

GlobalErrorAlert.propTypes = {
  error: ApiErrorShape,
  onDismiss: PropTypes.func,
  className: PropTypes.string,
};

GlobalErrorAlert.defaultProps = {
  error: null,
  onDismiss: undefined,
  className: '',
};

export default GlobalErrorAlert;