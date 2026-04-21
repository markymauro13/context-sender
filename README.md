# diff-sender

Chrome extension to copy merge request diffs to your clipboard or download them as text files — optimized for pasting into LLMs.

## How It Works

When you're on a GitLab merge request page, the extension:

1. Detects the MR URL and shows an **"MR"** badge on the extension icon
2. Fetches the raw diff by appending `.diff` to the MR URL (e.g. `merge_requests/113.diff`)
3. Lets you **copy** the diff to your clipboard or **download** it as a `.diff` file

You can then paste the full diff into ChatGPT, Claude, or any other LLM for review.

## Install (Developer Mode)

1. Clone this repo:
   ```
   git clone https://github.com/your-user/diff-sender.git
   ```
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right)
4. Click **Load unpacked** and select the `diff-sender` folder
5. Pin the extension from the puzzle-piece menu for quick access

## Usage

1. Navigate to any GitLab merge request (e.g. `https://gitlab.com/group/project/-/merge_requests/113`)
2. Click the **Diff Sender** extension icon
3. Choose **Copy to Clipboard** or **Download .txt**
4. Paste the diff into your preferred LLM

## Supported Platforms

- **GitLab** (gitlab.com and self-hosted instances)

## Permissions

- `activeTab` — read the URL of the current tab when you click the extension
- `clipboardWrite` — copy diff content to your clipboard

No data is collected or sent anywhere. The diff is fetched directly from GitLab using your existing session cookies.

## Project Structure

```
diff-sender/
├── manifest.json      # Extension manifest (V3)
├── popup.html         # Extension popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup logic (fetch, copy, download)
├── background.js      # Badge management on MR pages
├── content.js         # Content script (placeholder for future enhancements)
├── icons/             # Extension icons (16, 48, 128)
└── README.md
```
