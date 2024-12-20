import { Plugin, MarkdownView, PluginSettingTab, Notice, App, Setting } from 'obsidian';

// Define the ESV API base URL and your API key
const ESV_API_BASE_URL = "https://api.esv.org/v3/passage/text/";

interface ESVPluginSettings {
	apiKey: string;
	showFootnotes: boolean;
	showHeadings: boolean;
	showVerseNumbers: boolean;
	useCallout: boolean;
	calloutType: string;
}

const DEFAULT_SETTINGS: ESVPluginSettings = {
	apiKey: "",
	showFootnotes: true,
	showHeadings: true,
	showVerseNumbers: true,
	useCallout: true,
	calloutType: "example"
}

export default class ESVPlugin extends Plugin {
	settings: ESVPluginSettings;

	async onload() {
		await this.loadSettings();
		// Register the hotkey to trigger the function
		this.addCommand({
			id: 'fetch-esv-passage',
			name: 'Fetch ESV Passage',
			callback: () => this.fetchESVPassage()
		});
		this.addSettingTab(new ESVSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	// Function to fetch passage based on note title
	async fetchESVPassage() {
		// Get the current active file (note)
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice("No active file found!");
			return;
		}

		// Extract the title of the current note (e.g., "Genesis 1")
		const noteTitle = activeFile.basename;

		// Format the title to fit the ESV query
		const formattedTitle = encodeURIComponent(noteTitle);

		const apiKey = this.settings.apiKey;
		if (!apiKey) {
			new Notice("No API Set.  Please Set ESV API Key in Config Settings");
			return;
		}

		const queryParams: string[] = [];
		queryParams.push(`q=${formattedTitle}`);
		queryParams.push(`indent-paragraphs=0`);
		if(this.settings.showFootnotes === false) {
			queryParams.push(`include-footnotes=false`);
		}
		if(this.settings.showHeadings === false) {
			queryParams.push(`include-headings=false`);
		}
		if(this.settings.showVerseNumbers === false) {
			queryParams.push(`include-verse-numbers=false`);
		}
		const url = `${ESV_API_BASE_URL}?${queryParams.join('&')}`;
		// Make a request to the ESV API
		let response: Response;
		try {
			response = await fetch(url, {
				headers: {
					"Authorization": `Token ${apiKey}`
				}
			});

			const rawText = await response.text()

			if (!response.ok) {
				throw new Error(`Error fetching passage: ${response.statusText}`);	
			}

			const data = JSON.parse(rawText);
			
			// Extract the passage text from the API response
			const passageText = data.passages.join("\n\n");

			const lines: string[] = passageText.split("\n");
			const titleLine = lines.shift() || "No Title";
			
			let titlePrefix = "";
			let linePrefix = "";
			if (this.settings.useCallout) {
				titlePrefix = `> [!${this.settings.calloutType}]+ `;
				linePrefix = "> "
			}
			let blankLineCount = 0;
			let afterBlockquote = false;
			
			const processedLines = lines.map(line => {
				const trimmed = line.trim();
				if (trimmed === "") {
					blankLineCount++;
					if (blankLineCount >= 2) {
						afterBlockquote = true;
					}
					return linePrefix;
				} else {
					blankLineCount = 0;
					if (afterBlockquote) {
						const noLeading = line.replace(/^\s+/, "");
						afterBlockquote = false;
						return `${linePrefix}${noLeading}`;
					} else {
						return `${linePrefix}${line}`;
					}
				}
			});

			const calloutContent = `${titlePrefix}${titleLine}\n` 
				+ processedLines.join("\n")

			// Write the fetched passage to the active note
			const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
			if (editor) {
				const cursorPos = editor.getCursor();
				editor.replaceRange(calloutContent, cursorPos);
				new Notice(`Passage added to ${noteTitle}`);
			}
		} catch (error) {
			console.error('Fetch error:', error);
			new Notice(`Failed to fetch passage. Error: ${error}`);
		}
	}
}

class ESVSettingTab extends PluginSettingTab {
	plugin: ESVPlugin;
  
	constructor(app: App, plugin: ESVPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
  
	display(): void {
		const { containerEl } = this;
		containerEl.empty();
  
		containerEl.createEl('h2', { text: 'ESV Plugin Settings' });
  
		// API Key Setting
		new Setting(containerEl)
			.setName('ESV API Key')
			.setDesc('Enter your ESV API key.')
			.addText(text => text
				.setPlaceholder('Enter ESV API Key')
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value.trim();
					await this.plugin.saveSettings();
			})
		);
		// Footnotes Setting
		new Setting(containerEl)
			.setName('Show Footnotes')
			.setDesc('Include footnotes in the fetched passage')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showFootnotes)
				.onChange(async (value) => {
					this.plugin.settings.showFootnotes = value;
					await this.plugin.saveSettings();
				}					
				)
			)
		//Heading Setting
		new Setting(containerEl)
			.setName('Show Headings')
			.setDesc('Include section headings in the fetched passage')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showHeadings)
				.onChange(async (value) => {
					this.plugin.settings.showHeadings = value;
					await this.plugin.saveSettings();
				}					
				)
			)
		//Verse Number Setting
		new Setting(containerEl)
			.setName('Show Verse Numbers')
			.setDesc('Include verse numbers in the fetched passage')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showVerseNumbers)
				.onChange(async (value) => {
					this.plugin.settings.showVerseNumbers = value;
					await this.plugin.saveSettings();
				}					
				)
			)
		//Callout Setting
		new Setting(containerEl)
			.setName('Use Callout')
			.setDesc('Insert fetched passage into a callout')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useCallout)
				.onChange(async (value) => {
					this.plugin.settings.useCallout = value;
					await this.plugin.saveSettings();
				}					
				)
			)
		//Callout Type
		new Setting(containerEl)
			.setName('Callout type')
			.setDesc('Type of callout that callout feature uses')
			.addText(text => text
				.setPlaceholder('Enter callout type (e.g. note, warn, info)')
				.setValue(this.plugin.settings.calloutType)
				.onChange(async (value) => {
					this.plugin.settings.calloutType = value.trim();
					await this.plugin.saveSettings();
			})
		);
	}
  }