require('dotenv').config()
const express = require('express');
const cors = require('cors');
const SpotifyWebAPI = require('spotify-web-api-node');
const lyricsFinder = require('lyrics-finder')
const app = express();
app.use(cors())
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

app.post("/refresh", (req, res) => {
    const refreshToken = req.body.refreshToken;
    const spotifyAPI = new SpotifyWebAPI({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: refreshToken
    });

    spotifyAPI.refreshToken().then(res => res.json({
        accessToken: res.body.accessToken,
        expiresIn: res.body.expiresIn,
    }))
})

app.get("/lyrics", async (req, res) => {
    const lyrics = await lyricsFinder(req.query.artist, req.query.track) || "No Lyrics Found"
    res.json({lyrics})
})

app.post('/login', (req, res) => {
    const code = req.body.code
    const spotifyAPI = new SpotifyWebAPI({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: ""
    });

    spotifyAPI.authorizationCodeGrant(code).then(
        (data) => {
            spotifyAPI.setAccessToken(data.body['access_token']);
            spotifyAPI.setRefreshToken(data.body['refresh_token']);
            return res.send({
                accessToken: data.body.access_token,
                refreshToken: data.body.refresh_token,
                expiresIn: data.body.expires_in
            })
        }).catch(err => {
        console.log(err);
    })
})

app.listen(3001)