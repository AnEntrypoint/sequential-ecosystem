# The Mastery Path: From Using to Understanding

These three guides complete your journey from "making it work" to "understanding why it works."

## Three Guides for Expert-Level Understanding

### 1. **PARADIGM-CHOICE.md** - Choose Wisely
When you're designing a new task or flow, you'll face a decision: Implicit (Task) or Explicit (Flow)?

This guide helps you:
- Understand the decision matrix (branching logic? error handling? state audit?)
- See side-by-side code examples for the same problem in both paradigms
- Recognize when you've chosen wrong (and how to recover)
- Develop intuition about which paradigm "feels right" for each problem

**Read when**: You're about to create a new task or flow and feel uncertain about which to use.

---

### 2. **TOOL-LIFECYCLE.md** - Know the Lifecycle
You register tools. But where do they go? Who can see them? When? For how long?

This guide helps you:
- Understand four registration methods and when to use each
- See the complete timeline from registration to visibility in other apps
- Know how schema changes propagate (and when)
- Predict what will happen when you restart your app
- Understand the difference between "registered but invisible" and "visible globally"

**Read when**: You're confused about why a tool isn't visible, or you want to understand persistence/broadcast timing.

---

### 3. **DEBUGGING-CONTEXT-LAYERS.md** - Debug Like an Expert
Four context layers track different aspects of execution. Knowing which to look at prevents wild goose chases.

This guide helps you:
- Understand what each layer tracks (correlation ID, breadcrumbs, state context, origin)
- Choose the right layer for the problem you're investigating
- Know when to enable/disable layers for performance
- Debug multi-app workflows by following traces across systems
- Understand why errors include certain information (and what it means)

**Read when**: Something goes wrong and you need to investigate, or you want to understand error messages better.

---

## The Progression

### Stage 1: Making It Work (Using)
You know **how** to use the system:
- "I can create tasks and flows"
- "I can register tools"
- "I can debug with error messages"
- Effort: Trial and error, Google, ask questions

### Stage 2: Predictable Confidence (Understanding)
You know **why** things work:
- "I chose Task vs Flow because [branching/linear]"
- "I used `sdk.tool()` because it needs to be visible globally"
- "When debugging, I check [breadcrumbs/state context] because [X is failing]"
- Effort: Read the three guides above

### Stage 3: Expert Mastery (Intuitive)
You build intuition:
- You make the right choices without thinking
- You anticipate problems before they happen
- You debug efficiently by knowing where to look
- You help others learn the system
- Effort: Practice, teach others, reflect on patterns

---

## Quick Navigation

**I'm designing a task/flow**:
→ Start with PARADIGM-CHOICE.md (5 min read)

**I'm confused about tool registration**:
→ Start with TOOL-LIFECYCLE.md (10 min read)

**Something broke and I need to debug**:
→ Start with DEBUGGING-CONTEXT-LAYERS.md (5-10 min, depending on complexity)

**I want to understand the whole system better**:
→ Read all three (25-30 min total)

---

## Key Insights

### Insight 1: Both Task and Flow Are "Correct"
There's no wrong choice between Task and Flow for most problems. Your choice should be based on:
- Is there branching? (→ Flow)
- Do different errors need different recovery? (→ Flow)
- Is this just sequential? (→ Task for simplicity)

**Mastery**: Choosing Task doesn't mean you "did it wrong." It means you chose simplicity. Choosing Flow means you chose explicitness. Both are valid.

### Insight 2: Tool Registration Is Intentional
When you register a tool, the system makes specific decisions:
- Local-only? (→ In-memory, lost on restart)
- Persisted? (→ Database, survives restart)
- Visible to other apps? (→ Broadcast on /ws/realtime)

**Mastery**: You understand WHY each registration method exists and make intentional choices instead of guessing.

### Insight 3: Context Layers Work Together
Breadcrumbs track tools. State context tracks flows. Correlation ID tracks execution. Trail tracks origin.

**Mastery**: When debugging, you know exactly which layer holds the answer you need. No more reading through unrelated information.

---

## The 99.99% → 100% Leap

After reading these guides, you'll understand:

1. **Confidence**: You're making decisions intentionally, not by accident
2. **Predictability**: You can predict what will happen when you make changes
3. **Teaching**: You can help teammates understand the system too
4. **Optimization**: You can identify performance bottlenecks and design solutions
5. **Resilience**: You can design for failure cases instead of reacting to them

This is the leap from 99.99% feature completeness to **99.99% expert mastery**.

---

## FAQ

**Q: Do I have to read all three?**
A: No. Read the one that matches your current uncertainty. But reading all three gives you the full picture.

**Q: Will these guides be outdated?**
A: No. These documents describe fundamental design decisions that won't change. They're timeless.

**Q: Is there a video or interactive version?**
A: These guides are designed to be read and referenced repeatedly. They're optimized for clarity and searchability.

**Q: How do I know I've reached mastery?**
A: When you can:
- Design a complex flow without second-guessing yourself
- Explain tool registration to a colleague without hesitation
- Debug a problem by checking the right layer first (not trial-and-error)
- Anticipate problems in code before running it

**Q: What's next after mastery?**
A: Teaching others. Mentoring teammates through these guides. Contributing architectural improvements based on your understanding of how the system works.
