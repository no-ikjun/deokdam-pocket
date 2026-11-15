import { MetadataRoute } from "next";
import { SEASON } from "@/config/season";
import { SHEEP_TYPES } from "@/sheep/data/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SEASON.siteUrl;
  const now = new Date();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/test`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...SHEEP_TYPES.map((t) => ({
      url: `${baseUrl}/result/${t.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    // 지난 시즌 화면
    { url: `${baseUrl}/classic`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/policy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
