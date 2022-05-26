let IPFS_GATEWAY = null;
const HOSQ_PROVIDER = {
    contract: null,
    provider: null,
    setup: async function () {
        if (!await WALLET.is_ready()) return
        if (HOSQ_ABI.networks[WALLET.web3.networkVersion] === undefined) {
            alert(`HOSQ is not available for chain with id "${WALLET.web3.networkVersion}" `)
            return
        }
        this.contract = WALLET.setup_contract(HOSQ_ABI.networks[WALLET.web3.networkVersion].address, HOSQ_ABI.abi);
        let pid = 1;
        if (localStorage.getItem("hosq_provider") !== null) {
            pid = parseInt(localStorage.getItem("hosq_provider"));
        }
        await this.select_provider(pid);
        let self = this;
        document.querySelector("#hosq-provider-div button").addEventListener("click", async (el) => {
            let val = document.querySelector("#hosq-provider-div input").valueAsNumber;
            if (isNaN(val)) {
                alert("Invalid Provider ID");
                return
            }

            await self.select_provider(val);
        })
    },
    select_provider: async function (id) {
        if (!await this.is_ready()) return;
        try {
            let provider = await this.contract.functions.get_provider_details(id)
            if (provider[0][2] === "") {
                alert(`Invalid Provider "${id}"`);
                return false
            }
            document.querySelector("#hosq-provider-div input").value = id;
            document.querySelector("#hosq-provider-div span").textContent = provider[0][3].includes("<") ? "Invalid Name" : provider[0][3];
            IPFS_GATEWAY = provider[0][2] + (provider[0][2].endsWith("/") ? "gateway" : "/gateway");
            
            this.provider = provider[0];
            localStorage.setItem("hosq_provider", id);
            return true
        } catch (e) {
            console.error(`Failed to select provider '${id}'`, e);
            return false
        }
    },
    is_ready: async function () {
        if (this.contract === null) {
            alert("Hosq provider is not ready");
            return false
        }
        return true
    },
    get: async function (cid) {
        if (! await this.is_ready()) return null;
        return await fetch(`${IPFS_GATEWAY}/${cid}`)
    },
    upload: async function (data, json, dir, progress=null) {
        if (! await this.is_ready()) return null;
        let url = this.provider[2] + (this.provider[2].endsWith("/") ? "" : "/") + (dir? "upload_dir":"upload");
        if(!dir){
            const body = new FormData();
            body.append("file", data);
            data = body;
        }
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        if (progress !== null) {
            xhr.upload.addEventListener("progress", function (evt) {
                //console.log(evt, evt.target);
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    progress.update(parseInt(percentComplete * 100));
                    console.log(percentComplete);
                } else {
                    progress.processing();
                }
            }, false);
        }
        return (new Promise(function (resolve, reject) {
            xhr.onload = function () {
                if (progress !== null) { progress.hide() }
                if (this.status >= 200 && this.status < 300) {
                    let data = json ? JSON.parse(xhr.response) : xhr.response;
                    resolve({ status: this.status, data });
                } else {
                    reject({
                        status: this.status,
                        details: this
                    });
                }
            };
            xhr.send(data) // todo catch error
            if (progress !== null) { progress.show().processing() }
        }))
    },

    upload_dir: async function(files, json, dir_name=false, info=false, progress=null){
        if(!dir_name && !info){console.error("upload_dir requires 'dir_name' or 'info' object"); return}
        const body = new FormData();
        for (let file of files){
            body.append("file1", file, file.name);
        }
        if (dir_name){
            body.append("file2", new Blob([JSON.stringify({
                type: "dir",
                name: dir_name
            })]), "info.json")
        }else if(info){
            body.append("file2", new Blob([JSON.stringify(info)]), "info.json")
        }

        this.upload(body, json, true, progress)
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    if (typeof WALLET === "undefined") {
        alert("WALLET Object Not found")
        return
    }

    setInterval(async ()=>{
        if (IPFS_GATEWAY===null) return;
        document.querySelectorAll('[ipfs]').forEach((e, i)=>{
            e.setAttribute('src', `${IPFS_GATEWAY}/${e.getAttribute('ipfs')}`);
            e.removeAttribute('ipfs');
        })
    }, 1000)
})