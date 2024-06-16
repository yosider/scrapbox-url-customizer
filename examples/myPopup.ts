import { Scrapbox } from "https://scrapbox.io/api/code/yosider-scripts/scrapbox-jp%2Ftypes/userscript.ts";
import { insertText } from "https://scrapbox.io/api/code/yosider-scripts/scrapbox-userscript-std/dom.ts";
import {
  convert,
  convertGyazoURL,
  convertScrapboxURL,
  expandShortURL,
  formatTweet,
  formatURL,
  formatWikipedia,
  Middleware,
  redirectGoogleSearch,
  redirectWikiwand,
  shortenAmazonURL,
} from "https://scrapbox.io/api/code/yosider-scripts/takker99%2Fscrapbox-url-customizer/mod.ts";
import { myTweetFormatter } from "https://scrapbox.io/api/code/yosider-scripts/takker99-scrapbox-url-customizer-popup/myTweetFormatter.ts";
declare const scrapbox: Scrapbox;

// 毎回functionsを作るのは無駄なので、globalに保持しておく
const middlewares: Middleware[] = [
  redirectGoogleSearch,
  expandShortURL,
  redirectGoogleSearch,
  redirectWikiwand,
  shortenAmazonURL,
  convertScrapboxURL(),
  convertGyazoURL,
  formatTweet(myTweetFormatter),
  formatWikipedia,

  // code2svgでコードを画像にする
  (url) => {
    if (url.hostname === "raw.githubusercontent.com") {
      return `[https://code2svg.vercel.app/svg/${url.origin}${url.pathname}#.svg ${url}]`;
    }
    if (url.hostname !== "github.com") return url;
    const [user, repo, filepath] =
      url.pathname.match(/^\/([^\\]+)\/([^\\]+)\/blob\/(.+)$/)?.slice?.(1) ??
        [];
    if (!user || !repo || !filepath) return url;
    const [, start, end] = url.hash.match(/L(\d+)-L(\d+)/) ??
      url.hash.match(/L(\d+)/) ?? [];
    return `[https://code2svg.vercel.app/svg/${
      start && end ? `L${start}-${end}/` : start ? `L${start}/` : ""
    }https://raw.githubusercontent.com/${user}/${repo}/${filepath}#.svg ${url}]`;
  },

  formatURL(),
];

scrapbox.PopupMenu.addButton({
  title: (text) => /https?:\/\/\S+/.test(text) ? "URL" : "",
  onClick: (text) => {
    const promise = convert(text, ...middlewares);
    if (typeof promise === "string") {
      // 文字列に違いがあるときのみ更新
      return text === promise ? undefined : promise;
    }

    // 選択範囲に変換後の文字列を上書きする
    // 変換中に選択範囲が変わると、ずれた位置に挿入されるので注意
    promise.then((converted) => {
      if (text === converted) return;
      return insertText(converted);
    });
    return undefined;
  },
});
