# Elegant Wedding Invitation

A romantic wedding invitation website built with:

- HTML
- CSS
- JavaScript
- Firebase Firestore

## 1. Run locally

Because this uses JavaScript modules, run it with a local web server.

For example with VS Code:
- Install Live Server
- Right click `index.html`
- Open with Live Server

## 2. Create Firebase

1. Open Firebase Console.
2. Create a new project.
3. Add a Web App.
4. Copy the Firebase configuration.
5. Put it in `script.js`.
6. Create Firestore Database.
7. Apply the rules from `firestore.rules`.

## 3. Customize

Replace:
- John & Maria
- Date/time
- Church name/address
- Google Maps URL
- Invitation text
- Images in `/assets`

## 4. PDF email

The website currently stores the guest email in Firestore.

For security, the actual PDF email should be sent from a Firebase Cloud Function using an email provider. Do NOT put a private email API key inside `script.js`.

The next step is to add:
- Firebase Functions
- Email provider
- `invitation.pdf` attachment
- automatic email after a guest submits their address
