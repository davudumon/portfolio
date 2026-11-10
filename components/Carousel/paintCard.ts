import type { Project } from '@/types/project';
import { CARD_TEXTURE_HEIGHT, CARD_TEXTURE_WIDTH } from '@/lib/constants';

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  text.split(' ').forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  lines.push(line);
  return lines;
}

export interface PaintedCard {
  front: HTMLCanvasElement;
  back: HTMLCanvasElement;
}

export function paintCard(project: Project, canvases: PaintedCard, image?: HTMLImageElement): void {
  const entries: Array<[HTMLCanvasElement, boolean]> = [[canvases.front, true], [canvases.back, false]];
  entries.forEach(([canvas, withText]) => {
    const context = canvas.getContext('2d');
    if (!context) return;
    const width = canvas.width;
    const height = canvas.height;
    const gradient = context.createLinearGradient(0, 0, width, height);
    const colors = [...project.gradient.matchAll(/(#[0-9a-f]{6})(?:\s+(\d+)%)?/gi)];
    colors.forEach((match, index) => {
      gradient.addColorStop(match[2] ? Number(match[2]) / 100 : index / Math.max(colors.length - 1, 1), match[1]);
    });
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    if (image) {
      const scale = Math.max(width / image.width, height / image.height);
      const imageWidth = image.width * scale;
      const imageHeight = image.height * scale;
      context.drawImage(image, (width - imageWidth) / 2, (height - imageHeight) / 2, imageWidth, imageHeight);
      const horizontal = context.createLinearGradient(0, 0, width, 0);
      horizontal.addColorStop(0, 'rgba(0,0,0,.6)');
      horizontal.addColorStop(.7, 'rgba(0,0,0,.2)');
      horizontal.addColorStop(1, 'rgba(0,0,0,.05)');
      context.fillStyle = horizontal;
      context.fillRect(0, 0, width, height);
      const vertical = context.createLinearGradient(0, 0, 0, height);
      vertical.addColorStop(0, 'rgba(0,0,0,.25)');
      vertical.addColorStop(.5, 'rgba(0,0,0,0)');
      vertical.addColorStop(1, 'rgba(0,0,0,.35)');
      context.fillStyle = vertical;
      context.fillRect(0, 0, width, height);
    }
    if (!withText) return;
    const padding = 100;
    context.fillStyle = '#f5f4ef';
    context.textBaseline = 'top';
    context.font = '500 26px "Inter", Arial, sans-serif';
    context.letterSpacing = '2px';
    context.fillText(project.role, padding, padding);
    context.font = '600 118px "Inter", Arial, sans-serif';
    context.letterSpacing = '-7px';
    const lines = wrapText(context, project.highlight, 1150);
    const lineHeight = 114;
    const top = height / 2 - (lines.length * lineHeight) / 2;
    lines.forEach((line, index) => context.fillText(line, padding, top + index * lineHeight));
  });
}

export function createCardCanvases(): PaintedCard {
  const front = document.createElement('canvas');
  const back = document.createElement('canvas');
  [front, back].forEach((canvas) => {
    canvas.width = CARD_TEXTURE_WIDTH;
    canvas.height = CARD_TEXTURE_HEIGHT;
  });
  return { front, back };
}
