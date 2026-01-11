# Slack Webhook Setup Instructions

## Current Status
The contact form is configured to send notifications to Slack, but the webhook URL needs to be set up.

## Credentials Provided
- App ID: A0A7Y8TU362
- Client ID: 10256821234903.10270299955206
- Client Secret: ad1a3cf1ddd2991755171a89459a9289
- Signing Secret: eaf9129320cdc3b1bbafa57036a50955
- Verification Token: x97PJugb9kkbvOMlbSJk3X1w

## Steps to Get Webhook URL

### Option 1: Create an Incoming Webhook (Recommended)
1. Go to https://api.slack.com/apps
2. Select your app or create a new one
3. Navigate to "Incoming Webhooks" in the left sidebar
4. Click "Activate Incoming Webhooks" toggle to ON
5. Click "Add New Webhook to Workspace"
6. Select the channel where you want notifications
7. Copy the webhook URL (it will look like: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX)

### Option 2: Use Existing App
If you already have a Slack app with the provided credentials:
1. Go to https://api.slack.com/apps
2. Find your app using the App ID: A0A7Y8TU362
3. Go to "Incoming Webhooks"
4. Copy the webhook URL

## Update Configuration
Once you have the webhook URL, update the backend/.env file:

```bash
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR_ACTUAL_WEBHOOK_URL"
```

Then restart the backend:
```bash
sudo supervisorctl restart backend
```

## Testing
After setting up the webhook:
1. Go to the contact page on your website
2. Submit a test form
3. Check your Slack channel for the notification
4. You should also receive an email at info@techresona.com

## Current Behavior
- Email notifications: ✅ Working (using Gmail SMTP)
- Slack notifications: ⏳ Pending webhook URL configuration
- Form submissions are still saved to the database even if Slack is not configured
