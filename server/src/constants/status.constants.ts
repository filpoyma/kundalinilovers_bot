export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  DATABASE_ERROR: 'Database error',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later.',
  TOO_MANY_REQUESTS_FROM_IP: 'Too many requests from this IP, please try again later.',
} as const;

export const SUCCESS_MESSAGES = {
  SERVER_RUNNING: 'Server is running',
  HEALTH_CHECK: 'Server is healthy',
} as const;

