const puppeteer = require('puppeteer');

const visitPage = url => new Promise((res, rej) => {
  puppeteer.launch({ headless: false })
    .then(browser => {
      browser.newPage()
        .then(page => {
          page.setViewport({ height: 1000, width: 1800 })
          page.goto(url)
            .then(() => { res(page) });
        });
    }).catch(reason => rej(reason));
});

const hostGame = (page) => new Promise((res, rej) => {
  const createButton = 'a[href="/host"]';
  page.waitForSelector(createButton).then(() => {
    page.click(createButton).then(() => res(page));
  });
});

const login = (page, { username, password }) => new Promise((res, rej) => {
  page.type('#username', username)
    .then(() => {
      page.type('#password', password)
        .then(() => {
          page.click('.login-button').then(() => res(page));
        });
    });
});

const createGame = page => new Promise((res, rej) => {
  page.click('.form-controls>input').then(() => {
    page.waitForSelector('#game-link').then(() => {
      page.$eval('#game-link', e => e.defaultValue)
        .then(value => {
          res(value);
        });
    });
  });
});

const joinGame = (gameLink, player) => {
  const page = visitPage(gameLink);
  const lobby = page.then(page => login(page, player));
};

let a;
const main = () => {
  const homeUrl = 'http://localhost:8888/';
  const loginPage = visitPage(homeUrl);
  const homepage = loginPage.then(page => login(page, { username: 'avs', password: 'a' }));
  const hostPage = homepage.then(page => hostGame(page));
  const gameLink = hostPage.then(page => createGame(page));
  const players = [{ username: 'd', password: 'd' }, { username: 'b', password: 'b' }];
  gameLink.then(link => players.forEach(player => joinGame(link, player)));
};

main();
