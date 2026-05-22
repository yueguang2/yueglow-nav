export type Category = {
  id: number;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
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
  sortOrder: number;
  links: SiteLinkInput[];
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
