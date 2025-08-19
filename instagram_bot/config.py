# instagram_bot/config.py

# --- Instagram Credentials ---
# IMPORTANT: Replace these with your actual Instagram credentials
USERNAME = "YOUR_USERNAME"
PASSWORD = "YOUR_PASSWORD"

# --- Search Settings ---
# The keyword or hashtag to search for (e.g., "#developer" or "pythonprogramming")
SEARCH_KEYWORD = "#techtips"

# --- Commenting Settings ---
# A list of comments to be randomly chosen from. Add your own to make them unique!
COMMENTS = [
    "This is awesome! 🔥",
    "Great content, thanks for sharing!",
    "Love this post! ❤️",
    "Really insightful.",
    "Keep up the great work! 👍",
]

# --- Behavior Settings ---
# The maximum number of reels/posts to process in a single run.
# Be careful not to set this too high to avoid temporary blocks from Instagram.
REELS_LIMIT = 20

# Option to like the post before commenting. Set to False if you only want to comment.
LIKE_POST = True

# --- WebDriver Settings ---
# If chromedriver is in your system's PATH, you can leave this as "chromedriver".
# Otherwise, provide the full path to the chromedriver executable.
# e.g., "C:/path/to/chromedriver.exe" or "/usr/local/bin/chromedriver"
CHROMEDRIVER_PATH = "chromedriver"

# Set to True to run Chrome in headless mode (no browser window will open).
HEADLESS = False

# --- File Paths ---
# These files will be created in the same directory as the script.
LOG_FILE = "comment_log.txt"
PROCESSED_URLS_FILE = "processed_reels.json"
COOKIES_FILE = "instagram_cookies.pkl"
