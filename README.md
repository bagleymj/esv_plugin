# ESV Bible Passage Fetcher

This Obsidian plugin allows you to quickly fetch ESV (English Standard Version) Bible passages for use in your notes. By using the note’s title as the passage reference, you can instantly look up and embed Scripture without leaving your writing environment.

## Features
		Fetch Bible Passage:
Retrieve an ESV passage based on the current note’s title. For example, a note titled John 3.16-18 will fetch that passage when you run the command.
- Customizable Formatting:
  - Choose whether to include footnotes, headings, and verse numbers.
  - Display the passage inside a callout, optionally customizing the callout type (e.g., example, info, warning).

## Requirements
### ESV API Key:
This plugin requires an ESV API key, which you can obtain for free by registering at the [ESV API website](https://api.esv.org/docs/). Once you have an API key, open the plugin’s settings and enter it there.

## How It Works
1. Name Your Note with a Bible Reference:
    Create a note and name it according to the passage you want to fetch.
    Example:
  - John 3.16 for a single verse
  - Genesis 1.1-5 for a range of verses
    Note: Colons (:) are not allowed in Obsidian note titles. Instead, use a period (.) to separate chapter and verse. For example, John 3.16 instead of John 3:16.
2.  Fetch the Passage:
    Open the note and run the “Fetch ESV Passage” command from the command palette. The plugin will query the ESV API and insert the passage text at your cursor position.
	3.	Adjust Settings (Optional):
    In the plugin settings, you can:
    -	Toggle footnotes, headings, and verse numbers on or off.
    -	Enable or disable callouts.
    -	Select the callout type, if enabled, to visually style the fetched passage.
After adjusting the settings, run the command again, and the formatting will follow your preferences.

## Installation
From the Obsidian Community Plugins:
-	Open Settings > Community Plugins.
-	Click Browse, search for “ESV Bible Passage Fetcher”.
-	Click Install, then enable the plugin.
  

# Feedback and Contributions

If you encounter issues, have feature requests, or want to contribute improvements, please open an issue or submit a pull request on the GitHub repository.