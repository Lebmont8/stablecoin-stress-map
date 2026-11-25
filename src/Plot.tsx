import { useEffect, useRef } from 'react';

export type Point = { x: number; y: number };
export type Series = { color: string; points: Point[]; mark?: Point; dashed?: boolean };
type PlotProps = {
  series: Series[];
  xMax: number;
  yMin: number;
  yMax: number;
  xLabel: string;
  yLabel: string;
  description: string;
  formatX: (value: number) => string;
  formatY: (value: number) => string;
};

export function Plot(props: PlotProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current!;
    const context = element.getContext('2d');
    if (!context) return;
    const draw = () => {
      const { width, height } = element.getBoundingClientRect();
      if (width < 100 || height < 100) return;
      const density = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(width * density);
      element.height = Math.round(height * density);
      context.setTransform(density, 0, 0, density, 0, 0);
      const left = 58, top = 20, right = width - 20, bottom = height - 36;
      const x = (value: number) => left + value / props.xMax * (right - left);
      const y = (value: number) => bottom - (value - props.yMin) / (props.yMax - props.yMin) * (bottom - top);
      context.font = '11px system-ui';
      context.strokeStyle = '#344242';
      context.fillStyle = '#b7c5c2';
      context.textBaseline = 'middle';
      for (let index = 0; index <= 4; index++) {
        const value = props.yMin + (props.yMax - props.yMin) * index / 4;
        const heightAtTick = y(value);
        context.beginPath();
        context.moveTo(left, heightAtTick);
        context.lineTo(right, heightAtTick);
        context.stroke();
        context.textAlign = 'right';
        context.fillText(props.formatY(value), left - 8, heightAtTick);
      }
      context.textAlign = 'center';
      for (let index = 0; index <= 4; index++) {
        const value = props.xMax * index / 4;
        context.fillText(props.formatX(value), x(value), bottom + 17);
      }
      context.save();
      context.beginPath();
      context.rect(left - 6, top - 6, right - left + 12, bottom - top + 12);
      context.clip();
      for (const series of props.series) {
        context.beginPath();
        context.lineWidth = series.dashed ? 1.5 : 2.5;
        context.setLineDash(series.dashed ? [5, 5] : []);
        context.strokeStyle = series.color;
        for (const [index, point] of series.points.entries()) {
          if (index === 0) context.moveTo(x(point.x), y(point.y));
          else context.lineTo(x(point.x), y(point.y));
        }
        context.stroke();
        if (series.mark) {
          context.beginPath();
          context.arc(x(series.mark.x), y(series.mark.y), 4, 0, 2 * Math.PI);
          context.fillStyle = series.color;
          context.fill();
        }
      }
      context.restore();
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(element);
    return () => observer.disconnect();
  }, [props]);
  return <figure className="plot">
    <figcaption>{props.yLabel}</figcaption>
    <canvas ref={canvas} role="img" aria-label={props.description}>
      {props.description}
    </canvas>
    <p className="axis-label">{props.xLabel}</p>
  </figure>;
}
