import { overrideCopyCutPaste } from "./copy-cut-paste";
import { setUpLinkInterception } from "./links";
import { setUpLogInterception } from "./logs";
import {
  AppToPreviewMessage,
  RenderMessage,
  sendMessageFromPreview,
} from "./messages";
import { detach } from "./renderer/index";
import { setState } from "./state";

setUpLogInterception();
setUpLinkInterception();
overrideCopyCutPaste();

async function load({
  filePath,
  componentName,
  variantKey,
  defaultPropsSource,
  customVariantPropsSource,
}: RenderMessage) {
  try {
    const componentLoaderModuleId = `/@component-loader.js?p=${encodeURIComponent(
      filePath
    )}&c=${encodeURIComponent(componentName)}`;
    setState({
      filePath,
      componentName,
      defaultPropsSource,
      customVariantPropsSource,
      variantKey,
    });
    const { refresh } = await import(
      /* @vite-ignore */
      `/preview${componentLoaderModuleId}`
    );
    await refresh();
  } catch (error: any) {
    sendMessageFromPreview({
      kind: "rendering-error",
      message: error.stack || error.message,
    });
  }
}

const root = document.getElementById("root");
window.addEventListener(
  "message",
  (event: MessageEvent<AppToPreviewMessage>) => {
    const data = event.data;
    switch (data.kind) {
      case "show-loading":
        detach().catch(console.error);
        root.innerHTML = `<div class="previewjs-loader">
          <img src="../loading.svg" />
        </div>`;
        break;
      case "render":
        load(data).catch(console.error);
        break;
    }
  }
);

sendMessageFromPreview({
  kind: "bootstrapped",
});
