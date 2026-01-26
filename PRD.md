1. Overview

LogToStory is a lightweight web tool that restructures messy developer
raw technical logs — such as error messages, terminal output, short notes,
and code fragments — into calm, share-ready technical posts for LinkedIn and X.

This product is not:

an AI writing assistant

a motivation or productivity tool

a content marketing generator

It is a workflow utility that helps developers publish
what they already experienced, without rewriting everything manually.

2. Problem Statement

In practice, most developers already leave behind detailed traces during development:

error logs

terminal output

debugging notes

temporary code snippets

However, these traces rarely become public posts because:

restructuring them takes time

formatting is tedious

tone easily becomes awkward or “marketing-like”

switching between tools is costly

The core hypothesis of this MVP is:

The bottleneck to sharing is not motivation or writing skill,
but structure.

3. Target Users

Developers who already keep personal logs (Notion, Obsidian, local notes)

Developers who dislike hype or marketing tone

Developers preparing for English-speaking job markets

Korean developers who want KO / EN output

4. Core Principles (Non-Negotiable)

Trust over polish

Any hallucinated or invented content is a failure.

No marketing tone

No hype, no exaggerated claims, no emojis.

No invented results

Outcomes must come from user input only.

Completion over features

The MVP must be finishable by one developer.

Cost guardrails first

Monthly LLM cost must stay under $10.

5. Explicit Non-Goals (MVP)

The MVP explicitly excludes:

User accounts or authentication

Saving raw logs to a database

Image or PNG generation

Rich text editors

GitHub auto-import (fake door only)

Auto-generated metrics or performance claims

6. Inputs
Required

rawLog: string (≤ 2000 characters)

outcome: string (≤ 200 characters, one sentence)

tonePreset: linkedin | x

outputLanguage: ko | en | both

Optional

evidenceBefore

evidenceAfter

humanInsight (≤ 200 characters, user-written only)

7. STAR Handling Model

LogToStory does not create STAR content.
It only restructures user-provided information.

STAR Element	Source
Situation	rawLog
Task	inferred from context
Action	rawLog
Result	outcome (user-provided, mandatory)

The system must never invent a Result.

8. Output (User-Facing)
Text Outputs

LinkedIn-ready post (editable)

X (Twitter) post/thread (editable)

Code Cards

Extracted only from rawLog

Up to 3 blocks

Rendered as HTML with syntax highlighting (Shiki)

Not images

Not downloadable assets

9. Language Rules

Output language must strictly follow selection.

If BOTH is selected:

Korean and English outputs are generated separately.

No literal translation is allowed.

Translation must be rewriting, not literal translation.

Each language output must sound native to its audience.

10. Cost & Usage Guardrails
MONTHLY_LLM_BUDGET = $10
MAX_MONTHLY_TOKENS = 3_000_000


RAW_LOG_MAX_CHARS = 2000
OUTCOME_MAX_CHARS = 200
HUMAN_INSIGHT_MAX_CHARS = 200


RATE_LIMIT = 3 requests / hour / IP


DEFAULT_LANGUAGE = KO
BOTH_LANGUAGE_ENABLED = false
REGENERATE_ENABLED = false
11. Functional Specifications
User Stories & Acceptance Criteria (Given–When–Then)
US-01. Generate from Raw Log

User Story
As a developer,
I want to paste my raw technical logs and generate a share-ready post,
so that I can publish my experience without manual restructuring.

Acceptance Criteria

Given a rawLog within 2000 characters
When the user clicks “Generate”
Then output is generated successfully.

Given the rawLog is empty
When the user clicks “Generate”
Then generation is blocked with a validation message.

Given the rawLog exceeds 2000 characters
When the user clicks “Generate”
Then generation is blocked with an error.

US-02. Mandatory Outcome Input

User Story
As a developer,
I want to explicitly define the result in one sentence,
so that the system does not invent outcomes.

Acceptance Criteria

Given the outcome field is empty
When the user clicks “Generate”
Then generation is blocked.

Given the outcome is ≤ 200 characters
When output is generated
Then the outcome appears in the final text.

Given the outcome exceeds 200 characters
When the user clicks “Generate”
Then an error message is shown.

US-03. Output Language Selection

User Story
As a developer,
I want to choose the output language,
so that I can publish to different audiences.

Acceptance Criteria

Given language is set to KO
When generation completes
Then only Korean output is shown.

Given language is set to EN
When generation completes
Then only English output is shown.

Given language is set to BOTH
When generation completes
Then Korean and English outputs are shown separately without mixing.

US-04. Anti-Hype Tone Enforcement

User Story
As a developer,
I want the output to avoid marketing or hype language,
so that it sounds like an engineer wrote it.

Acceptance Criteria

Given banned hype words appear in output
When post-processing runs
Then those words are removed or neutralized.

Given marketing tone is detected
When output is shown
Then a tone_violation warning is included.

Given neutral technical tone
When output is shown
Then no tone warnings appear.

US-05. Evidence Handling

User Story
As a developer,
I want the system to avoid unsupported claims,
so that my post remains trustworthy.

Acceptance Criteria

Given no evidence is provided
When output is generated
Then no numeric or performance claims appear.

Given no evidence is provided
When output is generated
Then an evidence_missing warning is included.

Given evidence is provided
When output is generated
Then the evidence is quoted verbatim.

US-06. Code Block Extraction

User Story
As a developer,
I want code in my logs to be clearly displayed,
so that readers understand the technical context.

Acceptance Criteria

Given code exists in rawLog
When output is generated
Then up to 3 code blocks are extracted.

Given a code block exceeds display length
When rendered
Then it is truncated with a clear marker.

Given no code exists
When output is generated
Then the code section is empty without errors.

US-07. Editable Output & Copy

User Story
As a developer,
I want to edit and copy the generated content,
so that I can publish it externally.

Acceptance Criteria

Given output is generated
When the user edits text
Then changes are immediately reflected.

Given the user clicks “Copy”
When the action completes
Then text is copied to clipboard.

Given the user clicks “Copy All”
When the action completes
Then a watermark is included.

US-08. Rate Limiting & Budget Protection

User Story
As a system owner,
I want strict usage limits,
so that LLM costs never exceed budget.

Acceptance Criteria

Given a user exceeds 3 requests per hour
When another request is made
Then HTTP 429 is returned.

Given monthly token limit is reached
When a request is made
Then generation is disabled.

Given usage is within limits
When a request is made
Then generation proceeds normally.

12. Definition of MVP Completion

The MVP is considered complete when:

All User Stories pass Acceptance Criteria

Cost guardrails are respected

End-to-end generation works at least once in real usage

Scope exclusions remain intact

13.Personal Blog Project Git Workflow Rules

## 1. Repository
- **GitHub Repository:** https://github.com/yyj9529/logtostroy
- **Main Branch:** `main`

## 2. Branching Strategy
- All feature development must be done in branches following the format:  
  `feature/[issue-number]-[short-description-kebab-case]`
- For small fixes or changes without an issue number, use:  
  `fix/[short-description]` or `chore/[short-description]`

## 3. Commit Message Convention
- All commit messages must follow the **Conventional Commits** specification.
- Examples:
  - `feat: add author profile component`
  - `fix: correct typo in footer`
- The commit body must clearly describe **why** the change was made and must include the related GitHub issue using the format:  
  `Closes #[issue-number]`

## 4. Pull Request (PR) Process
- Direct pushes to the `main` branch are not allowed.  
  All changes must be merged via Pull Requests.
- The PR title must follow the same format as commit messages.
- The PR description must use the `.github/PULL_REQUEST_TEMPLATE.md` template.
