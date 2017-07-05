import requestPromise from 'request-promise';
var jsdom = require('jsdom');

const userMiddleware = async (request, response) => {
  const userId = request.params.id;
  const idBasedUrl = `https://steamcommunity.com/id/${userId}`;
  const profileBasedUrl = `https://steamcommunity.com/profiles/${userId}`;
  // error_ctn
  try {
    // Fetching HTML from id-based url at first
    let body = null;
    body = await requestPromise({
      uri: idBasedUrl
    });
    // Fallback to profile-based url to fetch data
    if (/\"error_ctn\"/gim.test(body)) {
      body = await requestPromise({
        uri: profileBasedUrl
      });
    }
    const gameTabHtml = await requestPromise({
      uri: 'https://steamcommunity.com/id/ajhsu/games/?tab=all'
    });
    const allGames = JSON.parse(
      gameTabHtml
        .match(/var rgGames = \[.*?\]/)[0]
        .replace(/var rgGames = /, '')
    );

    // Passing HTML string into JSDOM
    jsdom.env(
      body,
      ['https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js'],
      function(err, window) {
        var $ = window.$;
        var document = window.document;

        var privacy = $('.profile_private_info').text().trim();
        var currentStatus = $('.profile_in_game_header').text().trim();
        var lastStatus = $('.profile_in_game_name').text().trim();
        var realName = $('.header_real_name bdi').remove().text().trim();
        var country = $('.header_real_name').text().trim();
        var recentPlayTime = $('.recentgame_recentplaytime').text().trim();
        var recentGames = $('.recent_game')
          .map((idx, elem) => {
            return {
              name: $(elem).find('.game_name').text().trim(),
              details: $(elem)
                .find('.game_info_details')
                .text()
                .trim()
                .replace(/\t/g, '')
            };
          })
          .get();
        var profileNumbers = $('span.profile_count_link_total')
          .map((idx, elem) => $(elem).text().trim())
          .get();

        // Response is JSON
        response.json({
          privacy,
          currentStatus,
          lastStatus,
          realName,
          country,
          recentPlayTime,
          recentGames,
          badgeCount: profileNumbers[0],
          gameCount: profileNumbers[1],
          friendCount: profileNumbers[3],
          allGames
        });
      }
    );
  } catch (err) {
    console.error(err);
    response.status(400).json({
      error: 'unknown error'
    });
  }
};

export default userMiddleware;
