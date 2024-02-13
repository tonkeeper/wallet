import axios from 'axios';
import url from 'url';
import * as _ from 'lodash';
import { store } from '$store/index';
import { mainActions } from '$store/main';
import { TonWallet } from '$blockchain';
import { config } from '$config';

const Timers: { [index: string]: any } = {};
const Promises: { [index: string]: any } = {};
const Keys: { [index: string]: number } = {};
const BadHosts: { [index: string]: string } = {};

export function withRetry<Fn extends (...args: any[]) => any>(
  ident: string,
  fn: Fn,
  ...args: Parameters<Fn>
): Promise<Fn> {
  return new Promise((resolve, reject) => {
    if (Promises[ident]) {
      try {
        clearTimeout(Timers[ident]);
        Promises[ident].reject();
      } catch (e) {}
    }

    Keys[ident] = Keys[ident] ? Keys[ident] + 1 : 1;
    Promises[ident] = { resolve, reject };
    execTask(ident, fn, ...args).catch((err) => console.log('err', err));
  });
}

export function withRetryCtx<
  Ctx extends { [P in Name]: (this: Ctx, ...args: any[]) => any },
  Name extends string,
>(
  ident: string,
  ctxAndFnName: [Ctx, Name],
  ...args: Parameters<Ctx[Name]>
): Promise<Ctx[Name]> {
  const fn = ctxAndFnName[0][ctxAndFnName[1]].bind(ctxAndFnName[0]);

  // @ts-ignore
  fn.inst = ctxAndFnName[0];
  // @ts-ignore
  fn.methodName = ctxAndFnName[1];

  // @ts-ignore
  return withRetry(ident, fn, ...args);
}

async function execTask<Fn extends (...args: any[]) => any>(
  ident: string,
  fn: Fn,
  ...args: Parameters<Fn>
) {
  const key = Keys[ident];

  try {
    const data = await fn(...args);
    if (key !== Keys[ident]) {
      return;
    }

    try {
      Promises[ident].resolve(data);
    } catch (e) {}

    delete Promises[ident];
    delete Timers[ident];
    delete BadHosts[ident];
    updateBadHosts();
  } catch (e) {
    if (key !== Keys[ident]) {
      return;
    }

    const host = detectHostByFn(fn, args);
    console.log('fail request', host, ident, e);
    if (host) {
      if (host.match(/tonchain\.co|\.ton\.app/)) {
        BadHosts[ident] = 'tonkeeper.com';
      } else {
        BadHosts[ident] = host;
      }
      updateBadHosts();
    }

    console.log(host, ident, e);

    Timers[ident] = setTimeout(() => {
      execTask(ident, fn, ...args);
    }, 3000);
  }
}

function detectHostByFn(fn: any, args: any[]): string | null {
  if (fn === axios.get || fn === axios.post) {
    const parsed = url.parse(args[0], false);
    return parsed.hostname;
  } else {
    let calledUrl = '';
    if (fn.inst) {
      if (fn.inst instanceof TonWallet) {
        calledUrl = config.get('tonEndpoint');
      }
    }

    if (calledUrl) {
      const parsed = url.parse(calledUrl, false);
      return parsed.hostname;
    }

    return null;
  }
}

function updateBadHosts() {
  const hosts = _.uniq(Object.values(BadHosts));
  store.dispatch(mainActions.updateBadHosts(hosts));
}
