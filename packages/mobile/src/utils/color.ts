export function changeAlphaValue(rgbaColor: string, newAlphaValue: number): string {
  const regex = /^((?:.*?,){3})(.*?)\)/i;
  return rgbaColor.replace(regex, `$1 ${newAlphaValue})`);
}

export function convertHexToRGBA(hex: string, alphaValue = 1): string {
  let c: any;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return (
      'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + `,${alphaValue})`
    );
  }
  throw new Error('Bad Hex');
}
