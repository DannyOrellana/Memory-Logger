// === Memory Logger Plugin ===

function createMemoryLoggerUI() {
  const container = document.createElement("div");
  container.id = "memoryLoggerContainer";

  // Inject your HTML as a string below
  container.innerHTML = `
    <h2>Memory Logger</h2>
    <label>
      <input type="checkbox" id="enableMemoryLogger">
      Enable Memory Logger
    </label>
    <hr>
    <label for="lorebookSelect"><strong>LoreBook:</strong></label>
    <select id="lorebookSelect">
      <option value="">-- Select LoreBook --</option>
    </select>
    <div id="ruleListSection">
      <h3>Rule List</h3>
      <ul id="ruleList" class="rule-list"></ul>
    </div>
    <hr>
    <h3>Create / Edit Rule</h3>
    <label for="ruleName">Rule Name:</label><br>
    <input type="text" id="ruleName" placeholder="e.g., Mood Tracker"><br><br>
    <label for="listenFor">Listen for (Trigger):</label><br>
    <input type="text" id="listenFor" placeholder="e.g., Event 1"><br><br>
    <label for="targets">Target Blocks (comma-separated):</label><br>
    <input type="text" id="targets" placeholder="e.g., Current Mood, Summary of Key Events"><br><br>
    <fieldset>
      <legend>Function:</legend>
      <label><input type="radio" name="entryFunction" value="add" checked> Add Entry</label><br>
      <label><input type="radio" name="entryFunction" value="amend"> Amend Entry</label><br>
      <label><input type="radio" name="entryFunction" value="only"> Only 1 Allowed (auto-replace)</label>
    </fieldset><br>
    <label for="wiKeywords">WI Entry Keywords:</label><br>
    <input type="text" id="wiKeywords" placeholder="e.g., Sydney Memory Log"><br><br>
    <button id="addEditRuleBtn">Add / Edit Rule</button>
    <button id="deleteRuleBtn" disabled>Delete Selected Rule</button>
  `;

  document.querySelector("#extensions").appendChild(container);
}

// Required export so SillyTavern recognizes the plugin
export default {
  id: "memory-logger",
  name: "Memory Logger",
  onEnable() {
    console.log("[Memory Logger] Enabled");
    createMemoryLoggerUI();
  },
  onDisable() {
    console.log("[Memory Logger] Disabled");
    const existing = document.querySelector("#memoryLoggerContainer");
    if (existing) existing.remove();
  }
};

plugin.onResponse = async function (responseText, context) {
    if (!pluginStorage.memoryLogger || !pluginStorage.memoryLogger.rules) return;

    for (let rule of pluginStorage.memoryLogger.rules) {
        if (responseText.includes(rule.trigger)) {
            const timestamp = new Date().toLocaleString();
            const entryText = `\n[${timestamp}] ${rule.insertText}`;

            await insertIntoWorldInfo(rule.targetEntry, rule.insertSection, entryText);
        }
    }
};

async function insertIntoWorldInfo(entryName, sectionMarker, newText) {
    const entries = worldInfo.getEntries();

    let entry = entries.find(e => e.entry === entryName);
    if (!entry) return;

    const markerIndex = entry.content.indexOf(sectionMarker);
    if (markerIndex === -1) return;

    const before = entry.content.substring(0, markerIndex + sectionMarker.length);
    const after = entry.content.substring(markerIndex + sectionMarker.length);

    entry.content = before + newText + after;

    await worldInfo.updateEntry(entry);
}
