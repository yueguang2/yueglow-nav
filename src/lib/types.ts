export type Category = {
  id: number;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
  isPinned: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Site = {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  url: string;
  primaryUrl: string;
  description: string;
  icon: string;
  isFavorite: boolean;
  isVisible: boolean;
  isPinned: boolean;
  sortOrder: number;
  links: SiteLink[];
  linkCount: number;
  createdAt: string;
  updatedAt: string;
};

export type SiteLink = {
  id: number;
  siteId: number;
  label: string;
  url: string;
  sortOrder: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SiteLinkInput = {
  id?: number;
  label: string;
  url: string;
  sortOrder: number;
  isEnabled: boolean;
};

export type SiteInput = {
  categoryId: number;
  name: string;
  description: string;
  icon: string;
  isFavorite: boolean;
  isVisible: boolean;
  isPinned: boolean;
  sortOrder: number;
  links: SiteLinkInput[];
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminUser = {
  id: number;
  username: string;
  passwordHash: string;
  createdAt: string;
};

export type Session = {
  id: string;
  adminId: number;
  expiresAt: string;
  createdAt: string;
};

export type UiStyle = "wechat" | "classic" | "glass" | "minimal";

export type Theme = {
  id: number;
  name: string;
  slug: string;
  description: string;
  uiStyle: UiStyle;
  darkBackground: string;
  darkForeground: string;
  darkAccent: string;
  darkAccent2: string;
  darkPanel: string;
  darkPanelStrong: string;
  darkCardBg: string;
  darkFieldBg: string;
  lightBackground: string;
  lightForeground: string;
  lightAccent: string;
  lightAccent2: string;
  lightPanel: string;
  lightPanelStrong: string;
  lightCardBg: string;
  lightFieldBg: string;
  useBackdropBlur: boolean;
  useGradientGlow: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
