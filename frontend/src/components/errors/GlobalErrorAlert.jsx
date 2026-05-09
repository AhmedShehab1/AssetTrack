/**
 * @fileoverview
 * GlobalErrorAlert — Displays top-level ApiError messages.
 *
 * Use this whenever an API call fails and you want to surface a
 * banner-style message to the user.  It handles all status codes
 * with contextually appropriate copy and styling.
 *
 * @example
 * // Inside a form component after a failed submission:
 * {apiError && <GlobalErrorAlert error={apiError} onDismiss={() => setApiError(null)} />}
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ApiErrorShape } from '../../api/types';
import styles from './GlobalErrorAlert.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps HTTP status codes to a CSS modifier class and an icon character.
 * @param {number} status
 * @returns {{ modifier: string, icon: string }}
 */
const statusMeta = (status) => {
  if (status === 0) return { modifier: 'network', icon: '⚡' };
  if (status === 401) return { modifier: 'auth', icon: '🔒' };
  if (status === 403) return { modifier: 'auth', icon: '🚫' };
  if (status === 404) return { modifier: 'info', icon: '🔍' };
  if (status === 409) return { modifier: 'warning', icon: '⚠️' };
  if (status >= 500) return { modifier: 'server', icon: '🔧' };
  return { modifier: 'error', icon: '✕' };
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Banner-style alert for top-level API errors.
 *
 * @param {object}   props
 * @param {ApiError} props.error      - The structured error from the API client.
 * @param {Function} [props.onDismiss] - Called when the user closes the alert.
 *                                       Omit to render without a close button.
 * @param {string}   [props.className] - Additional CSS class(es) for layout.
 */
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

        {/* Show status context for 5xx / network so devs can debug */}
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
  /** Structured ApiError returned by the API client interceptor. */
  error: ApiErrorShape,
  /** Optional dismiss callback; omitting it hides the close button. */
  onDismiss: PropTypes.func,
  /** Additional class(es) for positioning / spacing from the parent layout. */
  className: PropTypes.string,
};

GlobalErrorAlert.defaultProps = {
  error: null,
  onDismiss: undefined,
  className: '',
};

export default GlobalErrorAlert;
