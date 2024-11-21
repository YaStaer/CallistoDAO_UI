import { netSettings } from '../dapp.config'
import { BN } from 'bn.js'
import Identicon from 'identicon.js'

export const Web3 = require('web3')
export const web3 = new Web3(netSettings.rpc)
export const contractGovernanceDAO = require('../artifacts/contracts/GovernanceDAO.sol/GovernanceDAO.json')
const GovernanceDAOcontract = new web3.eth.Contract(contractGovernanceDAO.abi, netSettings.contracts.governanceDAO.contractAddress)
export const contractWalletDAO = require('../artifacts/contracts/WalletDAO.sol/WalletDAO.json')
const WalletDAOcontract = new web3.eth.Contract(contractWalletDAO.abi, netSettings.contracts.walletDAO.contractAddress)
export const contractTreasury = require('../artifacts/contracts/Treasury.sol/Treasury.json')
const TreasuryContract = new web3.eth.Contract(contractTreasury.abi, netSettings.contracts.treasury.contractAddress)
export const contractMonetaryPolicy = require('../artifacts/contracts/MonetaryPolicy.sol/MonetaryPolicy.json')
const MonetaryPolicyContract = new web3.eth.Contract(contractMonetaryPolicy.abi, netSettings.contracts.monetaryPolicy.contractAddress)
export const contractDaoApprovedResources = require('../artifacts/contracts/DaoApprovedResources.sol/DaoApprovedResources.json')
const DaoApprovedResourcesContract = new web3.eth.Contract(contractDaoApprovedResources.abi, netSettings.contracts.DaoApprovedResources.contractAddress)

const gas_percent = 120

export const cards = 5

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function toEther(x, n) {
  if (x) {
    const base = new BN(10).pow(new BN(n))
    const dm = new BN(x).divmod(base)
    var div = dm.div
    var mod = dm.mod
    if (mod.toString(10, n)[0] == '-' && div == '0') {
      div = '-0'
    }
    const tempres = div + '.' + mod.toString(10, n).replace(/0*$/, '').replace('-', '')
    const res = tempres.replace(/\.$/, '')
    return res
  }
}

export function humanDate(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000)
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  var year = a.getFullYear()
  var month = months[a.getMonth()]
  var date = a.getDate()
  var hour = a.getHours()
  var min = a.getMinutes()
  var sec = a.getSeconds()
  var time =
    (date.toString().length == 1 ? '0' + date : date) +
    ' ' +
    month +
    ' ' +
    year +
    ' ' +
    (hour.toString().length == 1 ? '0' + hour : hour) +
    ':' +
    (min.toString().length == 1 ? '0' + min : min) +
    ':' +
    (sec.toString().length == 1 ? '0' + sec : sec)
  return time
}

export const getAvatar = address => {
  return new Identicon(address, 32).toString()
}

export const parseData = (data, abi) => {
  const result = {
    function: '',
    params: {},
    error: 'Function not found'
  }
  if (typeof abi == 'string') {
    try {
      abi = JSON.parse(abi.replace(/\s/g, ''))
    } catch (err) {
      return {
        function: '',
        params: {},
        error: 'Incorrect ABI'
      }
    }
  }
  for (const i = 0; i < abi.length; i++) {
    if (abi[i].type == 'function' && web3.eth.abi.encodeFunctionSignature(abi[i]) == data.slice(0, 10)) {
      result.function = abi[i].name
      const decode_params = web3.eth.abi.decodeParameters(abi[i].inputs, '0x' + data.slice(10))
      for (const p = 0; p < abi[i].inputs.length; p++) {
        result.params[abi[i].inputs[p].name] = decode_params[p].toString()
      }
      result.error = ''
    }
  }
  return result
}

export const parseABI = abi => {
  const result = {
    abi: '',
    error: ''
  }
  try {
    result.abi = JSON.parse(abi.replace(/\s/g, ''))
  } catch (err) {
    return {
      abi: '',
      error: 'Incorrect ABI'
    }
  }
  return result
}

export const parseSource = data => {
  const result = { MethodID: data.slice(0, 10) }
  for (const i = 0; i * 64 < data.slice(10).length; i++) {
    result['[' + i + ']'] = data.slice(10 + i * 64, 74 + i * 64)
  }
  return result
}

export const parseComment = comment => {
  if (!comment) {
    return 'Comment\u00A0-\u00A0(no comment added)'
  }
  const temp = comment.split(' ')
  const arr = []
  for (const i = 0; i < temp.length; i++) {
    if (temp[i].search('://') != -1) {
      const nodots = temp[i].replace(/[\.\,\!\?]$/, '')
      arr[i] = '<a class="underline" target="_blank" href="' + nodots + '">' + nodots + '</a>'
      if (nodots != temp[i]) {
        arr[i] = arr[i] + temp[i][temp[i].length - 1]
      }
    } else {
      arr[i] = temp[i]
    }
  }
  return 'Comment\u00A0-\u00A0' + arr.join('\u00A0')
}

export const getTreasuryBalanceDAO = async () => {
  const addr = await TreasuryContract.methods.callistoCommunity().call()
  const balance = await TreasuryContract.methods.getRecipientData(addr).call()
  return [Web3.utils.fromWei(balance[0], 'ether'), Web3.utils.fromWei(balance[1], 'ether')]
}

export const getTreasuryTokenBalanceDAO = async addr => {
  const balance = {
    balance: 0,
    token: '',
    decimal: '',
    error: ''
  }
  try {
    const resp = await TreasuryContract.methods.getBalanceToken(addr).call()
    balance.balance = toEther(resp[0], resp[1])
    balance.token = resp[2]
    balance.decimal = resp[1]
  } catch (err) {
    if (!addr) {
      balance.error = 'Paste token address'
    } else {
      balance.error = 'Incorrect token address'
    }
  }
  return balance
}

export const getUserDAO = async wallet => {
  const user = await GovernanceDAOcontract.methods.getUser(await Web3.utils.toChecksumAddress(wallet['accounts'][0]['address'])).call()
  return user[0] != '0' ? user : null
}

export const getUsersList = async () => {
  const userID = 1
  const count = 100
  const users = {}
  while (true) {
    const resp = await GovernanceDAOcontract.methods.getUsersList(userID, count).call()
    const id = 0
    while (resp[id] && Number(resp[id][0])) {
      users[resp[id][3].toString()] = {
        index: resp[id][0],
        votes: resp[id][1],
        entered: resp[id][2],
        address: resp[id][3],
        nickname: resp[id][4]
      }

      id++
    }
    if (!Number(resp[resp.length - 1][0])) {
      break
    } else {
      userID += count
    }
  }
  return users
}

export const getTotalVoting = async () => {
  const total = await GovernanceDAOcontract.methods.total_voting().call()
  return total
}

export const getTotalCloseVoting = async () => {
  const total = await GovernanceDAOcontract.methods.total_close_voting().call()
  return total
}

export const getExpirePeriod = async () => {
  const resp = await GovernanceDAOcontract.methods.expire_period().call()
  const days = Math.floor(resp / 86400)
  const hours = Math.floor((resp % 86400) / 3600)
  const minutes = Math.floor(((resp % 86400) % 3600) / 60)
  const seconds = Math.floor(((resp % 86400) % 3600) % 60)
  const period = [days, hours, minutes, seconds]
  return period
}

export const getMinPaymentDAO = async () => {
  const resp = await GovernanceDAOcontract.methods.min_payment_DAO().call()
  const payment = Web3.utils.fromWei(resp, 'ether')
  return payment
}

export const getMinPaymentOther = async () => {
  const resp = await GovernanceDAOcontract.methods.min_payment_other().call()
  const payment = Web3.utils.fromWei(resp, 'ether')
  return payment
}

export const getProposalsList = async id => {
  const resp = await GovernanceDAOcontract.methods.getProposalsList(id, cards).call()
  const proposals = []
  for (const i = 0; i < resp.length; i++) {
    if (resp[i][0] != '0') {
      proposals.push(resp[i])
    }
  }
  if (!proposals.length) {
    proposals = null
  }
  return proposals
}

export const getClaimList = async (wallet, id) => {
  const resp = await GovernanceDAOcontract.methods.getClaimList(await Web3.utils.toChecksumAddress(wallet['accounts'][0]['address']), id, cards).call()
  const claims = {}
  for (const i = 0; i < resp[0].length; i++) {
    if (resp[0][i] != '0') {
      claims[resp[0][i]] = resp[1][i]
    }
  }
  return claims
}

export const getWalletDAOBalances = async () => {
  const resp = await WalletDAOcontract.methods.walletDAO_ViewBalances().call()
  const balances = []
  for (const i = 0; i < resp.length; i++) {
    balances.push({
      address: resp[i][2],
      balance: toEther(resp[i][0], resp[i][1]),
      ticker: resp[i][3],
      decimals: resp[i][1]
    })
  }
  return balances
}

export const getListBots = async () => {
  const resp = await WalletDAOcontract.methods.twoBears_ViewListBots().call()
  return resp
}

export const vote = async (wallet, id, answer) => {
  const address = wallet['accounts'][0]['address']
  const tx = {
    to: netSettings.contracts.governanceDAO.contractAddress,
    from: address,
    value: '0x0', // hex
    data: GovernanceDAOcontract.methods.vote(id, answer).encodeABI()
  }
  try {
    const gas = await web3.eth.estimateGas(tx)
    tx.gas = '0x' + new BN(gas).mul(new BN(gas_percent)).div(new BN(100)).toString(16)
    const txHash = await wallet.provider.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })
    console.log(`Send - ${txHash}`)
    while (true) {
      const receipt = await web3.eth.getTransactionReceipt(txHash)
      if (receipt) {
        if (receipt.status) {
          await sleep(1000)
          return `Vote ${answer ? 'Up' : 'Down'} successfull`
        } else {
          await sleep(1000)
          return `Transaction failed`
        }
      }
      console.log('Waiting a mined block to include your tx... currently in block ' + (await web3.eth.getBlockNumber()))
      await sleep(1000)
    }
  } catch (err) {
    return err.message ? err.message : err.toString()
  }
}

export const complete = async (wallet, id) => {
  const address = wallet['accounts'][0]['address']
  const tx = {
    to: netSettings.contracts.governanceDAO.contractAddress,
    from: address,
    value: '0x0', // hex
    data: GovernanceDAOcontract.methods.vote(id, 0).encodeABI()
  }
  try {
    const gas = await web3.eth.estimateGas(tx)
    tx.gas = '0x' + new BN(gas).mul(new BN(gas_percent)).div(new BN(100)).toString(16)
    const txHash = await wallet.provider.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })
    console.log(`Send - ${txHash}`)
    while (true) {
      const receipt = await web3.eth.getTransactionReceipt(txHash)
      if (receipt) {
        if (receipt.status) {
          await sleep(1000)
          return `Voting completed`
        } else {
          await sleep(1000)
          return `Transaction failed`
        }
      }
      console.log('Waiting a mined block to include your tx... currently in block ' + (await web3.eth.getBlockNumber()))
      await sleep(1000)
    }
  } catch (err) {
    return err.message ? err.message : err.toString()
  }
}

export const execute = async (wallet, id) => {
  const address = wallet['accounts'][0]['address']
  const tx = {
    to: netSettings.contracts.governanceDAO.contractAddress,
    from: address,
    value: '0x0', // hex
    data: GovernanceDAOcontract.methods.execute(id).encodeABI()
  }
  try {
    const gas = await web3.eth.estimateGas(tx)
    tx.gas = '0x' + new BN(gas).mul(new BN(gas_percent)).div(new BN(100)).toString(16)
    const txHash = await wallet.provider.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })
    console.log(`Send - ${txHash}`)
    while (true) {
      const receipt = await web3.eth.getTransactionReceipt(txHash)
      if (receipt) {
        if (receipt.status) {
          await sleep(1000)
          return `Execute successfull`
        } else {
          await sleep(1000)
          return `Transaction failed`
        }
      }
      console.log('Waiting a mined block to include your tx... currently in block ' + (await web3.eth.getBlockNumber()))
      await sleep(1000)
    }
  } catch (err) {
    return err.message ? err.message : err.toString()
  }
}

export const claim = async (wallet, id) => {
  const address = wallet['accounts'][0]['address']
  const tx = {
    to: netSettings.contracts.governanceDAO.contractAddress,
    from: address,
    value: '0x0', // hex
    data: GovernanceDAOcontract.methods.claim(id).encodeABI()
  }
  try {
    const gas = await web3.eth.estimateGas(tx)
    tx.gas = '0x' + new BN(gas).mul(new BN(gas_percent)).div(new BN(100)).toString(16)
    const txHash = await wallet.provider.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })
    console.log(`Send - ${txHash}`)
    while (true) {
      const receipt = await web3.eth.getTransactionReceipt(txHash)
      if (receipt) {
        if (receipt.status) {
          await sleep(1000)
          return `Claim successfull`
        } else {
          await sleep(1000)
          return `Transaction failed`
        }
      }
      console.log('Waiting a mined block to include your tx... currently in block ' + (await web3.eth.getBlockNumber()))
      await sleep(1000)
    }
  } catch (err) {
    return err.message ? err.message : err.toString()
  }
}

export const createVoting = async (wallet, isMember, contract, data, func, params, comment) => {
  const address = wallet['accounts'][0]['address']
  const contract_address = ''
  const data_all = ''
  console.log(contract, data, params, comment)
  try {
    contract_address = Web3.utils.toChecksumAddress(contract)
  } catch (err) {
    return `Wrong address format`
  }
  if (!data) {
    try {
      data = web3.eth.abi.encodeFunctionCall(JSON.parse(func), params)
    } catch (err) {
      return `Wrong function parameters`
    }
  } else {
    if (!Web3.utils.isHex(data)) {
      return `Wrong data`
    }
  }

  const tx = {
    to: netSettings.contracts.governanceDAO.contractAddress,
    from: address,
    value: isMember
      ? Web3.utils.toHex(await GovernanceDAOcontract.methods.min_payment_DAO().call())
      : Web3.utils.toHex(await GovernanceDAOcontract.methods.min_payment_other().call()),
    data: GovernanceDAOcontract.methods.createProposal(contract_address, data, comment).encodeABI()
  }
  try {
    const gas = await web3.eth.estimateGas(tx)
    tx.gas = '0x' + new BN(gas).mul(new BN(gas_percent)).div(new BN(100)).toString(16)
    const txHash = await wallet.provider.request({
      method: 'eth_sendTransaction',
      params: [tx]
    })
    console.log(`Send - ${txHash}`)
    while (true) {
      const receipt = await web3.eth.getTransactionReceipt(txHash)
      if (receipt) {
        if (receipt.status) {
          await sleep(1000)
          document.getElementById('comment').value = ''
          return `Create voting successfull`
        } else {
          await sleep(1000)
          return `Transaction failed`
        }
      }
      console.log('Waiting a mined block to include your tx... currently in block ' + (await web3.eth.getBlockNumber()))
      await sleep(1000)
    }
  } catch (err) {
    return `Transaction canceled`
  }
}
