import { testSuite } from "../../testing";

export const actionLogsTests = testSuite("vue2/action logs", (test) => {
  test(
    "shows action logs on link click",
    "vue2",
    async ({ appDir, controller }) => {
      await appDir.update("src/App.vue", {
        kind: "replace",
        text: `
<template>
  <a id="link" href="https://www.google.com">
    Hello, World!
  </a>
</template>
`,
      });
      await controller.show("src/App.vue:App");
      const previewIframe = await controller.previewIframe();
      await previewIframe.waitForSelector("#link");
      await previewIframe.click("#link");
      const actionLog = await controller.actionLog.get(
        "Redirect prevented: https://www.google.com"
      );
      await actionLog.waitUntilVisible();
      await actionLog.waitUntilGone();
    }
  );
});
