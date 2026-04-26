const html2img = require("node-html-to-image");
const fs = require("node:fs");
const ColorThief = require("colorthief");
const { tmpdir } = require('os');
const path = require('path');
const play = require('play-dl');

const template = require("../config/template").template;

async function getSongInfo(link) {

    // Currently supported platforms
    const OEMBED_URLS = {
        "spotify": 'https://open.spotify.com/oembed',
        "youtube": 'https://www.youtube.com/oembed',
        "youtube-music": 'https://www.youtube.com/oembed',
        "soundcloud": 'https://soundcloud.com/oembed'
    };

    let platform = '';

    if (link.includes('spotify.com')) platform = 'spotify';
    else if (link.includes('soundcloud.com')) platform = 'soundcloud';
    else if (link.includes('music.youtube.com')) platform = 'youtube-music';
    else if (link.includes('youtube.com') || link.includes('youtu.be')) platform = 'youtube';
    else return 'Unsupported platform';

    const oembedUrl = `${OEMBED_URLS[platform]}?url=${encodeURIComponent(link)}`;

    const res = await fetch(oembedUrl);

    // If fails getting the info, try using play-dl
    if (!res.ok) {
        console.warn(`Failed to fetch oEmbed data for ${link} (status: ${res.status}). Falling back to play-dl.`);
        return await getSongInfoWithPlayDl(platform, link);
    }

    const data = await res.json();

    // Spotify doesn't return the author for god knows what reason
    if (platform === 'spotify') {
        const res = await fetch(link, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const html = await res.text();

        const title = html.match(/<meta property="og:title" content="(.+?)"/)?.[1];
        const thumbnail = html.match(/<meta property="og:image" content="(.+?)"/)?.[1];
        const description = html.match(/<meta property="og:description" content="(.+?)"/)?.[1];
        const artist = description?.split(' · ')[0];

        data.author_name = artist;
    }

    return {
        title: data.title,
        artists: data.author_name.split(',').map(a => a.trim()),
        thumbnail: data.thumbnail_url,
        link,
        platform
    }
}

async function getSongInfoWithPlayDl(platform, link) {
    try {
        let data;
        switch (platform) {
            case 'spotify':
                data = await play.spotify(link);
                return {
                    title: data.name,
                    artists: data.artists.map(a => a.name),
                    thumbnail: data.thumbnail?.url ?? 'https://www.svgrepo.com/show/508699/landscape-placeholder.svg',
                    link,
                    platform
                }
            case 'youtube':
                data = await play.video_info(link);

                return {
                    title: data.video_details.title,
                    artists: [data.video_details.channel.name],
                    thumbnail: data.thumbnails?.at(-1)?.url ?? 'https://www.svgrepo.com/show/508699/landscape-placeholder.svg',
                    link,
                    platform
                }
            case 'youtube-music':
                data = await play.video_info(link);

                return {
                    title: data.video_details.title,
                    artists: [data.video_details.channel.name],
                    thumbnail: data.thumbnails?.at(-1)?.url ?? 'https://www.svgrepo.com/show/508699/landscape-placeholder.svg',
                    link,
                    platform
                }
            case 'soundcloud':
                // Needs a Client ID to work, so I gave up and use soundcloud-scrapper instead
                const sc = require('soundcloud-scraper');
                const scClient = new sc.Client();
                const parsedLink = new URL(link);
                data = await scClient.getSongInfo(`${parsedLink.origin}${parsedLink.pathname}`);
                return {
                    title: data.title,
                    artists: [data.author.name],
                    thumbnail: data.thumbnail,
                    link,
                    platform
                }
        }
    } catch (error) {
        return `Failed to obtain song data using play-dl: ${error.message}`;
    }


}

async function getImage(link, extension = "jpg") {
    try {
        const res = await fetch(link);

        if (!res.ok) {
            console.error("Failed to fetch song page:", res.status);
            return;
        }

        const arrayBuffer = await res.arrayBuffer();
        const buffer = await Buffer.from(arrayBuffer);
        const tempPath = await path.join(tmpdir(), `tmp_${Math.random().toString(36)}.${extension}`);

        await fs.writeFileSync(tempPath, buffer);

        return tempPath;

    } catch (error) {
        console.error("Error fetching song thumbnail:", error);
        return;
    }
}

async function getMainColors(thumbnailLink) {
    const thumbnail = await getImage(thumbnailLink);
    const palette = await ColorThief.getPalette(thumbnail, 2);

    const color1 = [palette[0]._r, palette[0]._g, palette[0]._b],
        color2 = [palette[1]._r, palette[1]._g, palette[1]._b];

    fs.unlinkSync(thumbnail);
    return [color1, color2];
}

async function getPlatformIcon(platform) {
    switch (platform) {
        case "spotify":
            return 'https://simpleicons.org/icons/spotify.svg';
        case "youtube":
            return 'https://simpleicons.org/icons/youtube.svg';
        case "youtube-music":
            return 'https://simpleicons.org/icons/youtubemusic.svg';
        case "soundcloud":
            return 'https://simpleicons.org/icons/soundcloud.svg';
    }
}

async function parsePlatformName(platform) {
    return await platform
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

async function createCard(link, avatarLink, username) {
    const songInfo = await getSongInfo(link);

    if (typeof songInfo === "string") return songInfo;

    const [color1, color2] = await getMainColors(songInfo.thumbnail),
        platformIcon = await getPlatformIcon(songInfo.platform),
        platformName = await parsePlatformName(songInfo.platform);

    const card = await html2img({
        html: template(
            platformName,
            platformIcon,
            avatarLink,
            username,
            songInfo.thumbnail,
            songInfo.title,
            songInfo.artists.join(", "),
            color1,
            color2
        ),
        type: "png",
        encoding: "buffer",
        selector: ".card",
        transparent: true,
        beforeScreenshot: async (page) => {
            await page.evaluate(() => {
                document.documentElement.style.background = 'transparent';
                document.body.style.background = 'transparent';
            });
        },
        puppeteerArgs: {
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    return card;
}

module.exports = { createCard };