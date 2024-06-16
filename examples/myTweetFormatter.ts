import {
    processTweet,
    RefTweet,
} from "https://scrapbox.io/api/code/yosider-scripts/takker99%2Fscrapbox-url-customizer/internal.ts";
import {
    stringify,
    Tweet,
    TweetViaProxy,
} from "https://scrapbox.io/api/code/yosider-scripts/takker99%2Fscrapbox-url-customizer/mod.ts";

export const myTweetFormatter = async (
    tweet: Tweet | RefTweet | TweetViaProxy,
): Promise<string> => {
    if ("images" in tweet) return stringify(tweet); // TODO: why?

    const { quote, ...processed } = processTweet(tweet);

    return [
        ...(quote
            ? (await stringify(quote)).split("\n").map((line) => `> ${line}`)
            : []),
        ...(await stringify(processed)).split("\n").map((line) => `> ${line}`),
    ].join("\n");
};
