import VideoGraber from "./VideoGraber.js";

class TabsDispatcher {
    #graberByTab = new Map();

    run() {
        browser.tabs.onCreated.addListener(this.#tabCreatedHandler.bind(this));
        browser.tabs.onRemoved.addListener(this.#tabRemovedHandler.bind(this));
        browser.browserAction.onClicked.addListener(this.#clickHandler.bind(this));
    }

    #tabCreatedHandler(tab) {
        if (!this.#graberByTab.has(tab.id))
            this.#graberByTab.set(tab.id, new VideoGraber(tab.id));
    }

    #tabRemovedHandler(tabId, removeInfo) {
        this.#graberByTab.get(tabId)?.close();
        this.#graberByTab.delete(tabId);
    }

    async #clickHandler(tab) {
        browser.browserAction.disable(tab.id);
        if (!this.#graberByTab.has(tab.id))
            return;
        const graber = this.#graberByTab.get(tab.id);
        await graber.getVideo().load();
        graber.close();
        this.#graberByTab.delete(tab.id);
    }
}

export default new TabsDispatcher();
