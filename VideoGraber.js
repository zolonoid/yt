import VideoLoader from "./VideoLoader.js";

export default class VideoGraber {
    #tabId = 0;
    #reqListener;
    #filter;
    #data = [];
    #parts = [];

    constructor(tabId) {
        this.#tabId = tabId;
        this.#reqListener = this.#addListener();
    }

    getVideo() {
        return new VideoLoader(new Blob(this.#parts));
    }

    close() {
        browser.webRequest.onBeforeRequest.removeListener(this.#reqListener);
        this.#filter.close();
        this.#filter.ondata = undefined;
        this.#filter.onstop = undefined;
        browser.browserAction.setBadgeText({ text: "", tabId: this.#tabId });
    }

    #addListener() {
        const listener = this.#webRequestHandler.bind(this);
        const filter = {
            urls: ["https://*/*"],
            types: ["xmlhttprequest"],
            tabId: this.#tabId
        };
        const extraInfoSpec = [
            "blocking"
        ];
        browser.webRequest.onBeforeRequest.addListener(listener, filter, extraInfoSpec);
        return listener;
    }

    #checkUrl(url) {
        const reg = new RegExp(`^https://.+?&rn=${this.#parts.length + 1}$`);
        const pos = url.search(reg);
        // if(pos >= 0)
        //     console.log(url);
        return pos >= 0;
    }

    #webRequestHandler(details) {
        if(!this.#checkUrl(details.url))
            return;
        this.#filter = browser.webRequest.filterResponseData(details.requestId);
        this.#filter.ondata = this.#ondataHandler.bind(this);
        this.#filter.onstop = this.#onstopHandler.bind(this);
    }

    #ondataHandler(event) {
        this.#data.push(event.data);
        this.#filter.write(event.data);
    }

    #onstopHandler(event) {
        this.#parts.push(new Blob(this.#data));
        this.#data = [];
        this.#filter.close();
        browser.browserAction.setBadgeText({ text: `${this.#parts.length}`, tabId: this.#tabId });
    }
}