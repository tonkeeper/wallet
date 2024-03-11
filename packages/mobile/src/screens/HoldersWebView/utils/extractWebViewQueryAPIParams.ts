export enum QueryAPI {
  LockScroll = 'lockScroll',
  CloseApp = 'closeApp',
  OpenEnrollment = 'openEnrollment',
  BackPolicy = 'backPolicy',
  OpenUrl = 'openUrl',
  ShowKeyboardAccessoryView = 'showKAV',
  MarkAsShown = 'markAsShown',
  Subscribed = 'subscribed',
}

export type BackPolicy = 'back' | 'close' | 'lock';

export type QueryAPIParams = {
  closeApp?: boolean;
  openUrl?: string | null;
  backPolicy: BackPolicy;
  openEnrollment?: boolean;
  showKeyboardAccessoryView?: boolean;
  lockScroll?: boolean;
  markAsShown?: boolean;
  subscribed?: boolean;
};

export type QueryParamsState = Omit<
  QueryAPIParams,
  'openEnrollment' | 'openUrl' | 'closeApp'
>;

export function extractWebViewQueryAPIParams(url: string): QueryAPIParams {
  try {
    const query = url.split('?')[1];
    const params = new URLSearchParams(query);
    let closeApp = false;
    let openUrl: string | null = null;
    let backPolicy: BackPolicy = 'close';
    let openEnrollment = false;
    let showKeyboardAccessoryView = false;
    let lockScroll: boolean | undefined = undefined;
    let markAsShown = false;
    let subscribed = false;

    if (params.has(QueryAPI.CloseApp)) {
      const queryValue = params.get(QueryAPI.CloseApp);
      if (queryValue === 'true') {
        closeApp = true;
      }
    }

    if (params.has(QueryAPI.OpenUrl)) {
      const queryValue = params.get(QueryAPI.OpenUrl);
      if (queryValue) {
        openUrl = queryValue;
      }
    }

    if (params.has(QueryAPI.BackPolicy)) {
      const queryValue = params.get(QueryAPI.BackPolicy);
      if (queryValue === 'back') {
        backPolicy = 'back';
      }
    }

    if (params.has(QueryAPI.OpenEnrollment)) {
      const queryValue = params.get(QueryAPI.OpenEnrollment);
      if (queryValue === 'true') {
        openEnrollment = true;
      }
    }

    if (params.has(QueryAPI.ShowKeyboardAccessoryView)) {
      const queryValue = params.get(QueryAPI.ShowKeyboardAccessoryView);
      if (queryValue === 'true') {
        showKeyboardAccessoryView = true;
      }
    }

    if (params.has(QueryAPI.LockScroll)) {
      const queryValue = params.get(QueryAPI.LockScroll);
      if (queryValue === 'false') {
        lockScroll = false;
      } else if (queryValue === 'true') {
        lockScroll = true;
      }
    }

    if (params.has(QueryAPI.MarkAsShown)) {
      const queryValue = params.get(QueryAPI.MarkAsShown);
      if (queryValue === 'true') {
        markAsShown = true;
      }
    }

    if (params.has(QueryAPI.Subscribed)) {
      const queryValue = params.get(QueryAPI.Subscribed);
      if (queryValue === 'true') {
        subscribed = true;
      }
    }

    return {
      closeApp,
      openUrl,
      backPolicy,
      openEnrollment,
      showKeyboardAccessoryView,
      lockScroll,
      markAsShown,
      subscribed,
    };
  } catch {
    console.warn('Failed to extract holders query params');
    return { backPolicy: 'close' };
  }
}
