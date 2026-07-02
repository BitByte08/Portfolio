# Portfolio Layout Contract

## 1. Goal

Build a portfolio homepage that reads like a polished product site: full-width hero, clear hierarchy, compact supporting sections, and long-form project detail blocks.

## 2. Page Order

The page should flow in this order:

1. Header
2. Hero
3. Try, Challenge
4. Tech Stack
5. Award
6. Certificate
7. Mother
8. Aqua Guard

`OtherProject` is not part of the public homepage.

## 3. Section Roles

### 3.1 Header

Goal: provide quick navigation without shrinking the page into a dashboard.

Content:
- Brand name
- Section anchors

Rules:
- Keep the header thin and full width.
- Do not repeat profile data here.

### 3.2 Hero

Goal: establish identity immediately.

Content:
- Name
- Headline
- Short summary
- Profile summary
- Contact
- External links

Rules:
- Put the headline and summary on the left.
- Put profile and contact on the right.
- Keep contact information in one place.
- Do not duplicate the same profile data elsewhere on the page.

### 3.3 Try, Challenge

Goal: show working principles and mindset.

Content:
- 서로 다른 계층을 잇는 구조
- 아이디어를 결과까지 밀어붙이는 책임감
- 문제 옆에 서서 계속 조정하는 과정

Rules:
- Present as three wide statements.
- Keep the tone factual and personal.

### 3.4 Tech Stack

Goal: present the working surface by category.

Content groups:
- Frontend
- Backend
- Embedded
- Tools
- Language

Rules:
- Keep category labels visible.
- Show the items as grouped tags.
- Reclassify the stack by role, not by raw database order.
- Allow overlap only when the same item serves a different role.
- Render the categories as a vertical stack, not a horizontal strip.
- Do not add explanatory copy under each category.

### 3.5 Award

Goal: show recognition in a compact gallery.

Content:
- Year
- Status
- Award name

Rules:
- Keep the section concise and scannable.
- Use list-like rows with strong separation.

### 3.6 Certificate

Goal: show formal qualifications clearly.

Content:
- Certificate name

Rules:
- Present as a simple list.
- No extra narration is needed here.

### 3.7 Mother

Goal: show the most detailed project story.

Content:
- Project subtitle
- Period
- Role
- Stack
- Team size
- Source code link
- Summary
- Collapsible detail blocks

Rules:
- The summary is visible by default.
- Technical detail sections must be expandable on click.
- Keep the long-form content intact.

### 3.8 Aqua Guard

Goal: show the second major project with the same structure.

Content:
- Project subtitle
- Period
- Role
- Stack
- Team size
- Source code link
- Summary
- Collapsible detail blocks

Rules:
- Keep the same visual rhythm as Mother.
- Preserve the project-specific technical narrative.

## 4. Layout Behavior

Desktop:
- Full-width hero with left copy and right profile rail
- Tech Stack fills the width in multiple columns
- Awards and certificates sit in a two-column split
- Projects stack vertically and occupy the full page width

Tablet:
- The hero collapses into a single column
- Database blocks still read cleanly
- Project meta becomes one-column when needed

Mobile:
- Single-column flow
- Contact rows stack vertically
- Tag groups wrap naturally
- Disclosure blocks remain easy to tap

## 5. Visual Tone

- Black, white, and grayscale first
- Hairline borders over heavy shadows
- Spacious homepage rhythm
- Webpage polish over notebook chrome
- Avoid clutter and redundant sections

## 6. Content Rules

- Do not add extra portfolio sections that are not in the source structure.
- Do not surface `OtherProject` on the homepage.
- Keep the project detail blocks; do not flatten them into summaries only.
- Avoid repeating the same contact information in multiple places.

## 7. Implementation Note

Shape the layout first, then let the content fill into it.
The homepage should feel like a complete product page, not a raw database export.
