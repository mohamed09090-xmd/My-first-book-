# Authenticator Setup

This project now includes a static TOTP authenticator gate before the storybook.

## Static Security Notice

This is a static-only website. The authenticator secret must exist inside `script.js`, so this gate is designed to block casual visitors, not advanced users who inspect the source files.

For strong real access control, move verification to a backend or serverless function and keep the secret outside the public files.

## Authenticator App Configuration

Use any TOTP-compatible authenticator app, such as Google Authenticator, Microsoft Authenticator, Authy, or 2FAS.

Manual setup values:

```text
Issuer: The Last Train Home
Account: Private Reader
Secret: ALNN2A4BPFUMDW5EQIFANSPRBDYDA7FZ
Type: Time-based
Algorithm: SHA1
Digits: 6
Period: 30 seconds
```

Authenticator URI:

```text
otpauth://totp/The%20Last%20Train%20Home:Private%20Reader?secret=ALNN2A4BPFUMDW5EQIFANSPRBDYDA7FZ&issuer=The%20Last%20Train%20Home&algorithm=SHA1&digits=6&period=30
```

## How Readers Access the Story

1. Add the account above to an authenticator app.
2. Open the website.
3. Enter the 6-digit code shown in the authenticator app.
4. The storybook opens after a valid code.

The website accepts the current code plus a small time window before and after it to reduce clock-drift issues.

## Session Behavior

The successful login is stored in `sessionStorage`.

- Closing the tab clears access in most browsers.
- Pressing **Lock Story** clears access immediately.
- Opening the site again requires a fresh authenticator code.

## Changing the Secret

To change the authenticator secret:

1. Generate a new Base32 secret.
2. Open `script.js`.
3. Replace the value of `AUTHENTICATOR_SECRET`.
4. Add the new secret to your authenticator app.
5. Share the new setup details only with authorized readers.
