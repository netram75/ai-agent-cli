import "dotenv/config";
import OpenAI from "openai";
import readline from "readline";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Groq — 100% free at console.groq.com
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ── Tools ──────────────────────────────────────────────────────────────────

function parseArgs(raw) {
  if (typeof raw === "object" && raw !== null) return raw;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return { cmd: raw }; }
  }
  return {};
}

async function createDirectory(raw) {
  const { dirpath } = parseArgs(raw);
  await fs.mkdir(path.resolve(dirpath), { recursive: true });
  return `Directory created: ${dirpath}`;
}

async function writeFile(raw) {
  const { filepath, content } = parseArgs(raw);
  const resolved = path.resolve(filepath);
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  await fs.writeFile(resolved, content, "utf8");
  return `File written: ${filepath} (${content.length} bytes)`;
}

async function readFile(raw) {
  const { filepath } = parseArgs(raw);
  return await fs.readFile(path.resolve(filepath), "utf8");
}

async function listFiles(raw) {
  const { dirpath } = parseArgs(raw);
  const entries = await fs.readdir(path.resolve(dirpath), { withFileTypes: true });
  if (entries.length === 0) return "Directory is empty";
  return entries.map((e) => `${e.isDirectory() ? "[DIR] " : "[FILE]"} ${e.name}`).join("\n");
}

async function executeCommand(raw) {
  const args = parseArgs(raw);
  const cmd = typeof args === "string" ? args : args.cmd || String(raw);
  const { stdout, stderr } = await execAsync(cmd, { timeout: 30000 });
  return stdout || stderr || "Done";
}

const TOOL_MAP = { createDirectory, writeFile, readFile, listFiles, executeCommand };

// ── System Prompt (kept short to stay within free-tier token limits) ───────

const SYSTEM_PROMPT = `You are an AI Agent CLI. Respond with exactly ONE valid JSON object per turn — no text outside JSON, no markdown fences.

Tools available:
  createDirectory : {"dirpath":"path"}
  writeFile       : {"filepath":"path/file","content":"full file content here"}
  readFile        : {"filepath":"path/file"}
  listFiles       : {"dirpath":"path"}
  executeCommand  : {"cmd":"shell command"}

Response format (choose one):
  {"step":"START",  "content":"what the user wants"}
  {"step":"THINK",  "content":"your reasoning"}
  {"step":"TOOL",   "content":"why","tool_name":"name","tool_args":{...}}
  {"step":"OUTPUT", "content":"message to user"}

Rules:
  - One JSON object per turn; system sends OBSERVE after every TOOL call
  - START → THINK (at least twice) → TOOL → wait for OBSERVE → repeat → OUTPUT
  - Never generate OBSERVE yourself
  - Write COMPLETE, REAL file content — never use [omitted], [...], placeholder, or truncation
  - All file paths are relative to current working directory`;

// ── Scaler website spec injected into the user message (not system prompt) ─

const SCALER_SPEC = `

Design spec for the Scaler Academy clone:
- Folder: scaler_clone/  Files: index.html (links styles.css + script.js), styles.css, script.js
- Color scheme: background #0f172a, card bg #1e293b, accent/buttons #f97316, body text #f1f5f9, muted #94a3b8
- Font: system-ui sans-serif, bold headings
- HEADER (sticky): left=orange circle with "S" + "Scaler" text; center nav=Courses, Events, Blog, Placements, About; right="Login" ghost btn + "Get Started" orange btn; hamburger icon for mobile
- HERO (2-col grid): left col: badge "India's #1 Tech Upskilling Platform", h1 "Master the Skills to Build the Future", p "Join 50,000+ learners placed in 900+ top companies", buttons "Start Learning"(orange) + "Watch Demo"(ghost), stats row (50K+ Learners | 900+ Companies | 4.8★ Rating); right col: dark code-editor card with fake window chrome and syntax-highlighted code
- COURSES section "Popular Programs": 4 cards — DSA & Competitive Programming, System Design, Full Stack Development, ML & AI Engineering; each card has icon, title, 2-line description, "Explore →" link
- FOOTER: 4 link columns (Company / Resources / Programs / Legal), social icons row (GitHub Twitter LinkedIn YouTube), copyright bar "© 2024 Scaler Academy. All rights reserved."
- RESPONSIVE: hamburger toggles mobile menu, grid becomes single column on mobile
- JS: smooth scroll, IntersectionObserver fade-in on scroll, hamburger menu toggle, stat counter animation`;

function enrichIfScaler(message) {
  if (/scaler/i.test(message) && /clone|copy|create|build|make/i.test(message)) {
    return message + SCALER_SPEC;
  }
  return message;
}

// ── API call with automatic retry on rate-limit errors ─────────────────────

async function callModel(messages) {
  const MAX_RETRIES = 5;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.2,
        max_tokens: 8192,
      });
      return response.choices[0].message.content;
    } catch (err) {
      const isRateLimit = err.status === 413 || err.status === 429;
      if (isRateLimit && attempt < MAX_RETRIES) {
        const wait = 61;
        console.log(`\n⏳ Rate limit reached. Waiting ${wait}s then retrying (attempt ${attempt}/${MAX_RETRIES})...\n`);
        await new Promise((r) => setTimeout(r, wait * 1000));
        continue;
      }
      throw err;
    }
  }
}

// ── Agent Loop ─────────────────────────────────────────────────────────────

async function runAgent(userMessage, history) {
  history.push({ role: "user", content: enrichIfScaler(userMessage) });
  console.log("\n🤖 Agent is processing your request...\n");

  const MAX_STEPS = 40;
  let steps = 0;

  while (steps++ < MAX_STEPS) {
    const raw = (await callModel(history))
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.error("⚠️  Non-JSON response, retrying…");
      history.push({ role: "assistant", content: raw });
      history.push({
        role: "user",
        content: JSON.stringify({
          step: "OBSERVE",
          content: "Not valid JSON. Reply with ONLY a JSON object.",
        }),
      });
      continue;
    }

    // For writeFile, store only filepath in history (never store content — avoids token bloat
    // and prevents the model from learning to write placeholder text like "[omitted]")
    if (parsed.step === "TOOL" && parsed.tool_name === "writeFile" && parsed.tool_args) {
      const args = parseArgs(parsed.tool_args);
      const slim = { step: parsed.step, content: parsed.content, tool_name: "writeFile", tool_args: { filepath: args.filepath } };
      history.push({ role: "assistant", content: JSON.stringify(slim) });
    } else {
      history.push({ role: "assistant", content: JSON.stringify(parsed) });
    }

    const { step } = parsed;

    if (step === "START") {
      console.log(`🚀 START\n   ${parsed.content}\n`);
      history.push({ role: "user", content: '{"step":"CONTINUE","content":"Proceed."}' });

    } else if (step === "THINK") {
      console.log(`💭 THINK\n   ${parsed.content}\n`);
      history.push({ role: "user", content: '{"step":"CONTINUE","content":"Proceed."}' });

    } else if (step === "TOOL") {
      const { tool_name, tool_args, content } = parsed;
      console.log(`🔧 TOOL [${tool_name}]${content ? " — " + content : ""}`);

      let observeContent;
      if (!TOOL_MAP[tool_name]) {
        observeContent = `Unknown tool "${tool_name}". Available: ${Object.keys(TOOL_MAP).join(", ")}`;
        console.log(`   ❌ ${observeContent}\n`);
      } else {
        try {
          observeContent = await TOOL_MAP[tool_name](tool_args);
          const preview = String(observeContent).length > 100
            ? String(observeContent).substring(0, 100) + "…"
            : String(observeContent);
          console.log(`   ✓ ${preview}\n`);
        } catch (err) {
          observeContent = `Error: ${err.message}`;
          console.log(`   ❌ ${observeContent}\n`);
        }
      }

      history.push({
        role: "user",
        content: JSON.stringify({ step: "OBSERVE", content: observeContent }),
      });

    } else if (step === "OUTPUT") {
      console.log(`\n✅ DONE\n   ${parsed.content}\n`);
      return;

    } else if (step === "OBSERVE") {
      history.push({
        role: "user",
        content: JSON.stringify({ step: "CONTINUE", content: "Continue to the next step." }),
      });
    }
  }

  console.log("\n⚠️  Reached maximum step limit.\n");
}

// ── CLI Interface ──────────────────────────────────────────────────────────

function main() {
  console.log("┌──────────────────────────────────────────────────────┐");
  console.log("│        AI Agent CLI Tool  (FREE — powered by Groq)   │");
  console.log("│                                                      │");
  console.log("│  Try: Clone the Scaler Academy website               │");
  console.log("│  Type 'exit' to quit                                 │");
  console.log("└──────────────────────────────────────────────────────┘\n");

  if (!process.env.GROQ_API_KEY) {
    console.error("❌  GROQ_API_KEY is not set.");
    console.error("    1. Go to https://console.groq.com and sign up (free)");
    console.error("    2. Create an API key");
    console.error("    3. Create a .env file:  GROQ_API_KEY=your_key_here\n");
    process.exit(1);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const history = [{ role: "system", content: SYSTEM_PROMPT }];

  function prompt() {
    rl.question("You: ", async (input) => {
      const text = input.trim();
      if (!text) { prompt(); return; }
      if (text.toLowerCase() === "exit") {
        console.log("\nGoodbye! 👋\n");
        rl.close();
        process.exit(0);
        return;
      }
      try {
        await runAgent(text, history);
      } catch (err) {
        console.error(`\n❌ Agent error: ${err.message}\n`);
      }
      // If stdin was piped and is now closed, don't try to ask again
      if (process.stdin.readableEnded) {
        process.exit(0);
      } else {
        prompt();
      }
    });
  }

  prompt();
}

main();
