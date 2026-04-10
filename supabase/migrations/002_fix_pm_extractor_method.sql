-- Fix 2: Replace placeholder method with full SKILL.md body for pm-playbook-extractor
-- Run this in Supabase SQL Editor if you already seeded the database.

UPDATE playbooks
SET method = '# PM Playbook Extractor

**Category**: product | **Tool**: Claude | **Contributor**: Steph

## How to use

Paste a Claude chat transcript where you (or someone on your team) solved a real problem with AI assistance. This skill extracts a reusable, shareable playbook from that conversation.

## Extraction workflow

### Step 1 — Identify the core technique
Read the full conversation. Find the moment where the user and Claude converged on a working approach. Ignore false starts, tangents, and debugging — focus on the final technique that produced results.

### Step 2 — Classify the category
Assign exactly one category based on what the playbook *does*, not what it''s *about*:
- **analysis** — data wrangling, metric reconciliation, CSV processing, KPI debugging
- **engineering** — system design, Jira breakdowns, API reviews, migration planning
- **product** — specs, feature flags, A/B tests, requirements synthesis
- **comms** — stakeholder updates, RCAs, decision logs, retrospectives
- **eval** — QA rubrics, scoring frameworks, evaluation criteria

### Step 3 — Identify the tools
List the tools used in the workflow, formatted as a short string:
- "Claude" — pure prompt, no code
- "pandas + Claude" — data analysis with Python
- "Claude + React" — UI generation
- "LangGraph + Python" — agentic workflows

### Step 4 — Write the title
Max 120 characters. Format: *action + object + context*. Examples:
- "Weekly call outcome dashboard from CSV"
- "RCA draft from incident timeline"
- "Transfer reason extraction and taxonomy"

### Step 5 — Write the description
2–3 sentences, max 400 characters. Answer two questions:
1. What does this playbook do?
2. When should someone use it?

### Step 6 — Extract the method
This is the core deliverable. The method must be **self-contained** — someone with zero context should be able to copy-paste it into Claude and get a useful result.

Rules for the method:
- Write it as a direct prompt or step-by-step instruction set
- Remove company-specific data, names, PII, or sensitive info
- Generalize where possible while keeping the technique specific
- Include input format expectations (e.g., "Given a CSV with columns X, Y, Z...")
- Include output format expectations (e.g., "Output as a markdown table with...")
- If the chat contained multiple techniques, extract the primary one only

### Step 7 — Format the output
Return a JSON object with these exact fields:

```json
{
  "title": "...",
  "category": "analysis | engineering | product | comms | eval",
  "tool": "...",
  "contributor": "...",
  "description": "...",
  "method": "..."
}
```

## Quality checklist
- [ ] Title is concise and action-oriented
- [ ] Category is correct for the playbook''s function
- [ ] Description answers "what" and "when"
- [ ] Method is self-contained and copy-pasteable
- [ ] No sensitive or company-specific data remains
- [ ] Method includes both input and output expectations'
WHERE title = 'PM playbook extractor';
