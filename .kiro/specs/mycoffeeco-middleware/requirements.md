# Requirements Document

## Introduction

This document defines the requirements for the MyCoffeeCo Middleware — a Node.js/Express.js service that bridges the Shopify storefront (mycoffeeco.com) with the Rista POS and loyalty platform (ristaapps.com). The middleware receives Shopify webhook events, synchronises customer data to Rista, and exposes endpoints for querying, earning, and redeeming Rista loyalty points. It must operate securely, reliably, and observably in a VPS or serverless hosting environment.

---

## Glossary

- **Middleware**: The MyCoffeeCo Node.js/Express service described in this document.
- **Shopify**: The e-commerce platform hosting mycoffeeco.com, source of webhook events and the Admin API.
- **Rista**: The POS and loyalty platform at ristaapps.com whose REST API the Middleware consumes.
- **Webhook**: An HTTP POST request sent by Shopify to the Middleware when a subscribed event occurs.
- **HMAC**: Hash-based Message Authentication Code used by Shopify to sign webhook payloads.
- **Rista_Token**: A short-lived JWT issued by the Rista authentication endpoint and used as a Bearer token on subsequent Rista API calls.
- **Rista_Customer_ID**: The unique identifier assigned to a customer by Rista, stored as a Shopify customer metafield.
- **Loyalty_Balance**: The current loyalty points balance for a customer, as returned by Rista.
- **Metafield**: A Shopify Admin API construct used to store custom key-value data on a customer record.
- **Dead_Letter_Log**: A persistent record of webhook events that could not be processed after all retry attempts.
- **Retry_Queue**: An in-memory or persistent queue that re-attempts failed Rista API calls with exponential back-off.
- **Secret_Store**: The runtime environment (`.env` file or equivalent secrets manager) from which the Middleware reads credentials at startup.

---

## Requirements

### Requirement 1: Shopify Webhook Ingestion

**User Story:** As the MyCoffeeCo operations team, I want the Middleware to receive Shopify webhook events, so that customer and order data is automatically forwarded to Rista without manual intervention.

#### Acceptance Criteria

1. THE Middleware SHALL expose an HTTP POST endpoint at `/webhooks/shopify` that accepts Shopify webhook payloads.
2. WHEN Shopify sends an `orders/create` event, THE Middleware SHALL parse the payload and route it to the order-processing handler.
3. WHEN Shopify sends a `customers/create` event, THE Middleware SHALL parse the payload and route it to the customer-creation handler.
4. WHEN Shopify sends a `customers/update` event, THE Middleware SHALL parse the payload and route it to the customer-update handler.
5. WHEN a webhook payload cannot be parsed as valid JSON, THE Middleware SHALL return HTTP 400 and log the raw body with an `INVALID_PAYLOAD` error tag.
6. WHEN a supported webhook topic is received and processing succeeds, THE Middleware SHALL return HTTP 200 within 5 seconds of receiving the request.
7. IF the `X-Shopify-Topic` header is absent or contains an unrecognised topic, THEN THE Middleware SHALL return HTTP 422 and log the event with an `UNSUPPORTED_TOPIC` warning tag.

---

### Requirement 2: HMAC Webhook Verification

**User Story:** As the MyCoffeeCo security team, I want every inbound Shopify webhook to be cryptographically verified, so that only genuine Shopify requests are processed.

#### Acceptance Criteria

1. THE Middleware SHALL read the raw request body (before JSON parsing) to compute the HMAC digest.
2. WHEN a webhook request is received, THE Middleware SHALL compute an HMAC-SHA256 digest of the raw body using the `SHOPIFY_WEBHOOK_SECRET` value from the Secret_Store.
3. WHEN the computed digest matches the value in the `X-Shopify-Hmac-Sha256` header (Base64-encoded), THE Middleware SHALL allow the request to proceed to the appropriate handler.
4. WHEN the computed digest does not match the `X-Shopify-Hmac-Sha256` header value, THE Middleware SHALL return HTTP 401, log the mismatch with an `HMAC_FAILURE` error tag, and halt further processing of that request.
5. IF the `X-Shopify-Hmac-Sha256` header is absent, THEN THE Middleware SHALL return HTTP 401 and log the event with an `HMAC_MISSING` error tag.
6. THE Middleware SHALL use a constant-time comparison function when comparing HMAC digests to prevent timing-based attacks.

---

### Requirement 3: Rista API Authentication and Token Management

**User Story:** As the MyCoffeeCo engineering team, I want the Middleware to authenticate with Rista and keep its session token fresh, so that Rista API calls succeed without manual credential rotation.

#### Acceptance Criteria

1. THE Middleware SHALL obtain a Rista_Token by sending a POST request containing the `RISTA_USERNAME` and `RISTA_PASSWORD` credentials from the Secret_Store to the Rista authentication endpoint.
2. WHEN the Rista authentication endpoint returns a valid JWT, THE Middleware SHALL store the Rista_Token in memory and include it as a `Bearer` token in the `Authorization` header of all subsequent Rista API requests.
3. WHEN a Rista API call returns HTTP 401, THE Middleware SHALL discard the current Rista_Token, request a new token from the Rista authentication endpoint, and retry the original call exactly once.
4. WHEN the Rista authentication endpoint returns an error response, THE Middleware SHALL log the error with a `RISTA_AUTH_FAILURE` tag and propagate a service-unavailable error to the caller.
5. THE Middleware SHALL not log or expose the `RISTA_PASSWORD` or the raw Rista_Token value in any log output or HTTP response.
6. WHERE a token expiry claim (`exp`) is present in the Rista_Token JWT, THE Middleware SHALL proactively refresh the token 60 seconds before the expiry time to avoid in-flight request failures.

---

### Requirement 4: Customer Creation Sync

**User Story:** As a MyCoffeeCo customer, I want my account to be automatically created in the Rista loyalty programme when I register on the Shopify storefront, so that I can start earning points immediately.

#### Acceptance Criteria

1. WHEN a `customers/create` webhook is received and HMAC verification passes, THE Middleware SHALL extract the customer's first name, last name, email address, and phone number from the Shopify payload.
2. WHEN the extracted customer data is complete (email and at least one of first name or phone number present), THE Middleware SHALL send a POST request to the Rista customer-creation endpoint with the extracted data.
3. WHEN Rista responds with a successful creation and a Rista_Customer_ID, THE Middleware SHALL store the Rista_Customer_ID as a Shopify customer metafield using the Shopify Admin API within 10 seconds of receiving the webhook.
4. IF a customer with the same email already exists in Rista when a creation is attempted, THEN THE Middleware SHALL retrieve the existing Rista_Customer_ID and store it as a Shopify customer metafield rather than creating a duplicate.
5. IF the Rista customer-creation call fails with a retryable error (HTTP 429, 500, 502, 503, or 504), THEN THE Middleware SHALL add the event to the Retry_Queue with exponential back-off starting at 2 seconds, up to a maximum of 3 retries.
6. IF all retry attempts are exhausted without success, THEN THE Middleware SHALL write the original Shopify payload to the Dead_Letter_Log with a `CUSTOMER_SYNC_FAILED` tag.
7. WHEN the customer record lacks an email address, THE Middleware SHALL log a `MISSING_EMAIL` warning and skip the Rista creation call.

---

### Requirement 5: Customer Update Sync

**User Story:** As a MyCoffeeCo customer, I want changes to my profile on Shopify to be reflected in Rista, so that my loyalty account always has accurate contact information.

#### Acceptance Criteria

1. WHEN a `customers/update` webhook is received and HMAC verification passes, THE Middleware SHALL read the Rista_Customer_ID Shopify metafield for the affected customer using the Shopify Admin API.
2. WHEN a Rista_Customer_ID metafield exists for the customer, THE Middleware SHALL send the updated first name, last name, email, and phone number to the Rista customer-update endpoint.
3. WHEN Rista responds with HTTP 200 to the update request, THE Middleware SHALL log the successful sync with an `CUSTOMER_UPDATE_SUCCESS` tag.
4. IF the Rista_Customer_ID metafield does not exist for the updated customer, THEN THE Middleware SHALL treat the event as a new customer and execute the customer-creation flow defined in Requirement 4.
5. IF the Rista customer-update call fails with a retryable error (HTTP 429, 500, 502, 503, or 504), THEN THE Middleware SHALL add the event to the Retry_Queue with exponential back-off starting at 2 seconds, up to a maximum of 3 retries.
6. IF all retry attempts for an update are exhausted, THEN THE Middleware SHALL write the payload to the Dead_Letter_Log with a `CUSTOMER_UPDATE_FAILED` tag.

---

### Requirement 6: Loyalty Balance Query

**User Story:** As a MyCoffeeCo customer, I want to see my current loyalty points balance at checkout, so that I can decide whether to redeem points on my order.

#### Acceptance Criteria

1. THE Middleware SHALL expose an HTTP GET endpoint at `/loyalty/balance/:shopifyCustomerId` that returns the Loyalty_Balance for the specified customer.
2. WHEN the endpoint is called with a valid `shopifyCustomerId`, THE Middleware SHALL look up the Rista_Customer_ID from the Shopify customer metafield via the Shopify Admin API.
3. WHEN the Rista_Customer_ID is found, THE Middleware SHALL call the Rista loyalty-balance endpoint and return the balance as a JSON response in the format `{ "shopifyCustomerId": "<id>", "ristaCustomerId": "<id>", "loyaltyBalance": <number>, "currency": "<unit>" }`.
4. WHEN the Rista loyalty-balance endpoint returns a valid response, THE Middleware SHALL respond to the caller within 3 seconds.
5. IF the Rista_Customer_ID metafield is not found for the given Shopify customer, THEN THE Middleware SHALL return HTTP 404 with a JSON body `{ "error": "CUSTOMER_NOT_LINKED" }`.
6. IF the Rista loyalty-balance call fails, THEN THE Middleware SHALL return HTTP 502 with a JSON body `{ "error": "RISTA_UNAVAILABLE" }` and log the failure with a `LOYALTY_BALANCE_FETCH_FAILED` tag.
7. WHILE the Middleware is processing a balance request, THE Middleware SHALL not cache Loyalty_Balance values for longer than 30 seconds to avoid serving stale data.

---

### Requirement 7: Loyalty Points Earn

**User Story:** As a MyCoffeeCo customer, I want to earn loyalty points after a qualifying purchase, so that I am rewarded for spending on the storefront.

#### Acceptance Criteria

1. WHEN an `orders/create` webhook is received and HMAC verification passes, THE Middleware SHALL determine whether the order is in a financial status of `paid`.
2. WHEN the order financial status is `paid`, THE Middleware SHALL look up the Rista_Customer_ID for the ordering customer from the Shopify customer metafield.
3. WHEN the Rista_Customer_ID is found, THE Middleware SHALL send a POST request to the Rista loyalty-earn endpoint with the order total amount, order currency, and Shopify order ID as the transaction reference.
4. WHEN Rista responds with a successful earn response, THE Middleware SHALL log the transaction with an `LOYALTY_EARN_SUCCESS` tag including the Shopify order ID, Rista_Customer_ID, points earned, and new balance.
5. IF the order's financial status is not `paid`, THEN THE Middleware SHALL skip the loyalty-earn call and log a `LOYALTY_EARN_SKIPPED` informational entry with the order ID and actual status.
6. IF the Rista_Customer_ID is not found for the ordering customer, THEN THE Middleware SHALL log a `LOYALTY_EARN_NO_CUSTOMER` warning and skip the loyalty-earn call.
7. IF the Rista loyalty-earn call fails with a retryable error (HTTP 429, 500, 502, 503, or 504), THEN THE Middleware SHALL add the event to the Retry_Queue with exponential back-off starting at 2 seconds, up to a maximum of 3 retries.
8. IF all retry attempts are exhausted for a loyalty-earn event, THEN THE Middleware SHALL write the order payload to the Dead_Letter_Log with a `LOYALTY_EARN_FAILED` tag.
9. THE Middleware SHALL ensure that each Shopify order ID is submitted to the Rista loyalty-earn endpoint at most once, to prevent duplicate point awards.

---

### Requirement 8: Loyalty Points Redemption

**User Story:** As a MyCoffeeCo customer, I want to redeem my accumulated loyalty points at checkout to reduce my order total, so that I receive a tangible benefit from the loyalty programme.

#### Acceptance Criteria

1. THE Middleware SHALL expose an HTTP POST endpoint at `/loyalty/redeem` that accepts a JSON body containing `shopifyCustomerId`, `orderId`, and `pointsToRedeem`.
2. WHEN the `/loyalty/redeem` endpoint is called, THE Middleware SHALL validate that `shopifyCustomerId`, `orderId`, and `pointsToRedeem` are all present and that `pointsToRedeem` is a positive integer.
3. IF any required field is missing or `pointsToRedeem` is not a positive integer, THEN THE Middleware SHALL return HTTP 400 with a JSON body `{ "error": "INVALID_REDEMPTION_REQUEST" }`.
4. WHEN the request is valid, THE Middleware SHALL look up the Rista_Customer_ID for the given Shopify customer.
5. WHEN the Rista_Customer_ID is found, THE Middleware SHALL query the Rista loyalty-balance endpoint to confirm the current Loyalty_Balance before submitting the redemption.
6. WHEN the current Loyalty_Balance is greater than or equal to `pointsToRedeem`, THE Middleware SHALL send a POST request to the Rista loyalty-redeem endpoint with the Rista_Customer_ID, `pointsToRedeem`, and `orderId` as the transaction reference.
7. WHEN Rista confirms the redemption, THE Middleware SHALL return HTTP 200 with a JSON body `{ "success": true, "pointsRedeemed": <number>, "newBalance": <number> }` and log the event with a `LOYALTY_REDEEM_SUCCESS` tag.
8. WHEN the current Loyalty_Balance is less than `pointsToRedeem`, THE Middleware SHALL return HTTP 422 with a JSON body `{ "error": "INSUFFICIENT_BALANCE", "currentBalance": <number> }`.
9. IF the Rista_Customer_ID is not found for the given Shopify customer, THEN THE Middleware SHALL return HTTP 404 with `{ "error": "CUSTOMER_NOT_LINKED" }`.
10. IF the Rista loyalty-redeem call fails, THEN THE Middleware SHALL return HTTP 502 with `{ "error": "RISTA_UNAVAILABLE" }` and log the failure with a `LOYALTY_REDEEM_FAILED` tag.

---

### Requirement 9: Retry Logic and Dead-Letter Logging

**User Story:** As the MyCoffeeCo operations team, I want failed integration calls to be retried automatically and permanently logged if they continue to fail, so that data loss is minimised and failures are visible for manual remediation.

#### Acceptance Criteria

1. THE Middleware SHALL implement a Retry_Queue that stores failed Rista API call attempts with their original payload, target endpoint, failure reason, and attempt count.
2. WHEN a Rista API call fails with a retryable HTTP status (429, 500, 502, 503, 504) or a network timeout, THE Middleware SHALL schedule a retry with a delay calculated as `2^attemptNumber` seconds (2 s, 4 s, 8 s).
3. WHEN a Rista API call fails with a non-retryable HTTP status (400, 401, 403, 404, 409, 422), THE Middleware SHALL not retry the call and SHALL log the failure immediately with a `NON_RETRYABLE_FAILURE` tag.
4. WHEN the maximum retry count (3) is reached without a successful response, THE Middleware SHALL write the event to the Dead_Letter_Log and remove it from the Retry_Queue.
5. THE Dead_Letter_Log SHALL persist each failed event as a JSON entry containing the timestamp, event type, original payload, all HTTP status codes received across attempts, and a human-readable failure reason.
6. THE Middleware SHALL expose an HTTP GET endpoint at `/admin/dead-letter` (protected by the `ADMIN_API_KEY` from the Secret_Store) that returns the 100 most recent Dead_Letter_Log entries in reverse chronological order.
7. WHERE the hosting environment supports file system persistence, THE Middleware SHALL write Dead_Letter_Log entries to a local file named `dead-letter.log` in addition to standard output.

---

### Requirement 10: Logging and Observability

**User Story:** As the MyCoffeeCo engineering team, I want structured logs for every significant event, so that I can monitor system health and diagnose integration failures quickly.

#### Acceptance Criteria

1. THE Middleware SHALL emit structured JSON log entries for every inbound webhook, every outbound Rista API call, every Shopify Admin API call, and every error condition.
2. WHEN a log entry is emitted, THE Middleware SHALL include the following fields: `timestamp` (ISO 8601), `level` (`info`, `warn`, or `error`), `tag` (a constant identifier for the event type), `shopifyCustomerId` or `orderId` where applicable, and `durationMs` for API calls.
3. THE Middleware SHALL log at `info` level for successful operations, `warn` level for skipped operations and non-critical anomalies, and `error` level for failures and exceptions.
4. THE Middleware SHALL not include credit card numbers, passwords, raw JWT values, or personally identifiable information (PII) such as full name + email combinations in any log entry.
5. WHEN the `LOG_LEVEL` environment variable is set to `debug`, THE Middleware SHALL additionally log the full request and response bodies for Rista and Shopify API calls, redacting the `Authorization` header value.
6. THE Middleware SHALL write all log output to standard output (stdout) to be captured by the host process manager or container runtime.

---

### Requirement 11: Secrets Management

**User Story:** As the MyCoffeeCo security team, I want all credentials and secrets to be loaded from environment variables, so that they are never hard-coded in source files or committed to version control.

#### Acceptance Criteria

1. THE Middleware SHALL read the following secrets exclusively from environment variables at startup: `SHOPIFY_WEBHOOK_SECRET`, `SHOPIFY_ADMIN_API_TOKEN`, `SHOPIFY_SHOP_DOMAIN`, `RISTA_USERNAME`, `RISTA_PASSWORD`, `RISTA_API_BASE_URL`, and `ADMIN_API_KEY`.
2. WHEN the Middleware starts and any required environment variable is absent or empty, THE Middleware SHALL log a `MISSING_ENV_VAR` error specifying the variable name and terminate the process with exit code 1.
3. THE Middleware SHALL not log, print, or return any secret value in HTTP responses or log entries.
4. THE Middleware SHALL support loading environment variables from a `.env` file during local development using the `dotenv` library, while relying on host-level injection in production.
5. IF the `.env` file is absent in a non-production environment, THE Middleware SHALL start successfully provided all required variables are present in the process environment.

---

### Requirement 12: Error Handling and Graceful Degradation

**User Story:** As the MyCoffeeCo engineering team, I want the Middleware to handle unexpected errors without crashing, so that a single bad event does not take down the entire service.

#### Acceptance Criteria

1. THE Middleware SHALL wrap every webhook handler and API route in a top-level error boundary that catches unhandled exceptions and returns HTTP 500 without exposing stack traces in the response body.
2. WHEN an unhandled exception is caught, THE Middleware SHALL log the full stack trace at `error` level with an `UNHANDLED_EXCEPTION` tag.
3. WHEN the Rista API is unreachable (network timeout or DNS failure), THE Middleware SHALL treat the condition as retryable and add the event to the Retry_Queue rather than returning an error to Shopify.
4. WHEN the Shopify Admin API returns a rate-limit response (HTTP 429), THE Middleware SHALL pause the request for the duration specified in the `Retry-After` header and then retry the call exactly once.
5. THE Middleware SHALL expose an HTTP GET endpoint at `/health` that returns HTTP 200 with `{ "status": "ok", "uptime": <seconds> }` when the service is running, enabling uptime monitoring.
6. WHEN a process-level signal `SIGTERM` is received, THE Middleware SHALL stop accepting new requests, allow in-flight requests up to 10 seconds to complete, and then exit with code 0.

---

### Requirement 13: Shopify Admin API Integration

**User Story:** As the MyCoffeeCo engineering team, I want the Middleware to read and write Shopify customer metafields reliably, so that Rista_Customer_IDs and loyalty data are durably stored on the Shopify customer record.

#### Acceptance Criteria

1. THE Middleware SHALL authenticate all Shopify Admin API calls using the `SHOPIFY_ADMIN_API_TOKEN` from the Secret_Store as a private-app access token in the `X-Shopify-Access-Token` header.
2. WHEN writing a Rista_Customer_ID to a Shopify customer, THE Middleware SHALL use the metafield namespace `rista` and key `customer_id` with value type `single_line_text_field`.
3. WHEN reading a Rista_Customer_ID, THE Middleware SHALL query the Shopify Admin API for the metafield with namespace `rista` and key `customer_id` on the customer record.
4. WHEN the Shopify Admin API returns HTTP 429, THE Middleware SHALL respect the `Retry-After` header value (in seconds) and retry the request once after that delay.
5. IF a Shopify Admin API call fails with a non-retryable error (400, 401, 403, 404), THE Middleware SHALL log the failure with a `SHOPIFY_API_FAILURE` tag and propagate the error to the calling handler without retrying.
6. THE Middleware SHALL construct all Shopify Admin API URLs using the `SHOPIFY_SHOP_DOMAIN` environment variable to avoid hard-coded store references.

