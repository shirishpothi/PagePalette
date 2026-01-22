import { toPng } from 'html-to-image';
import { serializeError } from 'serialize-error';
import { useSandboxStore } from './hmr-sandbox-store';

export { serializeError };

export const waitForScreenshotReady = async () => {
  const images = Array.from(document.images);

  await Promise.all([
    'fonts' in document ? document.fonts.ready : Promise.resolve(),
    ...images.map(
      (img) =>
        new Promise((resolve) => {
          img.crossOrigin = 'anonymous';
          if (img.complete) {
            resolve(true);
            return;
          }
          img.onload = () => resolve(true);
          img.onerror = () => resolve(true);
        })
    ),
  ]);

  await new Promise((resolve) => setTimeout(resolve, 250));
};

const handleScreenshotMessage = async (event: MessageEvent) => {
  if (event.data.type === 'sandbox:web:screenshot:request') {
    try {
      await waitForScreenshotReady();

      const width = window.innerWidth;
      const aspectRatio = 16 / 9;
      const height = Math.floor(width / aspectRatio);

      const dataUrl = await toPng(document.body, {
        cacheBust: true,
        skipFonts: false,
        width,
        height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          margin: '0',
        },
      });

      window.parent.postMessage({ type: 'sandbox:web:screenshot:response', dataUrl }, '*');
    } catch (error) {
      window.parent.postMessage(
        {
          type: 'sandbox:web:screenshot:error',
          error: error instanceof Error ? error.message : String(error),
        },
        '*'
      );
    }
  }
};

const handleRefreshMessage = (event: MessageEvent) => {
  if (event.data.type === 'sandbox:web:refresh:request') {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    window.parent.postMessage({ type: 'sandbox:web:refresh:complete' }, '*');
  }
};

const createCodeGenHandler = () => {
  const store = useSandboxStore.getState();
  return (event: MessageEvent) => {
    const { type } = event.data;

    switch (type) {
      case 'sandbox:web:codegen:started':
        store.startCodeGen();
        break;
      case 'sandbox:web:codegen:generating':
        store.setCodeGenGenerating();
        break;
      case 'sandbox:web:codegen:complete':
        store.completeCodeGen();
        break;
      case 'sandbox:web:codegen:error':
        store.errorCodeGen();
        break;
      case 'sandbox:web:codegen:stopped':
        store.stopCodeGen();
        break;
    }
  };
};

export function install(): () => void {
  const codeGenHandler = createCodeGenHandler();

  window.addEventListener('message', handleScreenshotMessage);
  window.addEventListener('message', handleRefreshMessage);
  window.addEventListener('message', codeGenHandler);

  return () => {
    window.removeEventListener('message', handleScreenshotMessage);
    window.removeEventListener('message', handleRefreshMessage);
    window.removeEventListener('message', codeGenHandler);
  };
}

export function postFixMessage(error: unknown) {
  window.parent.postMessage(
    {
      type: 'sandbox:web:fix',
      error: serializeError(error),
    },
    '*'
  );
}

export function postShowLogsMessage() {
  window.parent.postMessage(
    {
      type: 'sandbox:web:show-logs',
    },
    '*'
  );
}

export function copyErrorToClipboard(error: unknown) {
  navigator.clipboard.writeText(JSON.stringify(serializeError(error)));
}
