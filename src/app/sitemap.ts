import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://party.com.tw";

    return [
        // 首頁
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        // 地圖檢視
        {
            url: `${baseUrl}/map`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        // 主辦方介紹
        {
            url: `${baseUrl}/host`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        // 社團
        {
            url: `${baseUrl}/club`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.7,
        },
        // 支援頁面
        {
            url: `${baseUrl}/discover`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/events`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/business`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/help`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
        // 法律頁面
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/disclaimer`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
    ];
}
