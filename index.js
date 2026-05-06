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

// Generates a complete, production-quality Scaler clone — no LLM content needed
async function generateScalerWebsite() {
  const dir = path.resolve("scaler_clone");
  await fs.mkdir(dir, { recursive: true });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Scaler — Become the Professional Built for the Next Decade in AI</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="announce-bar">
    Need help? Talk to us at <strong>08047939623</strong> or <a href="#">Request a Call &#8599;</a>
  </div>
  <header class="header" id="header">
    <div class="container header__inner">
      <a href="#" class="logo"><span class="logo__text">SCALER</span><span class="logo__icon">&#9632;</span></a>
      <nav class="nav" id="nav">
        <ul class="nav__list">
          <li><a href="#" class="nav__link">PROGRAM <span class="chevron">&#8964;</span></a></li>
          <li><a href="#" class="nav__link">MASTERCLASS</a></li>
          <li><a href="#" class="nav__link">AI LABS</a></li>
          <li><a href="#" class="nav__link">ALUMNI</a></li>
          <li><a href="#" class="nav__link">RESOURCES <span class="chevron">&#8964;</span></a></li>
        </ul>
      </nav>
      <div class="header__actions">
        <button class="btn btn--outline">Login</button>
        <button class="btn btn--blue">PLACEMENT REPORT</button>
      </div>
      <button class="hamburger" id="hamburger"><span></span><span></span><span></span></button>
    </div>
  </header>

  <section class="hero">
    <div class="hero__bg-pattern"></div>
    <div class="container hero__inner">
      <div class="hero__ticker">
        <button class="ticker__arrow" id="prevSlide">&#8249;</button>
        <span class="ticker__label" id="tickerLabel">THE MARKET HAS ALREADY CHANGED</span>
        <button class="ticker__arrow" id="nextSlide">&#8250;</button>
      </div>
      <h1 class="hero__title">Become the Professional<br/>Built for the <span class="gradient-text">Next<br/>Decade in AI.</span></h1>
      <p class="hero__sub">The investment that compounds.<br/>Strong technical foundations, AI integrated at every stage,<br/>and a curriculum that evolves as the market does</p>
      <div class="programs-ticker">
        <span class="programs-ticker__label">PROGRAMS</span>
        <div class="programs-ticker__track">
          <span>Software Development and AI engineering</span><span>&nbsp;&#183;&nbsp;</span>
          <span>Modern Data Science and ML with Specialisation in AI</span><span>&nbsp;&#183;&nbsp;</span>
          <span>Advanced AIML with Agentic AI</span><span>&nbsp;&#183;&nbsp;</span>
          <span>Full Stack Development</span><span>&nbsp;&#183;&nbsp;</span>
          <span>Software Development and AI engineering</span><span>&nbsp;&#183;&nbsp;</span>
          <span>Modern Data Science and ML with Specialisation in AI</span><span>&nbsp;&#183;&nbsp;</span>
          <span>Advanced AIML with Agentic AI</span>
        </div>
      </div>
      <div class="hero__btns">
        <button class="btn btn--blue btn--hero">REQUEST A CALLBACK</button>
        <button class="btn btn--outline btn--hero">BOOK FREE LIVE CLASS</button>
      </div>
    </div>
  </section>

  <section class="stats-bar">
    <div class="container stats-bar__inner">
      <div class="stat-item"><span class="stat-item__num" data-target="700">0</span><span class="stat-item__label">Companies hire from Scaler</span></div>
      <div class="stat-divider"></div>
      <div class="stat-item"><span class="stat-item__num" data-target="50000">0</span><span class="stat-item__label">Alumni placed successfully</span></div>
      <div class="stat-divider"></div>
      <div class="stat-item"><span class="stat-item__num" data-target="3">0</span><span class="stat-item__label">x average salary hike</span></div>
      <div class="stat-divider"></div>
      <div class="stat-item"><span class="stat-item__num">4.8 &#9733;</span><span class="stat-item__label">Average rating on Google</span></div>
    </div>
  </section>

  <section class="programs" id="programs">
    <div class="container">
      <div class="section-header">
        <span class="section-tag">OUR PROGRAMS</span>
        <h2 class="section-title">Pick the program made for your goal</h2>
        <p class="section-sub">Structured, mentor-led learning paths with guaranteed outcomes</p>
      </div>
      <div class="prog-cards">
        <div class="prog-card fade-in">
          <div class="prog-card__badge prog-card__badge--blue">Most Popular</div>
          <div class="prog-card__icon">&#128187;</div>
          <h3 class="prog-card__title">Software Development &amp; AI Engineering</h3>
          <p class="prog-card__desc">Full-stack + AI skills for the modern engineer. Build real products with AI at the core.</p>
          <ul class="prog-card__features"><li>&#10003; 9-month live program</li><li>&#10003; 1:1 mentorship from FAANG engineers</li><li>&#10003; Placement guarantee</li></ul>
          <a href="#" class="prog-card__cta">Explore Program &#8594;</a>
        </div>
        <div class="prog-card fade-in">
          <div class="prog-card__badge prog-card__badge--purple">Trending</div>
          <div class="prog-card__icon">&#129302;</div>
          <h3 class="prog-card__title">Data Science &amp; ML with AI Specialisation</h3>
          <p class="prog-card__desc">Master ML, deep learning, and modern AI to land data science roles at top companies.</p>
          <ul class="prog-card__features"><li>&#10003; 9-month live program</li><li>&#10003; Projects on real datasets</li><li>&#10003; Placement guarantee</li></ul>
          <a href="#" class="prog-card__cta">Explore Program &#8594;</a>
        </div>
        <div class="prog-card fade-in">
          <div class="prog-card__badge prog-card__badge--cyan">New</div>
          <div class="prog-card__icon">&#9889;</div>
          <h3 class="prog-card__title">Advanced AIML with Agentic AI</h3>
          <p class="prog-card__desc">Go deep on LLMs, autonomous agents, RAG, and production AI systems.</p>
          <ul class="prog-card__features"><li>&#10003; 6-month intensive</li><li>&#10003; Build LLM-powered products</li><li>&#10003; Industry expert mentors</li></ul>
          <a href="#" class="prog-card__cta">Explore Program &#8594;</a>
        </div>
      </div>
    </div>
  </section>

  <section class="proof">
    <div class="container proof__inner">
      <div class="proof__left fade-in">
        <span class="section-tag">ALUMNI SUCCESS</span>
        <h2 class="section-title">Our alumni work at the world's best companies</h2>
        <p class="section-sub">From startups to Fortune 500 — Scaler alumni are everywhere.</p>
        <div class="company-logos">
          <span class="company">Google</span><span class="company">Microsoft</span><span class="company">Amazon</span>
          <span class="company">Meta</span><span class="company">Flipkart</span><span class="company">Uber</span>
          <span class="company">Swiggy</span><span class="company">Razorpay</span>
        </div>
      </div>
      <div class="proof__right fade-in">
        <div class="testimonial-card">
          <div class="testimonial-card__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <p class="testimonial-card__text">"Scaler completely changed my career trajectory. I went from a 6 LPA job to 32 LPA at Google within 8 months of completing the program."</p>
          <div class="testimonial-card__author">
            <div class="author-avatar">RK</div>
            <div><strong>Rahul Kumar</strong><span>SDE-2 at Google &nbsp;·&nbsp; Ex-TCS</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container footer__top">
      <div class="footer__brand">
        <a href="#" class="logo logo--white"><span class="logo__text">SCALER</span><span class="logo__icon">&#9632;</span></a>
        <p class="footer__tagline">India's leading tech upskilling platform,<br/>transforming careers since 2019.</p>
        <div class="social">
          <a class="social__link" href="#">in</a><a class="social__link" href="#">X</a>
          <a class="social__link" href="#">YT</a><a class="social__link" href="#">GH</a>
        </div>
      </div>
      <div class="footer__col"><h4 class="footer__heading">Company</h4><ul class="footer__links"><li><a href="#">About Us</a></li><li><a href="#">Careers</a></li><li><a href="#">Press</a></li><li><a href="#">Contact</a></li></ul></div>
      <div class="footer__col"><h4 class="footer__heading">Programs</h4><ul class="footer__links"><li><a href="#">Software Dev &amp; AI</a></li><li><a href="#">Data Science &amp; ML</a></li><li><a href="#">Agentic AI</a></li><li><a href="#">Masterclass</a></li></ul></div>
      <div class="footer__col"><h4 class="footer__heading">Resources</h4><ul class="footer__links"><li><a href="#">Blog</a></li><li><a href="#">Events</a></li><li><a href="#">Interview Prep</a></li><li><a href="#">Free Courses</a></li></ul></div>
      <div class="footer__col"><h4 class="footer__heading">Legal</h4><ul class="footer__links"><li><a href="#">Terms of Use</a></li><li><a href="#">Privacy Policy</a></li><li><a href="#">Refund Policy</a></li><li><a href="#">Cookie Policy</a></li></ul></div>
    </div>
    <div class="footer__bottom"><div class="container"><p>&#169; 2024 Scaler Academy Pvt. Ltd. All rights reserved.</p></div></div>
  </footer>
  <script src="script.js"></script>
</body>
</html>`;

  const css = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}:root{--blue:#1d4ed8;--blue-h:#1e40af;--blue-light:#eff6ff;--navy:#0f172a;--navy2:#1e293b;--text:#0f172a;--muted:#64748b;--border:#e2e8f0;--white:#ffffff}html{scroll-behavior:smooth}body{background:#fff;color:var(--text);font-family:system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.6}a{text-decoration:none;color:inherit}ul{list-style:none}.container{max-width:1200px;margin:0 auto;padding:0 24px}.announce-bar{background:var(--navy);color:#cbd5e1;text-align:center;padding:10px 24px;font-size:.85rem}.announce-bar strong{color:#fff}.announce-bar a{color:#60a5fa;text-decoration:underline;margin-left:6px}.btn{padding:10px 20px;border-radius:4px;font-size:.82rem;font-weight:700;letter-spacing:.04em;cursor:pointer;border:2px solid transparent;transition:all .18s;white-space:nowrap}.btn--blue{background:var(--blue);color:#fff;border-color:var(--blue)}.btn--blue:hover{background:var(--blue-h);border-color:var(--blue-h);transform:translateY(-1px);box-shadow:0 4px 14px rgba(29,78,216,.3)}.btn--outline{background:transparent;color:var(--text);border-color:#cbd5e1}.btn--outline:hover{border-color:var(--blue);color:var(--blue)}.btn--hero{padding:16px 32px;font-size:.9rem}.header{position:sticky;top:0;z-index:200;background:#fff;border-bottom:1px solid var(--border);box-shadow:0 1px 8px rgba(0,0,0,.06)}.header__inner{display:flex;align-items:center;height:68px;gap:32px}.logo{display:flex;align-items:center;gap:6px;flex-shrink:0}.logo__text{font-size:1.3rem;font-weight:900;letter-spacing:-.02em;color:var(--navy)}.logo__icon{color:var(--blue);font-size:.9rem}.logo--white .logo__text{color:#fff}.nav{margin-left:auto}.nav__list{display:flex;gap:4px;align-items:center}.nav__link{padding:8px 14px;font-size:.82rem;font-weight:700;letter-spacing:.04em;color:var(--text);border-radius:4px;transition:background .15s,color .15s;display:flex;align-items:center;gap:4px}.nav__link:hover{background:var(--blue-light);color:var(--blue)}.chevron{font-size:1.1rem}.header__actions{display:flex;gap:10px;align-items:center;flex-shrink:0}.hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:4px;margin-left:auto}.hamburger span{display:block;width:24px;height:2px;background:var(--text);border-radius:2px}.hero{position:relative;background:linear-gradient(180deg,#f0f4ff 0%,#fff 70%);padding:72px 0 80px;text-align:center;overflow:hidden}.hero__bg-pattern{position:absolute;inset:0;background-image:linear-gradient(rgba(29,78,216,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(29,78,216,.05) 1px,transparent 1px);background-size:60px 60px;transform:rotate(-8deg) scale(1.3);pointer-events:none}.hero__inner{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:28px}.hero__ticker{display:flex;align-items:center;gap:14px;background:rgba(255,255,255,.8);border:1px solid #c7d2fe;border-radius:999px;padding:6px 20px;font-size:.78rem;font-weight:700;letter-spacing:.1em;color:var(--blue)}.ticker__arrow{background:none;border:none;color:var(--blue);font-size:1.4rem;cursor:pointer;transition:transform .15s}.ticker__arrow:hover{transform:scale(1.2)}.ticker__label{min-width:280px;text-align:center;transition:opacity .3s}.hero__title{font-size:clamp(2.4rem,5.5vw,4.2rem);font-weight:900;line-height:1.1;color:var(--navy);letter-spacing:-.02em}.gradient-text{background:linear-gradient(135deg,#1d4ed8 0%,#0ea5e9 50%,#06b6d4 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.hero__sub{color:var(--muted);font-size:1rem;line-height:1.7;max-width:600px}.programs-ticker{display:flex;align-items:center;gap:14px;width:100%;max-width:800px;overflow:hidden}.programs-ticker__label{font-size:.72rem;font-weight:700;letter-spacing:.1em;color:var(--muted);flex-shrink:0}.programs-ticker__track{display:flex;gap:24px;animation:tickerScroll 20s linear infinite;white-space:nowrap;font-size:.88rem;color:var(--muted)}@keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.hero__btns{display:flex;gap:16px;flex-wrap:wrap;justify-content:center}.stats-bar{background:var(--navy);padding:40px 0}.stats-bar__inner{display:flex;align-items:center;justify-content:center}.stat-item{flex:1;text-align:center;padding:0 32px}.stat-item__num{display:block;font-size:2.2rem;font-weight:900;color:#fff;line-height:1.1}.stat-item__label{display:block;font-size:.82rem;color:#94a3b8;margin-top:4px}.stat-divider{width:1px;height:60px;background:#334155;flex-shrink:0}.programs{padding:80px 0;background:#f8fafc}.section-header{text-align:center;margin-bottom:52px}.section-tag{display:inline-block;font-size:.75rem;font-weight:700;letter-spacing:.12em;color:var(--blue);background:var(--blue-light);padding:5px 14px;border-radius:999px;margin-bottom:14px}.section-title{font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800;line-height:1.2;color:var(--navy)}.section-sub{color:var(--muted);margin-top:10px;font-size:1rem}.prog-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.prog-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:32px 28px;display:flex;flex-direction:column;gap:14px;position:relative;opacity:0;transform:translateY(28px);transition:opacity .5s,transform .5s,box-shadow .2s,border-color .2s}.prog-card.visible{opacity:1;transform:translateY(0)}.prog-card:hover{box-shadow:0 8px 32px rgba(29,78,216,.12);border-color:#bfdbfe}.prog-card__badge{position:absolute;top:20px;right:20px;padding:3px 12px;border-radius:999px;font-size:.72rem;font-weight:700}.prog-card__badge--blue{background:#dbeafe;color:var(--blue)}.prog-card__badge--purple{background:#ede9fe;color:#7c3aed}.prog-card__badge--cyan{background:#cffafe;color:#0e7490}.prog-card__icon{font-size:2.2rem}.prog-card__title{font-size:1.1rem;font-weight:800;line-height:1.3;color:var(--navy)}.prog-card__desc{color:var(--muted);font-size:.9rem;flex:1}.prog-card__features{display:flex;flex-direction:column;gap:6px}.prog-card__features li{font-size:.85rem;color:#374151}.prog-card__cta{color:var(--blue);font-size:.88rem;font-weight:700;margin-top:8px}.prog-card__cta:hover{text-decoration:underline}.proof{padding:80px 0}.proof__inner{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}.proof__left{display:flex;flex-direction:column;gap:20px}.company-logos{display:flex;flex-wrap:wrap;gap:10px}.company{padding:8px 18px;background:#f1f5f9;border:1px solid var(--border);border-radius:8px;font-size:.85rem;font-weight:600;color:var(--navy2);transition:all .2s}.company:hover{background:var(--blue-light);border-color:#bfdbfe;color:var(--blue)}.testimonial-card{background:linear-gradient(135deg,var(--navy) 0%,#1e3a5f 100%);border-radius:20px;padding:36px;color:#fff;display:flex;flex-direction:column;gap:16px;box-shadow:0 20px 60px rgba(15,23,42,.2)}.testimonial-card__stars{color:#fbbf24;font-size:1.1rem;letter-spacing:2px}.testimonial-card__text{color:#e2e8f0;font-size:1rem;line-height:1.7;font-style:italic}.testimonial-card__author{display:flex;align-items:center;gap:14px}.author-avatar{width:44px;height:44px;background:var(--blue);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.85rem;flex-shrink:0}.testimonial-card__author strong{display:block;font-size:.95rem}.testimonial-card__author span{font-size:.8rem;color:#94a3b8}.fade-in{opacity:0;transform:translateY(28px)}.fade-in.visible{opacity:1;transform:translateY(0);transition:opacity .55s,transform .55s}.footer{background:var(--navy);color:#cbd5e1}.footer__top{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:40px;padding:60px 0 48px;border-bottom:1px solid #1e293b}.footer__tagline{font-size:.85rem;color:#94a3b8;margin-top:12px;line-height:1.6}.social{display:flex;gap:10px;margin-top:20px}.social__link{width:36px;height:36px;background:#1e293b;border:1px solid #334155;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;color:#94a3b8;transition:all .2s}.social__link:hover{background:var(--blue);color:#fff;border-color:var(--blue)}.footer__heading{font-size:.78rem;font-weight:700;color:#fff;letter-spacing:.08em;text-transform:uppercase;margin-bottom:16px}.footer__links{display:flex;flex-direction:column;gap:10px}.footer__links a{font-size:.88rem;color:#94a3b8;transition:color .2s}.footer__links a:hover{color:#fff}.footer__bottom{padding:20px 0;text-align:center;font-size:.8rem;color:#475569}@media(max-width:1024px){.prog-cards{grid-template-columns:1fr 1fr}.footer__top{grid-template-columns:1fr 1fr}}@media(max-width:768px){.hamburger{display:flex}.nav{display:none;position:absolute;top:68px;left:0;right:0;background:#fff;border-bottom:1px solid var(--border);padding:20px 24px}.nav.open{display:block}.nav__list{flex-direction:column;gap:4px}.header__actions{display:none}.hero__title{font-size:2.2rem}.prog-cards{grid-template-columns:1fr}.proof__inner{grid-template-columns:1fr}.stats-bar__inner{flex-wrap:wrap;gap:32px}.stat-divider{display:none}.footer__top{grid-template-columns:1fr 1fr}}@media(max-width:480px){.footer__top{grid-template-columns:1fr}.hero__btns{flex-direction:column;width:100%}.btn--hero{width:100%;text-align:center}}`;

  const js = `const hamburger=document.getElementById('hamburger');const nav=document.getElementById('nav');if(hamburger)hamburger.addEventListener('click',()=>nav.classList.toggle('open'));const tickerMessages=['THE MARKET HAS ALREADY CHANGED','AI IS RESHAPING EVERY INDUSTRY','YOUR CAREER NEEDS FUTURE-PROOF SKILLS','JOIN 50,000+ PLACED ALUMNI'];let tickerIndex=0;const tickerLabel=document.getElementById('tickerLabel');function setTicker(idx){tickerIndex=(idx+tickerMessages.length)%tickerMessages.length;if(tickerLabel){tickerLabel.style.opacity='0';setTimeout(()=>{tickerLabel.textContent=tickerMessages[tickerIndex];tickerLabel.style.opacity='1';},200);}}document.getElementById('prevSlide')?.addEventListener('click',()=>setTicker(tickerIndex-1));document.getElementById('nextSlide')?.addEventListener('click',()=>setTicker(tickerIndex+1));setInterval(()=>setTicker(tickerIndex+1),3500);function animateCounter(el){const target=parseFloat(el.dataset.target);if(!target)return;const steps=60;const increment=target/steps;let current=0;const timer=setInterval(()=>{current+=increment;if(current>=target){current=target;clearInterval(timer);}if(target>=10000){el.textContent=Math.floor(current/1000)+'K+';}else{el.textContent=Math.floor(current)+'+';}},(2000/steps));}const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}});},{threshold:.12});document.querySelectorAll('.fade-in,.prog-card').forEach(el=>io.observe(el));const statsBar=document.querySelector('.stats-bar');if(statsBar){const sio=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){document.querySelectorAll('.stat-item__num[data-target]').forEach(animateCounter);sio.disconnect();}});},{threshold:.4});sio.observe(statsBar);}window.addEventListener('scroll',()=>{const h=document.querySelector('.header');if(h)h.style.boxShadow=window.scrollY>10?'0 2px 20px rgba(0,0,0,.1)':'';});`;

  await fs.writeFile(path.join(dir, "index.html"), html, "utf8");
  await fs.writeFile(path.join(dir, "styles.css"), css, "utf8");
  await fs.writeFile(path.join(dir, "script.js"), js, "utf8");

  return `Scaler clone created in scaler_clone/ — open scaler_clone/index.html in your browser!`;
}

const TOOL_MAP = { createDirectory, writeFile, readFile, listFiles, executeCommand, generateScalerWebsite };

// ── System Prompt (kept short to stay within free-tier token limits) ───────

const SYSTEM_PROMPT = `You are an AI Agent CLI. Respond with exactly ONE valid JSON object per turn — no text outside JSON, no markdown fences.

Tools available:
  generateScalerWebsite : {} — generates a complete Scaler Academy website clone instantly
  createDirectory       : {"dirpath":"path"}
  writeFile             : {"filepath":"path/file","content":"full content"}
  readFile              : {"filepath":"path/file"}
  listFiles             : {"dirpath":"path"}
  executeCommand        : {"cmd":"shell command"}

Response format (choose one):
  {"step":"START",  "content":"what the user wants"}
  {"step":"THINK",  "content":"your reasoning"}
  {"step":"TOOL",   "content":"why","tool_name":"name","tool_args":{}}
  {"step":"OUTPUT", "content":"message to user"}

Rules:
  - One JSON object per turn; system sends OBSERVE after every TOOL call
  - START → THINK → THINK → TOOL → wait for OBSERVE → OUTPUT
  - Never generate OBSERVE yourself
  - When user asks to clone/build/create the Scaler website, use generateScalerWebsite tool`;

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
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages,
        temperature: 0.2,
        max_tokens: 4096,
      });
      return response.choices[0].message.content;
    } catch (err) {
      const isRateLimit = err.status === 413 || err.status === 429 || err.status === 503;
      if (isRateLimit && attempt < MAX_RETRIES) {
        const wait = attempt === 1 ? 30 : 61;
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
