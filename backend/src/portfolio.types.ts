type JsonRecord = Record<string, unknown>;

export type PortfolioData = {
  site: {
    name: string;
    headline: string;
    role: string;
    location: string;
    summary: string;
    phone: string;
    school: string;
    email: string;
    education: {
      period: string;
      major: string;
      school: string;
    };
    links: Array<{ label: string; href: string }>;
  };
  intro: {
    contact: Array<{ label: string; value: string; href?: string }>;
    challenge: Array<{ title: string; body: string }>;
  };
  techStack: Array<{ name: string; items: string[] }>;
  awards: Array<{ year: string; status: string; issuer: string; name: string }>;
  certificates: string[];
  projects: Array<{
    title: string;
    subtitle: string;
    meta: {
      period: string;
      role: string;
      stack: string[];
      team: string;
      code: string;
    };
    summary: string;
    details: Array<{ title: string; body: string }>;
    media?: Array<{ src: string; alt: string }>;
  }>;
};

export type PortfolioDocument = {
  data: PortfolioData;
  updatedAt: string;
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown, path: string): JsonRecord {
  if (!isRecord(value)) {
    throw new Error(`Expected ${path} to be an object`);
  }

  return value;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== "string") {
    throw new Error(`Expected ${path} to be a string`);
  }

  return value;
}

function asStringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`Expected ${path} to be an array of strings`);
  }

  return value;
}

function parseLink(value: unknown, path: string): { label: string; href: string } {
  const record = asRecord(value, path);
  return {
    label: asString(record.label, `${path}.label`),
    href: asString(record.href, `${path}.href`),
  };
}

function parseLinks(value: unknown, path: string): Array<{ label: string; href: string }> {
  if (!Array.isArray(value)) {
    throw new Error(`Expected ${path} to be an array`);
  }

  return value.map((item, index) => parseLink(item, `${path}[${index}]`));
}

function parseTextBlock(value: unknown, path: string): { title: string; body: string } {
  const record = asRecord(value, path);
  return {
    title: asString(record.title, `${path}.title`),
    body: asString(record.body, `${path}.body`),
  };
}

function parseTextBlocks(value: unknown, path: string): Array<{ title: string; body: string }> {
  if (!Array.isArray(value)) {
    throw new Error(`Expected ${path} to be an array`);
  }

  return value.map((item, index) => parseTextBlock(item, `${path}[${index}]`));
}

function parseSite(value: unknown): PortfolioData["site"] {
  const record = asRecord(value, "site");
  return {
    name: asString(record.name, "site.name"),
    headline: asString(record.headline, "site.headline"),
    role: asString(record.role, "site.role"),
    location: asString(record.location, "site.location"),
    summary: asString(record.summary, "site.summary"),
    phone: asString(record.phone, "site.phone"),
    school: asString(record.school, "site.school"),
    email: asString(record.email, "site.email"),
    education: parseEducation(record.education),
    links: parseLinks(record.links, "site.links"),
  };
}

function parseEducation(value: unknown): PortfolioData["site"]["education"] {
  const record = asRecord(value, "site.education");
  return {
    period: asString(record.period, "site.education.period"),
    major: asString(record.major, "site.education.major"),
    school: asString(record.school, "site.education.school"),
  };
}

function parseIntro(value: unknown): PortfolioData["intro"] {
  const record = asRecord(value, "intro");
  return {
    contact: parseContact(record.contact),
    challenge: parseTextBlocks(record.challenge, "intro.challenge"),
  };
}

function parseContact(value: unknown): PortfolioData["intro"]["contact"] {
  if (!Array.isArray(value)) {
    throw new Error("Expected intro.contact to be an array");
  }

  return value.map((item, index) => {
    const record = asRecord(item, `intro.contact[${index}]`);
    const contact = {
      label: asString(record.label, `intro.contact[${index}].label`),
      value: asString(record.value, `intro.contact[${index}].value`),
    };

    if (record.href === undefined) {
      return contact;
    }

    return {
      ...contact,
      href: asString(record.href, `intro.contact[${index}].href`),
    };
  });
}

function parseTechStack(value: unknown): PortfolioData["techStack"] {
  if (!Array.isArray(value)) {
    throw new Error("Expected techStack to be an array");
  }

  return value.map((item, index) => {
    const record = asRecord(item, `techStack[${index}]`);
    return {
      name: asString(record.name, `techStack[${index}].name`),
      items: asStringArray(record.items, `techStack[${index}].items`),
    };
  });
}

function parseAwards(value: unknown): PortfolioData["awards"] {
  if (!Array.isArray(value)) {
    throw new Error("Expected awards to be an array");
  }

  return value.map((item, index) => {
    const record = asRecord(item, `awards[${index}]`);
    return {
      year: asString(record.year, `awards[${index}].year`),
      status: asString(record.status, `awards[${index}].status`),
      issuer: asString(record.issuer, `awards[${index}].issuer`),
      name: asString(record.name, `awards[${index}].name`),
    };
  });
}

function parseProjectDetails(value: unknown, path: string): Array<{ title: string; body: string }> {
  return parseTextBlocks(value, path);
}

function parseProjectMedia(value: unknown, path: string): Array<{ src: string; alt: string }> {
  if (!Array.isArray(value)) {
    throw new Error(`Expected ${path} to be an array`);
  }

  return value.map((item, index) => {
    const record = asRecord(item, `${path}[${index}]`);
    return {
      src: asString(record.src, `${path}[${index}].src`),
      alt: asString(record.alt, `${path}[${index}].alt`),
    };
  });
}

function parseProjects(value: unknown): PortfolioData["projects"] {
  if (!Array.isArray(value)) {
    throw new Error("Expected projects to be an array");
  }

  return value.map((item, index) => {
    const record = asRecord(item, `projects[${index}]`);
    const meta = asRecord(record.meta, `projects[${index}].meta`);
    const project = {
      title: asString(record.title, `projects[${index}].title`),
      subtitle: asString(record.subtitle, `projects[${index}].subtitle`),
      meta: {
        period: asString(meta.period, `projects[${index}].meta.period`),
        role: asString(meta.role, `projects[${index}].meta.role`),
        stack: asStringArray(meta.stack, `projects[${index}].meta.stack`),
        team: asString(meta.team, `projects[${index}].meta.team`),
        code: asString(meta.code, `projects[${index}].meta.code`),
      },
      summary: asString(record.summary, `projects[${index}].summary`),
      details: parseProjectDetails(record.details, `projects[${index}].details`),
    };

    if (record.media === undefined) {
      return project;
    }

    return {
      ...project,
      media: parseProjectMedia(record.media, `projects[${index}].media`),
    };
  });
}

export function parsePortfolioData(value: unknown): PortfolioData {
  const record = asRecord(value, "portfolio");

  return {
    site: parseSite(record.site),
    intro: parseIntro(record.intro),
    techStack: parseTechStack(record.techStack),
    awards: parseAwards(record.awards),
    certificates: asStringArray(record.certificates, "certificates"),
    projects: parseProjects(record.projects),
  };
}
