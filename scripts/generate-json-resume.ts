#!/usr/bin/env npx tsx
/**
 * generate-json-resume.ts — parses ATS LaTeX → JSON Resume schema
 *
 * Usage:
 *   npm run generate:resumes
 *   RESUME_LOCAL_PATH=/path/to/resume npm run generate:resumes   # local mode
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

// ─── Types ───────────────────────────────────────────────────────────────────

interface JsonResume {
	basics: {
		name: string;
		label: string;
		email: string;
		phone: string;
		website: string;
		summary: string;
		linkedin: string;
		github: string;
		location: { city: string; region: string; country: string };
		profiles: Array<{ network: string; username: string; url: string }>;
	};
	work: Array<{
		name: string;
		position: string;
		startDate: string;
		endDate: string;
		location: string;
		url: string;
		highlights: string[];
	}>;
	skills: Array<{ name: string; level: string; keywords: string[] }>;
	education: Array<{
		institution: string;
		area: string;
		studyType: string;
		startDate: string;
		endDate: string;
		gpa: string;
		courses: string[];
	}>;
	projects: Array<{ name: string; description: string; highlights: string[] }>;
	references: Array<{ name: string; reference: string }>;
	languages: Array<{ language: string; fluency: string }>;
	interests: Array<{ name: string; keywords: string[] }>;
	awards: Array<{ title: string; date: string; summary: string }>;
	certifications: Array<{
		title: string;
		date: string;
		issuer: string;
		url: string;
	}>;
	meta: { canonical: string; version: string; lastModified: string };
}

// ─── Config ──────────────────────────────────────────────────────────────────

const RAW_BASE =
	"https://raw.githubusercontent.com/marceloprates/Resume/master/src";
const LOCAL_BASE = process.env.RESUME_LOCAL_PATH
	? path.join(process.env.RESUME_LOCAL_PATH, "src")
	: "";

const VARIANTS = [
	{ id: "ai", label: "AI/ML Engineer", tex: "ats__ai.tex" },
	{ id: "ds", label: "Data Scientist", tex: "ats__ds.tex" },
	{ id: "ml", label: "ML Engineer", tex: "ats__ml.tex" },
] as const;

const EDU_TEX_FILE = "ats_education_common.tex";

// ─── HTTP ────────────────────────────────────────────────────────────────────

async function fetchUrl(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const mod = url.startsWith("https") ? https : http;
		mod
			.get(url, (res) => {
				if (res.statusCode !== 200)
					return reject(new Error(`HTTP ${res.statusCode}`));
				const bufs: Buffer[] = [];
				res.on("data", (c: Buffer) => bufs.push(c));
				res.on("end", () => resolve(Buffer.concat(bufs).toString("utf8")));
			})
			.on("error", reject);
	});
}

// Returns [mainTex, eduTex]
async function fetchBoth(
	texFile: string,
	eduFile: string,
): Promise<[string, string]> {
	if (LOCAL_BASE) {
		const main = fs.existsSync(path.join(LOCAL_BASE, "generated", texFile))
			? fs.readFileSync(path.join(LOCAL_BASE, "generated", texFile), "utf8")
			: "";
		const edu = fs.existsSync(path.join(LOCAL_BASE, "includes", eduFile))
			? fs.readFileSync(path.join(LOCAL_BASE, "includes", eduFile), "utf8")
			: "";
		return [main, edu];
	}
	return Promise.all([
		fetchUrl(`${RAW_BASE}/generated/${texFile}`),
		fetchUrl(`${RAW_BASE}/includes/${eduFile}`),
	]);
}

// ─── Macro helpers ────────────────────────────────────────────────────────────

// The experience_catalog.tex defines \newcommand{\ExpFooBar}{value} for each
// job field. Keys in the map look like "\ExpDatasideTitle" (1 backslash).
function buildMacroMap(catalog: string): Record<string, string> {
	const map: Record<string, string> = {};
	// Match \newcommand{\ExpFooBar}{value} — backslash at start of macro name
	const re = /\\newcommand\{(\\Exp\w+)\}\{(.+?)\}/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(catalog))) map[m[1]] = m[2];
	return map;
}

// Build lookup: "dataside" → "\ExpDatasideTitle", "hophr" → "\ExpHopHRTitle"
// Only uses Title-suffixed keys to avoid Location/Dates/Company collisions.
// Strips the leading backslash from the key to get the company base name.
function buildNameLookup(
	macros: Record<string, string>,
): Record<string, string> {
	const lookup: Record<string, string> = {};
	for (const k of Object.keys(macros)) {
		if (!k.endsWith("Title")) continue;
		// k looks like "\ExpDatasideTitle" (1 backslash char)
		// Strip "\Exp" prefix and "Title" suffix → "dataside"
		const base = k.slice(4, -5); // skip first 4 chars ("\Exp") and last 5 ("Title")
		lookup[base.toLowerCase()] = k;
	}
	return lookup;
}

// ─── LaTeX cleaner ────────────────────────────────────────────────────────────

function strip(text: string): string {
	return text
		.replace(/\\csname\s+\w+\s*\\endcsname/g, "")
		.replace(/\\textbf\{([^{}]*)\}/g, "$1")
		.replace(/\\textit\{([^{}]*)\}/g, "$1")
		.replace(/\\emph\{([^{}]*)\}/g, "$1")
		.replace(/\\bfseries\s*\{([^{}]*)\}/g, "$1")
		.replace(/\\href\{[^}]+\}\{([^}]*)\}/g, "$1")
		.replace(/\\url\{[^}]+\}/g, "")
		.replace(/\\MakeUppercase|\\MakeLowercase/g, "")
		.replace(/\$\\rightarrow\$/g, "→")
		.replace(/\$\w+\$\$/g, "")
		.replace(/\\[a-zA-Z]+\{[^}]*\}/g, "")
		.replace(/\\[a-zA-Z]+/g, "")
		.replace(/\s{2,}/g, " ")
		.trim();
}

// ─── Parser ──────────────────────────────────────────────────────────────────

interface Parsed {
	summary: string;
	skills: string[];
	work: ReturnType<typeof buildWork>;
	education: ReturnType<typeof buildEdu>;
}
type WorkEntry = JsonResume["work"][0];
type EduEntry = JsonResume["education"][0];

function buildWork(
	tex: string,
	lookup: Record<string, string>,
	macros: Record<string, string>,
): WorkEntry[] {
	// Extract the Experience section
	const secMatch = tex.match(
		/\\section\*\{Experience\}[\s\S]*?(?=\\section\*\{Education\}|\n\\section\*\{Selected Impact\}|$)/,
	);
	const sec = secMatch ? secMatch[0] : "";

	// Split on job comment markers: "% JobName\n..." → ["", "JobName", block, "JobName2", block2...]
	const parts = sec.split(/^\s*%\s*([A-Za-z]+)\s*$/m);
	const result: WorkEntry[] = [];

	for (let i = 1; i < parts.length; i += 2) {
		const raw = (parts[i] || "").trim();
		if (!raw || raw === "Education" || raw === "Selected Impact") continue;

		const key = lookup[raw.toLowerCase()];
		if (!key) {
			console.warn(`  [warn] No macro for job "${raw}"`);
			continue;
		}

		// key looks like "\ExpDatasideTitle" — strip \Exp and Title to get base
		const base = key.slice(4, -5); // "\ExpDatasideTitle" → "Dataside"
		const company = macros[`\\Exp${base}Company`] ?? "";
		const location = macros[`\\Exp${base}Location`] ?? "";
		const startDate = macros[`\\Exp${base}StartDates`] ?? "";
		const endDate = macros[`\\Exp${base}Dates`] ?? "";
		const title = macros[`\\Exp${base}Title`] ?? raw;

		// Extract \item bullets from the block
		const block = parts[i + 1] || "";
		const bullets: string[] = [];
		const itemRe = /\\begin\{itemize\}[\s\S]*?\\end\{itemize\}/g;
		let iu: RegExpExecArray | null;
		while ((iu = itemRe.exec(block))) {
			const items = iu[0]
				.replace(/\\begin\{itemize\}|\\end\{itemize\}/g, "")
				.replace(/\\item\s*/g, "");
			for (const item of items.split(/\n+/)) {
				const clean = strip(item.trim());
				if (clean && clean !== "item") bullets.push(clean);
			}
		}

		if (!company && bullets.length === 0) continue;
		result.push({
			name: company,
			position: title,
			startDate,
			endDate,
			location,
			url: "",
			highlights: bullets,
		});
	}
	return result;
}

function buildEdu(eduTex: string): EduEntry[] {
	// ats_education_common.tex contains: \textbf{area} \hfill start -- end \\ institution (code)
	const phd = eduTex.match(
		/\\textbf\{([^}]+)\}\s*\\hfill\s*(\w+\s+\d{4})\s*--\s*(\w+\s+\d{4})\s*\\\\[\s\n]+([^(]+?)\s*\(([^)]+)\)/,
	);
	if (!phd) return [];
	return [
		{
			institution: phd[4].trim(),
			area: strip(phd[1]),
			studyType: "PhD",
			startDate: phd[2],
			endDate: phd[3],
			gpa: "",
			courses: [],
		},
	];
}

function parseVariant(
	mainTex: string,
	eduTex: string,
	macros: Record<string, string>,
) {
	const lookup = buildNameLookup(macros);

	// Summary
	const summaryMatch = mainTex.match(
		/\\renewcommand\{\\ResumeSummary\}\{(.+?)\}(?=\n)/s,
	);
	const summary = summaryMatch ? strip(summaryMatch[1]) : "";

	// Skills: "Category: items, items; Category: items; ..."
	const skillsRaw =
		mainTex.match(
			/\\renewcommand\{\\ResumeCoreSkillsInline\}\{(.+?)\}(?=\n)/s,
		)?.[1] ?? "";
	const skills = skillsRaw
		.split(/;\s*/)
		.flatMap((group: string) => {
			const ci = group.indexOf(":");
			if (ci === -1) return group.trim() ? [strip(group.trim())] : [];
			const name = strip(group.slice(0, ci).trim());
			const kws = group
				.slice(ci + 1)
				.split(",")
				.map((k: string) => strip(k.trim()))
				.filter(Boolean);
			return [`${name}: ${kws.join(", ")}`];
		})
		.filter(Boolean);

	return {
		summary,
		skills,
		work: buildWork(mainTex, lookup, macros),
		education: buildEdu(eduTex),
	} as Parsed;
}

// ─── JSON Resume builder ──────────────────────────────────────────────────────

function toJsonResume(id: string, label: string, parsed: Parsed): JsonResume {
	return {
		basics: {
			name: "Marcelo Prates, PhD",
			label,
			email: "marceloorp@gmail.com",
			phone: "",
			website: "https://marceloprates.github.io",
			summary: parsed.summary,
			linkedin: "https://linkedin.com/in/marceloprates",
			github: "https://github.com/marceloprates",
			location: { city: "Porto Alegre", region: "RS", country: "Brazil" },
			profiles: [
				{
					network: "LinkedIn",
					username: "marceloprates",
					url: "https://linkedin.com/in/marceloprates",
				},
				{
					network: "GitHub",
					username: "marceloprates",
					url: "https://github.com/marceloprates",
				},
			],
		},
		work: parsed.work,
		skills: parsed.skills.map((s: string) => {
			const ci = s.indexOf(":");
			const name = ci >= 0 ? s.slice(0, ci).trim() : s.trim();
			const kws =
				ci >= 0
					? s
							.slice(ci + 1)
							.trim()
							.split(",")
							.map((k: string) => k.trim())
							.filter(Boolean)
					: [];
			return { name, level: "", keywords: kws };
		}),
		education: parsed.education,
		projects: [],
		references: [],
		languages: [],
		interests: [],
		awards: [],
		certifications: [],
		meta: {
			canonical: `https://marceloprates.github.io/#resume-${id}`,
			version: "0.1.0",
			lastModified: new Date().toISOString().split("T")[0],
		},
	};
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
	const outDir = path.join(process.cwd(), "src", "data", "resumes");
	if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

	// ── Load experience catalog ─────────────────────────────────────────────────
	const catalogPath = path.join(
		LOCAL_BASE,
		"includes",
		"data",
		"experience_catalog.tex",
	);
	const macros = fs.existsSync(catalogPath)
		? buildMacroMap(fs.readFileSync(catalogPath, "utf8"))
		: {};

	// ── Process variants ─────────────────────────────────────────────────────
	for (const v of VARIANTS) {
		const [mainTex, eduTex] = await fetchBoth(v.tex, EDU_TEX_FILE);
		const parsed = parseVariant(mainTex, eduTex, macros);
		const resume = toJsonResume(v.id, v.label, parsed);
		const outPath = path.join(outDir, `${v.id}.json`);
		fs.writeFileSync(outPath, JSON.stringify(resume, null, 2));
		console.log(
			`  → ${v.id}.json (${resume.work.length} jobs · ${resume.skills.length} skill groups · ${resume.education.length} education)`,
		);
	}
	console.log("\n✅ JSON Resume generation complete.");
}

main().catch((e) => {
	console.error("❌", e);
	process.exit(1);
});
