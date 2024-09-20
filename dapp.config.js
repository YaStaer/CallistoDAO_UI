const netSettings = {
  name: 'Callisto DAO',
  logo: '/images/net_img/CLO.png',
  ticker: 'CLO',
  rpc: 'https://rpc.callisto.network/',
  contracts: {
    treasury: {
      title: 'Treasury',
      description: 'Callisto treasury',
      contractAddress: '0x5633F30748A435322030fB02F1097CFe9D311bA4'
    },
    governanceDAO: {
      title: 'GovernanceDAO',
      description: 'Callisto GovernanceDAO',
      contractAddress: '0x810059e1406dEDAFd1BdCa4E0137CbA306c0Ce36'
    },
    walletDAO: {
      title: 'WalletDAO',
      description: 'Callisto WalletDAO',
      contractAddress: '0x6dd4c097C5f7A57FeAC50D23E53540f4578a0467'
    },
    monetaryPolicy: {
      title: 'MonetaryPolicy',
      description: 'Callisto MonetaryPolicy',
      contractAddress: '0x3c0a04dDD9Bd580e152e29b1d702000e7460c299'
    }
  }
}

// const netSettings = {
//   name: 'Callisto DAO Testnet',
//   logo: '/images/net_img/CLO.png',
//   ticker: 'CLO',
//   rpc: 'https://testnet-rpc.callisto.network/',
//   contracts: {
//     treasury: {
//       title: 'Treasury',
//       description: 'Callisto treasury',
//       contractAddress: '0xf82533EC6F73C56549e21B24a93B9f1612A99C67'
//     },
//     governanceDAO: {
//       title: 'GovernanceDAO',
//       description: 'Callisto GovernanceDAO',
//       contractAddress: '0xb356A5a5710Cac1677854f1b95608D1d4B4B417d'
//     },
//     walletDAO: {
//       title: 'WalletDAO',
//       description: 'Callisto WalletDAO',
//       contractAddress: '0x5E1A2196A67CA301CBbcC0da8335f1a9C19F5Ff4'
//     }
//   }
// }

export { netSettings }
