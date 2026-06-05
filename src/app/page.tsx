import { HomePage } from "@/components/home-page";
import { getActiveUiStyle, listCategories, listFavoriteSites, listSites } from "@/lib/db";

export const dynamic = "force-dynamic";

function groupSites() {
  const categories = listCategories();
  const sites = listSites();

  return categories
    .map((category) => ({
      ...category,
      sites: sites.filter((site) => site.categoryId === category.id),
    }))
    .filter((category) => category.sites.length > 0);
}

export default function Home() {
  const favoriteSites = listFavoriteSites();
  const categories = groupSites();
  const allSites = listSites();
  const uiStyle = getActiveUiStyle();

  return <HomePage favoriteSites={favoriteSites} categories={categories} allSites={allSites} uiStyle={uiStyle} />;
}
