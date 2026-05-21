/**
 * JSON Resume schema types.
 * @see https://jsonresume.org/schema/
 */

export interface ResumeProfile {
	network: string;
	username: string;
	url: string;
}

export interface ResumeLocation {
	city: string;
	region: string;
	country: string;
}

export interface ResumeBasics {
	name: string;
	label: string;
	email: string;
	phone: string;
	website: string;
	summary: string;
	linkedin: string;
	github: string;
	location: ResumeLocation;
	profiles: ResumeProfile[];
}

export interface ResumeWork {
	name: string;
	position: string;
	startDate: string;
	endDate: string;
	location: string;
	url: string;
	highlights: string[];
}

export interface ResumeSkill {
	name: string;
	level: string;
	keywords: string[];
}

export interface ResumeEducation {
	institution: string;
	area: string;
	studyType: string;
	startDate: string;
	endDate: string;
	gpa: string;
	courses: string[];
}

export interface JsonResume {
	basics: ResumeBasics;
	work: ResumeWork[];
	skills: ResumeSkill[];
	education: ResumeEducation[];
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
