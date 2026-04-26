const { getString } = require("../helpers/dictionary");

module.exports = {
    template(platform_name, platform_icon, avatar, username, cover, title, artist, color1, color2) {
        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
        <meta charset="UTF-8" />
        <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        }

        body {
            width: 800px;
            height: 300px;
        }

        .card {
            width: 100%;
            height: 100%;
            border-radius: 20px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            background: linear-gradient(
            135deg,
            rgba(${color1}, 0.85),
            rgba(${color2}, 0.85)
            );

            position: relative;
            overflow: hidden;
        }

        .overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.25);
            backdrop-filter: blur(20px);
        }

        .content {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        .header {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #eaeaea;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
        }

        .main {
            display: flex;
            gap: 20px;
            flex: 1;
            align-items: center;
        }

        .cover {
            width: 140px;
            height: 140px;
            border-radius: 12px;
            object-fit: cover;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4);
        }

        .info {
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .title {
            font-size: 28px;
            font-weight: 700;
            color: white;
        }

        .artist {
            font-size: 18px;
            color: #d1d1d1;
            margin-top: 5px;
        }

        .button {
            margin-top: 15px;
            padding: 14px;
            border-radius: 12px;
            text-align: center;
            font-weight: 600;
            font-size: 16px;

            border: 2px solid rgba(255,255,255,0.3);
            color: white;

            backdrop-filter: blur(10px);
        }
        .platform {
            position: absolute;
            top: 20px;
            right: 20px;

            display: flex;
            align-items: center;
            gap: 8px;

            padding: 6px 10px;
            border-radius: 999px;

            background: rgba(0,0,0,0.35);
            border: 1px solid rgba(255,255,255,0.2);

            font-size: 13px;
            color: white;
            backdrop-filter: blur(10px);
        }

        .platform img {
            width: 16px;
            height: 16px;
            filter: invert(1);
        }
        </style>
        </head>

        <body>
        <div class="card">

            <div class="overlay"></div>
            <div class="platform">
                <img src="${platform_icon}" />
                <span>${platform_name}</span>
            </div>
            <div class="content">
            
            <div class="header">
                <img class="avatar" src="${avatar}" />
                <span>${getString("commands.suggest.suggested_by")} <b>${username}</b></span>
            </div>

            <div class="main">
                <img class="cover" src="${cover}" />

                <div class="info">
                <div class="title">${title}</div>
                <div class="artist">${artist}</div>
                </div>
            </div>
            </div>
        </div>
        </body>
        </html>
        `
    }
};