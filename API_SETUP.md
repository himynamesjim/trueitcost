# Anthropic API Setup

This application uses the Anthropic Claude API for AI-powered room analysis and design generation.

## Setup Instructions

1. **Get your Anthropic API Key**
   - Go to https://console.anthropic.com/
   - Sign in or create an account
   - Navigate to API Keys section
   - Create a new API key or copy an existing one

2. **Add the API Key to your environment**
   - Open the file `.env.local` in the project root
   - Replace `your_api_key_here` with your actual API key:
     ```
     ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
     ```
   - Save the file

3. **Restart the development server**
   - Stop the dev server (Ctrl+C)
   - Run `npm run dev` again
   - The application will now use your API key automatically

## Security Notes

- The `.env.local` file is already in `.gitignore` and will NOT be committed to git
- Your API key is stored securely on the server-side only
- The API key is never exposed to the client/browser
- All API calls are made through secure server-side routes (`/api/analyze-room` and `/api/generate-design`)

## Testing the Connection

1. Navigate to http://localhost:3000/ai-solutions/collaboration
2. Upload one or more room photos
3. The AI should automatically analyze them without prompting for an API key
4. Complete the questionnaire and generate a design

If you see errors about "API key not configured", make sure:
- The `.env.local` file exists in the project root
- The API key is correctly formatted (starts with `sk-ant-`)
- You've restarted the dev server after adding the key
