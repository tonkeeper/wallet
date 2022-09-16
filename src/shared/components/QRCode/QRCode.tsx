import React, { FC, useMemo } from 'react';
import QR from 'qrcode';
import Svg, { G, Path } from 'react-native-svg';

import { QRCodeProps } from './QRCode.interface';
import { ns } from '$utils';
import { View } from 'react-native';

function makeLine(matrix: any, i: number, j: number, cellSize: number) {
  const result = [`M${cellSize / 2 + cellSize * j} ${cellSize / 2 + cellSize * i}`];

  let lastDirection = '';
  while (true) {
    matrix[i][j] = 0;

    const hasTop = matrix[i - 1] ? !!matrix[i - 1][j] : false;
    const hasBottom = matrix[i + 1] ? !!matrix[i + 1][j] : false;
    const hasLeft = !!matrix[i][j - 1];
    const hasRight = !!matrix[i][j + 1];

    let direction;
    if (hasRight) {
      j++;
      direction = 'right';
    } else if (hasBottom) {
      i++;
      direction = 'bottom';
    } else if (hasLeft) {
      j--;
      direction = 'left';
    } else if (hasTop) {
      i--;
      direction = 'top';
    } else {
      break;
    }

    result.push(`L${cellSize / 2 + cellSize * j} ${cellSize / 2 + cellSize * i}`);

    lastDirection = direction;
  }

  return {
    result: result.join(' '),
    matrix,
  };
}

export const QRCode: FC<QRCodeProps> = (props) => {
  const { size, value } = props;
  const resSize = size - ns(8 * 2);

  const result = useMemo(() => {
    try {
      const arr = Array.prototype.slice.call(
        QR.create(value, { errorCorrectionLevel: 'M' }).modules.data,
        0,
      );
      const sqrt = Math.sqrt(arr.length);
      let matrix = arr.reduce(
        (rows, key, index) =>
          (index % sqrt === 0 ? rows.push([key]) : rows[rows.length - 1].push(key)) &&
          rows,
        [],
      );

      const cellSize = resSize / matrix.length;
      let path = '';

      matrix.forEach((row: any, i: number) => {
        let needDraw = false;
        row.forEach((column: number, j: number) => {
          if (column) {
            if (!needDraw) {
              path += `M${cellSize * j} ${cellSize / 2 + cellSize * i} `;
              needDraw = true;
            }
            if (needDraw && j === matrix.length - 1) {
              path += `L${cellSize * (j + 1)} ${cellSize / 2 + cellSize * i} `;
            }
          } else {
            if (needDraw) {
              path += `L${cellSize * j} ${cellSize / 2 + cellSize * i} `;
              needDraw = false;
            }
          }
        });
      });

      // for (let i = 0; i < matrix.length; i++) {
      //   const row = matrix[i];
      //   for (let j = 0; j < row.length; j++) {
      //     if (row[j]) {
      //       const data = makeLine(matrix, i, j, cellSize);
      //       matrix = data.matrix;
      //       path += data.result + ' ';
      //     }
      //   }
      // }

      return {
        cellSize,
        path,
      };
    } catch (error) {}
  }, [value, resSize]);

  if (!result) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: ns(8),
        padding: ns(8),
      }}
    >
      <Svg viewBox={[0, 0, resSize, resSize].join(' ')} width={resSize} height={resSize}>
        <G>
          <Path
            d={result.path}
            strokeLinecap="butt"
            strokeLinejoin="miter"
            stroke={'black'}
            strokeWidth={result.cellSize}
          />
        </G>
      </Svg>
    </View>
  );
};
