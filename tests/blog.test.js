Number.prototype._called = {};
const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("When Login ", async () => {
  beforeEach(async () => {
    await page.login();
    await page.click(".btn-floating");
  });
  test(", show blog form", async () => {
    const text = await page.getContent("form label");

    expect(text).toEqual("Blog Title");
  });

  describe("And put valid data", async () => {
    beforeEach(async () => {
      await page.type(".title input", "My Title");
      await page.type(".content input", "My Content");
      await page.click("form button");
    });

    test("User taken to confirming page", async () => {
      const text = await page.getContent("h5");

      expect(text).toEqual("Please confirm your entries");
    });

    test("Save post and redirects to blog list", async () => {
      await page.click("button.green");
      await page.waitFor(".card");

      const title = await page.getContent(".card-title");
      const content = await page.getContent("p");

      expect(title).toEqual("My Title");
      expect(content).toEqual("My Content");
    });
  });

  describe("And put invalid data", async () => {
    beforeEach(async () => {
      await page.click("form button");
    });
    test("Show error message", async () => {
      const titleMessage = await page.getContent(".title .red-text");
      const contentMessage = await page.getContent(".content .red-text");

      expect(titleMessage).toEqual("You must provide a value");
      expect(contentMessage).toEqual("You must provide a value");
    });
  });
});

describe("When user not logged in", async () => {
  const actions = [
    {
      method: "get",
      path: "api/blogs",
    },
    {
      method: "post",
      path: "api/blogs",
      data: { title: "T", content: "C" },
    },
  ];

  test("Blogs routes are protected", async () => {
    const results = await page.execRequests(actions);

    for (let result of results) {
      expect(result).toEqual({ error: "You must log in!" });
    }
  });
});
