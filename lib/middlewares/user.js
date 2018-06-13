const requestPromise = require('request-promise');
const jsdom = require('jsdom');

async function fetchUserIndexPage(userId) {
  const idBasedUrl = `https://steamcommunity.com/id/${userId}`;
  const profileBasedUrl = `https://steamcommunity.com/profiles/${userId}`;

  // Fetching HTML from id-based url at first
  let html = null;
  html = await requestPromise({
    uri: idBasedUrl
  });

  // Fallback to profile-based url to fetch data
  if (/\"error_ctn\"/gim.test(html)) {
    html = await requestPromise({
      uri: profileBasedUrl
    });
  }

  return html;
}

async function fetchUserAllGames(userId) {
  const gameTabHtml = await requestPromise({
    uri: `https://steamcommunity.com/id/${userId}/games/?tab=all`
  });
  const allGames = JSON.parse(
    gameTabHtml.match(/var rgGames = \[.*?\]/)[0].replace(/var rgGames = /, '')
  );
  return allGames;
}

async function userMiddleware(request, response) {
  const userId = request.params.id;

  // error_ctn
  try {
    const html = await fetchUserIndexPage(userId);

    // Passing HTML string into JSDOM
    jsdom.env(
      html,
      ['https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js'],
      async function(err, window) {
        const $ = window.$;
        const document = window.document;

        const privacy = $('.profile_private_info')
          .text()
          .trim();
        const currentStatus = $('.profile_in_game_header')
          .text()
          .trim();
        const lastStatus = $('.profile_in_game_name')
          .text()
          .trim();
        const realName = $('.header_real_name bdi')
          .remove()
          .text()
          .trim();
        const country = $('.header_real_name')
          .text()
          .trim();
        const recentPlayTime = $('.recentgame_recentplaytime')
          .text()
          .trim();
        const recentGames = $('.recent_game')
          .map((idx, elem) => {
            return {
              name: $(elem)
                .find('.game_name')
                .text()
                .trim(),
              details: $(elem)
                .find('.game_info_details')
                .text()
                .trim()
                .replace(/\t/g, '')
            };
          })
          .get();
        const profileNumbers = $('span.profile_count_link_total')
          .map((idx, elem) =>
            $(elem)
              .text()
              .trim()
          )
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
          allGames: await fetchUserAllGames(userId)
        });
      }
    );
  } catch (err) {
    console.error(err);
    response.status(400).json({
      error: 'unknown error'
    });
  }
}

module.exports = userMiddleware;
