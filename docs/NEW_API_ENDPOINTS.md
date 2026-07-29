# New Endpoints Reference

Covers everything added since the last docs pass: the username availability check
and the `/admin` API (order sub-states + discount management moved here).

## Base URL

```
http://localhost:3000/api
```

---

## Username Availability Check

`GET /card/:username/available`

Public, no auth. Looks up the `Card` collection (the source of truth for
purchased usernames) and normalizes the same way order creation does
(`trim().toLowerCase()`).

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "johndoe",
    "available": true
  }
}
```

**Response (empty/whitespace username):**
```json
{
  "success": false,
  "message": "Username is required"
}
```

### Using it as a live/typeahead check

This endpoint is cheap (one indexed `findOne`) and safe to call on every
keystroke, but you should still debounce and cancel stale requests so a fast
typer doesn't get an out-of-order response overwriting a newer one:

```javascript
import { useEffect, useRef, useState } from "react";

function useUsernameAvailability(username, delay = 400) {
  const [status, setStatus] = useState("idle"); // idle | checking | available | taken | error
  const controllerRef = useRef(null);

  useEffect(() => {
    if (!username.trim()) {
      setStatus("idle");
      return;
    }

    setStatus("checking");
    const timer = setTimeout(async () => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const res = await fetch(
          `http://localhost:3000/api/card/${encodeURIComponent(username)}/available`,
          { signal: controller.signal }
        );
        const body = await res.json();
        setStatus(body.data?.available ? "available" : "taken");
      } catch (err) {
        if (err.name !== "AbortError") setStatus("error");
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      controllerRef.current?.abort();
    };
  }, [username, delay]);

  return status;
}
```

This is exactly the same check `POST /orders` relies on implicitly (order
creation still fails with "Username is already taken" if you skip this and
someone else grabs it in between) — the live check just gives the user
feedback before they get to checkout, it doesn't replace server-side
validation at purchase time.

---

## Admin API

Base path: `/api/admin`. Every route below requires:

```
Authorization: Bearer <privy-access-token>
```

...and the token's Privy `userId` (DID) must be listed in the `ADMIN_USER_IDS`
env var (comma-separated). No token → `401`. Valid token but not on the
allowlist → `403`.

```env
# .env
ADMIN_USER_IDS=did:privy:abc123,did:privy:def456
```

### Order sub-states

Every `Sales` (order) document now tracks three independent states instead of
one `status` field, because payment, card provisioning, and email delivery
fail independently of each other:

| Field | Values | Meaning |
|---|---|---|
| `payment_status` | `pending` \| `verified` \| `failed` | Paystack verification outcome |
| `provision_status` | `pending` \| `provisioned` \| `failed` | Card creation outcome |
| `email_status` | `pending` \| `sent` \| `failed` | Confirmation email outcome |
| `last_error` | string | Most recent error message across any of the three stages |
| `attempts` | number | Payment verification attempts (incremented on every check) |
| `updated_at` | date | Last time any sub-state changed |
| `status` | `pending` \| `completed` \| `failed` | Legacy field, kept in sync automatically from `payment_status` for backward compatibility |

### `GET /admin/orders`

List/filter orders, paginated.

**Query params (all optional):** `payment_status`, `provision_status`,
`email_status`, `reference` (partial match), `email` (partial match), `page`
(default 1), `limit` (default 20, max 100).

```bash
curl http://localhost:3000/api/admin/orders?provision_status=failed \
  -H "Authorization: Bearer $TOKEN"
```

```json
{
  "success": true,
  "data": [ /* Sales documents */ ],
  "pagination": { "page": 1, "limit": 20, "total": 3, "pages": 1 }
}
```

### `GET /admin/orders/:reference`

Full order detail, including sub-states.

### `POST /admin/orders/:reference/verify-payment`

Re-checks the transaction with Paystack and updates `payment_status`
accordingly. Use when a webhook was missed and an order looks stuck on
`pending`. Fails with `400` for discount-code orders (no gateway transaction
to check).

### `POST /admin/orders/:reference/retry-provision`

Re-runs card creation for an order whose payment is `verified` but
`provision_status` is `failed` (e.g. username collision at the time of
purchase). Requires `payment_status: "verified"`; no-ops with `400` if the
order is already `provisioned`.

### `POST /admin/orders/:reference/retry-email`

Re-sends the buyer confirmation + seller notification emails for a verified
order whose `email_status` is `failed`.

### `PATCH /admin/orders/:reference/resolve`

Manual override for anything the automated retries can't fix (refunded
outside the system, confirmed via bank statement, etc). Any subset of the
three sub-states can be set directly, plus a free-text `note` recorded as
`last_error`.

```bash
curl -X PATCH http://localhost:3000/api/admin/orders/ORD_123/resolve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payment_status": "verified", "note": "Confirmed manually via bank statement"}'
```

### `GET /admin/metrics`

Aggregate dashboard numbers:

```json
{
  "success": true,
  "data": {
    "totalOrders": 42,
    "paymentStatus": { "pending": 3, "verified": 38, "failed": 1 },
    "provisionStatus": { "provisioned": 37, "failed": 1, "pending": 4 },
    "emailStatus": { "sent": 36, "failed": 2, "pending": 4 },
    "revenue": { "total": 210000, "verifiedOrders": 38 },
    "needsAttention": 3,
    "avgVerificationAttempts": 1.4
  }
}
```

`needsAttention` = orders where payment succeeded but provisioning or email
failed — the queue an admin should actually work through.

> Note: orders created before this migration don't have `payment_status` /
> `provision_status` / `email_status` set, so they won't match the filters
> above and show up as `"unknown"` in metrics. Ask if you want a one-time
> backfill script for historical orders.

---

### Discount codes (management moved to `/admin`)

Creating, listing, and deactivating discount codes now requires admin auth.
Validating a code at checkout is still public.

| Endpoint | Auth |
|---|---|
| `GET /discounts/validate/:code` | Public — used by the checkout flow |
| `GET /admin/discounts` | Admin |
| `POST /admin/discounts` | Admin |
| `POST /admin/discounts/bulk` | Admin |
| `PATCH /admin/discounts/:code/deactivate` | Admin |

Request/response shapes are unchanged from before — see
[DISCOUNT_CODES_GUIDE.md](./DISCOUNT_CODES_GUIDE.md) for field details, just
prefix the management calls with `/admin` and add the `Authorization` header.
