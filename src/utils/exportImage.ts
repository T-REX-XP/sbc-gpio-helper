import { toBlob } from 'html-to-image';

const CAPTURE_OPTIONS = {
  cacheBust: true,
  pixelRatio: 2,
} as const;

function getBackgroundColor(element: HTMLElement): string {
  let node: HTMLElement | null = element;

  while (node) {
    const { backgroundColor } = getComputedStyle(node);
    if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
      return backgroundColor;
    }
    node = node.parentElement;
  }

  return '#ffffff';
}

export async function captureElementAsBlob(element: HTMLElement): Promise<Blob> {
  const blob = await toBlob(element, {
    ...CAPTURE_OPTIONS,
    backgroundColor: getBackgroundColor(element),
  });

  if (!blob) {
    throw new Error('Image capture returned no data');
  }

  return blob;
}

export async function copyElementImageToClipboard(element: HTMLElement): Promise<void> {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('Clipboard image copy is not supported in this browser');
  }

  const blob = await captureElementAsBlob(element);
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

export function saveBlobAsFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export async function saveElementImage(element: HTMLElement, fileName: string): Promise<void> {
  const blob = await captureElementAsBlob(element);
  saveBlobAsFile(blob, fileName);
}
