import React, { FC, useMemo } from 'react';
import Svg, { G, Path, Circle } from 'react-native-svg';

import { ChartProps } from './Chart.interface';
import { ns } from '$utils';
import { useTheme } from '$hooks/useTheme';
import { ChartPoint } from '$store/rates/interface';

const SidePadding = ns(4);

function getPointCoordinates(index: number, opts: any) {
  let point = {
    x: opts.points[index].x - opts.points[0].x,
    y: opts.maxY - opts.points[index].y,
  };

  const height = opts.height;
  let topSpace = SidePadding;
  const boundsDiff = opts.maxY - opts.minY;

  const percent = (opts.maxY - opts.points[index].y) / boundsDiff;
  point.y = topSpace + height * percent;

  const boundsDiffX = opts.maxX - opts.minX;
  const percentX = (opts.points[index].x - opts.minX) / boundsDiffX;
  point.x = opts.width * percentX;

  return point;
}

const line = (pointA: ChartPoint, pointB: ChartPoint) => {
  const lengthX = pointB.x - pointA.x;
  const lengthY = pointB.y - pointA.y;
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX),
  };
};

const controlPoint = (
  current: ChartPoint,
  previous: ChartPoint,
  next: ChartPoint,
  reverse = false,
) => {
  // When 'current' is the first or last point of the array
  // 'previous' or 'next' don't exist.
  // Replace with 'current'
  const p = previous || current;
  const n = next || current;
  // The smoothing ratio
  const smoothing = 0.2;
  // Properties of the opposed-line
  const o = line(p, n);
  // If is end-control-point, add PI to the angle to go backward
  const angle = o.angle + (reverse ? Math.PI : 0);
  const length = o.length * smoothing;
  // The control point position is relative to the current point
  const x = current.x + Math.cos(angle) * length;
  const y = current.y + Math.sin(angle) * length;
  return [x, y];
};

const bezierCommand = (point: ChartPoint, i: number, a: ChartPoint[]) => {
  const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
  const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
  return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point.x},${point.y}`;
};

export const Chart: FC<ChartProps> = (props) => {
  const { points, width, height } = props;
  const theme = useTheme();

  const innerWidth = width - SidePadding;
  const innerHeight = height - SidePadding * 2;

  const data = useMemo(() => {
    let maxY = Number.MIN_SAFE_INTEGER,
      minY = Number.MAX_SAFE_INTEGER;

    let maxX = Number.MIN_SAFE_INTEGER,
      minX = Number.MAX_SAFE_INTEGER;
    for (let point of points) {
      maxY = Math.max(point.y, maxY);
      minY = Math.min(point.y, minY);

      maxX = Math.max(point.x, maxX);
      minX = Math.min(point.x, minX);
    }

    let result = [];
    for (let i = 0; i < points.length; i++) {
      const point = getPointCoordinates(i, {
        width: innerWidth,
        height: innerHeight,
        points,
        minY,
        maxY,
        minX,
        maxX,
      });
      result.push(point);
    }
    return {
      path: result.reduce(
        (acc, point, i, a) =>
          i === 0 ? `M ${point.x},${point.y}` : `${acc} L ${point.x},${point.y}`,
        '',
      ),
      lastPoint: result[result.length - 1],
    };

    // `${acc} ${bezierCommand(point, i, a)}`
  }, [points, innerWidth, innerHeight]);

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <G>
        {data.lastPoint && (
          <Circle
            key="circle"
            cx={data.lastPoint.x}
            cy={data.lastPoint.y}
            r={ns(4)}
            fill={theme.colors.accentPrimary}
          />
        )}
        <Path
          key="line"
          d={data.path}
          fill="none"
          stroke={theme.colors.accentPrimary}
          strokeWidth={ns(2)}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
};
