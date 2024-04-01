import { Wallet } from 'ethers'
import { netSettings } from '../dapp.config'
import { BN } from 'bn.js'

const Contract = require('web3-eth-contract')
export const Web3 = require('web3')
export const web3 = new Web3(netSettings.rpc)
const contractGovernanceDAO = require('../artifacts/contracts/GovernanceDAO.sol/GovernanceDAO.json')
const GovernanceDAOcontract = new web3.eth.Contract(contractGovernanceDAO.abi, netSettings.contracts.governanceDAO.contractAddress)

const gas_percent = 120

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// для страницы информаци

// конвертация из 'wei' в 'ether' с учетом количества десятичных знаков токена
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

//конвертация из 'ether' в 'wei' с учетом количества десятичных знаков токена
export function fromEther(x, n) {
  if (x) {
    const base = new BN(10).pow(new BN(n))
    const base18 = new BN(10).pow(new BN(18))
    const result = Web3.utils.toBN(Web3.utils.toWei(x, 'ether')).mul(base).div(base18)
    return result.toString(10)
  }
}

// перевод timestamp в человеческий вид
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

export const getUserDAO = async wallet => {
  const user = await GovernanceDAOcontract.methods.getUser(wallet.accounts[0].address).call()
  return user[0] != '0' ? user : ''
}

export const getUsersList = async () => {
  const resp = await GovernanceDAOcontract.methods.getUsersList(1, 100).call()
  const id = 0
  const users = {}
  while (Number(resp[id][0])) {
    users[resp[id][3]] = {
      index: resp[id][0],
      votes: resp[id][1],
      entered: resp[id][2],
      address: resp[id][3],
      nickname: resp[id][4]
    }
    users[resp[id][4]] = {
      index: resp[id][0],
      votes: resp[id][1],
      entered: resp[id][2],
      address: resp[id][3],
      nickname: resp[id][4]
    }
    id ++
  }
  console.log(users)
  return users
}

export const getTotalVoting = async () => {
  const total = await GovernanceDAOcontract.methods.total_voting().call()
  return total
}

export const getProposalsList = async id => {
  const resp = await GovernanceDAOcontract.methods.getProposalsList(id, 5).call()
  const proposals = []
  for (const i = 0; i < resp.length; i ++) {
    if (resp[i][0] != "0") {
      proposals.push(resp[i])
    }
  }
  const result = proposals.reverse()
  console.log(result)
  return result
}
