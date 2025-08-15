// ==UserScript==
// @name        No Count Replit
// @namespace   Violentmonkey Scripts
// @match       https://*/*
// @grant       none
// @run-at document-start
// @version     1.0
// @author      -
// @description 14/08/2025, 13:59:54
// ==/UserScript==

(() => {
  const runs = ['replit', 'stripe', 'sentry', 'googleanalytics'];
  if (!runs.some(x => location.href.includes(x))) {
    return;
  }
  Object.keys(localStorage).filter(x => x.startsWith('dataLoss')).forEach(x => localStorage.removeItem(x));
  const blocks = ['https://sp.replit.com', '__reachability', 'stripe.com', 'logs.browser', 'sentry.io', 'analytics.google.com', 'google-analytics', 'sorryapp.com', 'events.launchdarkly.com', 'doubleclick.net'];
  (() => {
    const _fetch = self.fetch
    self.fetch = Object.setPrototypeOf(async function fetch(...args) {
      const url = JSON.stringify(args.map(x => (String(x?.url ?? x))));
      for (const block of blocks) {
        if (url.includes(block)) {
          console.warn('blocking fetch', ...args);
          return new Promise(() => { });
        }
      }
      return _fetch.apply(this, args);
    }, _fetch);
  })();
  (() => {
    const $Map = self?.WeakMap ?? Map;
    const _openArgs = new $Map();
    const xhrs = [XMLHttpRequest, XMLHttpRequestUpload, XMLHttpRequestEventTarget];
    for (const xhr of xhrs) {
      (() => {
        const _open = xhr.prototype.open;
        if (!_open) return;
        xhr.prototype.open = Object.setPrototypeOf(function open(...args) {
          _openArgs.set(this, args);
          return _open.apply(this, args);
        }, _open);
      })();
      (() => {
        const _send = xhr.prototype.send;
        if (!_send) return;
        xhr.prototype.send = Object.setPrototypeOf(function send(...args) {
          const openArgs = JSON.stringify(_openArgs.get(this) ?? []);
          _openArgs.delete(this);
          for (const block of blocks) {
            if (openArgs.includes(block)) {
              console.warn('blocking xhr', ...args);
              return;
            }
          }
          return _send.apply(this, args);
        }, _send);
      })();
    }
  })();
  const scripts = [...document.getElementsByTagName('script'), ...document.getElementsByTagName('iframe'), ...document.getElementsByTagName('frame')];
  for (const script of scripts) {
    for (const block of blocks) {
      if (String(script.src).includes(block)) {
        console.warn('blocking script', script);
        script.remove();
      }
    }
  }
  (() => {
    const _appendChild = HTMLElement.prototype.appendChild;
    HTMLElement.prototype.appendChild = Object.setPrototypeOf(function appendChild(child) {
      for (const block of blocks) {
        if (String(child.src).includes(block)) {
          console.warn('blocking appendChild', ...arguments);
          return child;
        }
      }
      return _appendChild.call(this, child);
    }, _appendChild);
  })();
  (() => {
    const _sendBeacon = Navigator.prototype.sendBeacon;
    Navigator.prototype.sendBeacon = Object.setPrototypeOf(function sendBeacon(...args) {
      const url = JSON.stringify(args);
      for (const block of blocks) {
        if (url.includes(block)) {
          console.warn('blocking beacon', ...args);
          return true;
        }
      }
      return _sendBeacon.apply(this, args);
    }, _sendBeacon);
  })();
  (() => {
    const _Worker = self.Worker;
    const $Worker = class Worker extends _Worker {
      constructor(...args) {
        const url = JSON.stringify(args);
        for (const block of blocks) {
          if (url.includes(block)) {
            super(`data:text/javascript,console.warn('worker blocked');`;
            console.warn('blocking worker', ...args);
            return;
          }
        }
        super(...args);
      }
    };
    self.Worker = $Worker;
  })();
  const atrs = [HTMLAnchorElement, HTMLImageElement, HTMLScriptElement];
  for (const atr of atrs) {
    Object.defineProperty(atr.prototype, 'attributionSrc', { get() { }, set(x) { console.warn('blocking attr', x); } });
  }
  Object.defineProperty(self, 'SENTRY_RELEASE', { get() { }, set(x) { console.warn('blocking SENTRY_RELEASE', x); } });
})();
