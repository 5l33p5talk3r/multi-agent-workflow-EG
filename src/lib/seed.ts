import { db } from "@/db";
import { users, agents, workflows, executions, contentItems, nicheTrends } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    // Check if user already exists
    const existingUsers = await db.select().from(users).where(eq(users.id, "demo-user-1"));
    if (existingUsers.length > 0) {
      return { success: true, message: "Database already seeded" };
    }

    // 1. Create Demo Users
    await db.insert(users).values([
      {
        id: "demo-user-1",
        email: "alex@creator-swarm.ai",
        name: "Alex Rivera",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
        niche: "AI & Indie Dev Tools",
        brandVoice: "Pragmatic, code-first, high signal-to-noise ratio, zero fluff, slightly irreverent humor.",
        apiKeys: JSON.stringify({ openai: "sk-demo-key", anthropic: "sk-ant-demo-key" }),
      },
      {
        id: "demo-user-2",
        email: "maya@longevity-lab.io",
        name: "Dr. Maya Lin",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
        niche: "Biohacking & Longevity",
        brandVoice: "Rigorous scientific backing, protocol-driven, actionable summary tables, accessible jargon.",
        apiKeys: JSON.stringify({ openai: "sk-demo-key" }),
      },
    ]);

    // 2. Create Default Agents for Alex Rivera
    await db.insert(agents).values([
      {
        id: "agent-trend-hunter",
        userId: "demo-user-1",
        name: "Nexus Trend Hunter",
        role: "Niche Trend Researcher & Signal Extractor",
        avatar: "🔍",
        color: "emerald",
        model: "Claude 3.5 Sonnet",
        temperature: 0.5,
        systemPrompt: "You are an elite trend researcher for tech & developer creators. You scour GitHub trending, Hacker News, X dev discussions, and paper preprints to identify high-potential signals before they hit mainstream tech media. Provide concise bullet points with verified context.",
        tools: JSON.stringify(["web_search", "github_trending", "hacker_news_scraper", "signal_filter"]),
        isDefault: true,
      },
      {
        id: "agent-hook-arch",
        userId: "demo-user-1",
        name: "Hook Smith",
        role: "Content Strategist & Hook Architect",
        avatar: "🪝",
        color: "amber",
        model: "GPT-4o",
        temperature: 0.8,
        systemPrompt: "You craft high-converting hooks, curiosity gaps, and contrarian openings for developer content. You know how to capture high-IQ tech audiences without sounding like cheap clickbait. Give 5 distinct hook variations with predicted viral scores.",
        tools: JSON.stringify(["hook_scorer", "curiosity_gap_checker", "pattern_interrupt_gen"]),
        isDefault: true,
      },
      {
        id: "agent-tech-writer",
        userId: "demo-user-1",
        name: "Deep Code Writer",
        role: "Technical Script & Article Writer",
        avatar: "📝",
        color: "indigo",
        model: "Claude 3.5 Sonnet",
        temperature: 0.6,
        systemPrompt: "You are a master technical communicator. You write lucid, step-by-step code breakdowns, architecture explanations, and technical scripts. Never use generic corporate speak like 'delve', 'testament', or 'in today's fast-paced world'. Keep it direct, clean, and developer-focused.",
        tools: JSON.stringify(["code_syntax_highlighter", "benchmarking_tool", "diagram_mermaid_gen"]),
        isDefault: true,
      },
      {
        id: "agent-brand-critic",
        userId: "demo-user-1",
        name: "Voice & Integrity Guard",
        role: "Brand Voice & Quality Critic",
        avatar: "🛡️",
        color: "rose",
        model: "DeepSeek-R1",
        temperature: 0.3,
        systemPrompt: "You evaluate content drafts against the author's brand voice. You aggressively flag generic AI phrasing, fluff, unverified claims, and weak transitions. Suggest exact text replacements and rate brand alignment from 1-100.",
        tools: JSON.stringify(["fluff_detector", "ai_phrase_scrubber", "tone_matcher"]),
        isDefault: true,
      },
      {
        id: "agent-seo-amplification",
        userId: "demo-user-1",
        name: "Algo Amplifier",
        role: "SEO & Platform Optimization Specialist",
        avatar: "🚀",
        color: "cyan",
        model: "GPT-4o-mini",
        temperature: 0.4,
        systemPrompt: "You optimize titles, metadata, tags, YouTube thumbnail text, Substack preheaders, and algorithmic keywords tailored specifically for developer and tech communities.",
        tools: JSON.stringify(["keyword_density_check", "thumbnail_text_optimizer", "hashtag_relevance"]),
        isDefault: true,
      },
      {
        id: "agent-atomizer",
        userId: "demo-user-1",
        name: "Multi-Platform Atomizer",
        role: "Platform Reformatting Engine",
        avatar: "⚛️",
        color: "purple",
        model: "Claude 3.5 Sonnet",
        temperature: 0.7,
        systemPrompt: "You take a single master deep-dive piece and convert it into native formats for: X/Twitter thread (8 posts), Substack Newsletter section, LinkedIn Carousel slides, and YouTube Shorts 60s voiceover script with visual cues.",
        tools: JSON.stringify(["x_thread_formatter", "linkedin_carousel_builder", "shorts_script_formatter"]),
        isDefault: true,
      },
    ]);

    // 3. Create Demo Workflows
    const defaultNodes1 = [
      {
        id: "step-1",
        agentId: "agent-trend-hunter",
        name: "Niche Signal & Context Extraction",
        order: 1,
        humanApprovalRequired: false,
        promptTemplate: "Analyze the topic '{{topic}}' in the {{niche}} niche. Extract key tech capabilities, architecture innovations, performance benchmarks, and potential pitfalls.",
        outputKey: "research_summary",
      },
      {
        id: "step-2",
        agentId: "agent-hook-arch",
        name: "Hook & Frame Generation",
        order: 2,
        humanApprovalRequired: false,
        promptTemplate: "Based on the research output:\n{{research_summary}}\n\nGenerate 5 high-performing hooks for YouTube, Substack, and X/Twitter. Include contrarian angles and problem-first hooks.",
        outputKey: "hooks",
      },
      {
        id: "step-3",
        agentId: "agent-tech-writer",
        name: "Master Longform Script / Article Draft",
        order: 3,
        humanApprovalRequired: false,
        promptTemplate: "Write a full master technical breakdown using hook #1. Include code snippets, practical setup commands, architecture flow, and real-world trade-offs.\n\nResearch context:\n{{research_summary}}",
        outputKey: "master_draft",
      },
      {
        id: "step-4",
        agentId: "agent-brand-critic",
        name: "Brand Voice & Fluff Critique",
        order: 4,
        humanApprovalRequired: true,
        promptTemplate: "Review the master draft:\n{{master_draft}}\n\nCheck for brand tone alignment (Pragmatic, zero fluff). Remove repetitive statements, AI buzzwords, and refine code snippets for maximum clarity.",
        outputKey: "critique_and_refined_draft",
      },
      {
        id: "step-5",
        agentId: "agent-atomizer",
        name: "Multi-Platform Atomization",
        order: 5,
        humanApprovalRequired: false,
        promptTemplate: "Using the refined draft:\n{{critique_and_refined_draft}}\n\nReformat into 4 native platform packages:\n1. X/Twitter Thread (8 posts with code blocks)\n2. Substack Issue (Title, Preheader, Body, Key Takeaways)\n3. LinkedIn Post (Clean bullet points with high visual structure)\n4. YouTube Shorts Script (60s with timer cues & visual directions)",
        outputKey: "multi_platform_outputs",
      },
    ];

    const defaultNodes2 = [
      {
        id: "step-1",
        agentId: "agent-trend-hunter",
        name: "Weekly Niche News Digest",
        order: 1,
        humanApprovalRequired: false,
        promptTemplate: "Gather top 3 industry developments in '{{topic}}'.",
        outputKey: "digest_research",
      },
      {
        id: "step-2",
        agentId: "agent-tech-writer",
        name: "Substack Issue Generation",
        order: 2,
        humanApprovalRequired: false,
        promptTemplate: "Draft a 1,200 word newsletter issue based on: {{digest_research}}",
        outputKey: "newsletter_draft",
      },
      {
        id: "step-3",
        agentId: "agent-seo-amplification",
        name: "Subject Line & CTA Optimization",
        order: 3,
        humanApprovalRequired: false,
        promptTemplate: "Optimize subject lines, preview text, and social thumbnail copy for: {{newsletter_draft}}",
        outputKey: "seo_meta",
      },
    ];

    await db.insert(workflows).values([
      {
        id: "wf-viral-tech-breakdown",
        userId: "demo-user-1",
        title: "Viral Tech Tool Breakdown Engine",
        description: "5-Agent Swarm pipeline: Trend Research → Hook Architecture → Technical Draft → Brand Voice Critique → Multi-Platform Multi-Export",
        nicheCategory: "AI & Dev Tools",
        isTemplate: true,
        nodes: JSON.stringify(defaultNodes1),
      },
      {
        id: "wf-weekly-newsletter",
        userId: "demo-user-1",
        title: "Weekly Deep-Dive Substack Swarm",
        description: "Curates trending repositories, benchmarks new models, and generates a polished email newsletter with SEO metadata.",
        nicheCategory: "Substack & Longform",
        isTemplate: true,
        nodes: JSON.stringify(defaultNodes2),
      },
      {
        id: "wf-micro-atomizer",
        userId: "demo-user-1",
        title: "Micro-Content Social Atomizer",
        description: "Slices any technical topic or repository link into 7 daily posts, 3 LinkedIn carousels, and 2 YouTube Shorts scripts.",
        nicheCategory: "Social Media Swarm",
        isTemplate: false,
        nodes: JSON.stringify(defaultNodes1.slice(1)),
      },
    ]);

    // 4. Create Demo Executions
    const sampleScratchpad = {
      research_summary: "Local AI agents running on Apple Silicon (M-series GPUs) using MLX framework achieved 3x speedup over standard llama.cpp bindings. Memory bandwidth in M3 Max allows 70B parameter models to run quantized at 18 tokens/sec locally without cloud costs or latency.",
      hooks: [
        "1. Stop paying OpenAI $2,000/mo for agent API calls. Apple Silicon just changed everything.",
        "2. How I ran a 6-agent autonomous swarm locally on an M3 MacBook Air (No cloud required).",
        "3. MLX vs Ollama in 2025: The local AI engine benchmark developer creators aren't talking about.",
        "4. Why local-first agent swarms are replacing serverless cloud pipelines for niche workflows.",
        "5. The zero-cost AI stack for solo builders: Unified memory + MLX + Local PG."
      ],
      master_draft: "# How to Build Local AI Agent Swarms on Apple Silicon\n\nCloud API latency is killing reactive agent workflows. When running 5 autonomous agents in sequence, 500ms roundtrip API latency compounds into a frustrating 8-second delay before human feedback.\n\nHere is how Apple Silicon's unified memory architecture changes the game using MLX framework...",
      critique_and_refined_draft: "# Local AI Swarm Orchestration on Apple Silicon (2025 Blueprint)\n\nIf you build multi-agent workflows, cloud API latency is your biggest bottleneck. Running a 5-step agent swarm over REST APIs introduces 6 to 12 seconds of cumulative network latency.\n\nBy leveraging Apple's unified memory architecture with MLX bindings, you can run quantised 14B models locally at 48 tokens/sec with sub-50ms latency between agent state transitions.\n\n### Step-by-Step Architecture\n1. Node.js local agent orchestration queue\n2. Shared state scratchpad via local PostgreSQL / Drizzle ORM\n3. MLX local inference endpoint via local Python server",
      multi_platform_outputs: {
        twitter: "🧵 1/8 Stop paying $2,000/mo for Cloud AI Agent APIs.\n\nHere is how to run a 5-agent autonomous swarm locally on Apple Silicon with 0ms network latency and 0 cloud cost:\n\n[Thread 👇]",
        substack: "Subject: Why Local Agent Swarms beat Cloud APIs in 2025\nPreheader: How unified memory on Apple Silicon unlocks sub-50ms multi-agent coordination.\n\nHey Builders,\n\nIf you've been experimenting with multi-agent workflows recently, you've probably noticed...",
        linkedin: "⚡ Cloud AI latency is officially a dealbreaker for real-time agent workflows.\n\nHere is what happened when we migrated our multi-agent content swarm from cloud APIs to local MLX inference on Apple Silicon...",
        youtube: "[0:00 - Visual: Code editor running local terminal with fast stream]\nVoiceover: 'What if you could run a 5-agent AI swarm completely offline on your MacBook at 50 tokens per second?'"
      }
    };

    const sampleLogs = [
      { timestamp: new Date(Date.now() - 3600000).toISOString(), agentId: "agent-trend-hunter", agentName: "Nexus Trend Hunter", stepName: "Niche Signal & Context Extraction", status: "completed", durationMs: 1420, output: "Extracted 4 key benchmarks for Apple Silicon MLX local swarms." },
      { timestamp: new Date(Date.now() - 3300000).toISOString(), agentId: "agent-hook-arch", agentName: "Hook Smith", stepName: "Hook & Frame Generation", status: "completed", durationMs: 1100, output: "Generated 5 high-converting hook variants." },
      { timestamp: new Date(Date.now() - 3000000).toISOString(), agentId: "agent-tech-writer", agentName: "Deep Code Writer", stepName: "Master Longform Script / Article Draft", status: "completed", durationMs: 2800, output: "Drafted 1,400 word technical breakdown with architecture diagram." },
      { timestamp: new Date(Date.now() - 2700000).toISOString(), agentId: "agent-brand-critic", agentName: "Voice & Integrity Guard", stepName: "Brand Voice & Fluff Critique", status: "completed", durationMs: 1900, output: "Audited draft. Removed 4 corporate filler words and sharpened opening paragraph." },
      { timestamp: new Date(Date.now() - 2400000).toISOString(), agentId: "agent-atomizer", agentName: "Multi-Platform Atomizer", stepName: "Multi-Platform Atomization", status: "completed", durationMs: 3100, output: "Formatted final deliverables into X Thread, Substack, LinkedIn, and YouTube Shorts." },
    ];

    await db.insert(executions).values([
      {
        id: "exec-demo-1",
        workflowId: "wf-viral-tech-breakdown",
        userId: "demo-user-1",
        topic: "Local-First Multi-Agent Swarms on Apple Silicon with MLX",
        targetNiche: "AI & Dev Tools",
        targetPlatforms: JSON.stringify(["twitter", "substack", "linkedin", "youtube"]),
        status: "completed",
        currentStepIndex: 5,
        scratchpad: JSON.stringify(sampleScratchpad),
        logs: JSON.stringify(sampleLogs),
        finalOutputs: JSON.stringify(sampleScratchpad.multi_platform_outputs),
        completedAt: new Date(),
      },
    ]);

    // 5. Create Demo Content Items
    await db.insert(contentItems).values([
      {
        id: "content-1",
        userId: "demo-user-1",
        executionId: "exec-demo-1",
        title: "Local AI Swarms on Apple Silicon Breakdown (X Thread)",
        niche: "AI & Dev Tools",
        platform: "twitter",
        status: "published",
        content: sampleScratchpad.multi_platform_outputs.twitter,
        metadata: JSON.stringify({ hooks: [sampleScratchpad.hooks[0]], tags: ["#LocalAI", "#AppleSilicon", "#DevTools"] }),
        engagementMetrics: JSON.stringify({ views: 42800, likes: 2310, retweets: 480, bookmarks: 1250 }),
      },
      {
        id: "content-2",
        userId: "demo-user-1",
        executionId: "exec-demo-1",
        title: "Why Local Agent Swarms beat Cloud APIs in 2025",
        niche: "AI & Dev Tools",
        platform: "substack",
        status: "scheduled",
        content: sampleScratchpad.multi_platform_outputs.substack,
        metadata: JSON.stringify({ scheduledTime: new Date(Date.now() + 86400000 * 2).toISOString(), subject: "Why Local Agent Swarms beat Cloud APIs" }),
        engagementMetrics: JSON.stringify({ openRateEst: "48.2%", subscribersTarget: 14500 }),
      },
      {
        id: "content-3",
        userId: "demo-user-1",
        executionId: "exec-demo-1",
        title: "Cloud AI Latency is a Dealbreaker: Local MLX Swarm Solution",
        niche: "AI & Dev Tools",
        platform: "linkedin",
        status: "draft",
        content: sampleScratchpad.multi_platform_outputs.linkedin,
        metadata: JSON.stringify({ tags: ["#SoftwareEngineering", "#ArtificialIntelligence"] }),
        engagementMetrics: JSON.stringify({}),
      },
      {
        id: "content-4",
        userId: "demo-user-1",
        executionId: "exec-demo-1",
        title: "Build a Local 5-Agent Swarm in 60 Seconds (YouTube Short)",
        niche: "AI & Dev Tools",
        platform: "youtube",
        status: "draft",
        content: sampleScratchpad.multi_platform_outputs.youtube,
        metadata: JSON.stringify({ duration: "58s", tags: ["#Shorts", "#Coding"] }),
        engagementMetrics: JSON.stringify({}),
      },
    ]);

    // 6. Create Demo Niche Trends
    await db.insert(nicheTrends).values([
      {
        id: "trend-1",
        niche: "AI & Dev Tools",
        topic: "DeepSeek R1 local distillation models on M3/M4 Macs",
        summary: "1.5B to 14B parameter reasoning models distilled from DeepSeek R1 are outperforming GPT-4o on logic tasks while running offline at 60 tokens/sec.",
        score: 96,
        sources: JSON.stringify(["GitHub: deepseek-ai", "HackerNews #1", "X/Twitter TechTrend"]),
        suggestedHooks: JSON.stringify([
          "You don't need a $100k GPU cluster for reasoning models anymore.",
          "How DeepSeek R1 changed my local dev workflow in 48 hours."
        ]),
      },
      {
        id: "trend-2",
        niche: "AI & Dev Tools",
        topic: "Cursor AI vs Bolt.new vs Local Windsurf in 2025",
        summary: "Fullstack vibe coding tools are converging, but developers are moving toward local agent orchestration to avoid context window caps.",
        score: 91,
        sources: JSON.stringify(["Reddit r/LocalLLaMA", "TechCrunch", "Dev.to"]),
        suggestedHooks: JSON.stringify([
          "The hidden bottleneck in Cursor AI that nobody is talking about.",
          "I switched from Cursor to a custom 3-agent local swarm. Here are the benchmarks."
        ]),
      },
      {
        id: "trend-3",
        niche: "Biohacking & Longevity",
        topic: "Peptide protocol optimization with automated biomarker tracking",
        summary: "Quantified self creators are combining continuous health monitor APIs with custom local agent prompts to generate weekly recovery scripts.",
        score: 88,
        sources: JSON.stringify(["Huberman Lab", "Peter Attia Podcast", "PubMed"]),
        suggestedHooks: JSON.stringify([
          "The exact recovery protocol I used after analyzing 90 days of Oura ring data.",
          "3 biomarker metrics that actually predict HRV recovery."
        ]),
      },
    ]);

    return { success: true, message: "Database seeded successfully" };
  } catch (err) {
    console.error("Error seeding database:", err);
    return { success: false, error: String(err) };
  }
}
