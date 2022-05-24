const HOSQ_PROVIDER = {
    contract: null,
    provider: null,
    setup: async function(){
        if(!await WALLET.is_ready()) return
        this.contract = WALLET.setup_contract(HOSQ_ABI.networks[WALLET.web3.networkVersion].address, HOSQ_ABI.abi);
        let pid = 1;
        if(localStorage.getItem("hosq_provider")!==null){
            pid = parseInt(localStorage.getItem("hosq_provider"));
        }
        await this.select_provider(pid);
        let self = this;
        document.querySelector("#hosq-provider-div button").addEventListener("click", async (el)=>{
            let val = document.querySelector("#hosq-provider-div input").valueAsNumber;
            if(isNaN(val)){
                alert("Invalid Provider ID");
                return
            }

            await self.select_provider(val);
        })
    },
    select_provider: async function(id){
        if(!await this.is_ready()) return;
        try{
            let provider = await this.contract.functions.get_provider_details(id)
            document.querySelector("#hosq-provider-div input").value = id;
            document.querySelector("#hosq-provider-div span").textContent = provider[0][3].includes("<")?"Invalid Name":provider[0].name;
            if(typeof IPFS_GATEWAY !== "undefined"){
                IPFS_GATEWAY = provider[0][2] + (provider[0][2].endsWith("/")?"gateway":"/gateway");
            }
            
            this.provider = provider[0];
            localStorage.setItem("hosq_provider", id);
            return true
        }catch(e){
            console.error(`Failed to select provider '${id}'`, e);
            return false
        }
    },
    is_ready: async function(){
        if(this.contract===null){
            alert("Hosq provider is not ready");
            return false
        }
        return true
    }
}

document.addEventListener("DOMContentLoaded", async function(){
    if(typeof WALLET === "undefined") {
        alert("WALLET Object Not found")
        return
    }   
})