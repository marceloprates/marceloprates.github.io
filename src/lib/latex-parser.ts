/**
 * LaTeX → Markdown converter for the ATS resume format.
 *
 * Source: Resume/src/generated/ats__ai.tex (or any ats__*.tex variant).
 * Format: article document with \section*{}, itemize environments,
 * \textbf role lines, \leavevmode company/location rows, and
 * \csname Exp*...\endcsname macro references.
 *
 * Also handles \ResumeCoreSkillsInline as a plain-text prose block.
 */

// Fixed number of positions per skill for aligned dot columns
export const MAX_SKILL_DOTS = 8;

export type SkillItem = { name: string; level: number; tag?: string };

/**
 * Convert ATS-format LaTeX to Markdown for the resume section.
 *
 * Supported constructs:
 * - \section*{Heading}       → ## Heading
 * - \subsection*{Heading}   → ### Heading
 * - \textbf{...} or \bfseries ... → **bold**
 * - \itemize / \enumerate blocks → bullet or numbered lists
 * - Role title lines (\textbf{Role} \hfill Date) → **Role** — Date
 * - Company/location rows (\leavevmode \csname ...\endcsname, Location \hfill Start-End)
 * - \csname Exp*...\endcsname macro refs → resolved to plain text
 * - \ResumeCoreSkillsInline → stripped to plain prose
 */
export function convertLatexToMarkdown(input: string): string {
	if (!input) return "";
	let md = input;

	// Normalize line endings
	md = md.replace(/\r\n?|\n/g, "\n");
	// Remove LaTeX comments
	md = md.replace(/(^|\n)\s*%.*(?=\n|$)/g, "$1");
	// Unescape common LaTeX symbols
	md = md
		.replace(/\\&/g, "&")
		.replace(/\\%/g, "%")
		.replace(/\\_/g, "_")
		.replace(/\\#/g, "#");
	md = md.replace(/\\{n}/g, "\n");

	// Resolve \csname Exp*...\endcsname macros to their plain-text name
	// e.g. \textbf{\csname ExpDatasideCompany\endcsname} → \textbf{Dataside}
	// We'll strip the \csname wrappers entirely and let the content through
	md = md.replace(/\\csname\s+(Exp\w+)\s*\\endcsname/gi, (_, name) => name);

	// Resolve \Resume* macros to empty (they appear in header sections, already rendered elsewhere)
	md = md.replace(/\\ResumeName\b/gi, "Marcelo Prates, PhD");
	md = md.replace(/\\ResumeTagline\b/gi, "");
	md = md.replace(/\\ResumeSummary\b/gi, "");
	md = md.replace(/\\ResumeCoreSkillsInline\b/gi, "");
	md = md.replace(/\\ResumeSelectedImpactText\b/gi, "");
	md = md.replace(/\\ResumeLocation\b/gi, "Porto Alegre, Brazil");
	md = md.replace(/\\ResumeWorkMode\b/gi, "");
	md = md.replace(/\\ResumeEmail\b/gi, "");
	md = md.replace(/\\ResumeLinkedIn\b/gi, "");
	md = md.replace(/\\ResumeGitHub\b/gi, "");
	md = md.replace(/\\ResumePhone\b/gi, "");

	// Section headings
	md = md.replace(/\\section\*?\{([^}]+)\}/g, "## $1");
	md = md.replace(/\\subsection\*?\{([^}]+)\}/g, "### $1");
	md = md.replace(/\\subsubsection\*?\{([^}]+)\}/g, "#### $1");

	// Text formatting
	md = md.replace(/\\textbf\{([^}]+)\}/g, "**$1**");
	md = md.replace(/\\textit\{([^}]+)\}|\\emph\{([^}]+)\}/g, "_$1_");
	md = md.replace(/\\ttfamily\s*\{?([^}\n]+)\}?/g, "`$1`");
	md = md.replace(/\\bfseries\s*\{?([^}\n]+)\}?/g, "**$1**");

	// Links
	md = md.replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, "[$2]($1)");
	md = md.replace(/\\url\{([^}]+)\}/g, "<$1>");

	// itemize → bullet list
	md = md
		.replace(/\\begin\{itemize\}[\s\S]*?\\end\{itemize\}/g, (block) => {
			const items = block
				.replace(/\\begin\{itemize\}|\\end\{itemize\}/g, "")
				.replace(/\n?\s*\\item\s*/g, "\n- ");
			return items.trim();
		})
		// enumerate → numbered list
		.replace(/\\begin\{enumerate\}[\s\S]*?\\end\{enumerate\}/g, (block) => {
			const items = block
				.replace(/\\begin\{enumerate\}|\\end\{enumerate\}/g, "")
				.replace(/\n?\s*\\item\s*/g, "\n1. ");
			return items.trim();
		});

	// Line breaks
	md = md.replace(/\\\\/g, "  \n").replace(/\\newline\b/g, "\n");

	// Remove layout commands and environments
	md = md
		.replace(/\\begin\{[^}]+\}|\\end\{[^}]+\}/g, "")
		.replace(
			/\\setlength\{[^}]*\}\{[^}]*\}|\setlist|\\pagestyle\{[^}]*\}|\setenumerate/g,
			"",
		)
		.replace(/\\setlength\\parindent\{[^}]*\}|\setlength\\baselineskip/g, "")
		.replace(
			/\\hspace\*?\{[^}]*\}|hfill|\\newpage|\\clearpage|\\centering|\\raggedright/g,
			"",
		)
		.replace(
			/\\small|\\normalsize|\\large|\\Large|\\LARGE|\\huge|\\Huge|\\tiny/g,
			"",
		)
		.replace(/\\Leavevmode|\\leavevmode|\\nopagebreak/g, "")
		.replace(/\\MakeUppercase|\\MakeLowercase/g, "");

	// Remove remaining TeX commands (consume single optional braced arg)
	md = md.replace(/\\[a-zA-Z][a-zA-Z0-9]*\*?(\{[^}]*\})?/g, (_, grp) =>
		grp ? grp.slice(1, -1) : "",
	);

	// Normalize dashes in date ranges
	md = md.replace(/\s--\s/g, " — ").replace(/–/g, " — ");

	// Strip leftover braces around simple text
	md = md.replace(/(^|\s)\{([^{}]+)\}(?=\s|$)/g, "$1$2").replace(/\{\}/g, "");

	// Clean up whitespace
	md = md
		.replace(/\n{3,}/g, "\n\n")
		.replace(/[ \t]+\n/g, "\n")
		.trim();
	return md;
}

/**
 * Parse skill items from LaTeX sidebar source.
 *
 * Supports four patterns:
 * 1. \cvskill{Name}{Level}{Tag}
 * 2. \cvskill{Name}{Level}
 * 3. \skill{Name}{Level}{Tag?}
 * 4. Plain lines: "Name — 4 (tag)" or "Name: 3" or "- Name - 5 (tag)"
 *
 * Returns deduplicated items keyed by name+tag, keeping the max level per key.
 *
 * NOTE: The new ATS resume format does NOT use a sidebar/skills file.
 * Skills are rendered as inline prose in the \ResumeCoreSkillsInline macro,
 * which is handled as plain text by `convertLatexToMarkdown`.
 * This function is retained for backwards compatibility but will return
 * an empty array when given the ATS-format source.
 */
export function parseSkillsFromLatex(input: string): SkillItem[] {
	if (!input) return [];
	let src = input.replace(/(^|\n)\s*%.*(?=\n|$)/g, "$1");
	src = src
		.replace(/\\&/g, "&")
		.replace(/\\%/g, "%")
		.replace(/\\_/g, "_")
		.replace(/\\#/g, "#");
	const out: SkillItem[] = [];
	const clean = (s?: string) =>
		(s ?? "")
			.replace(/\\&/g, "&")
			.replace(/\\%/g, "%")
			.replace(/\\_/g, "_")
			.replace(/\\#/g, "#")
			.replace(/\s{2,}/g, " ")
			.trim();

	const push = (name?: string, levelRaw?: string | number, tag?: string) => {
		const n =
			typeof levelRaw === "string" ? parseInt(levelRaw, 10) : (levelRaw ?? 0);
		if (!name || !Number.isFinite(n)) return;
		out.push({
			name: clean(name),
			level: Math.max(0, n),
			tag: clean(tag) || undefined,
		});
	};

	{
		const re = /\\cvskill\{([^}]+)\}\{([^}]+)\}\{([^}]+)\}/g;
		let m: RegExpExecArray | null;
		while ((m = re.exec(src))) {
			push(m[1], m[2], m[3]);
		}
		src = src.replace(re, "");
	}
	{
		const re = /\\cvskill\{([^}]+)\}\{([^}]+)\}/g;
		let m: RegExpExecArray | null;
		while ((m = re.exec(src))) {
			push(m[1], m[2]);
		}
		src = src.replace(re, "");
	}
	{
		const re = /\\skill\{([^}]+)\}\{([^}]+)\}(?:\{([^}]+)\})?/g;
		let m: RegExpExecArray | null;
		while ((m = re.exec(src))) {
			push(m[1], m[2], m[3]);
		}
		src = src.replace(re, "");
	}
	{
		const re =
			/(^|\n)\s*[-*]?\s*([^—:\n]+?)\s*[—:-]\s*(\d+)\s*(?:\(([^)]+)\))?(?=\s*(\n|$))/g;
		let m: RegExpExecArray | null;
		while ((m = re.exec(src))) {
			push(m[2], m[3], m[4]);
		}
	}

	const byKey = new Map<string, SkillItem>();
	for (const s of out) {
		const key = `${s.name}__${s.tag ?? ""}`.toLowerCase();
		const prev = byKey.get(key);
		if (!prev || s.level > prev.level) byKey.set(key, s);
	}
	return Array.from(byKey.values());
}

/**
 * Map a skill tag string to a Tailwind bg colour class.
 * Returns a string suitable for use in a className.
 */
export function tagToColorClass(tag?: string): string {
	const t = (tag || "").toLowerCase().trim();
	switch (t) {
		case "coreml":
		case "cerulean":
			return "bg-sky-500";
		case "genai":
		case "vermillion":
			return "bg-orange-600";
		case "deploy":
		case "viridian":
			return "bg-emerald-600";
		case "infra":
		case "saffron":
			return "bg-amber-400";
		case "python":
			return "bg-amber-500";
		case "ml":
		case "ai":
			return "bg-rose-500";
		case "web":
			return "bg-emerald-500";
		case "data":
			return "bg-indigo-500";
		default:
			return "bg-zinc-400 dark:bg-zinc-500";
	}
}
