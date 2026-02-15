# Employee Eligibility Checker

A modern, full-stack Next.js application that checks employee eligibility against a Google Sheets database and manages mobile numbers in real-time.

## 🚀 Features

- **Real-time Eligibility Check**: Instantly verify employee eligibility status by Employee ID
- **Mobile Number Management**: Add and edit mobile numbers for eligible employees
- **Activity Log Tracking**: Automatic logging of all searches and mobile number updates to a separate "Activity Log" sheet for post-event analytics
- **Google Sheets Backend**: Uses Google Sheets as a simple, accessible database
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Type-safe**: Built with TypeScript for reliability and better developer experience
- **Secure**: Environment-based configuration keeps credentials safe

## 🛠 Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Google Sheets API
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ installed
- A Google Cloud Platform account
- A Google Sheet with employee data

## 🔧 Setup Instructions

### Step 1: Google Sheets Setup

1. **Import Your CSV Data**
   - Go to [Google Sheets](https://sheets.google.com)
   - Click "Blank" to create a new spreadsheet
   - File → Import → Upload → Select your CSV file (e.g., `L&T - Sheet1.csv`)
   - Click "Import data"

2. **Add Mobile Number Column**
   - Your sheet should have these columns:
     - **Column A**: Employee ID (PS No.)
     - **Column B**: Mobile Number (insert this between Employee ID and Status if needed)
     - **Column C**: Status (Eligible/Not Eligible)
   - If Column B doesn't exist, right-click column B and select "Insert 1 column left"
   - Add "Mobile Number" as the header in B1

3. **Get Sheet ID**
   - Look at your browser's URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
   - Copy the `YOUR_SHEET_ID` part (it's a long string between `/d/` and `/edit`)
   - Save this for later

### Step 2: Google Cloud Platform Setup

1. **Create a Project** (or use an existing one)
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Click the project dropdown at the top
   - Click "New Project"
   - Enter a name like "Employee Checker" and click "Create"

2. **Enable Google Sheets API**
   - In the Google Cloud Console, navigate to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click on it and click "Enable"

3. **Create a Service Account**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Enter a name like "employee-checker-service"
   - Click "Create and Continue"
   - Skip the optional steps and click "Done"

4. **Generate Service Account Key**
   - Click on the service account you just created
   - Go to the "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON" format
   - Click "Create" - a JSON file will download

5. **Extract Credentials from JSON**
   - Open the downloaded JSON file
   - Find and copy these two values:
     - `client_email`: looks like `your-service-account@your-project.iam.gserviceaccount.com`
     - `private_key`: starts with `-----BEGIN PRIVATE KEY-----` (copy the entire multi-line value)

6. **Share Google Sheet with Service Account**
   - Go back to your Google Sheet
   - Click the "Share" button (top right)
   - Paste the `client_email` from step 5
   - Give it "Editor" access
   - Uncheck "Notify people"
   - Click "Share"

### Step 3: Local Development Setup

1. **Clone/Download the Project**
   ```bash
   cd employee-eligibility-checker
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Create a file named `.env.local` in the project root
   - Add the following (replace with your actual values):

   ```env
   GOOGLE_SHEET_ID=your_sheet_id_from_step_1
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
   ```

   **Important Notes:**
   - Keep the quotes around `GOOGLE_PRIVATE_KEY`
   - The `\n` characters in the private key should be literal text (not actual newlines)
   - If copying from JSON, the key should already have `\n` in the right places

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

5. **Open the App**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - You should see the Employee Eligibility Checker interface

### Step 4: Testing the Application

1. **Test Case 1: Eligible Employee with Mobile**
   - Enter an Employee ID that exists in your sheet and has a mobile number
   - Should show green "Eligible" badge
   - Should display the mobile number
   - Click "Edit" to update the number

2. **Test Case 2: Eligible Employee without Mobile**
   - Enter an Employee ID that exists but has no mobile number
   - Should show green "Eligible" badge
   - Should show "No mobile number on record"
   - Add a mobile number and save
   - Check your Google Sheet - the mobile number should be updated

3. **Test Case 3: Non-Eligible Employee**
   - Enter an Employee ID that doesn't exist in your sheet
   - Should show red "Not Eligible" badge
   - Optionally add a mobile number and save
   - Check your Google Sheet - a new row should be added with "Not Eligible" status

### Step 5: Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/employee-eligibility-checker.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Add Environment Variables**
   - In the Vercel project settings, go to "Environment Variables"
   - Add the same three variables from your `.env.local`:
     - `GOOGLE_SHEET_ID`
     - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
     - `GOOGLE_PRIVATE_KEY`
   - Make sure to paste the private key exactly as it appears in your `.env.local`

4. **Deploy**
   - Click "Deploy"
   - Wait for the deployment to complete
   - Visit your production URL

## 📱 How to Use

### Checking Eligibility

1. Enter an Employee ID in the search field
2. Click "Check Status"
3. The system will search the Google Sheet and display:
   - ✅ **Eligible**: Employee is in the sheet with eligible status
   - ❌ **Not Eligible**: Employee is not found or marked as not eligible

### Adding/Editing Mobile Numbers

**For Eligible Employees:**
- If mobile number exists: Click "Edit" to update it
- If no mobile number: Enter one and click "Save Mobile Number"

**For Non-Eligible Employees:**
- Optionally enter a mobile number
- Click "Save Mobile Number" to create a new record

All changes are immediately saved to Google Sheets!

## 📊 Activity Log & Analytics

### Automatic Activity Tracking

Every interaction is automatically logged to a separate "Activity Log" sheet in your Google Spreadsheet:

**What Gets Logged:**
- ✅ Every employee ID search (eligible or not eligible)
- ✅ Every mobile number save (add or update)
- ✅ Timestamp of each action
- ✅ Action type (Checked, Mobile Added, Mobile Updated)

**Activity Log Columns:**
1. **Timestamp** - When the action occurred (e.g., `2026-02-15 14:30:25`)
2. **Employee ID** - The employee ID that was searched
3. **Eligible** - Yes or No
4. **Mobile Number** - The mobile number (or `-` if none)
5. **Action** - Type of action performed

### Post-Event Analytics

After an event, sales representatives can easily analyze:

**Total Foot Traffic:**
- Filter Activity Log by date to see all people who visited the booth

**Eligible vs Non-Eligible Breakdown:**
- Count "Eligible = Yes" vs "Eligible = No" to see conversion potential

**Mobile Numbers Collected:**
- Filter by "Mobile Added" or "Mobile Updated" actions

**Time-Based Analysis:**
- Filter by specific time ranges (e.g., 2-5 PM) to see peak hours

**Repeat Visitors:**
- Group by Employee ID to identify people who came back multiple times

### Example Use Case

**During Event:**
- Sales rep searches 50 employee IDs throughout the day
- Collects mobile numbers from 30 eligible employees
- 20 non-eligible employees also inquired

**After Event:**
1. Open Google Sheet → "Activity Log" tab
2. Filter by today's date
3. See complete list of 50 unique interactions
4. Export eligible leads (30) for follow-up
5. Analyze peak hours for future event planning

**Note:** The Activity Log sheet is automatically created on first use. No manual setup required!

## 🎨 Design Features

- **Responsive Design**: Works beautifully on mobile, tablet, and desktop
- **Smooth Animations**: Fade-in effects, hover states, and loading spinners
- **Toast Notifications**: Success and error messages
- **Accessible**: WCAG AA compliant color contrast and keyboard navigation
- **Modern UI**: Gradient accents, rounded corners, and clean typography

## 🔒 Security Notes

- Never commit `.env.local` to version control (it's in `.gitignore`)
- Keep your service account credentials secure
- Only share the Google Sheet with the service account email
- Regularly rotate service account keys if needed

## 🐛 Troubleshooting

**"Failed to fetch employee data" error:**
- Check that your Google Sheet is shared with the service account email
- Verify the Sheet ID is correct in `.env.local`
- Ensure the Google Sheets API is enabled in Google Cloud Console

**Private key errors:**
- Make sure the `GOOGLE_PRIVATE_KEY` has quotes around it
- Verify that `\n` characters are literal text (not actual line breaks)
- Copy the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

**"Employee not found" when they should exist:**
- Check that Column A in your sheet contains Employee IDs
- Verify there are no extra spaces in the Employee ID cells
- Make sure the sheet name is correct (first sheet is used by default)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Support

If you encounter any issues or have questions:
1. Check the Troubleshooting section above
2. Verify all environment variables are set correctly
3. Check the browser console for error messages
4. Ensure Google Sheets API permissions are correct

---

Built with ❤️ using Next.js and Google Sheets
