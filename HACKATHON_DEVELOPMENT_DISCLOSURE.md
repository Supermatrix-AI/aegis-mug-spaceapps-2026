# Hackathon Development Timeline & Eligibility Disclosure

**Project:** AegisμG — Microgravity Fire Safety Intelligence  
**Team:** SPECULATRON AI  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data*  
**Repository:** `https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026`  
**Audit Date:** 2026-11-15  
**Current Eligibility Status:** **RULING PENDING — Submit disclosure inquiry to Local Lead / Global Organizing Team**

---

## 1. Exact Repository Timestamp Forensics

Public GitHub commit timestamps on `Supermatrix-AI/aegis-mug-spaceapps-2026` (`main` branch), converted accurately from UTC to **UAE Standard Time (UTC+4)**:

| Commit SHA (short) | Timestamp (UTC) | Timestamp (UAE / UTC+4) | Timing vs `2026-11-14 09:00 UTC+4` Hackathon Start | Summary of Changes |
|---|---|---|---|---|
| `55bb69b341` | `2026-11-14T04:06:12Z` | `2026-11-14 08:06:12 UTC+4` | **53m 48s BEFORE 09:00 start** | Initial Phase 1+2 MVP codebase pushed (`src/`, `server.ts`, initial catalog & docs) |
| `49386b23d1` | `2026-11-14T04:17:22Z` | `2026-11-14 08:17:22 UTC+4` | **42m 38s BEFORE 09:00 start** | Phase 1+2 UI & documentation refinements |
| `5f024bea6d` | `2026-11-14T04:44:09Z` | `2026-11-14 08:44:09 UTC+4` | **15m 51s BEFORE 09:00 start** | Digital Twin V1 / Phase 2 updates |
| `e169d4c153` | `2026-11-14T14:12:40Z` | `2026-11-14 18:12:40 UTC+4` | Inside event window (+9h 12m) | BASS-II Atlas / mid-hackathon commits |
| `931d6281d6` | `2026-11-15T02:48:01Z` | `2026-11-15 06:48:01 UTC+4` | Inside event window | Validation & documentation sync (triggered GitHub Actions Run `43669448020`) |
| `4d68780167` | `2026-11-15T03:27:04Z` | `2026-11-15 07:27:04 UTC+4` | Inside event window | Submission pack & readiness documents |
| `cde52ac7cf` | `2026-11-15T03:28:27Z` | `2026-11-15 07:28:27 UTC+4` | Inside event window | Submission pack updates on `main` |

No commit history was rewritten or force-pushed during audit; all timestamps remain publicly preserved on `main`.

---

## 2. Official NASA Space Apps Guidance Reviewed

Two official NASA Space Apps Challenge GitHub Discussions were inspected directly:

1. **Discussion `#1827` (Pre-hackathon preparation vs. project work):** Global Organizing (GO) Team guidance states that pre-event planning, reading resources, researching the challenge topic, and forming teams are permitted prior to Saturday `09:00` local time, whereas **challenge-specific project development before Saturday `09:00` local time violates event rules and can lead to disqualification**.
2. **Discussion `#1924` (Pre-existing code & libraries):** GO Team guidance states that **pre-existing open-source libraries/frameworks or utilities not built for the challenge may be reused if properly attributed**, whereas custom challenge-specific software work must take place during the official hackathon window.

---

## 3. Work Classification (Transparent Separation)

| Category | Description | Status / Timing |
|---|---|---|
| **Allowed Pre-Event Research** | Reading NASA NTRS (`20210011385`), PSI portals (`PSI-25`, `PSI-69`, `PSI-98`), `OCHMO-TB-008`, and Space Apps brief (`Flame in Freefall`) | Permitted under Discussion `#1827` |
| **Open-Source / Standard Libraries** | React 19, TypeScript, Tailwind CSS, Vite, Recharts, PapaParse, Zod, Express, Vitest, Lucide icons, `@google/genai` | Permitted third-party OSS under Discussion `#1924` |
| **Pre-Start Challenge Commits** | `55bb69b341` (`08:06 UAE`), `49386b23d1` (`08:17 UAE`), `5f024bea6d` (`08:44 UAE`) pushed up to 54 minutes prior to `09:00 UAE` local start | **Requires explicit Local Lead / GO Team ruling** (`Ruling Pending`) |
| **During-Event Core Engineering** | Full 20-test / 43-segment Table 5.1 BASS-II Atlas, M3 counterexample logic, DIWA 6-stage lineage, Evidence Integrity Inspector, Gap Map, Offline BM25 Question Explorer, Scientific Reliability Scorecard, reproducible NTRS/DataCite SHA-256 verifier, Digital Twin V1 safeguards, test suite, and slide deck | Implemented during Nov 14–15 event window |

---

## 4. Challenge "Resources Tab" Verification Status

- **Verification Status:** **UNVERIFIED**
- The official Space Apps challenge page (`https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/`) returned `000` / connection-timeout or dynamic SPA access from this sandbox environment, so the exact wording of the 2026 Resources Tab regarding any pre-approved starter tools could not be confirmed automatically.
- **Required Owner Action:** Manually inspect the *Resources* tab on `spaceappschallenge.org` while logged into your Space Apps participant account before submitting.

---

## 5. Draft Message for Local Lead / Global Organizing Team

> **Subject:** Eligibility Clarification Request — AegisμG (Team SPECULATRON AI) — Pre-09:00 UAE Commits on Nov 14  
>  
> Hello Local Lead / NASA Space Apps Global Organizing Team,  
>  
> We are reaching out transparently ahead of the November 15 deadline regarding our repository `https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026` for the *Flame in Freefall* challenge. Our initial three commits (`55bb69b341`, `49386b23d1`, `5f024bea6d`) were pushed on Saturday Nov 14 between `08:06` and `08:44 UTC+4` (16–54 minutes before `09:00` local event start), while all subsequent major scientific modules, BASS-II Table 5.1 extraction, provenance auditing, testing, and submission documentation were built during the Nov 14–15 hackathon window (`e169d4c153` through `cde52ac7cf` and final submission updates).  
>  
> Rather than rewriting git history, we have documented exact UTC and UTC+4 timestamps in `HACKATHON_DEVELOPMENT_DISCLOSURE.md`. Could you confirm whether our submission remains eligible with full disclosure, or advise on required remediation steps before judging?  
>  
> Thank you for your time and guidance.  
> — Team SPECULATRON AI
