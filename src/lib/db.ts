import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type { AdminUser, Category, Session, Site, SiteInput, SiteLink } from "./types";

const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "nav-site.db");

let db: Database.Database | undefined;

function bool(value: number | boolean) {
  return Boolean(value);
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: Number(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    icon: String(row.icon ?? ""),
    sortOrder: Number(row.sort_order),
    isVisible: bool(Number(row.is_visible)),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapSite(row: Record<string, unknown>, links?: SiteLink[]): Site {
  const siteLinks = links ?? listSiteLinksForSite(Number(row.id), true);
  const enabledLinks = siteLinks.filter((link) => link.isEnabled);
  const primaryUrl = enabledLinks[0]?.url ?? siteLinks[0]?.url ?? String(row.url ?? "");

  return {
    id: Number(row.id),
    categoryId: Number(row.category_id),
    categoryName: String(row.category_name ?? ""),
    name: String(row.name),
    url: String(row.url),
    primaryUrl,
    description: String(row.description ?? ""),
    icon: String(row.icon ?? ""),
    isFavorite: bool(Number(row.is_favorite)),
    isVisible: bool(Number(row.is_visible)),
    sortOrder: Number(row.sort_order),
    links: siteLinks,
    linkCount: enabledLinks.length,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapSiteLink(row: Record<string, unknown>): SiteLink {
  return {
    id: Number(row.id),
    siteId: Number(row.site_id),
    label: String(row.label ?? ""),
    url: String(row.url),
    sortOrder: Number(row.sort_order),
    isEnabled: bool(Number(row.is_enabled)),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function migrate(database: Database.Database) {
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");

  database.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      admin_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      icon TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 100,
      is_visible INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      icon TEXT NOT NULL DEFAULT '',
      is_favorite INTEGER NOT NULL DEFAULT 0,
      is_visible INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 100,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS site_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_id INTEGER NOT NULL,
      label TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 100,
      is_enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
    );
  `);

  const sitesWithoutLinks = database
    .prepare(
      `
      SELECT sites.id, sites.url
      FROM sites
      LEFT JOIN site_links ON site_links.site_id = sites.id
      WHERE site_links.id IS NULL
    `,
    )
    .all() as { id: number; url: string }[];

  if (sitesWithoutLinks.length > 0) {
    const insertLink = database.prepare(`
      INSERT INTO site_links (site_id, label, url, sort_order, is_enabled)
      VALUES (?, '默认链接', ?, 10, 1)
    `);

    const transaction = database.transaction(() => {
      for (const site of sitesWithoutLinks) {
        insertLink.run(site.id, site.url);
      }
    });

    transaction();
  }
}

function seed(database: Database.Database) {
  const count = database.prepare("SELECT COUNT(*) AS count FROM categories").get() as { count: number };

  if (count.count > 0) {
    return;
  }

  const insertCategory = database.prepare(`
    INSERT INTO categories (name, description, icon, sort_order, is_visible)
    VALUES (@name, @description, @icon, @sortOrder, 1)
  `);

  const insertSite = database.prepare(`
    INSERT INTO sites (category_id, name, url, description, icon, sort_order, is_favorite, is_visible)
    VALUES (@categoryId, @name, @url, @description, @icon, @sortOrder, @isFavorite, 1)
  `);

  const insertLink = database.prepare(`
    INSERT INTO site_links (site_id, label, url, sort_order, is_enabled)
    VALUES (@siteId, '默认链接', @url, 10, 1)
  `);

  const samples = [
    {
      name: "常用工具",
      description: "高频访问的效率工具和工作入口",
      icon: "A",
      sortOrder: 10,
      sites: [
        ["GitHub", "https://github.com", "代码托管、项目协作与开源发现", "GH", 10, 1],
        ["Notion", "https://www.notion.so", "知识库、项目记录与个人工作台", "N", 20, 1],
        ["Figma", "https://www.figma.com", "界面设计、原型与视觉协作", "F", 30, 0],
      ],
    },
    {
      name: "AI 创作",
      description: "模型、提示词、灵感和自动化入口",
      icon: "AI",
      sortOrder: 20,
      sites: [
        ["ChatGPT", "https://chatgpt.com", "对话、写作、代码和研究助手", "C", 10, 1],
        ["OpenAI", "https://platform.openai.com", "API、模型和开发者控制台", "O", 20, 0],
        ["Perplexity", "https://www.perplexity.ai", "搜索、问答与资料汇总", "P", 30, 0],
      ],
    },
    {
      name: "开发文档",
      description: "前端、后端和部署相关官方资料",
      icon: "D",
      sortOrder: 30,
      sites: [
        ["Next.js", "https://nextjs.org/docs", "React 全栈框架官方文档", "NX", 10, 1],
        ["React", "https://react.dev", "React 官方学习和 API 文档", "R", 20, 0],
        ["Tailwind CSS", "https://tailwindcss.com/docs", "原子化 CSS 框架文档", "TW", 30, 0],
      ],
    },
    {
      name: "设计灵感",
      description: "视觉参考、产品细节与动效灵感",
      icon: "V",
      sortOrder: 40,
      sites: [
        ["Awwwards", "https://www.awwwards.com", "高质量网页设计与创意案例", "AW", 10, 0],
        ["Mobbin", "https://mobbin.com", "移动端产品界面参考", "M", 20, 0],
        ["Dribbble", "https://dribbble.com", "品牌、插画和 UI 视觉探索", "DB", 30, 0],
      ],
    },
  ] as const;

  const transaction = database.transaction(() => {
    for (const category of samples) {
      const result = insertCategory.run(category);
      const categoryId = Number(result.lastInsertRowid);

      for (const [name, url, description, icon, sortOrder, isFavorite] of category.sites) {
        const siteResult = insertSite.run({
          categoryId,
          name,
          url,
          description,
          icon,
          sortOrder,
          isFavorite,
        });

        insertLink.run({
          siteId: Number(siteResult.lastInsertRowid),
          url,
        });
      }
    }
  });

  transaction();
}

export function getDb() {
  if (!db) {
    fs.mkdirSync(dataDir, { recursive: true });
    db = new Database(dbPath);
    migrate(db);
    seed(db);
  }

  return db;
}

export function getAdminCount() {
  const row = getDb().prepare("SELECT COUNT(*) AS count FROM admin_users").get() as { count: number };
  return row.count;
}

export function getAdminByUsername(username: string) {
  return getDb()
    .prepare("SELECT id, username, password_hash AS passwordHash, created_at AS createdAt FROM admin_users WHERE username = ?")
    .get(username) as AdminUser | undefined;
}

export function getAdminById(id: number) {
  return getDb()
    .prepare("SELECT id, username, password_hash AS passwordHash, created_at AS createdAt FROM admin_users WHERE id = ?")
    .get(id) as AdminUser | undefined;
}

export function createAdmin(username: string, passwordHash: string) {
  return getDb()
    .prepare("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)")
    .run(username, passwordHash);
}

export function createSession(sessionId: string, adminId: number, expiresAt: Date) {
  return getDb()
    .prepare("INSERT INTO sessions (id, admin_id, expires_at) VALUES (?, ?, ?)")
    .run(sessionId, adminId, expiresAt.toISOString());
}

export function getSession(sessionId: string) {
  return getDb()
    .prepare("SELECT id, admin_id AS adminId, expires_at AS expiresAt, created_at AS createdAt FROM sessions WHERE id = ?")
    .get(sessionId) as Session | undefined;
}

export function deleteSession(sessionId: string) {
  return getDb().prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
}

export function deleteExpiredSessions() {
  return getDb().prepare("DELETE FROM sessions WHERE expires_at <= ?").run(new Date().toISOString());
}

export function listCategories({ includeHidden = false } = {}) {
  const rows = getDb()
    .prepare(
      `
      SELECT * FROM categories
      ${includeHidden ? "" : "WHERE is_visible = 1"}
      ORDER BY sort_order ASC, id ASC
    `,
    )
    .all() as Record<string, unknown>[];

  return rows.map(mapCategory);
}

export function getCategoryById(id: number) {
  const row = getDb().prepare("SELECT * FROM categories WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? mapCategory(row) : undefined;
}

export function createCategory(input: Omit<Category, "id" | "createdAt" | "updatedAt">) {
  return getDb()
    .prepare(
      `
      INSERT INTO categories (name, description, icon, sort_order, is_visible)
      VALUES (@name, @description, @icon, @sortOrder, @isVisible)
    `,
    )
    .run({ ...input, isVisible: input.isVisible ? 1 : 0 });
}

export function updateCategory(id: number, input: Omit<Category, "id" | "createdAt" | "updatedAt">) {
  return getDb()
    .prepare(
      `
      UPDATE categories
      SET name = @name,
          description = @description,
          icon = @icon,
          sort_order = @sortOrder,
          is_visible = @isVisible,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `,
    )
    .run({ id, ...input, isVisible: input.isVisible ? 1 : 0 });
}

export function deleteCategory(id: number) {
  return getDb().prepare("DELETE FROM categories WHERE id = ?").run(id);
}

export function countSitesByCategory(id: number) {
  const row = getDb().prepare("SELECT COUNT(*) AS count FROM sites WHERE category_id = ?").get(id) as { count: number };
  return row.count;
}

export function listSites({ includeHidden = false } = {}) {
  const rows = getDb()
    .prepare(
      `
      SELECT sites.*, categories.name AS category_name
      FROM sites
      JOIN categories ON categories.id = sites.category_id
      ${
        includeHidden
          ? ""
          : `WHERE sites.is_visible = 1
             AND categories.is_visible = 1
             AND EXISTS (SELECT 1 FROM site_links WHERE site_links.site_id = sites.id AND site_links.is_enabled = 1)`
      }
      ORDER BY sites.is_favorite DESC, categories.sort_order ASC, sites.sort_order ASC, sites.id ASC
    `,
    )
    .all() as Record<string, unknown>[];

  if (rows.length === 0) return [];

  const siteIds = rows.map((row) => Number(row.id));
  const allLinks = getDb()
    .prepare(
      `
      SELECT *
      FROM site_links
      WHERE site_id IN (${siteIds.map(() => "?").join(",")})
      ORDER BY sort_order ASC, id ASC
    `,
    )
    .all(...siteIds) as Record<string, unknown>[];

  const linksBySiteId = new Map<number, SiteLink[]>();
  for (const linkRow of allLinks) {
    const siteId = Number(linkRow.site_id);
    if (!linksBySiteId.has(siteId)) {
      linksBySiteId.set(siteId, []);
    }
    linksBySiteId.get(siteId)!.push(mapSiteLink(linkRow));
  }

  return rows.map((row) => mapSite(row, linksBySiteId.get(Number(row.id)) || []));
}

export function listSiteLinksForSite(siteId: number, includeDisabled = false) {
  const rows = getDb()
    .prepare(
      `
      SELECT *
      FROM site_links
      WHERE site_id = ?
      ${includeDisabled ? "" : "AND is_enabled = 1"}
      ORDER BY sort_order ASC, id ASC
    `,
    )
    .all(siteId) as Record<string, unknown>[];

  return rows.map(mapSiteLink);
}

export function getSiteById(id: number, { includeHidden = false } = {}) {
  const row = getDb()
    .prepare(
      `
      SELECT sites.*, categories.name AS category_name
      FROM sites
      JOIN categories ON categories.id = sites.category_id
      WHERE sites.id = ?
      ${includeHidden ? "" : "AND sites.is_visible = 1 AND categories.is_visible = 1"}
    `,
    )
    .get(id) as Record<string, unknown> | undefined;

  return row ? mapSite(row) : undefined;
}

export function listFavoriteSites() {
  const rows = getDb()
    .prepare(
      `
      SELECT sites.*, categories.name AS category_name
      FROM sites
      JOIN categories ON categories.id = sites.category_id
      WHERE sites.is_visible = 1
        AND sites.is_favorite = 1
        AND categories.is_visible = 1
        AND EXISTS (SELECT 1 FROM site_links WHERE site_links.site_id = sites.id AND site_links.is_enabled = 1)
      ORDER BY sites.sort_order ASC, sites.id ASC
    `,
    )
    .all() as Record<string, unknown>[];

  if (rows.length === 0) return [];

  const siteIds = rows.map((row) => Number(row.id));
  const allLinks = getDb()
    .prepare(
      `
      SELECT *
      FROM site_links
      WHERE site_id IN (${siteIds.map(() => "?").join(",")})
      ORDER BY sort_order ASC, id ASC
    `,
    )
    .all(...siteIds) as Record<string, unknown>[];

  const linksBySiteId = new Map<number, SiteLink[]>();
  for (const linkRow of allLinks) {
    const siteId = Number(linkRow.site_id);
    if (!linksBySiteId.has(siteId)) {
      linksBySiteId.set(siteId, []);
    }
    linksBySiteId.get(siteId)!.push(mapSiteLink(linkRow));
  }

  return rows.map((row) => mapSite(row, linksBySiteId.get(Number(row.id)) || []));
}

function primaryLink(input: SiteInput) {
  return input.links.filter((link) => link.isEnabled).sort((a, b) => a.sortOrder - b.sortOrder)[0] ?? input.links[0];
}

function replaceSiteLinks(database: Database.Database, siteId: number, links: SiteInput["links"]) {
  const deleteLinks = database.prepare("DELETE FROM site_links WHERE site_id = ?");
  const insertLink = database.prepare(`
    INSERT INTO site_links (site_id, label, url, sort_order, is_enabled)
    VALUES (@siteId, @label, @url, @sortOrder, @isEnabled)
  `);

  deleteLinks.run(siteId);

  for (const link of links) {
    insertLink.run({
      siteId,
      label: link.label || "链接",
      url: link.url,
      sortOrder: link.sortOrder,
      isEnabled: link.isEnabled ? 1 : 0,
    });
  }
}

export function createSite(input: SiteInput) {
  const database = getDb();
  const mainLink = primaryLink(input);

  const transaction = database.transaction(() => {
    const result = database
      .prepare(
        `
        INSERT INTO sites (category_id, name, url, description, icon, sort_order, is_favorite, is_visible)
        VALUES (@categoryId, @name, @url, @description, @icon, @sortOrder, @isFavorite, @isVisible)
      `,
      )
      .run({
        ...input,
        url: mainLink.url,
        isFavorite: input.isFavorite ? 1 : 0,
        isVisible: input.isVisible ? 1 : 0,
      });

    const siteId = Number(result.lastInsertRowid);
    replaceSiteLinks(database, siteId, input.links);
    return result;
  });

  return transaction();
}

export function updateSite(id: number, input: SiteInput) {
  const database = getDb();
  const mainLink = primaryLink(input);

  const transaction = database.transaction(() => {
    const result = database
      .prepare(
      `
      UPDATE sites
      SET category_id = @categoryId,
          name = @name,
          url = @url,
          description = @description,
          icon = @icon,
          sort_order = @sortOrder,
          is_favorite = @isFavorite,
          is_visible = @isVisible,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `,
      )
      .run({
        id,
        ...input,
        url: mainLink.url,
        isFavorite: input.isFavorite ? 1 : 0,
        isVisible: input.isVisible ? 1 : 0,
      });

    replaceSiteLinks(database, id, input.links);
    return result;
  });

  return transaction();
}

export function deleteSite(id: number) {
  return getDb().prepare("DELETE FROM sites WHERE id = ?").run(id);
}

export function getDashboardStats() {
  const categoryCount = getDb().prepare("SELECT COUNT(*) AS count FROM categories").get() as { count: number };
  const siteCount = getDb().prepare("SELECT COUNT(*) AS count FROM sites").get() as { count: number };
  const favoriteCount = getDb().prepare("SELECT COUNT(*) AS count FROM sites WHERE is_favorite = 1").get() as { count: number };
  const hiddenCount = getDb().prepare("SELECT COUNT(*) AS count FROM sites WHERE is_visible = 0").get() as { count: number };

  return {
    categoryCount: categoryCount.count,
    siteCount: siteCount.count,
    favoriteCount: favoriteCount.count,
    hiddenCount: hiddenCount.count,
  };
}
