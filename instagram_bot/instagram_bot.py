import time
import random
import logging
import json
import os
import pickle
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    NoSuchElementException,
    TimeoutException,
    ElementClickInterceptedException,
)

# Import configuration from config.py
import config

# --- Global Variables ---
BASE_URL = "https://www.instagram.com"


def setup_logging():
    """Configures the logging module to output to a file and the console."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] - %(message)s",
        handlers=[
            logging.FileHandler(config.LOG_FILE, mode='w'),
            logging.StreamHandler(),
        ],
    )


def setup_driver():
    """Initializes and returns a Selenium WebDriver instance."""
    chrome_options = Options()
    if config.HEADLESS:
        chrome_options.add_argument("--headless")
    chrome_options.add_argument("--log-level=3")  # Suppress console logs
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")

    # To prevent detection
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)


    try:
        service = Service(config.CHROMEDRIVER_PATH)
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    except Exception as e:
        logging.error(f"Failed to initialize WebDriver: {e}")
        logging.error("Please ensure your `CHROMEDRIVER_PATH` in `config.py` is correct and the driver is compatible with your Chrome version.")
        return None
    return driver


def save_cookies(driver, filepath):
    """Saves the browser's cookies to a file."""
    try:
        with open(filepath, "wb") as file:
            pickle.dump(driver.get_cookies(), file)
        logging.info("Session cookies saved successfully.")
    except Exception as e:
        logging.error(f"Error saving cookies: {e}")


def load_cookies(driver, filepath):
    """Loads cookies from a file into the browser session."""
    if not os.path.exists(filepath):
        logging.warning("Cookie file not found. A new session will be started.")
        return False
    try:
        with open(filepath, "rb") as file:
            cookies = pickle.load(file)
            driver.get(BASE_URL) # Must be on the domain to set cookies
            for cookie in cookies:
                driver.add_cookie(cookie)
        logging.info("Session cookies loaded successfully.")
        return True
    except Exception as e:
        logging.error(f"Error loading cookies: {e}. Starting a new session.")
        return False


def handle_popups(driver):
    """Handles common Instagram pop-ups like 'Save Info' and 'Turn on Notifications'."""
    time.sleep(random.uniform(2, 4))
    try:
        # "Save Your Login Info?" popup
        save_info_button = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Save Info')] | //div[@role='button' and text()='Not Now']"))
        )
        if 'Not Now' in save_info_button.text:
             save_info_button.click()
             logging.info("Clicked 'Not Now' on 'Save Info' popup.")
        else:
            save_info_button.click()
            logging.info("Clicked 'Save Info' on popup.")
        time.sleep(random.uniform(2, 3))
    except TimeoutException:
        logging.info("'Save Info' popup not found, skipping.")

    try:
        # "Turn on Notifications" popup
        notifications_button = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Turn On')] | //button[contains(text(), 'Not Now')]"))
        )
        if 'Not Now' in notifications_button.text:
            notifications_button.click()
            logging.info("Clicked 'Not Now' on 'Notifications' popup.")
        else: # If only 'Turn On' is there, we need to find the other button. Let's just click 'Not Now' if it exists.
            # This logic might need adjustment based on IG's UI changes.
            # Searching for a button with text "Not Now" is more reliable.
            not_now_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Not Now')]")
            if not_now_buttons:
                not_now_buttons[0].click()
                logging.info("Clicked 'Not Now' on 'Notifications' popup.")

    except TimeoutException:
        logging.info("'Notifications' popup not found, skipping.")


def login(driver, username, password):
    """Performs the login action on Instagram."""
    driver.get(f"{BASE_URL}/accounts/login/")

    if load_cookies(driver, config.COOKIES_FILE):
        driver.get(BASE_URL)
        time.sleep(random.uniform(3, 5))
        # Check if login was successful by looking for a profile icon or search bar
        try:
            WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "//input[@aria-label='Search input']")))
            logging.info("Login successful using session cookies.")
            return True
        except TimeoutException:
            logging.warning("Cookie login failed. Proceeding with manual login.")

    driver.get(f"{BASE_URL}/accounts/login/")
    time.sleep(random.uniform(3, 5))

    try:
        username_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "username"))
        )
        password_field = driver.find_element(By.NAME, "password")

        username_field.send_keys(username)
        time.sleep(random.uniform(1, 2))
        password_field.send_keys(password)
        time.sleep(random.uniform(1, 2))
        password_field.send_keys(Keys.RETURN)

        # Wait for login to complete by checking for a known element on the home page
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.XPATH, "//input[@aria-label='Search input'] | //div[contains(text(), 'profile picture')]"))
        )
        logging.info("Manual login successful.")

        handle_popups(driver)
        save_cookies(driver, config.COOKIES_FILE)
        return True

    except TimeoutException:
        logging.error("Login failed. Check your credentials or network connection.")
        logging.error("If you have 2FA enabled, you need to manually log in once and save cookies.")
        return False
    except Exception as e:
        logging.error(f"An unexpected error occurred during login: {e}")
        return False


def search_and_navigate(driver, keyword):
    """Searches for a keyword/hashtag and navigates to the results page."""
    logging.info(f"Searching for: {keyword}")
    try:
        search_icon = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//div/a[@href='/explore/']"))
        )
        search_icon.click()

        search_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//input[@aria-label='Search input']"))
        )
        search_input.send_keys(keyword)
        time.sleep(random.uniform(2, 4))

        # Click the first result, which is usually the correct hashtag/account
        first_result = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, f"//a[contains(@href, '/tags/{keyword.replace('#', '')}/')] | //a[contains(@href, '/{keyword}/')]"))
        )
        first_result.click()
        logging.info(f"Navigated to '{keyword}' page.")
        return True
    except TimeoutException:
        logging.error(f"Could not find or interact with the search bar for keyword: {keyword}")
        return False
    except Exception as e:
        logging.error(f"An error occurred during search: {e}")
        return False


def load_processed_urls():
    """Loads the set of already processed URLs from a file."""
    if os.path.exists(config.PROCESSED_URLS_FILE):
        try:
            with open(config.PROCESSED_URLS_FILE, 'r') as f:
                return set(json.load(f))
        except (json.JSONDecodeError, IOError) as e:
            logging.warning(f"Could not read processed URLs file: {e}. Starting fresh.")
    return set()


def save_processed_urls(processed_urls):
    """Saves the set of processed URLs to a file."""
    try:
        with open(config.PROCESSED_URLS_FILE, 'w') as f:
            json.dump(list(processed_urls), f)
    except IOError as e:
        logging.error(f"Could not save processed URLs file: {e}")


def collect_links(driver, limit):
    """Scrolls the page and collects reel/post URLs."""
    logging.info(f"Starting to collect up to {limit} reel/post URLs...")
    urls = set()
    processed_urls = load_processed_urls()

    last_height = driver.execute_script("return document.body.scrollHeight")

    while len(urls) < limit:
        # Find all links to posts/reels on the current screen
        links = driver.find_elements(By.XPATH, "//a[starts-with(@href, '/p/') or starts-with(@href, '/reel/')]")

        new_links_found = False
        for link in links:
            url = link.get_attribute('href')
            if url not in processed_urls and url not in urls:
                urls.add(url)
                new_links_found = True
                logging.info(f"Collected URL: {url} ({len(urls)}/{limit})")
                if len(urls) >= limit:
                    break

        if len(urls) >= limit:
            break

        # Scroll down
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(random.uniform(3, 5)) # Wait for new content to load

        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height and not new_links_found:
            logging.warning("Reached the end of the page or no new posts loaded. Stopping collection.")
            break
        last_height = new_height

    return list(urls)


def process_links(driver, urls):
    """Iterates through URLs, likes, and comments on them."""
    if not urls:
        logging.warning("No new URLs to process.")
        return

    processed_urls = load_processed_urls()

    for i, url in enumerate(urls):
        logging.info(f"--- Processing URL {i+1}/{len(urls)}: {url} ---")
        try:
            driver.get(url)
            time.sleep(random.uniform(4, 7))

            # --- Optional: Like the post ---
            if config.LIKE_POST:
                try:
                    # The like button is an SVG inside a button. We look for the "Like" label.
                    like_button_container = WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.XPATH, "//span/div/div/button/div/*[name()='svg' and @aria-label='Like']"))
                    )
                    # The parent of the svg is the clickable element
                    like_button = like_button_container.find_element(By.XPATH, "..")
                    like_button.click()
                    logging.info("✅ Liked the post.")
                    time.sleep(random.uniform(1, 3))
                except TimeoutException:
                    logging.warning("⚠️ Could not find the 'Like' button, it might already be liked.")
                except ElementClickInterceptedException:
                    logging.warning("⚠️ Like button was not clickable.")
                except Exception as e:
                    logging.error(f"An unexpected error occurred while trying to like: {e}")

            # --- Commenting ---
            try:
                # Click on the comment icon to open the comment box if it's not already visible
                comment_icon = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, "//div/span/*[name()='svg' and @aria-label='Comment']"))
                )
                comment_icon.click()
                time.sleep(random.uniform(2, 4))
            except (TimeoutException, ElementClickInterceptedException):
                # Sometimes the comment box is already there, so we just continue
                logging.info("Comment box already visible or icon not found, proceeding.")


            try:
                comment_box = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, "//textarea[@aria-label='Add a comment…']"))
                )

                chosen_comment = random.choice(config.COMMENTS)
                logging.info(f"Typing comment: '{chosen_comment}'")

                # Simulate human typing
                for char in chosen_comment:
                    comment_box.send_keys(char)
                    time.sleep(random.uniform(0.1, 0.3))

                time.sleep(random.uniform(1, 2))
                comment_box.send_keys(Keys.RETURN)

                # Wait for comment to appear
                WebDriverWait(driver, 15).until(
                    EC.presence_of_element_located((By.XPATH, f"//span[contains(text(), '{chosen_comment}')]"))
                )
                logging.info("✅ Commented successfully.")

            except TimeoutException:
                logging.warning("⚠️ Comment box not found or comments might be disabled for this post. Skipping comment.")
            except Exception as e:
                logging.error(f"An error occurred during commenting: {e}")

            processed_urls.add(url)
            save_processed_urls(processed_urls)

        except Exception as e:
            logging.error(f"Failed to process URL {url}: {e}")

        # Random delay before processing the next post
        sleep_time = random.uniform(10, 20)
        logging.info(f"Sleeping for {sleep_time:.2f} seconds before next post...")
        time.sleep(sleep_time)


def main():
    """Main function to run the Instagram bot."""
    setup_logging()
    logging.info("--- Instagram Bot Started ---")

    if config.USERNAME == "YOUR_USERNAME" or config.PASSWORD == "YOUR_PASSWORD":
        logging.error("Please update `config.py` with your Instagram credentials.")
        return

    driver = setup_driver()
    if not driver:
        return

    try:
        if not login(driver, config.USERNAME, config.PASSWORD):
            return

        if not search_and_navigate(driver, config.SEARCH_KEYWORD):
            return

        # Let the page load before collecting links
        time.sleep(random.uniform(5, 8))

        urls_to_process = collect_links(driver, config.REELS_LIMIT)

        if urls_to_process:
            process_links(driver, urls_to_process)
            logging.info("--- All tasks completed ---")
        else:
            logging.warning("Found no new posts to process in this session.")

    except Exception as e:
        logging.critical(f"A critical error occurred in the main loop: {e}", exc_info=True)
    finally:
        if driver:
            driver.quit()
            logging.info("--- Browser closed. Bot session ended. ---")


if __name__ == "__main__":
    main()
