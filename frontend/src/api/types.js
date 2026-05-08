/**
 * @fileoverview
 * AssetTrack API — Canonical data-shape definitions.
 *
 * Every type here is derived directly from the OpenAPI 3.0.3 spec.
 * Update this file whenever the spec changes so the rest of the
 * codebase can rely on a single source of truth.
 *
 * Conventions:
 *  - JSDoc typedefs describe the *wire* shapes returned by the API.
 *  - PropTypes exports are used by React components for runtime validation.
 *  - Enum objects provide safe string constants for every OpenAPI `enum`.
 */

import PropTypes from 'prop-types';

/** @enum {string} */
export const UserRole = Object.freeze({
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  DEVELOPER: 'DEVELOPER',
});

/** @enum {string} */
export const AssetType = Object.freeze({
  LAPTOP: 'LAPTOP',
  MONITOR: 'MONITOR',
  KEYBOARD: 'KEYBOARD',
  MOUSE: 'MOUSE',
  HEADSET: 'HEADSET',
  DOCKING_STATION: 'DOCKING_STATION',
  OTHER: 'OTHER',
});

/** @enum {string} */
export const AssetStatus = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  ALLOCATED: 'ALLOCATED',
  UNDER_REPAIR: 'UNDER_REPAIR',
  DECOMMISSIONED: 'DECOMMISSIONED',
  SPARE: 'SPARE',
});

/** @enum {string} */
export const ConditionSeverity = Object.freeze({
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
});

/** @enum {string} */
export const ConditionReportStatus = Object.freeze({
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
});

/** @enum {string} */
export const NotificationType = Object.freeze({
  WARRANTY_EXPIRY: 'WARRANTY_EXPIRY',
  LOW_STOCK: 'LOW_STOCK',
  ASSET_ALLOCATED: 'ASSET_ALLOCATED',
  ASSET_RETURNED: 'ASSET_RETURNED',
  CONDITION_REPORT_OPENED: 'CONDITION_REPORT_OPENED',
  CONDITION_REPORT_RESOLVED: 'CONDITION_REPORT_RESOLVED',
});

/**
 * A single field-level validation failure.
 * Present inside `ApiError.fieldErrors` on HTTP 400 responses only.
 *
 * @typedef {Object} FieldError
 * @property {string} field         - The request body / query parameter name.
 * @property {string} rejectedValue - The value that failed validation.
 * @property {string} message       - Human-readable constraint description.
 */

/**
 * Standard error envelope returned on all 4xx / 5xx responses.
 *
 * @typedef {Object} ApiError
 * @property {string}       timestamp   - ISO-8601 UTC timestamp of the error.
 * @property {number}       status      - HTTP status code (e.g. 400, 401, 404).
 * @property {string}       error       - Short HTTP reason phrase (e.g. "Bad Request").
 * @property {string}       message     - Human-readable explanation of the error.
 * @property {string}       path        - Request URI that produced the error.
 * @property {FieldError[]} [fieldErrors] - Per-field failures; present on 400 only.
 */

export const FieldErrorShape = PropTypes.shape({
  field: PropTypes.string.isRequired,
  rejectedValue: PropTypes.string,
  message: PropTypes.string.isRequired,
});

export const ApiErrorShape = PropTypes.shape({
  timestamp: PropTypes.string.isRequired,
  status: PropTypes.number.isRequired,
  error: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  fieldErrors: PropTypes.arrayOf(FieldErrorShape),
});

/**
 * Pagination metadata included in every paginated response.
 *
 * @typedef {Object} PageMeta
 * @property {number} page          - Zero-based current page index.
 * @property {number} size          - Items requested per page.
 * @property {number} totalElements - Total items across all pages.
 * @property {number} totalPages    - Total number of pages available.
 */

export const PageMetaShape = PropTypes.shape({
  page: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  totalElements: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
});

/**
 * @typedef {Object} UserSummary
 * @property {string}   id       - UUID
 * @property {string}   email
 * @property {string}   fullName
 * @property {UserRole} role
 */
export const UserSummaryShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  role: PropTypes.oneOf(Object.values(UserRole)).isRequired,
});

/**
 * @typedef {Object} AssetResponse
 * @property {string}          id
 * @property {AssetType}       type
 * @property {string}          brand
 * @property {string}          model
 * @property {string}          serialNumber
 * @property {string}          purchaseDate             - YYYY-MM-DD
 * @property {string}          warrantyExpirationDate   - YYYY-MM-DD
 * @property {AssetStatus}     status
 * @property {boolean}         warrantyExpired
 * @property {number}          [warrantyExpiresInDays]
 * @property {UserSummary}     [currentOwner]
 * @property {string}          [notes]
 * @property {string}          createdAt
 * @property {string}          updatedAt
 */
export const AssetResponseShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(Object.values(AssetType)).isRequired,
  brand: PropTypes.string.isRequired,
  model: PropTypes.string.isRequired,
  serialNumber: PropTypes.string.isRequired,
  purchaseDate: PropTypes.string.isRequired,
  warrantyExpirationDate: PropTypes.string.isRequired,
  status: PropTypes.oneOf(Object.values(AssetStatus)).isRequired,
  warrantyExpired: PropTypes.bool.isRequired,
  warrantyExpiresInDays: PropTypes.number,
  currentOwner: UserSummaryShape,
  notes: PropTypes.string,
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
});

/**
 * Generic paged response wrapper.
 *
 * @template T
 * @typedef {Object} PagedResponse
 * @property {T[]}      content
 * @property {PageMeta} meta
 */

/**
 * Returns a PropTypes shape for any paginated response.
 * @param {PropTypes.Requireable} itemShape - PropTypes shape for a single item.
 * @returns {PropTypes.Requireable}
 */
export const pagedResponseShape = (itemShape) =>
  PropTypes.shape({
    content: PropTypes.arrayOf(itemShape).isRequired,
    meta: PageMetaShape.isRequired,
  });