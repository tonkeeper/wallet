type KeyExtractor<T> = (obj: T) => string;
type Prefixes = { [key in string]: number };
type DeepLines = { [key in string]: { [key in string]: number } };
type Index<T> = T[] | { [key in string]: Index<T> };

export class SearchIndexer<T> {
  private delimiter = new RegExp('[\\s\\-,]+', 'g');
  private keyExtractor: KeyExtractor<T> = (obj) => String(obj);

  private list: T[] = [];
  private iterCur = 0;
  private iterEnd = 0;
  private index: Index<T> = {};

  constructor(list?: T[], keyExtractor?: KeyExtractor<T>) {
    if (list) {
      this.list = list;
      this.iterEnd = list.length
    }
    
    if (keyExtractor) {
      this.keyExtractor = keyExtractor;
    }
  
    this.indexIteration();
  }

  private indexIteration() {
    const end = Math.min(this.iterEnd, this.iterCur + 200);
    let i = this.iterCur;
    for (; i < end; i++) {
      const obj = this.list[i];
      this.add(obj);
    }

    this.iterCur = i;
    if (i >= this.iterEnd) {
      // console.log(this.index);
    } else {
      this.indexIteration();
    }
  };
  
  private strToPrefixes(val: string) {
    const prefixes: Prefixes = {};
    const words = val.toLowerCase().split(this.delimiter);
    let len = words.length;

    while (len--) {
      const w = words[len];
      let key = '';

      if (!w) continue;
      for (let letter = 0; letter < 6; letter++) {
        const symbol = w.charCodeAt(letter);
        if (symbol) {
          const wletter = w.substring(letter, letter + 1);
          key += wletter;
        }
      }

      prefixes[key] = 1;
    }

    return prefixes;
  }
  
  private strToSearchPrefixes(val: string) {
    const result: Prefixes[] = [];
    const words = val.toLowerCase().split(this.delimiter);
    let len = words.length;

    while (len--) {
      const prefixes: Prefixes  = {};
      const w = words[len];
      let key = '';

      if (!w) continue;
      for (let letter = 0; letter < 6; letter++) {
        const symbol = w.charCodeAt(letter);
        if (symbol) {
          const wletter = w.substring(letter, letter + 1);
          key +=  wletter;
        }
      }

      prefixes[key] = 1;
      result.push(prefixes);
    }

    return result;
  }
  
  private toIndexTree(key: string, obj: T) {
    let prnt: any = this.index;
    for (let i = 0; i < 6; i++) {
      const k = key.substring(i, i + 1) || '-1';
      if (prnt[k]) {
        prnt = prnt[k];
      } else {
        prnt = prnt[k] = i === 5 ? [] : {};
      }
    }

    // if (Array.isArray(prnt)) {
    prnt.push(obj);
    // }
  }
  
  public add(obj: T) {
    const item = this.keyExtractor(obj);
    const prefixes = this.strToPrefixes(item);

    for (let k in prefixes) {
      this.toIndexTree(k, obj);
    }
  }
  
  public search(text: string, limit?: number) {
    const prnt = this.index;
    const prefixes = this.strToSearchPrefixes(text);
    let result: T[] = [];
    let merged = false;

    for (let k in prefixes) {
      if (merged && !result) break;

      const res = this.deepSearch(prefixes[k], 0, prnt, limit);
      result = res;
      merged = true;
    }

    let last = result[0];
    const len = result.length + 1; 
    const rows = [];

    for (let i = 1; i < len; i++) {
      const val = result[i];
      if (val !== last) {
        rows.push(last);
        last = val;
      } else {
        continue;
      }
    }

    return rows;
  }
  
  private deepSearch(prefixes: Prefixes, deep: number, prnt: any, limit?: number): T[] {
    if (!prnt) return [];

    let lines: DeepLines = {};
    for (let k in prefixes) {
      const c = k.substring(deep, deep + 1) || '-1';
      if (!lines[c]) {
        lines[c] = {};
      }
      lines[c][k] = 1;
    }

    if (deep++ === 6 || !prnt) {
      return prnt;
    }

    const result: T[] = [];
    for (let c in lines) {
      if (Number(c) === -1) {
        for (let i in prnt) {
          if (limit && result.length === limit) {
            return result;
          }
          
          result.push.apply(result, this.deepSearch(lines[c], deep, prnt[i], limit));
        }
      } else {
        if (limit && result.length === limit) {
          return result;
        }

        const res = this.deepSearch(lines[c], deep, prnt[c], limit);
        result.push.apply(result, res);
      }
    }

    return result;
  }
}