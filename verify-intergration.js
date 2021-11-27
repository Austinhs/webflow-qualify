$(function() {
    const ETH_NETWORK   = "mainnet"
    const MAINNET_RPC   = "https://mainnet.infura.io/v3/2085b411450b46f9a7498607d8ee9ca5";
    const INFURA_ID     = "2085b411450b46f9a7498607d8ee9ca5";
    const COINBASE_LOGO = "https://uploads-ssl.webflow.com/614234887546d4556cfcc459/6180a0039ddadb922db47dc5_coinbase.png";

    const CONTRACT_ADDRESS = "0xc631164B6CB1340B5123c9162f8558c866dE1926";
    const ETHEREUM_EVENTS  = ["accountsChanged", "chainChanged", "connect", "disconnect"];
    const CONTRACT_ABI     = window.da_abi;


    const $connected_container = $('.connected-wallet-information');
    const $connect_container   = $('.wallet-information');
    const $wallet_address      = $('.connected-wallet-information .wallet-address');

    let provider, web3, contract, web3Modal, account;

    init();

    // Events
    $(document)
        .on('click', '.wallet-information .div-block-47 .heading-23-copy', connect)
        .on('click', '.connected-wallet-information .div-block-47 .heading-23-copy', disconnect)
    ;

    async function disconnect() {
        provider = null;
        web3     = null;
        account  = null;
        contract = null;

        loadUnconnected();
    }

    async function connect() {
        try {
            provider = await web3Modal.connect();
            web3     = new Web3(provider);

            let accounts = await web3.eth.getAccounts();
                account  = accounts[0];

            contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

            loadConnected();

            ETHEREUM_EVENTS.map(async(el) => {
                await provider.on(el, (e) => {
                    window.location.reload();
                })
            })
        } catch(err) {
            window.alert('Something went wrong: ' + err);
            console.error(err)
        }
    }

    async function getTokens() {
        const responses = await contract.methods.getData(account).call({ from: account })

        return responses[0];
    }

    async function loadConnected() {
        $connect_container.addClass('hide');
        $connected_container.removeClass('hide');
        $wallet_address.removeClass('hide');

        // Set wallet data
        $wallet_address.html(account);

        const qualified = {
            spirit_animals: await getSpiritAnimals(),
            gas           : getGasAffected()
        };

        console.log(qualified);
    }

    async function getSpiritAnimals() {
        let tokens = await getTokens();

        let count = 0;
        for (const token_id of tokens) {
            if(token_id % 4 == 0) {
                count++;
            }
        }

        return count;
    }

    function getGasAffected() {
        if (account in window.gas_wallets) {
            return window.gas_wallets[account];
        } else {
            return 0;
        }
    }

    function loadUnconnected() {
        $connected_container.addClass('hide');
        $wallet_address.addClass('hide');
        $connect_container.removeClass('hide');
    }

    async function init() {
        loadUnconnected();

        let Web3Modal = window.Web3Modal.default;

        const providerOptions = {
            walletconnect: {
                package: WalletConnectProvider.default, // required
                options: {
                    INFURA_ID,
                    rpc: {
                        1: MAINNET_RPC
                    }
                }
            },
            torus: {
                package: Torus //provider.torus
            },
            portis: {
                package: Portis, // required
                options: {
                    id: "2a0186e4-0afe-4a54-830a-f1fd8a6024ae" // required
                }
            },
            'custom-coinbase': {
                display: {
                    logo: COINBASE_LOGO,
                    name: 'Coinbase Wallet',
                    description: 'Scan with WalletLink to connect',
                },
                package: WalletLink,
                connector: async (_, options) => {
                    const { appName } = options
                    const walletLink = new WalletLink({ appName })
                    provider = walletLink.makeWeb3Provider(MAINNET_RPC, 4);

                    return provider
                }
            }
        }

        web3Modal = new Web3Modal({
            disableInjectedProvider: false,
            network: ETH_NETWORK,
            cacheProvider: false,
            providerOptions,
            theme: "light"
        });
    }
});