const netSettings = {
  '0x50f9': {
    name: 'Callisto Testnet',
    logo: '/images/net_img/CLO.png',
    ticker: 'CLO',
    rpc: 'https://testnet-rpc.callisto.network/',
    wraped: ['0xbd2D3BCe975FD72E44A73cC8e834aD1B8441BdDa', 'CLO'],
    wraped_bots: ['0xbd2D3BCe975FD72E44A73cC8e834aD1B8441BdDa', 'WCLO'],
    stable: ['0x9a0a2D4498182D4466901A39a97feB16AE26d01a', 'USDT'],
    intraEX_arbitrage: '0x47a00226ED1cb45BaF041F736E281AA01cDbee1B',
    contracts: {
      balances: {
        title: '2bearsBalances',
        description: '2bears balances',
        contractAddress: '0x1501Bffb3D83239214AE55eCE3a4ccd40092c922'
      },
      orders: {
        title: '2bearsOrders',
        description: '2bears orders',
        contractAddress: '0xe8F6F27621E94CCDD70FE5555e6c6d24257b99FB'
      },
      commission: {
        title: '2bearsCommision',
        description: '2bears commission',
        contractAddress: '0x1b6c9df704b765BEac653BA03e61B477fC24dF57'
      },
      bots: {
        title: '2bearsBots',
        description: '2bears bots',
        contractAddress: '0x69b78bF6300a39D186C7850A46ea6CA261c265c3'
      },
      botshelp: {
        title: '2bearsBotsHelp',
        description: '2bears bots help',
        contractAddress: '0xECB37B02ea61DEcA8976F8316aDAACCdD7626902'
      }
    }
  },
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
}

// const defaultChain = '0x334'

export { netSettings }
// export { defaultChain }
