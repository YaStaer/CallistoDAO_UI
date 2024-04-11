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
      }
    }
  }

export { netSettings }
