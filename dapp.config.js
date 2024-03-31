const netSettings = {
    name: 'Callisto Testnet',
    logo: '/images/net_img/CLO.png',
    ticker: 'CLO',
    rpc: 'https://testnet-rpc.callisto.network/',
    contracts: {
      treasury: {
        title: 'Treasury',
        description: 'Callisto treasury',
        contractAddress: '0xfD2D4C6C1a8272177729A6D7458984264F89e54c'
      },
      governanceDAO: {
        title: 'GovernanceDAO',
        description: 'Callisto GovernanceDAO',
        contractAddress: '0x0A35C34Af123c423E140AB7C00158eb1B41AB1B5'
      }
    }
  }
  // '0x334': {
  //   name: 'Callisto Mainnet',
  //   logo: '/images/net_img/CLO.png',
  //   ticker: 'CLO',
  //   rpc: 'https://rpc.callisto.network/',
  //   wraped: ['0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a', 'CLO'],
  //   wraped_bots: ['0xF5AD6F6EDeC824C7fD54A66d241a227F6503aD3a', 'WCLO'],
  //   stable: ['0xbf6c50889d3a620eb42C0F188b65aDe90De958c4', 'BUSDT'],
  // intraEX_arbitrage: '',
  //   contracts: {
  //     balances: {
  //       title: '2bearsBalances',
  //       description: '2bears balances',
  //       contractAddress: '0x820b5c3835B731DdeB1155ac0b37009E37524a53'
  //     },
  //     orders: {
  //       title: '2bearsOrders',
  //       description: '2bears orders',
  //       contractAddress: '0x1635a5bBf111742f7eBB95950714494a17FC14cb'
  //     },
  //     commission: {
  //       title: '2bearsCommision',
  //       description: '2bears commission',
  //       contractAddress: '0x469A2f6604b456110b486dA4950D032958FDE447'
  //     },
  //     bots: {
  //       title: '2bearsBots',
  //       description: '2bears bots',
  //       contractAddress: '0xc113Ed199eF9380e3f93B0a6e25FA86b7298FB16'
  //     },
  //     botshelp: {
  //       title: '2bearsBotsHelp',
  //       description: '2bears bots help',
  //       contractAddress: '0x6Ce8B9D7e0e7F9D0647EFfD8289023AeaccB5c32'
  //     }
  //   }
  // }
// }

// const defaultChain = '0x334'

export { netSettings }
// export { defaultChain }
