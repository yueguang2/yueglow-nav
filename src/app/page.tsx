import { HomePage } from "@/components/home-page";
import { listCategories, listFavoriteSites, listSites } from "@/lib/db";

export const dynamic = "force-dynamic";

function groupSites() {
  const categories = listCategories();
  const sites = listSites();

  return categories.map((category) => ({
    ...category,
    sites: sites.filter((site) => site.categoryId === category.id),
  }));
}

export default function Home() {
  const favoriteSites = listFavoriteSites();
  const categories = groupSites();
  const allSites = listSites();

  return <HomePage favoriteSites={favoriteSites} categories={categories} allSites={allSites} />;
}
