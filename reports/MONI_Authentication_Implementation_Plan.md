# MONI OS Authentication Implementation Plan

This document details the architecture and integration strategy for adding secure user authentication to the MONI AI Operating System.

## 1. User Interface Design
* **Login & Register Views:** Minimalist, glassmorphic auth cards centered on a dark canvas. Features matching visual elements from the MONI visualizer Orb.
* **Navigation Guards:** React Router (or React state) intercepts all routes. Users attempting to access the `MoniDashboard` without active sessions are automatically redirected to `/login`.

## 2. Cryptographic Security & Password Rules
* **Password Strength Validator:**
  - Minimum 10 characters length.
  - At least one uppercase letter.
  - At least one lowercase letter.
  - At least one numeric digit.
  - At least one special character (`@`, `$`, `!`, `%`, `*`, `?`, `&`, etc.).
* **Password Hashing:** Passwords will be salted and hashed server-side using **bcrypt** (minimum cost factor of 10) or **Argon2id**. Plaintext passwords will never be logged, printed, or saved.

## 3. Registration & Activation Workflow
* **Email Verification:**
  - On registration, account is created with `status: "pending_verification"`.
  - A secure, short-lived activation token (JWT or random hex) is sent to the user's email.
  - Verification endpoint checks token signature and changes status to `active`.
* **Password Reset:**
  - Secure request page triggers a single-use verification token emailed to the user, valid for 15 minutes.

## 4. Session Management
* **JWT Token Security:**
  - Short-lived Access Token (stored in memory or secure Cookie with `HttpOnly`, `Secure`, and `SameSite=Strict` flags).
  - Refresh tokens persisted locally inside SQLite.
* **Local Offline Admin Mode:**
  - For offline desktop builds, a dedicated offline admin flag bypasses the email delivery module, allowing database creation of local user profiles instantly.

## 5. Next Phase: Multi-Factor Auth (MFA) & Google Login
* **Google OAuth 2.0 Integration:** Google Sign-In credential parsing.
* **Two-Factor Authentication (2FA):** TOTP (Google Authenticator / Authy) integration.
