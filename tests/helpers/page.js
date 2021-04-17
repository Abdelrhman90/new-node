const puppeteer = require("puppeteer");
const userFactory = require("../factories/userFactory");
const sessionFactory = require("../factories/sessionFactory");
module.exports = class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();

    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function (target, property) {
        return customPage[property] || browser[property] || page[property];
      },
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();

    const { sig, session } = sessionFactory(user);

    await this.page.setCookie({ name: "session", value: session });
    await this.page.setCookie({ name: "session.sig", value: sig });
    await this.page.goto("http://localhost:3000/blogs");
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContent(selector) {
    return this.page.$eval(selector, (el) => el.innerHTML);
  }

  post(path, data) {
    return this.page.evaluate(
      (_path, _data) => {
        return fetch("api/blogs", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/JSON" },
          body: JSON.stringify(_data),
        }).then((res) => res.json());
      },
      path,
      data
    );
  }

  get(path) {
    return this.page.evaluate((_path) => {
      return fetch("api/blogs", {
        method: "GET",
        credentials: "same-origin",
        headers: { "Content-Type": "application/JSON" },
      }).then((res) => res.json());
    }, path);
  }

  execRequests(actions) {
    return Promise.all(
      actions.map(({ method, path, data }) => {
        return this[method](path, data);
      })
    );
  }
};
