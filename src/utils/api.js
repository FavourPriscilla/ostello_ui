/**
 * utils/api.js – Centralised API Client (Ostello)
 * ─────────────────────────────────────────────────────────────────────────────
 * ALL backend communication lives in this one file.
 * Pages import the specific functions they need:
 *   import { searchHostels, createBooking } from '../utils/api';
 *
 * ── WHY ONE FILE FOR ALL API CALLS? ──────────────────────────────────────────
 * Keeping every fetch() call here means:
 *   • One place to update if the API base URL changes (e.g. you deploy to prod)
 *   • Consistent error handling — every function throws the server's error message
 *   • Easier to read — a page file just calls a named function, no fetch() clutter
 *
 * ── HOW EACH FUNCTION WORKS ──────────────────────────────────────────────────
 * Every exported function follows this pattern:
 *   1. Build the URL (with path params and/or query strings)
 *   2. Call the shared `request()` helper
 *   3. request() does the actual fetch, parses JSON, throws on error
 *   4. The caller (page component) handles the error with try/catch
 *
 * ── PROTECTED vs PUBLIC ENDPOINTS ────────────────────────────────────────────
 * Public endpoints (e.g. GET /hostels) need no token.
 * Protected endpoints (e.g. POST /bookings) require:
 *   Authorization: Bearer <JWT>
 * The `authHeaders(token)` helper builds this header object.
 *
 * ── READING THIS FILE ─────────────────────────────────────────────────────────
 * Sections are organised by feature area, matching the backend route files:
 *   Auth → Users → Hostels → Rooms → Bookings → Payments → Reviews
 */

// The base URL for all API calls.
// Change this string if your backend runs on a different host or port.
// In production this would be something like 'https://api.ostello.com'.
const API_BASE = 'http://localhost:3000/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * authHeaders(token)
 * Builds the HTTP headers object required for protected API calls.
 *
 * The Authorization header format "Bearer <token>" is a standard convention
 * for JWT authentication. The server's authMiddleware reads this header,
 * strips the "Bearer " prefix, and verifies the remaining token string.
 *
 * We also include Content-Type: application/json so the server knows to
 * parse the request body as JSON.
 */
const authHeaders = (token) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
});

/**
 * request(url, options)
 * A thin wrapper around the browser's built-in fetch() API.
 *
 * Why wrap fetch()?
 *   fetch() does NOT throw an error for HTTP error status codes (400, 401, 500…).
 *   It only rejects if there is a network failure (no connection).
 *   So we must manually check res.ok (true for 200–299) and throw ourselves.
 *
 * This wrapper means every API function automatically throws a proper Error
 * with the server's error message, which the calling component can catch and
 * display in the UI.
 */
const request = async (url, options = {}) => {
    // fetch() returns a Promise that resolves to a Response object.
    const res = await fetch(url, options);

    // Parse the response body as JSON regardless of status.
    // The server always returns JSON (either data or { error: "..." }).
    const data = await res.json();

    // res.ok is true when status is 200–299.
    // For any other status (400, 401, 403, 404, 500…) we throw an error
    // so the calling code knows something went wrong.
    if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data;
};

// ── Auth ──────────────────────────────────────────────────────────────────────
// These endpoints are PUBLIC — no token required.

/**
 * login({ email, password })
 * Sends credentials to POST /api/login.
 * On success returns: { token, user: { id, email, full_name, role } }
 * The token is a JWT that must be stored and sent with all protected requests.
 */
export const login = ({ email, password }) =>
    request(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

/**
 * register(userData)
 * Sends a new user object to POST /api/register.
 * userData should include: { full_name, email, password, role, institution }
 */
export const register = (userData) =>
    request(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });

/**
 * verifyEmail(token)
 * Called after the user clicks the link in their verification email.
 * The token is a UUID sent in the email, passed as a query parameter.
 */
export const verifyEmail = (token) =>
    request(`${API_BASE}/verify-email?token=${token}`);

/** forgotPassword(email) — sends a password-reset link to the given email. */
export const forgotPassword = (email) =>
    request(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

/** resetPassword(token, password) — sets a new password using the reset token. */
export const resetPassword = (token, password) =>
    request(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
    });

// ── Users ─────────────────────────────────────────────────────────────────────
// Protected — require a token.

/** getProfile(token) — returns the currently logged-in user's own profile. */
export const getProfile = (token) =>
    request(`${API_BASE}/users/me`, { headers: authHeaders(token) });

/** updateProfile(data, token) — updates the current user's own profile. */
export const updateProfile = (data, token) =>
    request(`${API_BASE}/users/me`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(data),
    });

/**
 * getUsers(token, role?)
 * ADMIN only — returns all users, optionally filtered by role.
 * e.g. getUsers(token, 'STUDENT') → all students
 */
export const getUsers = (token, role = '') => {
    const url = role ? `${API_BASE}/users?role=${role}` : `${API_BASE}/users`;
    return request(url, { headers: authHeaders(token) });
};

/** getUserById(id, token) — fetch a single user by their database ID. */
export const getUserById = (id, token) =>
    request(`${API_BASE}/users/${id}`, { headers: authHeaders(token) });

/** updateUser(id, data, token) — ADMIN can update any user's details. */
export const updateUser = (id, data, token) =>
    request(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(data),
    });

/** deleteUser(id, token) — ADMIN can permanently delete a user account. */
export const deleteUser = (id, token) =>
    request(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
    });

// ── Hostels ───────────────────────────────────────────────────────────────────

/**
 * searchHostels(params?)
 * PUBLIC — no token needed. Anyone can browse hostels.
 * params is an object of optional query filters, e.g.:
 *   { search: 'makerere', min_price: 500000, max_price: 1500000 }
 * URLSearchParams converts this to: ?search=makerere&min_price=500000…
 */
export const searchHostels = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/hostels?${query}` : `${API_BASE}/hostels`;
    return request(url);
};

/** getHostelById(id) — PUBLIC — full details for a single hostel. */
export const getHostelById = (id) =>
    request(`${API_BASE}/hostels/${id}`);

/** getMyHostels(token) — CUSTODIAN — returns only hostels owned by this custodian. */
export const getMyHostels = (token) =>
    request(`${API_BASE}/hostels/my`, { headers: authHeaders(token) });

/** getHostelStats(token) — CUSTODIAN — dashboard numbers: rooms, bookings, revenue. */
export const getHostelStats = (token) =>
    request(`${API_BASE}/hostels/stats`, { headers: authHeaders(token) });

/** createHostel(data, token) — CUSTODIAN — create a new hostel listing. */
export const createHostel = (data, token) =>
    request(`${API_BASE}/hostels`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(data),
    });

/** updateHostel(id, data, token) — CUSTODIAN — update an existing hostel. */
export const updateHostel = (id, data, token) =>
    request(`${API_BASE}/hostels/${id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(data),
    });

/** deleteHostel(id, token) — CUSTODIAN — permanently remove a hostel. */
export const deleteHostel = (id, token) =>
    request(`${API_BASE}/hostels/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
    });

// ── Rooms ─────────────────────────────────────────────────────────────────────

/**
 * getRoomsByHostel(hostelId)
 * PUBLIC — returns all rooms for a given hostel.
 * Called on the HostelDetail page to show the available rooms.
 */
export const getRoomsByHostel = (hostelId) =>
    request(`${API_BASE}/hostels/${hostelId}/rooms`);

/** getRoomById(id) — PUBLIC — single room details. */
export const getRoomById = (id) =>
    request(`${API_BASE}/rooms/${id}`);

/** createRoom(hostelId, data, token) — CUSTODIAN — add a room to a hostel. */
export const createRoom = (hostelId, data, token) =>
    request(`${API_BASE}/hostels/${hostelId}/rooms`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(data),
    });

/** updateRoom(id, data, token) — CUSTODIAN — edit room details or price. */
export const updateRoom = (id, data, token) =>
    request(`${API_BASE}/rooms/${id}`, {
        method: 'PUT',
        headers: authHeaders(token),
        body: JSON.stringify(data),
    });

/** deleteRoom(id, token) — CUSTODIAN — remove a room from a hostel. */
export const deleteRoom = (id, token) =>
    request(`${API_BASE}/rooms/${id}`, {
        method: 'DELETE',
        headers: authHeaders(token),
    });

// ── Bookings ──────────────────────────────────────────────────────────────────

/**
 * createBooking(data, token)
 * STUDENT — submit a booking request for a room.
 * data: { room_id, check_in_date, check_out_date }
 * The booking starts in PENDING status until the custodian approves it.
 */
export const createBooking = (data, token) =>
    request(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(data),
    });

/**
 * getMyBookings(token)
 * STUDENT — returns all bookings made by the currently logged-in student.
 * Used on the MyBookings page for the status filter tabs.
 */
export const getMyBookings = (token) =>
    request(`${API_BASE}/bookings/my`, { headers: authHeaders(token) });

/**
 * getCustodianBookings(token, status?)
 * CUSTODIAN — returns booking requests for all hostels the custodian owns.
 * Optional status filter: 'PENDING', 'APPROVED', 'COMPLETED', etc.
 */
export const getCustodianBookings = (token, status = '') => {
    const url = status
        ? `${API_BASE}/bookings/custodian?status=${status}`
        : `${API_BASE}/bookings/custodian`;
    return request(url, { headers: authHeaders(token) });
};

/** getBookingById(id, token) — any authenticated user — single booking details. */
export const getBookingById = (id, token) =>
    request(`${API_BASE}/bookings/${id}`, { headers: authHeaders(token) });

/** approveBooking(id, token) — CUSTODIAN — changes booking status to APPROVED. */
export const approveBooking = (id, token) =>
    request(`${API_BASE}/bookings/${id}/approve`, {
        method: 'PUT',
        headers: authHeaders(token),
    });

/** declineBooking(id, token) — CUSTODIAN — changes booking status to DECLINED. */
export const declineBooking = (id, token) =>
    request(`${API_BASE}/bookings/${id}/decline`, {
        method: 'PUT',
        headers: authHeaders(token),
    });

/**
 * cancelBooking(id, token)
 * STUDENT — cancel a booking that is still PENDING or APPROVED.
 * Sets status to CANCELLED and frees the room.
 */
export const cancelBooking = (id, token) =>
    request(`${API_BASE}/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: authHeaders(token),
    });

/** getAllBookings(token) — ADMIN — returns every booking on the platform. */
export const getAllBookings = (token) =>
    request(`${API_BASE}/bookings`, { headers: authHeaders(token) });

// ── Payments ──────────────────────────────────────────────────────────────────

/**
 * makePayment(data, token)
 * STUDENT — record a payment for an APPROVED booking.
 * data: { booking_id, amount, payment_method, transaction_ref? }
 * payment_method: 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'CASH'
 *
 * Note: In this learning project the payment is simulated. In a real app
 * you would integrate with a payment gateway (Flutterwave, Stripe, etc.)
 * and only record the payment after receiving a webhook confirmation.
 */
export const makePayment = (data, token) =>
    request(`${API_BASE}/payments`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(data),
    });

/** getMyPayments(token) — STUDENT — payment history for the current user. */
export const getMyPayments = (token) =>
    request(`${API_BASE}/payments/my`, { headers: authHeaders(token) });

/** getPaymentById(id, token) — returns a single payment record. */
export const getPaymentById = (id, token) =>
    request(`${API_BASE}/payments/${id}`, { headers: authHeaders(token) });

// ── Reviews ───────────────────────────────────────────────────────────────────

/**
 * createReview(data, token)
 * STUDENT — post a rating and comment for a hostel.
 * data: { booking_id, rating, comment }
 *
 * IMPORTANT: The API requires a booking_id (not a hostel_id).
 * It checks that:
 *   1. The booking belongs to this student
 *   2. The booking status is COMPLETED (proves the student actually stayed)
 * This prevents fake reviews from people who never stayed at the hostel.
 */
export const createReview = (data, token) =>
    request(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(data),
    });

/**
 * getHostelReviews(hostelId)
 * PUBLIC — returns all reviews for a given hostel, newest first.
 * Displayed on the HostelDetail page.
 */
export const getHostelReviews = (hostelId) =>
    request(`${API_BASE}/hostels/${hostelId}/reviews`);

/** getMyReviews(token) — STUDENT — all reviews written by the current user. */
export const getMyReviews = (token) =>
    request(`${API_BASE}/reviews/my`, { headers: authHeaders(token) });

