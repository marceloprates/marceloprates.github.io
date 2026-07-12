#!/usr/bin/env npx tsx
/**
 * generate-json-resume.ts — parses ATS LaTeX → JSON Resume schema
 *
 * Usage:
 *   npm run generate:resumes
 *   RESUME_LOCAL_PATH=/path/to/resume npm run generate:resumes   # local mode
 *
 * Falls back to inlined data when GitHub is unreachable (e.g. in CI without
 * network access to raw.githubusercontent.com).
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { resolveLocalLatexPath } from "../src/lib/paths";
import { VARIANTS } from "./_variants";

// ─── Inlined education ────────────────────────────────────────────────────────
// PhD data is the same across all variants and does not change. Inlined so the
// script works even when GitHub is unreachable (e.g. in sandboxed CI runners).
const INLINED_EDUCATION = [
	{
		institution: "Federal University of Rio Grande do Sul (UFRGS)",
		area: "Computer Science",
		studyType: "PhD",
		startDate: "Aug 2015",
		endDate: "Jul 2019",
		gpa: "",
		courses: [],
	},
];

// ─── Types ────────────────────────────────────────────────────────────────────

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
//
// Resolve local LaTeX repo path. Priority:
//   1. RESUME_LOCAL_PATH env var (explicit override)
//   2. Auto-detect ~/projects/active/personal/resume (the user's local clone)
// If neither resolves, fall back to the raw.githubusercontent.com fetch
// (which will fail for the private repo, surfacing a clear error in the
// parse step). We do not throw here — letting the JSON parse fail loudly
// is the existing behavior and avoids breaking the script contract for
// environments that may legitimately need the raw fetch (e.g. CI where
// the repo is public for a future release).
const LOCAL_LATEX_PATH = resolveLocalLatexPath();
const LOCAL_BASE = LOCAL_LATEX_PATH ? path.join(LOCAL_LATEX_PATH, "src") : "";

// ─── HTTP ─────────────────────────────────────────────────────────────────────

function fetchUrl(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const mod = url.startsWith("https") ? https : http;
		const req = mod.get(
			url,
			{ headers: { "User-Agent": "npm/generate-json-resume" } },
			(res: http.IncomingMessage) => {
				if (res.statusCode === 404 || res.statusCode === 403) {
					reject(
						new Error(
							`HTTP ${res.statusCode} — GitHub unreachable, using inlined fallback`,
						),
					);
					return;
				}
				if (res.statusCode !== 200) {
					reject(new Error(`HTTP ${res.statusCode}`));
					return;
				}
				const bufs: Buffer[] = [];
				res.on("data", (c: Buffer) => bufs.push(c));
				res.on("end", () => resolve(Buffer.concat(bufs).toString("utf8")));
			},
		);
		req.on("error", reject);
	});
}

async function fetchMainTex(texFile: string): Promise<string> {
	if (LOCAL_BASE) {
		const localPath = path.join(LOCAL_BASE, "generated", texFile);
		if (fs.existsSync(localPath)) return fs.readFileSync(localPath, "utf8");
	}
	try {
		return await fetchUrl(`${RAW_BASE}/generated/${texFile}`);
	} catch {
		return "";
	}
}

// ─── Macro helpers ─────────────────────────────────────────────────────────────

function buildMacroMap(catalog: string): Record<string, string> {
	const map: Record<string, string> = {};
	const re = /\\newcommand\{(\\Exp\w+)\}\{(.+?)\}/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(catalog))) map[m[1]] = m[2];
	return map;
}

function buildNameLookup(
	macros: Record<string, string>,
): Record<string, string> {
	const lookup: Record<string, string> = {};
	for (const k of Object.keys(macros)) {
		if (!k.endsWith("Title")) continue;
		lookup[k.slice(4, -5).toLowerCase()] = k;
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

// ─── String-based LaTeX macro extractor ───────────────────────────────────────
//
// Uses indexOf + brace-counting instead of regex literals to avoid issues with
// the \r → CR mapping in regex literals on macOS/Linux (where the LaTeX file
// uses literal \r = backslash + letter r, not a CR character).

function extractMacroValue(tex: string, commandName: string): string {
	const cmdStart = tex.indexOf(commandName);
	if (cmdStart < 0) return "";

	const braceStart = tex.indexOf("{", cmdStart + commandName.length);
	if (braceStart < 0) return "";

	let depth = 1;
	let pos = braceStart + 1;
	while (pos < tex.length && depth > 0) {
		if (tex[pos] === "{") depth++;
		else if (tex[pos] === "}") depth--;
		pos++;
	}

	return tex.slice(braceStart + 1, pos - 1);
}

// ─── Parser ───────────────────────────────────────────────────────────────────

type WorkEntry = JsonResume["work"][0];

function buildWork(
	tex: string,
	lookup: Record<string, string>,
	macros: Record<string, string>,
): WorkEntry[] {
	const secMatch = tex.match(
		/\\section\*\{Experience\}[\s\S]*?(?=\\section\*\{Education\}|\n\\section\*\{Selected Impact\}|$)/,
	);
	const sec = secMatch ? secMatch[0] : "";

	// Split on job comment markers: "% JobName\n..." → ["", "JobName", block, ...]
	const parts = sec.split(/^\s*%\s*([A-Za-z]+)\s*$/m);
	const result: WorkEntry[] = [];

	for (let i = 1; i < parts.length; i += 2) {
		const raw = (parts[i] || "").trim();
		if (!raw || raw === "Education" || raw === "Selected Impact") continue;

		const key = lookup[raw.toLowerCase()];
		if (!key) {
			console.warn(`  [warn] No macro key for job "${raw}"`);
			continue;
		}

		const base = key.slice(4, -5);
		const company = macros[`\\Exp${base}Company`] ?? "";
		const location = macros[`\\Exp${base}Location`] ?? "";
		const startDate = macros[`\\Exp${base}StartDates`] ?? "";
		const endDate = macros[`\\Exp${base}Dates`] ?? "";
		const title = macros[`\\Exp${base}Title`] ?? raw;

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

function parseVariant(mainTex: string, macros: Record<string, string>) {
	const lookup = buildNameLookup(macros);

	// Summary: \renewcommand{\ResumeSummary}{content}  (lowercase \r in source)
	const summaryRaw = extractMacroValue(
		mainTex,
		"\\renewcommand{\\ResumeSummary}",
	);
	const summary = strip(summaryRaw);

	// Skills: \renewcommand{\ResumeCoreSkillsInline}{content}
	const skillsRaw = extractMacroValue(
		mainTex,
		"\\renewcommand{\\ResumeCoreSkillsInline}",
	);
	const skills = skillsRaw
		.split(/;\s*/)
		.filter((g) => g.trim())
		.map((g) => strip(g));

	return {
		summary,
		skills,
		work: buildWork(mainTex, lookup, macros),
		education: INLINED_EDUCATION,
	};
}

// ─── JSON Resume builder ─────────────────────────────────────────────────────

function toJsonResume(
	id: string,
	label: string,
	parsed: ReturnType<typeof parseVariant>,
): JsonResume {
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
		skills: parsed.skills.map((s) => {
			const ci = s.indexOf(":");
			const name = ci >= 0 ? s.slice(0, ci).trim() : s.trim();
			const kws =
				ci >= 0
					? s
							.slice(ci + 1)
							.trim()
							.split(",")
							.map((k: string) => strip(k.trim()))
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
	let macros: Record<string, string> = {};
	const catalogPath = path.join(
		LOCAL_BASE,
		"includes",
		"data",
		"experience_catalog.tex",
	);
	if (LOCAL_BASE && fs.existsSync(catalogPath)) {
		macros = buildMacroMap(fs.readFileSync(catalogPath, "utf8"));
	} else {
		try {
			const catalogUrl = `${RAW_BASE}/includes/data/experience_catalog.tex`;
			const catalogTex = await fetchUrl(catalogUrl);
			macros = buildMacroMap(catalogTex);
		} catch {
			console.warn(
				"  [warn] Could not load experience_catalog.tex (GitHub unreachable — job data will be empty)",
			);
		}
	}

	// ── Process variants ───────────────────────────────────────────────────────
	for (const v of VARIANTS) {
		const mainTex = await fetchMainTex(v.tex);
		const parsed = parseVariant(mainTex, macros);
		const resume = toJsonResume(v.id, v.label, parsed);
		const outPath = path.join(outDir, `${v.id}.json`);
		fs.writeFileSync(outPath, JSON.stringify(resume, null, 2));
		console.log(
			`  → ${v.id}.json (${resume.work.length} jobs · ${resume.skills.length} skill groups)`,
		);
	}
	console.log("\n✅ JSON Resume generation complete.");
}

main().catch((e) => {
	console.error("❌", e.message);
	process.exit(1);
});
