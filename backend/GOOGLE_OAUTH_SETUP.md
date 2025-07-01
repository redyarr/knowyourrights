# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Legal Network application.

## Prerequisites

- A Google account
- Access to Google Cloud Console
- The application running locally or deployed

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Legal Network OAuth")
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the required fields:
     - App name: "Legal Network"
     - User support email: Your email
     - Developer contact information: Your email
   - Save and continue through the scopes and test users sections
4. Select "Web application" as the application type
5. Add authorized redirect URIs:
   - For local development: `http://localhost:3000/auth/google/callback`
   - For production: `https://yourdomain.com/auth/google/callback`
6. Click "Create"

## Step 4: Configure Environment Variables

1. Copy the Client ID and Client Secret from the credentials page
2. Add them to your `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Step 5: Test the Integration

1. Restart your application
2. Go to the login page
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After granting permission, you should be redirected back to your application and logged in

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**:
   - Make sure the redirect URI in your Google Cloud Console matches exactly with your application URL
   - Check for trailing slashes and http vs https

2. **"invalid_client" error**:
   - Verify your Client ID and Client Secret are correct in the `.env` file
   - Make sure there are no extra spaces or characters

3. **"access_blocked" error**:
   - Your OAuth consent screen might need to be verified by Google
   - For development, add test users in the OAuth consent screen configuration

### Development vs Production

- For development, you can use `http://localhost:3000`
- For production, make sure to use `https://` URLs
- Update the authorized redirect URIs accordingly in Google Cloud Console

## Security Notes

- Never commit your `.env` file to version control
- Keep your Client Secret secure and never expose it in client-side code
- Regularly rotate your OAuth credentials if needed
- Use HTTPS in production environments

## Features Implemented

- ✅ Google OAuth login integration
- ✅ Automatic user creation for new Google users
- ✅ Account linking for existing users with same email
- ✅ Session management with Google authentication
- ✅ Proper error handling and redirects

The Google OAuth integration is now ready to use!