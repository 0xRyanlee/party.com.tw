import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: "/admin/",
        },
        sitemap: "https://party.com.tw/sitemap.xml", // Replace with actual domain
    };
}
