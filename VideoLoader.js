export default class VideoLoader {
    #urlVideo;
    #downloadId = 0;
    #isComplete = false;

    constructor(blobVideo) {
        this.#urlVideo = URL.createObjectURL(blobVideo);
    }

    async load() {
        const date=new Date();
        const options = {
            filename: `${Math.floor(Date.now() / 1000)}.mp4`,
            method: "GET",
            saveAs: true,
            url: this.#urlVideo
        };
        this.#downloadId = await browser.downloads.download(options);
        const delta = await this.#waitDownload();
        URL.revokeObjectURL(this.#urlVideo);
    }

    #waitDownload() {
        return new Promise(resolve => {
            browser.downloads.onChanged.addListener(delta => {
                if (this.#isComplete || delta.id !== this.#downloadId || delta.state.current !== "complete")
                    return;
                this.#isComplete = true;
                resolve(delta);
            });
        });
    }
}