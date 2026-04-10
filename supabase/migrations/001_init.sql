CREATE TABLE playbooks (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT        NOT NULL,
  category    TEXT        NOT NULL
                CHECK (category IN ('analysis','engineering',
                       'product','comms','eval')),
  tool        TEXT        NOT NULL,
  contributor TEXT        NOT NULL,
  description TEXT        NOT NULL,
  method      TEXT        NOT NULL,
  downloads   INTEGER     DEFAULT 0,
  featured    BOOLEAN     DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read"
  ON playbooks FOR SELECT USING (true);

CREATE POLICY "public_insert"
  ON playbooks FOR INSERT WITH CHECK (true);

CREATE POLICY "public_update"
  ON playbooks FOR UPDATE USING (true) WITH CHECK (true);

CREATE INDEX idx_playbooks_category ON playbooks(category);
CREATE INDEX idx_playbooks_created  ON playbooks(created_at DESC);
CREATE INDEX idx_playbooks_featured ON playbooks(featured DESC);

-- Seed data
INSERT INTO playbooks (title, category, tool, contributor, description, method, featured) VALUES

('PM playbook extractor',
 'product', 'Claude', 'Steph',
 'Extract reusable playbooks from Claude chat history. Paste a conversation where you solved a problem with AI, and this skill will distill it into a structured, shareable playbook with title, category, tool, description, and method fields ready for the registry.',
 '# PM Playbook Extractor

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
- [ ] Method includes both input and output expectations', true);

INSERT INTO playbooks (title, category, tool, contributor, description, method) VALUES

('Low Contained rate ROI justification',
 'comms', 'Claude', 'Steph',
 'When AVA''s Contained % looks low in isolation, reframe using total contribution, cost-per-call savings, and a trajectory narrative for a leadership audience.',
 'You are a senior operations analyst preparing a brief for VP-level stakeholders who are questioning the ROI of an AI voice assistant (AVA). The contained-call rate looks low (~18-22%) in isolation.

Your job: reframe the narrative using these angles:
1. Total call volume contribution — what % of all calls does AVA handle end-to-end?
2. Cost-per-call comparison — AVA vs. live agent fully loaded cost
3. Trajectory — month-over-month improvement trend
4. Deflection value — calls that WOULD have gone to agents but didn''t

Output a 1-page executive summary with:
- A headline stat that leads with strength
- 3 supporting data points
- A forward-looking paragraph on projected savings at scale
- A recommended "talking point" for the exec to use in their next review

Tone: confident, data-driven, not defensive. Never say "only 18%". Say "AVA independently resolves X calls per month, saving $Y."'),

('Review Queue product spec + demo',
 'product', 'Claude + React', 'Steph',
 'Full spec for replacing an Excel auditing workflow with a Review Queue UI — personas, disposition form, classifier tags (#BEHAVIOR #CALLOUT #ESCALATION #REGRESSION), Jira tickets, and stakeholder Q&A.',
 'You are a product manager writing a detailed spec for a Review Queue feature. Context: the QA team currently uses Excel spreadsheets to audit AI call transcripts. This is slow, error-prone, and doesn''t scale.

Write a complete product spec that includes:
1. Problem statement (2-3 sentences)
2. User personas (QA Analyst, QA Lead, Engineering)
3. Core workflow: select call → read transcript → apply disposition → tag classifiers → submit
4. Disposition options: Correct, Incorrect, Partially Correct, Needs Review
5. Classifier tags: #BEHAVIOR, #CALLOUT, #ESCALATION, #REGRESSION, #TONE
6. Data model for the review record
7. Jira ticket breakdown (Epic + 5-8 stories)
8. Stakeholder FAQ (anticipate 5 common objections)

Format as a clean, structured document. Use tables where appropriate.'),

('Transfer reason extraction and taxonomy',
 'analysis', 'pandas + Claude', 'Steph',
 'Extract all raw transfer_reason values from a CSV export, consolidate variants (e.g. 1095A_form vs 1095a_form), and group into canonical categories with human-readable labels.',
 'Load the CSV file with transfer reasons. Steps:
1. df = pd.read_csv(file, encoding="latin1")
2. Extract unique transfer_reason values: df["transfer_reason"].dropna().unique()
3. Normalize: lowercase, strip whitespace, replace underscores with spaces
4. Group variants (e.g. "1095a form", "1095A_form", "1095a_Form") into canonical keys
5. Create a mapping dict: raw_value → canonical_category
6. Apply mapping: df["canonical_reason"] = df["transfer_reason"].map(mapping)
7. Output a summary table: canonical_reason | count | % of total | example raw values
8. Flag any unmapped values for manual review

Output format: Excel file with two sheets — "Mapped Transfers" and "Unmapped Review"'),

('Weekly call outcome dashboard from CSV',
 'analysis', 'pandas + Claude', 'Steph',
 'Load AVA CSV exports, apply unique_calls deduplication, classify calls into Handled / Dropped / 3rd Party / CSR buckets, and output a formatted multi-period Excel dashboard.',
 'Load CSV: df = pd.read_csv(file, encoding="latin1")
Filter: df = df[df["unique_calls"] == 1]

Classify each call into exactly one bucket:
- Handled: status == "completed" AND transfer_reason is null
- Dropped: status == "abandoned" OR duration < 30
- 3rd Party: transfer_reason contains "3rd_party" or "external"
- CSR: transfer_reason contains "agent" or "representative"

For each week (group by ISO week):
- Count calls per bucket
- Calculate percentages
- Track week-over-week delta

Output: formatted Excel with:
- Sheet 1: Weekly summary table (Week | Handled | Dropped | 3rd Party | CSR | Total)
- Sheet 2: Raw classified data
- Conditional formatting: green for improvement, red for regression'),

('RCA draft from incident timeline',
 'comms', 'Claude', 'Steph',
 'Paste a Jira thread or on-call timeline and get a structured RCA draft in minutes. No blank-page paralysis.',
 'You are a technical PM. Given an incident timeline (Jira comments, Slack messages, or raw notes), write a concise RCA with:

1. Incident summary (2 sentences max)
2. Timeline of events (table: Time | Event | Actor)
3. Root cause (1 clear sentence)
4. Contributing factors (bullet list, max 5)
5. Impact assessment (users affected, duration, revenue impact if known)
6. Remediation steps taken (what was done to fix it)
7. Prevention measures (what will prevent recurrence — be specific, include Jira ticket numbers if possible)
8. Follow-up actions (table: Action | Owner | Due Date | Status)

Tone: factual, blameless, focused on systems not people. Use past tense. Never say "human error" — describe the system gap that allowed the error.'),

('Stakeholder update email generator',
 'comms', 'Claude', 'Steph',
 'Turn rough bullet points into a polished stakeholder update email with proper framing, highlights, and next steps.',
 'You are a program manager writing a weekly stakeholder update. Given rough notes/bullets from the user, produce:

Subject line: [Project Name] Weekly Update — [Date] — [One-line status]

Body:
1. TL;DR (2 sentences, bold the key metric or milestone)
2. Highlights this week (3-5 bullets, each starting with a verb)
3. Risks & blockers (table: Risk | Impact | Mitigation | Owner)
4. Next week priorities (numbered list, max 5)
5. Metrics snapshot (if data provided — format as a small table)
6. Sign-off with "Questions? Reply to this thread or ping me in #channel"

Tone: confident, concise, executive-friendly. No jargon. Lead with wins.'),

('Jira epic + story breakdown',
 'engineering', 'Claude', 'Steph',
 'Turn a feature description into a structured Jira epic with properly scoped user stories, acceptance criteria, and story point estimates.',
 'You are a senior engineer breaking down a feature into Jira tickets. Given a feature description:

1. Write the Epic:
   - Title: [Feature] — [Outcome]
   - Description: problem statement, success criteria, out of scope
   - Labels: team, quarter

2. Break into Stories (5-10):
   Each story must have:
   - Title: "As a [persona], I want [action] so that [benefit]"
   - Description: context + technical approach (3-5 sentences)
   - Acceptance criteria (checkbox format, 3-5 items)
   - Story points: 1 (trivial), 2 (small), 3 (medium), 5 (large), 8 (needs splitting)
   - Dependencies: list any blocking stories by title

3. Identify the critical path (which stories must be sequential)
4. Suggest a sprint allocation (assuming 2-week sprints, team velocity ~20pts)

Format as clean markdown that can be copy-pasted into Jira.'),

('API endpoint design review',
 'engineering', 'Claude', 'Steph',
 'Review a proposed API design for consistency, RESTful conventions, error handling, and edge cases before implementation.',
 'You are a senior backend engineer reviewing an API design. For each endpoint provided:

1. Check RESTful conventions:
   - Correct HTTP methods (GET/POST/PUT/PATCH/DELETE)
   - Proper URL patterns (nouns, not verbs; plural resources)
   - Appropriate status codes

2. Review request/response schemas:
   - Are required vs optional fields clear?
   - Are types appropriate?
   - Is pagination included for list endpoints?

3. Error handling:
   - What error codes should each endpoint return?
   - Are error response bodies consistent?

4. Edge cases:
   - Concurrent modification handling
   - Rate limiting considerations
   - Input validation boundaries

5. Security:
   - Authentication requirements
   - Authorization (who can access what)
   - Input sanitization

Output: markdown table with Endpoint | Issue | Severity | Recommendation'),

('Database migration planning',
 'engineering', 'Claude', 'Steph',
 'Plan a safe database migration strategy with rollback steps, data validation, and zero-downtime deployment approach.',
 'You are a database engineer planning a migration. Given the current schema and desired changes:

1. Migration plan:
   - Step-by-step SQL statements
   - Order of operations (add columns before dropping, etc.)
   - Data backfill strategy if needed

2. Rollback plan:
   - Reverse SQL for each step
   - Data recovery approach
   - Point-of-no-return identification

3. Validation queries:
   - Pre-migration data counts
   - Post-migration verification
   - Consistency checks

4. Deployment strategy:
   - Blue/green or rolling approach
   - Feature flag requirements
   - Monitoring queries to run during migration

5. Risk assessment:
   - Estimated downtime (if any)
   - Data loss scenarios
   - Performance impact during migration

Output as a runbook document with checkboxes for each step.'),

('Product requirements from user feedback',
 'product', 'Claude', 'Steph',
 'Synthesize raw user feedback (interviews, support tickets, surveys) into structured product requirements with priority rankings.',
 'You are a product manager synthesizing user feedback into requirements. Given raw feedback data:

1. Theme extraction:
   - Group feedback into 5-8 themes
   - Count mentions per theme
   - Identify sentiment (positive/negative/neutral) per theme

2. Requirements generation:
   For each theme, write:
   - User story format requirement
   - Problem statement (what pain does this solve?)
   - Proposed solution (high level)
   - Success metric (how do we know this worked?)

3. Priority matrix:
   Table with: Requirement | Impact (H/M/L) | Effort (H/M/L) | Priority Score | Recommended Quarter

4. Quick wins (high impact, low effort) — call these out separately
5. Parking lot (interesting but not now) — list with brief rationale

Format as a product brief that can be shared with stakeholders.'),

('Feature flag rollout strategy',
 'product', 'Claude', 'Steph',
 'Design a phased feature flag rollout plan with audience targeting, success metrics, and kill-switch criteria.',
 'You are a product manager planning a feature rollout. Given a feature description:

1. Rollout phases:
   - Phase 1: Internal team (1-2 days)
   - Phase 2: Beta users / 5% (1 week)
   - Phase 3: 25% rollout (1 week)
   - Phase 4: 50% rollout (1 week)
   - Phase 5: General availability

2. For each phase define:
   - Audience targeting rules
   - Success metrics + thresholds
   - Monitoring dashboards to watch
   - Go/no-go criteria for next phase

3. Kill-switch criteria:
   - Error rate threshold (e.g., >2% increase)
   - Performance threshold (e.g., p99 >500ms)
   - User complaint threshold
   - Automatic rollback rules

4. Communication plan:
   - Internal announcement template
   - User-facing changelog entry
   - Support team briefing doc

Output as a rollout playbook.'),

('A/B test analysis framework',
 'product', 'Claude', 'Steph',
 'Analyze A/B test results with statistical rigor — compute significance, check for novelty effects, and write a recommendation.',
 'You are a data analyst evaluating an A/B test. Given test parameters and results:

1. Test summary:
   - Hypothesis
   - Control vs variant description
   - Sample size and duration
   - Primary and secondary metrics

2. Statistical analysis:
   - Conversion rates for each variant
   - Relative lift (%)
   - p-value and confidence interval
   - Statistical significance (yes/no at 95% confidence)
   - Power analysis (was sample size sufficient?)

3. Validity checks:
   - Sample ratio mismatch (SRM) test
   - Novelty effect assessment (did the effect decay over time?)
   - Segment analysis (did any user segment behave differently?)

4. Recommendation:
   - Ship / Don''t Ship / Extend Test
   - Reasoning (2-3 sentences)
   - Follow-up tests to consider

Format with clear tables and bold the key decision.'),

('QA evaluation rubric builder',
 'eval', 'Claude', 'Steph',
 'Design a structured QA evaluation rubric for AI call transcripts with scoring criteria, calibration examples, and inter-rater reliability guidance.',
 'You are a QA lead designing an evaluation rubric for AI voice assistant calls. Build a comprehensive rubric:

1. Evaluation dimensions (5-7):
   For each dimension:
   - Name and definition
   - Scoring scale (1-5 with anchored descriptions for each level)
   - Weight in overall score
   - Example: what does a 1 vs 3 vs 5 look like?

2. Suggested dimensions:
   - Accuracy: Did the AI provide correct information?
   - Completeness: Were all customer needs addressed?
   - Tone: Was the interaction professional and empathetic?
   - Efficiency: Was the call resolved without unnecessary steps?
   - Escalation judgment: Did the AI appropriately escalate or handle?

3. Calibration set:
   - Provide 3 example transcripts with "gold standard" scores
   - Include borderline cases that are tricky to score

4. Process:
   - How many calls per analyst per day?
   - Inter-rater reliability target (Cohen''s kappa > 0.7)
   - Calibration session frequency
   - Dispute resolution process

Output as a document that can be used for QA analyst onboarding.'),

('Decision log template',
 'comms', 'Claude', 'Steph',
 'Create a structured decision log entry that captures context, options considered, rationale, and dissenting opinions for team decisions.',
 'You are documenting a team decision. Given the context and outcome:

Format:
# Decision: [Title]

**Date**: [Date]
**Decision maker**: [Name]
**Status**: Decided / Pending / Revisit by [date]

## Context
What is the situation that requires a decision? (2-3 sentences)

## Options Considered
| Option | Pros | Cons | Effort | Risk |
|--------|------|------|--------|------|
| A      |      |      |        |      |
| B      |      |      |        |      |
| C      |      |      |        |      |

## Decision
What was decided and why? (2-3 sentences)

## Rationale
- Key factor 1
- Key factor 2
- Key factor 3

## Dissenting Opinions
Capture any disagreements respectfully. This is important for future context.

## Consequences
What changes as a result? What needs to happen next?

## Review Date
When should this decision be revisited?'),

('Sprint retrospective facilitator',
 'comms', 'Claude', 'Steph',
 'Generate a structured sprint retrospective with categorized feedback, action items, and follow-up tracking from raw team input.',
 'You are a scrum master facilitating a sprint retrospective. Given raw team feedback (or generate prompts to gather it):

1. Categorize feedback into:
   - What went well (celebrate these!)
   - What didn''t go well (no blame, focus on process)
   - What to try next sprint (actionable experiments)

2. For each "didn''t go well" item:
   - Root cause (ask "why" 2-3 times)
   - Is this a recurring theme? (check against last 3 retros if available)
   - Proposed action item with owner and due date

3. Action items summary:
   Table: Action | Owner | Due Date | Success Criteria | Status

4. Team health check:
   Rate 1-5 on: Velocity, Quality, Collaboration, Morale, Process
   Compare to last sprint if available.

5. Kudos section:
   Call out individual contributions.

Output as a retro document that can be posted in Confluence/Notion.'),

('CSV data profiling and cleanup',
 'analysis', 'pandas + Claude', 'Steph',
 'Profile a CSV dataset — check for nulls, duplicates, outliers, and encoding issues — then output a cleaned version with a data quality report.',
 'Load and profile the CSV file:

1. Initial load:
   df = pd.read_csv(file, encoding="latin1")
   
2. Data profile:
   - Shape (rows × columns)
   - Column types (auto-detected vs expected)
   - Null counts and percentages per column
   - Unique value counts per column
   - Duplicate row count
   
3. Quality checks:
   - Date columns: are they parseable? Any future dates? Any before expected range?
   - Numeric columns: min/max/mean/median, any obvious outliers (>3 std dev)?
   - Text columns: encoding issues (Ã, Â, etc.), leading/trailing whitespace, empty strings vs nulls
   - ID columns: are they unique? Any format inconsistencies?

4. Cleanup steps:
   - Strip whitespace from all string columns
   - Standardize null representations (empty string → NaN)
   - Remove exact duplicate rows
   - Fix encoding issues
   - Standardize date formats

5. Output:
   - Cleaned CSV file
   - Data quality report (markdown) with before/after stats
   - List of rows that were modified or removed, with reasons');
