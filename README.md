# Hosq Provider

## IPFS storage contract component for [Arag](https://github.com/anspar/arag) dapps.

![release](https://github.com/anspar/hosq_provider/actions/workflows/release.yml/badge.svg?branch=main)


### Requirements 

[Wallet](https://github.com/anspar/wallet) or other compatible component

### Import 
1. In html file
```
    {{web_component "https://github.com/anspar/hosq_provider/releases/download/<release-version>/build.html"}}
```
2. In arag.yml
```
    dependencies:
        - https://github.com/anspar/hosq_provider/releases/download/<release-version>/build.html
```
#### OR
Download the `build.html` file and add it to the project with
```
    {{import_content "path/to/build.html"}}
```


### Setup
On first launch this will automatically select the provider with id 1, user can switch the provider anytime. On the next launch the last selected provider will be loaded.  
```
document.addEventListener("DOMContentLoaded", async function(){
    await HOSQ_PROVIDER.setup();
    if(!await HOSQ_PROVIDER.is_ready()) return;
    ...

})
```

### Available Properties
`HOSQ_PROVIDER.contract` : returns hosq smart-contract object

`HOSQ_PROVIDER.provider` : returns selected provider object

### Note
You can always get all available attributes with `Object.keys(HOSQ_PROVIDER)`

## Ask question at [Discord](https://discord.gg/ENQfPEcrZJ)

[anspar.io](https://anspar.io)
