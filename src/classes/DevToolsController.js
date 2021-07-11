

export function DevToolsController(){
    this.tabId = undefined;
    this.yt_watch = "https://youtube.com"


    this.init = function(){
        this.attach();
    }
    this.attach = function(){
        // First get the current tab id - cannot call tab.query from content script
        chrome.runtime.sendMessage( {"msg": "start_devtools"}, (response) => {
            this.tabId = response.tabId;
            console.log(this.tabId);
        })
    }
}