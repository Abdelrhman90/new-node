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

test("Checking Logo", async () => {
  const text = await page.getContent("a.brand-logo");
  expect(text).toEqual("Blogster");
});

test("When sign in,  show logout button", async () => {
  await page.login();

  const text = await page.$eval('a[href="/auth/logout"]', (el) => el.innerHTML);

  expect(text).toEqual("Logout");
});
