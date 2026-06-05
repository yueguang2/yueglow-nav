import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { BUILT_IN_THEMES, WECHAT_THEME, isBuiltInThemeName, isBuiltInThemeSlug, type BuiltInTheme } from "./default-theme";
import type { AdminUser, Category, PaginatedResult, Session, Site, SiteInput, SiteLink, Theme, UiStyle } from "./types";

const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "nav-site.db");

let db: Database.Database | undefined;

const removedPresetThemeSlugs = ["clay", "glass", "purple", "forest", "sunset"] as const;

function bool(value: number | boolean) {
  return Boolean(value);
}

function normalizePagination(page: number, pageSize: number, total: number) {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Number.isInteger(page) && page > 0 ? Math.min(page, totalPages) : 1;
  const offset = (safePage - 1) * safePageSize;

  return { page: safePage, pageSize: safePageSize, totalPages, offset };
}

function hasColumn(database: Database.Database, tableName: "categories" | "sites" | "themes", columnName: string) {
  const rows = database.prepare(`PRAGMA table_info(${tableName})`).all() as { name: string }[];
  return rows.some((row) => row.name === columnName);
}

function ensureColumn(database: Database.Database, tableName: "categories" | "sites" | "themes", columnName: string, definition: string) {
  if (!hasColumn(database, tableName, columnName)) {
    database.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

function normalizeUiStyle(value: unknown): UiStyle {
  return value === "classic" ? "classic" : "wechat";
}

function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: Number(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    icon: String(row.icon ?? ""),
    sortOrder: Number(row.sort_order),
    isPinned: bool(Number(row.is_pinned ?? 0)),
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
    isPinned: bool(Number(row.is_pinned ?? 0)),
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

function mapTheme(row: Record<string, unknown>): Theme {
  return {
    id: Number(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description ?? ""),
    uiStyle: normalizeUiStyle(row.ui_style),
    darkBackground: String(row.dark_background),
    darkForeground: String(row.dark_foreground),
    darkAccent: String(row.dark_accent),
    darkAccent2: String(row.dark_accent_2),
    darkPanel: String(row.dark_panel),
    darkPanelStrong: String(row.dark_panel_strong),
    darkCardBg: String(row.dark_card_bg),
    darkFieldBg: String(row.dark_field_bg),
    lightBackground: String(row.light_background),
    lightForeground: String(row.light_foreground),
    lightAccent: String(row.light_accent),
    lightAccent2: String(row.light_accent_2),
    lightPanel: String(row.light_panel),
    lightPanelStrong: String(row.light_panel_strong),
    lightCardBg: String(row.light_card_bg),
    lightFieldBg: String(row.light_field_bg),
    useBackdropBlur: bool(Number(row.use_backdrop_blur)),
    useGradientGlow: bool(Number(row.use_gradient_glow)),
    isActive: bool(Number(row.is_active)),
    sortOrder: Number(row.sort_order),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function themeDbInput(theme: BuiltInTheme, isActive = false) {
  return {
    ...theme,
    useBackdropBlur: theme.useBackdropBlur ? 1 : 0,
    useGradientGlow: theme.useGradientGlow ? 1 : 0,
    isActive: isActive ? 1 : 0,
  };
}

function insertBuiltInTheme(database: Database.Database, theme: BuiltInTheme, isActive: boolean) {
  return database
    .prepare(
      `
      INSERT INTO themes (
        name, slug, description, ui_style,
        dark_background, dark_foreground, dark_accent, dark_accent_2,
        dark_panel, dark_panel_strong, dark_card_bg, dark_field_bg,
        light_background, light_foreground, light_accent, light_accent_2,
        light_panel, light_panel_strong, light_card_bg, light_field_bg,
        use_backdrop_blur, use_gradient_glow, is_active, sort_order
      ) VALUES (
        @name, @slug, @description, @uiStyle,
        @darkBackground, @darkForeground, @darkAccent, @darkAccent2,
        @darkPanel, @darkPanelStrong, @darkCardBg, @darkFieldBg,
        @lightBackground, @lightForeground, @lightAccent, @lightAccent2,
        @lightPanel, @lightPanelStrong, @lightCardBg, @lightFieldBg,
        @useBackdropBlur, @useGradientGlow, @isActive, @sortOrder
      )
    `,
    )
    .run(themeDbInput(theme, isActive));
}

function updateBuiltInTheme(database: Database.Database, id: number, theme: BuiltInTheme) {
  return database
    .prepare(
      `
      UPDATE themes
      SET name = @name,
          slug = @slug,
          description = @description,
          ui_style = @uiStyle,
          dark_background = @darkBackground,
          dark_foreground = @darkForeground,
          dark_accent = @darkAccent,
          dark_accent_2 = @darkAccent2,
          dark_panel = @darkPanel,
          dark_panel_strong = @darkPanelStrong,
          dark_card_bg = @darkCardBg,
          dark_field_bg = @darkFieldBg,
          light_background = @lightBackground,
          light_foreground = @lightForeground,
          light_accent = @lightAccent,
          light_accent_2 = @lightAccent2,
          light_panel = @lightPanel,
          light_panel_strong = @lightPanelStrong,
          light_card_bg = @lightCardBg,
          light_field_bg = @lightFieldBg,
          use_backdrop_blur = @useBackdropBlur,
          use_gradient_glow = @useGradientGlow,
          sort_order = @sortOrder,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `,
    )
    .run({
      id,
      ...themeDbInput(theme),
    });
}

function isThemePalette(row: Record<string, unknown>, theme: BuiltInTheme) {
  const checks: [keyof BuiltInTheme, string | boolean][] = [
    ["description", String(row.description ?? "")],
    ["darkBackground", String(row.dark_background)],
    ["darkForeground", String(row.dark_foreground)],
    ["darkAccent", String(row.dark_accent)],
    ["darkAccent2", String(row.dark_accent_2)],
    ["darkPanel", String(row.dark_panel)],
    ["darkPanelStrong", String(row.dark_panel_strong)],
    ["darkCardBg", String(row.dark_card_bg)],
    ["darkFieldBg", String(row.dark_field_bg)],
    ["lightBackground", String(row.light_background)],
    ["lightForeground", String(row.light_foreground)],
    ["lightAccent", String(row.light_accent)],
    ["lightAccent2", String(row.light_accent_2)],
    ["lightPanel", String(row.light_panel)],
    ["lightPanelStrong", String(row.light_panel_strong)],
    ["lightCardBg", String(row.light_card_bg)],
    ["lightFieldBg", String(row.light_field_bg)],
    ["useBackdropBlur", bool(Number(row.use_backdrop_blur))],
    ["useGradientGlow", bool(Number(row.use_gradient_glow))],
  ];

  return checks.every(([key, value]) => theme[key] === value);
}

function isThemePresetRow(row: Record<string, unknown>, theme: BuiltInTheme) {
  return isThemePalette(row, theme);
}

function customThemeSlug(slug: string, id: number) {
  const safeSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "theme";
  const suffix = `-${id}`;
  return `custom-${safeSlug}`.slice(0, Math.max(1, 40 - suffix.length)) + suffix;
}

function renameConflictingTheme(database: Database.Database, row: Record<string, unknown>) {
  const id = Number(row.id);
  const currentSlug = String(row.slug || "theme");
  const currentName = String(row.name || "主题");

  database
    .prepare(
      `
      UPDATE themes
      SET slug = @slug,
          name = @name,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `,
    )
    .run({
      id,
      slug: customThemeSlug(currentSlug, id),
      name: `${currentName}（自定义 ${id}）`,
    });
}

function renameReservedNameConflicts(database: Database.Database, theme: BuiltInTheme, protectedId: number) {
  const rows = database
    .prepare("SELECT * FROM themes WHERE name = ? AND id <> ?")
    .all(theme.name, protectedId) as Record<string, unknown>[];

  for (const row of rows) {
    renameConflictingTheme(database, row);
  }
}

function prepareWechatTransition(database: Database.Database) {
  const oceanRow = database.prepare("SELECT * FROM themes WHERE slug = 'ocean'").get() as Record<string, unknown> | undefined;

  if (!oceanRow || !isThemePalette(oceanRow, WECHAT_THEME)) {
    return;
  }

  const oceanId = Number(oceanRow.id);
  const existingWechat = database.prepare("SELECT * FROM themes WHERE slug = 'wechat' AND id <> ?").get(oceanId) as
    | Record<string, unknown>
    | undefined;

  if (existingWechat) {
    renameConflictingTheme(database, existingWechat);
  }

  renameReservedNameConflicts(database, WECHAT_THEME, oceanId);
  updateBuiltInTheme(database, oceanId, WECHAT_THEME);
}

function ensureBuiltInTheme(database: Database.Database, theme: BuiltInTheme) {
  const existing = database.prepare("SELECT * FROM themes WHERE slug = ?").get(theme.slug) as Record<string, unknown> | undefined;

  if (existing) {
    if (isThemePresetRow(existing, theme)) {
      const id = Number(existing.id);
      renameReservedNameConflicts(database, theme, id);
      updateBuiltInTheme(database, id, theme);
      return;
    }

    renameConflictingTheme(database, existing);
  }

  const nameConflict = database.prepare("SELECT * FROM themes WHERE name = ?").get(theme.name) as Record<string, unknown> | undefined;

  if (nameConflict) {
    renameConflictingTheme(database, nameConflict);
  }

  insertBuiltInTheme(database, theme, false);
}

function normalizeActiveTheme(database: Database.Database, preferredActiveId?: number) {
  const activeRows = database
    .prepare("SELECT id, slug FROM themes WHERE is_active = 1 ORDER BY id ASC")
    .all() as { id: number; slug: string }[];

  if (activeRows.length === 1) {
    return;
  }

  const preferredExists =
    preferredActiveId && database.prepare("SELECT id FROM themes WHERE id = ?").get(preferredActiveId);
  const fallbackRow =
    (preferredExists ? ({ id: preferredActiveId } as { id: number }) : undefined) ??
    (database.prepare("SELECT id FROM themes WHERE slug = 'wechat'").get() as { id: number } | undefined) ??
    (database.prepare("SELECT id FROM themes ORDER BY sort_order ASC, id ASC LIMIT 1").get() as { id: number } | undefined);

  if (!fallbackRow) {
    return;
  }

  database.prepare("UPDATE themes SET is_active = CASE WHEN id = ? THEN 1 ELSE 0 END").run(fallbackRow.id);
}

function ensureBuiltInThemes(database: Database.Database) {
  const transaction = database.transaction(() => {
    const activeBeforeCleanup = database
      .prepare("SELECT id, slug FROM themes WHERE is_active = 1 ORDER BY id ASC")
      .all() as { id: number; slug: string }[];
    const preferredActiveId = activeBeforeCleanup.length === 1 ? activeBeforeCleanup[0].id : undefined;

    for (const slug of removedPresetThemeSlugs) {
      database.prepare("DELETE FROM themes WHERE slug = ?").run(slug);
    }

    prepareWechatTransition(database);

    const reservedNameRows = database
      .prepare(`SELECT * FROM themes WHERE name IN (${BUILT_IN_THEMES.map(() => "?").join(",")})`)
      .all(...BUILT_IN_THEMES.map((theme) => theme.name)) as Record<string, unknown>[];

    for (const row of reservedNameRows) {
      const matchingTheme = BUILT_IN_THEMES.find((theme) => theme.slug === row.slug);

      if (!matchingTheme || !isThemePresetRow(row, matchingTheme)) {
        renameConflictingTheme(database, row);
      }
    }

    for (const theme of BUILT_IN_THEMES) {
      ensureBuiltInTheme(database, theme);
    }

    normalizeActiveTheme(database, preferredActiveId);
  });

  transaction();
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
      is_pinned INTEGER NOT NULL DEFAULT 0,
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
      is_pinned INTEGER NOT NULL DEFAULT 0,
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

    CREATE TABLE IF NOT EXISTS themes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      ui_style TEXT NOT NULL DEFAULT 'wechat',
      dark_background TEXT NOT NULL,
      dark_foreground TEXT NOT NULL,
      dark_accent TEXT NOT NULL,
      dark_accent_2 TEXT NOT NULL,
      dark_panel TEXT NOT NULL,
      dark_panel_strong TEXT NOT NULL,
      dark_card_bg TEXT NOT NULL,
      dark_field_bg TEXT NOT NULL,
      light_background TEXT NOT NULL,
      light_foreground TEXT NOT NULL,
      light_accent TEXT NOT NULL,
      light_accent_2 TEXT NOT NULL,
      light_panel TEXT NOT NULL,
      light_panel_strong TEXT NOT NULL,
      light_card_bg TEXT NOT NULL,
      light_field_bg TEXT NOT NULL,
      use_backdrop_blur INTEGER NOT NULL DEFAULT 0,
      use_gradient_glow INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 100,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  ensureColumn(database, "categories", "is_pinned", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn(database, "sites", "is_pinned", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn(database, "themes", "ui_style", "TEXT NOT NULL DEFAULT 'wechat'");

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

  ensureBuiltInThemes(database);
}

function seed(database: Database.Database) {
  const count = database.prepare("SELECT COUNT(*) AS count FROM categories").get() as { count: number };

  if (count.count > 0) {
    return;
  }

  const insertCategory = database.prepare(`
    INSERT INTO categories (name, description, icon, sort_order, is_pinned, is_visible)
    VALUES (@name, @description, @icon, @sortOrder, 0, 1)
  `);

  const insertSite = database.prepare(`
    INSERT INTO sites (category_id, name, url, description, icon, sort_order, is_favorite, is_pinned, is_visible)
    VALUES (@categoryId, @name, @url, @description, @icon, @sortOrder, @isFavorite, 0, 1)
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

export function updateAdminPassword(adminId: number, passwordHash: string) {
  return getDb()
    .prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?")
    .run(passwordHash, adminId);
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
      ORDER BY is_pinned DESC, sort_order ASC, id ASC
    `,
    )
    .all() as Record<string, unknown>[];

  return rows.map(mapCategory);
}

export function listCategoriesPage({ includeHidden = false, page = 1, pageSize = 12 } = {}): PaginatedResult<Category> {
  const whereClause = includeHidden ? "" : "WHERE is_visible = 1";
  const totalRow = getDb().prepare(`SELECT COUNT(*) AS count FROM categories ${whereClause}`).get() as { count: number };
  const pagination = normalizePagination(page, pageSize, totalRow.count);
  const rows = getDb()
    .prepare(
      `
      SELECT *
      FROM categories
      ${whereClause}
      ORDER BY is_pinned DESC, sort_order ASC, id ASC
      LIMIT ? OFFSET ?
    `,
    )
    .all(pagination.pageSize, pagination.offset) as Record<string, unknown>[];

  return {
    items: rows.map(mapCategory),
    total: totalRow.count,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
  };
}

export function getCategoryById(id: number) {
  const row = getDb().prepare("SELECT * FROM categories WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? mapCategory(row) : undefined;
}

export function createCategory(input: Omit<Category, "id" | "createdAt" | "updatedAt">) {
  return getDb()
    .prepare(
      `
      INSERT INTO categories (name, description, icon, sort_order, is_pinned, is_visible)
      VALUES (@name, @description, @icon, @sortOrder, @isPinned, @isVisible)
    `,
    )
    .run({ ...input, isPinned: input.isPinned ? 1 : 0, isVisible: input.isVisible ? 1 : 0 });
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
          is_pinned = @isPinned,
          is_visible = @isVisible,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `,
    )
    .run({ id, ...input, isPinned: input.isPinned ? 1 : 0, isVisible: input.isVisible ? 1 : 0 });
}

export function updateCategoryPinned(id: number, isPinned: boolean) {
  return getDb()
    .prepare("UPDATE categories SET is_pinned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(isPinned ? 1 : 0, id);
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
      ORDER BY sites.is_pinned DESC, sites.is_favorite DESC, categories.sort_order ASC, sites.sort_order ASC, sites.id ASC
    `,
    )
    .all() as Record<string, unknown>[];

  return mapSiteRowsWithLinks(rows);
}

function mapSiteRowsWithLinks(rows: Record<string, unknown>[]) {
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

export function listSitesPage({ includeHidden = false, page = 1, pageSize = 10 } = {}): PaginatedResult<Site> {
  const whereClause = includeHidden
    ? ""
    : `WHERE sites.is_visible = 1
       AND categories.is_visible = 1
       AND EXISTS (SELECT 1 FROM site_links WHERE site_links.site_id = sites.id AND site_links.is_enabled = 1)`;

  const totalRow = getDb()
    .prepare(
      `
      SELECT COUNT(*) AS count
      FROM sites
      JOIN categories ON categories.id = sites.category_id
      ${whereClause}
    `,
    )
    .get() as { count: number };
  const pagination = normalizePagination(page, pageSize, totalRow.count);
  const rows = getDb()
    .prepare(
      `
      SELECT sites.*, categories.name AS category_name
      FROM sites
      JOIN categories ON categories.id = sites.category_id
      ${whereClause}
      ORDER BY sites.is_pinned DESC, sites.is_favorite DESC, categories.sort_order ASC, sites.sort_order ASC, sites.id ASC
      LIMIT ? OFFSET ?
    `,
    )
    .all(pagination.pageSize, pagination.offset) as Record<string, unknown>[];

  return {
    items: mapSiteRowsWithLinks(rows),
    total: totalRow.count,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: pagination.totalPages,
  };
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
      ORDER BY sites.is_pinned DESC, sites.sort_order ASC, sites.id ASC
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
        INSERT INTO sites (category_id, name, url, description, icon, sort_order, is_favorite, is_pinned, is_visible)
        VALUES (@categoryId, @name, @url, @description, @icon, @sortOrder, @isFavorite, @isPinned, @isVisible)
      `,
      )
      .run({
        ...input,
        url: mainLink.url,
        isFavorite: input.isFavorite ? 1 : 0,
        isPinned: input.isPinned ? 1 : 0,
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
          is_pinned = @isPinned,
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
        isPinned: input.isPinned ? 1 : 0,
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

export function updateSitePinned(id: number, isPinned: boolean) {
  return getDb()
    .prepare("UPDATE sites SET is_pinned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .run(isPinned ? 1 : 0, id);
}

// Theme functions
export function listThemes() {
  const rows = getDb()
    .prepare("SELECT * FROM themes ORDER BY sort_order ASC, id ASC")
    .all() as Record<string, unknown>[];
  return rows.map(mapTheme);
}

export function getThemeById(id: number) {
  const row = getDb().prepare("SELECT * FROM themes WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? mapTheme(row) : undefined;
}

export function getThemeBySlug(slug: string) {
  const row = getDb().prepare("SELECT * FROM themes WHERE slug = ?").get(slug) as Record<string, unknown> | undefined;
  return row ? mapTheme(row) : undefined;
}

export function isBuiltInTheme(theme: Pick<Theme, "slug" | "name">) {
  return isBuiltInThemeSlug(theme.slug) || isBuiltInThemeName(theme.name);
}

export function isReservedThemeIdentity(input: Pick<Theme, "slug" | "name">) {
  return isBuiltInThemeSlug(input.slug) || isBuiltInThemeName(input.name);
}

export function getActiveTheme() {
  const row = getDb().prepare("SELECT * FROM themes WHERE is_active = 1").get() as Record<string, unknown> | undefined;
  return row ? mapTheme(row) : undefined;
}

export function getActiveUiStyle(): UiStyle {
  return getActiveTheme()?.uiStyle ?? "wechat";
}

export function ensureDefaultTheme() {
  ensureBuiltInThemes(getDb());
}

export function createTheme(input: Omit<Theme, "id" | "createdAt" | "updatedAt">) {
  return getDb()
    .prepare(
      `
      INSERT INTO themes (
        name, slug, description, ui_style,
        dark_background, dark_foreground, dark_accent, dark_accent_2,
        dark_panel, dark_panel_strong, dark_card_bg, dark_field_bg,
        light_background, light_foreground, light_accent, light_accent_2,
        light_panel, light_panel_strong, light_card_bg, light_field_bg,
        use_backdrop_blur, use_gradient_glow, is_active, sort_order
      ) VALUES (
        @name, @slug, @description, @uiStyle,
        @darkBackground, @darkForeground, @darkAccent, @darkAccent2,
        @darkPanel, @darkPanelStrong, @darkCardBg, @darkFieldBg,
        @lightBackground, @lightForeground, @lightAccent, @lightAccent2,
        @lightPanel, @lightPanelStrong, @lightCardBg, @lightFieldBg,
        @useBackdropBlur, @useGradientGlow, @isActive, @sortOrder
      )
    `,
    )
    .run({
      ...input,
      useBackdropBlur: input.useBackdropBlur ? 1 : 0,
      useGradientGlow: input.useGradientGlow ? 1 : 0,
      isActive: input.isActive ? 1 : 0,
    });
}

export function updateTheme(id: number, input: Omit<Theme, "id" | "createdAt" | "updatedAt">) {
  return getDb()
    .prepare(
      `
      UPDATE themes
      SET name = @name,
          slug = @slug,
          description = @description,
          ui_style = @uiStyle,
          dark_background = @darkBackground,
          dark_foreground = @darkForeground,
          dark_accent = @darkAccent,
          dark_accent_2 = @darkAccent2,
          dark_panel = @darkPanel,
          dark_panel_strong = @darkPanelStrong,
          dark_card_bg = @darkCardBg,
          dark_field_bg = @darkFieldBg,
          light_background = @lightBackground,
          light_foreground = @lightForeground,
          light_accent = @lightAccent,
          light_accent_2 = @lightAccent2,
          light_panel = @lightPanel,
          light_panel_strong = @lightPanelStrong,
          light_card_bg = @lightCardBg,
          light_field_bg = @lightFieldBg,
          use_backdrop_blur = @useBackdropBlur,
          use_gradient_glow = @useGradientGlow,
          sort_order = @sortOrder,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `,
    )
    .run({
      id,
      ...input,
      useBackdropBlur: input.useBackdropBlur ? 1 : 0,
      useGradientGlow: input.useGradientGlow ? 1 : 0,
      isActive: input.isActive ? 1 : 0,
    });
}

export function deleteTheme(id: number) {
  return getDb().prepare("DELETE FROM themes WHERE id = ?").run(id);
}

export function activateTheme(id: number) {
  const database = getDb();
  const transaction = database.transaction(() => {
    database.prepare("UPDATE themes SET is_active = 0").run();
    database.prepare("UPDATE themes SET is_active = 1 WHERE id = ?").run(id);
  });
  return transaction();
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
