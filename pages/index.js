import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Tooltip } from 'react-tooltip'
import { useClickOutside } from '../utils/useClickOutside'
import { BN } from 'bn.js'
import { netSettings } from '../dapp.config'
import { initOnboard } from '../utils/onboard'
import { useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react'
import {
  cards,
  checkClaim,
  contractGovernanceDAO,
  contractTreasury,
  getAvatar,
  getClaimList,
  getProposalsList,
  getTotalVoting,
  getUserDAO,
  getUsersList,
  humanDate,
  parseComment,
  parseData,
  parseSource,
  Web3
} from '../utils/interact'
import Modal from '../utils/modal'

export default function DAO() {
  const statuses = {
    1: 'Active',
    2: 'All Vote',
    3: 'Executed'
  }
  // кошельки, сети и подключения
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  // const [{ chains, connectedChain, settingChain }, setChain] = useSetChain()
  const connectedWallets = useWallets()

  const [onboard, setOnboard] = useState(null)

  const [userDao, setUserDao] = useState('')
  const [usersList, setUsersList] = useState('')
  const [claimsList, setClaimsList] = useState(null)
  const [totalVoting, setTotalVoting] = useState(null)
  const [proposalsList, setProposalsList] = useState(null)
  const [proposalID, setProposalID] = useState(0)

  // эффекты onboard
  useEffect(() => {
    setOnboard(initOnboard)
  }, [])

  useEffect(() => {
    if (!connectedWallets.length) return

    const connectedWalletsLabelArray = connectedWallets.map(({ label }) => label)
    window.localStorage.setItem('connectedWallets', JSON.stringify(connectedWalletsLabelArray))
  }, [connectedWallets])

  useEffect(() => {
    if (!onboard) return

    const previouslyConnectedWallets = JSON.parse(window.localStorage.getItem('connectedWallets'))

    if (previouslyConnectedWallets?.length) {
      async function setWalletFromLocalStorage() {
        await connect({
          autoSelect: {
            label: previouslyConnectedWallets[0],
            disableModals: true
          }
        })
      }

      setWalletFromLocalStorage()
    }
  }, [onboard, connect])

  useEffect(() => {
    const init = async () => {
      const votings = await getTotalVoting()
      setTotalVoting(votings)
      setProposalID(votings)
      setProposalsList(await getProposalsList(votings))
      setUsersList(await getUsersList())
    }
    init()
  }, [])

  useEffect(() => {
    const init = async () => {
      if (wallet) {
        setUserDao(await getUserDAO(wallet))
        setClaimsList(await getClaimList(wallet.accounts[0].address, proposalID, cards))
      } else {
        setClaimsList(null)
      }
    }
    init()
  }, [wallet])

  useEffect(() => {
    const getProps = async () => {
      setProposalsList(await getProposalsList(proposalID))
    }
    getProps()
  }, [proposalID])

  return (
    <div className="min-h-screen h-full w-full overflow-hidden flex flex-col items-center justify-start bg-gradient-to-b from-gray-100 via-gray-300 to-gray-100 selection:bg-gray-700/90">
      <div className="bg-gray-300 h-[50px] w-full grid grid-cols-6 gap-2 place-items-center">
        <div className="ml-4 col-start-1 col-span-3 md:col-span-1 flex place-items-center">
          <img src="/images/Callisto_Logo.png" className="pl-2 h-[32px]" />
          <div className="mx-1 font-bold text-[22px]">Callisto{'\u00A0'}DAO</div>
        </div>
        {wallet ? (
          <div className="hidden md:block col-start-4 col-span-2">
            {userDao ? (
              <div className="flex place-items-center">
                <img
                  src={`data:image/png;base64,${getAvatar(userDao[3])}`}
                  className="my-1 hidden md:block border border-gray-400 float-left h-[32px] rounded-full"
                ></img>
                <div className="font-bold px-2">{userDao[4]}</div>
                <div className="px-3 text-[12px] grid grid-cols-2">
                  <div className="col-start-1">Proposals</div>
                  <div className="ml-2 font-bold col-start-2">{totalVoting - Number(userDao[2])}</div>
                  <div className="col-start-1">Participated</div>
                  <div className="ml-2 font-bold col-start-2">{userDao[1]}</div>
                </div>
              </div>
            ) : (
              <div className="font-bold">{wallet.accounts[0].address.slice(0, 8) + '...' + wallet.accounts[0].address.slice(-6)}</div>
            )}
          </div>
        ) : (
          ''
        )}
        {wallet ? (
          <div className="col-start-4 md:col-start-6 col-span-3 md:col-span-1">
            <div className="hidden md:block">
              <button
                className="bg-gray-500/90 shadow-inner hover:shadow-gray-300/70 py-1 px-2 rounded-md text-base text-white tracking-wide"
                onClick={() => disconnect(wallet)}
              >
                disconnect
              </button>
            </div>
            <div className="md:hidden">
              {userDao ? (
                <div className="flex place-items-center">
                  <img src={`data:image/png;base64,${getAvatar(userDao[3])}`} className="my-1 border border-gray-400 float-left h-[32px] rounded-full"></img>
                  <div className="px-3 text-[12px] grid grid-cols-3">
                    <div className="col-start-1 col-span-2">Total{'\u00A0'}votes</div>
                    <div className="pl-2 font-bold col-start-3">{totalVoting - Number(userDao[2])}</div>
                    <div className="col-start-1 col-span-2">Participated</div>
                    <div className="pl-2 font-bold col-start-3">{userDao[1]}</div>
                  </div>
                </div>
              ) : (
                <div className="font-bold">{wallet.accounts[0].address.slice(0, 8) + '...' + wallet.accounts[0].address.slice(-6)}</div>
              )}
            </div>
          </div>
        ) : (
          <button
            className="col-start-5 md:col-start-6 col-span-2 md:col-span-1 bg-gray-500/90 shadow-inner hover:shadow-gray-300/70 py-1 px-2 rounded-md text-base text-white tracking-wide"
            onClick={() => connect()}
          >
            connect
          </button>
        )}
      </div>
      <div className="mt-2 mb-[75px] w-11/12 xl:w-[1200px] shadow-md bg-gray-100/70">
        <div className="p-3 grid grid-cols-2 place-items-center w-full">
          <button className="flex place-items-center justify-self-start fill-gray-700/90 hover:fill-gray-900/90 text-gray-700/90 hover:text-gray-900/90 transition-all">
            <svg height="32" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg" className="m-2">
              <path d="m14.414 0h-9.414a3 3 0 0 0 -3 3v21h20v-16.414zm.586 3.414 3.586 3.586h-3.586zm-11 18.586v-19a1 1 0 0 1 1-1h8v7h7v13zm9-8h3v2h-3v3h-2v-3h-3v-2h3v-3h2z" />
            </svg>
            <div className="font-bold">New{'\u00A0'}proposal</div>
          </button>
          <div className="flex justify-self-end">
            <button className="fill-gray-700/90 hover:fill-gray-900/90 transition-all">
              <svg height="32" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg" className="m-2">
                <path d="m7.5 13a4.5 4.5 0 1 1 4.5-4.5 4.505 4.505 0 0 1 -4.5 4.5zm0-7a2.5 2.5 0 1 0 2.5 2.5 2.5 2.5 0 0 0 -2.5-2.5zm7.5 14a5.006 5.006 0 0 0 -5-5h-5a5.006 5.006 0 0 0 -5 5v4h2v-4a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v4h2zm2.5-11a4.5 4.5 0 1 1 4.5-4.5 4.505 4.505 0 0 1 -4.5 4.5zm0-7a2.5 2.5 0 1 0 2.5 2.5 2.5 2.5 0 0 0 -2.5-2.5zm6.5 14a5.006 5.006 0 0 0 -5-5h-4v2h4a3 3 0 0 1 3 3v4h2z" />
              </svg>
            </button>
            <button className="fill-gray-700/90 hover:fill-gray-900/90 transition-all">
              <svg height="32" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg" className="m-2">
                <path d="M21.3,13.88l-.45-.26c.1-.54,.15-1.09,.15-1.63s-.05-1.08-.15-1.63l.45-.26c1.43-.82,1.93-2.66,1.11-4.1-.4-.69-1.05-1.19-1.82-1.4-.77-.21-1.58-.1-2.28,.3l-.45,.26c-.84-.72-1.81-1.28-2.86-1.65v-.52c0-1.65-1.35-3-3-3s-3,1.35-3,3v.52c-1.05,.37-2.02,.93-2.86,1.65l-.45-.26c-.69-.4-1.5-.5-2.28-.3-.77,.21-1.42,.71-1.82,1.4-.82,1.43-.33,3.27,1.1,4.1l.45,.26c-.1,.54-.15,1.09-.15,1.63s.05,1.08,.15,1.63l-.45,.26c-1.43,.82-1.93,2.66-1.11,4.1,.4,.69,1.05,1.19,1.82,1.4,.77,.21,1.58,.1,2.28-.3l.45-.26c.84,.72,1.81,1.28,2.86,1.65v.52c0,1.65,1.35,3,3,3s3-1.35,3-3v-.52c1.05-.37,2.02-.93,2.86-1.65l.45,.26c.69,.4,1.5,.51,2.28,.3,.77-.21,1.42-.71,1.82-1.4,.82-1.43,.33-3.27-1.1-4.1Zm-2.56-3.74c.17,.62,.26,1.25,.26,1.86s-.09,1.23-.26,1.86c-.12,.44,.07,.9,.47,1.13l1.09,.63c.48,.28,.64,.89,.37,1.37-.13,.23-.35,.4-.61,.47-.26,.07-.53,.04-.76-.1l-1.09-.63c-.4-.23-.89-.16-1.21,.17-.89,.91-2.01,1.56-3.25,1.88-.44,.11-.75,.51-.75,.97v1.26c0,.55-.45,1-1,1s-1-.45-1-1v-1.26c0-.46-.31-.85-.75-.97-1.24-.32-2.36-.97-3.25-1.88-.19-.2-.45-.3-.72-.3-.17,0-.34,.04-.5,.13l-1.09,.63c-.23,.13-.5,.17-.76,.1-.26-.07-.47-.24-.61-.47-.27-.48-.11-1.09,.37-1.37l1.09-.63c.4-.23,.59-.69,.47-1.13-.17-.62-.26-1.25-.26-1.86s.09-1.23,.26-1.86c.12-.44-.07-.9-.47-1.13l-1.09-.63c-.48-.28-.64-.89-.37-1.37,.13-.23,.35-.4,.61-.47,.26-.07,.53-.03,.76,.1l1.09,.63c.4,.23,.89,.16,1.21-.17,.89-.91,2.01-1.56,3.25-1.88,.44-.11,.75-.51,.75-.97v-1.26c0-.55,.45-1,1-1s1,.45,1,1v1.26c0,.46,.31,.85,.75,.97,1.24,.32,2.36,.97,3.25,1.88,.32,.33,.82,.4,1.21,.17l1.09-.63c.23-.13,.5-.17,.76-.1,.26,.07,.47,.24,.61,.47,.27,.48,.11,1.09-.37,1.37l-1.09,.63c-.4,.23-.59,.69-.47,1.13Zm-4.96-1.94l-1.6,8c-.09,.48-.51,.8-.98,.8-.06,0-.13,0-.2-.02-.54-.11-.89-.63-.78-1.18l1.6-8c.11-.54,.63-.89,1.18-.78,.54,.11,.89,.63,.78,1.18Zm-4.57,2.65l-1.21,1.21,1.21,1.19c.39,.39,.39,1.02,0,1.41-.2,.2-.45,.29-.71,.29s-.51-.1-.71-.29l-1.21-1.21c-.78-.78-.78-2.04,0-2.81l1.21-1.21c.39-.39,1.02-.39,1.41,0s.39,1.02,0,1.41Zm8.21-.2c.78,.78,.78,2.04,0,2.81l-1.21,1.21c-.2,.2-.45,.29-.71,.29s-.51-.1-.71-.29c-.39-.39-.39-1.02,0-1.41l1.21-1.21-1.21-1.2c-.39-.39-.39-1.02,0-1.41s1.02-.39,1.41,0l1.21,1.21Z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="pt-2">
          {proposalsList
            ? proposalsList.map((prop, index) => (
                <div
                  key={'proposal_' + (index + 1)}
                  id={'proposal_' + (index + 1)}
                  className="mx-2 p-2 mt-2 grid grid-cols-3 border-2 border-solid border-green-500 rounded-lg text-xs bg-gray-300/90"
                >
                  <div className="col-start-1 col-span-3 md:col-span-2">
                    <div>Start voting - {humanDate(prop[1])}</div>
                    <div>End voting - {humanDate(prop[3])}</div>
                    <div>Status - {statuses[prop[5]]}</div>
                    <div>Reward - {Web3.utils.fromWei(prop[2], 'ether')} CLO</div>
                    <div className="hidden md:block cursor-pointer font-mono" onClick={() => navigator.clipboard.writeText(prop[4])}>
                      Creator - {usersList[prop[4]] ? usersList[prop[4]].nickname : prop[4]}
                    </div>
                    <div className="md:hidden cursor-pointer font-mono" onClick={() => navigator.clipboard.writeText(prop[4])}>
                      Creator - {usersList[prop[4]] ? usersList[prop[4]].nickname : prop[4].slice(0, 8) + '...' + prop[4].slice(-6)}
                    </div>
                    <div className="overflow-x-auto pb-2" dangerouslySetInnerHTML={{ __html: parseComment(prop[6]) }} />
                    <div className="hidden md:block cursor-pointer font-mono" onClick={() => navigator.clipboard.writeText(prop[9])}>
                      Contract -{' '}
                      {prop[9] == netSettings.contracts.treasury.contractAddress
                        ? 'Treasury'
                        : prop[9] == netSettings.contracts.governanceDAO.contractAddress
                        ? 'Governance DAO'
                        : prop[9]}
                    </div>
                    <div className="md:hidden cursor-pointer font-mono" onClick={() => navigator.clipboard.writeText(prop[9])}>
                      Contract -{' '}
                      {prop[9] == netSettings.contracts.treasury.contractAddress
                        ? 'Treasury'
                        : prop[9] == netSettings.contracts.governanceDAO.contractAddress
                        ? 'Governance DAO'
                        : prop[9].slice(0, 8) + '...' + prop[9].slice(-6)}
                    </div>
                    {prop[9] == netSettings.contracts.treasury.contractAddress ? (
                      <div className="overflow-x-auto">
                        <div className="font-mono">Function: {parseData(prop[10], contractTreasury.abi).function}</div>
                        {Object.entries(parseData(prop[10], contractTreasury.abi).params).map((par, index) => (
                          <div key={'tparam_' + index} className="font-mono">
                            {par[0]}:{'\u00A0'}
                            {par[1]}
                          </div>
                        ))}
                      </div>
                    ) : prop[9] == netSettings.contracts.governanceDAO.contractAddress ? (
                      <div className="overflow-x-auto">
                        <div className="font-mono">Function: {parseData(prop[10], contractGovernanceDAO.abi).function}</div>
                        {Object.entries(parseData(prop[10], contractGovernanceDAO.abi).params).map((par, index) => (
                          <div key={'dparam_' + index} className="font-mono">
                            {par[0]}:{'\u00A0'}
                            {par[1]}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        {Object.entries(parseSource(prop[10])).map((par, index) => (
                          <div key={'sparam_' + index} className="font-mono">
                            {par[0]}:{'\u00A0'}
                            {par[1]}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-start-1 col-span-3 md:col-start-3 md:col-span-1 place-self-center text-base mt-2">
                    <div className="mt-3 grid grid-cols-4 place-items-center">
                      <button className="col-start-1 col-span-1 mr-2 p-2 flex place-items-center border-2 bg-gray-300/90 border-green-600/90 fill-green-600/90 text-green-600/90 rounded-lg hover:fill-green-500/90 hover:text-green-500/90 hover:border-green-500/90 hover:bg-gray-400/20 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24" width="32" height="32">
                          <path d="M22.773,7.721A4.994,4.994,0,0,0,19,6H15.011l.336-2.041A3.037,3.037,0,0,0,9.626,2.122L7.712,6H5a5.006,5.006,0,0,0-5,5v5a5.006,5.006,0,0,0,5,5H18.3a5.024,5.024,0,0,0,4.951-4.3l.705-5A5,5,0,0,0,22.773,7.721ZM2,16V11A3,3,0,0,1,5,8H7V19H5A3,3,0,0,1,2,16Zm19.971-4.581-.706,5A3.012,3.012,0,0,1,18.3,19H9V7.734a1,1,0,0,0,.23-.292l2.189-4.435A1.07,1.07,0,0,1,13.141,2.8a1.024,1.024,0,0,1,.233.84l-.528,3.2A1,1,0,0,0,13.833,8H19a3,3,0,0,1,2.971,3.419Z" />
                        </svg>
                        <div className="pl-2 text-[24px] font-bold">{prop[7].length}</div>
                      </button>
                      <button className="col-start-2 col-span-1 mr-2 p-2 flex place-items-center border-2 bg-gray-300/90 border-red-600/90 fill-red-600/90 text-red-600/90 rounded-lg hover:border-red-500/90 hover:fill-red-500/90 hover:text-red-500/90 hover:bg-gray-400/20 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24" width="32" height="32">
                          <path d="M23.951,12.3l-.705-5A5.024,5.024,0,0,0,18.3,3H5A5.006,5.006,0,0,0,0,8v5a5.006,5.006,0,0,0,5,5H7.712l1.914,3.878a3.037,3.037,0,0,0,5.721-1.837L15.011,18H19a5,5,0,0,0,4.951-5.7ZM5,5H7V16H5a3,3,0,0,1-3-3V8A3,3,0,0,1,5,5Zm16.264,9.968A3,3,0,0,1,19,16H13.833a1,1,0,0,0-.987,1.162l.528,3.2a1.024,1.024,0,0,1-.233.84,1.07,1.07,0,0,1-1.722-.212L9.23,16.558A1,1,0,0,0,9,16.266V5h9.3a3.012,3.012,0,0,1,2.97,2.581l.706,5A3,3,0,0,1,21.264,14.968Z" />
                        </svg>
                        <div className="pl-2 text-[24px] font-bold">{prop[8].length}</div>
                      </button>
                      <button className="col-start-3 col-span-1 ml-4 p-2 flex place-items-center border-2 bg-gray-300/90 border-gray-700/90 fill-gray-700/90 rounded-lg hover:border-gray-900/90 hover:fill-gray-900/90 hover:bg-gray-400/20 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24" width="32" height="32">
                          <path d="m14.696,15.381l-.81.809c-.391.391-.391,1.023,0,1.414.195.195.451.293.707.293s.512-.098.707-.293l7.402-7.401c.391-.391.391-1.023,0-1.414-.391-.391-1.023-.391-1.414,0l-.722.722-7.082-7.082.722-.722c.391-.391.391-1.023,0-1.414s-1.023-.391-1.414,0l-7.402,7.402c-.391.391-.391,1.023,0,1.414.195.195.451.293.707.293s.512-.098.707-.293l.81-.81,2.836,2.836L.293,21.293c-.391.391-.391,1.023,0,1.414.195.195.451.293.707.293s.512-.098.707-.293l10.158-10.158,2.832,2.831Zm4.457-4.456l-3.043,3.042-1.245-1.245,3.043-3.043,1.245,1.245Zm-8.789-2.703l-1.336-1.336,3.043-3.043,1.336,1.336-3.043,3.043Zm4.457-1.629l1.672,1.672-3.043,3.043-1.672-1.672,3.043-3.043Zm9.179,16.407c0,.553-.447,1-1,1h-13c-.553,0-1-.447-1-1s.447-1,1-1h.051c.232-1.14,1.242-2,2.449-2h8c1.208,0,2.217.86,2.449,2h.051c.553,0,1,.447,1,1Z" />
                        </svg>
                      </button>
                      <button className="col-start-4 col-span-1 ml-2 p-2 flex place-items-center border-2 bg-gray-300/90 border-gray-700/90 fill-gray-700/90 rounded-lg hover:border-gray-900/90 hover:fill-gray-900/90 hover:bg-gray-400/20 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 24 24" width="32" height="32">
                          <path d="M16.5,0c-4.206,0-7.5,1.977-7.5,4.5v2.587c-.483-.057-.985-.087-1.5-.087C3.294,7,0,8.977,0,11.5v8c0,2.523,3.294,4.5,7.5,4.5,3.407,0,6.216-1.297,7.16-3.131,.598,.087,1.214,.131,1.84,.131,4.206,0,7.5-1.977,7.5-4.5V4.5c0-2.523-3.294-4.5-7.5-4.5Zm5.5,12.5c0,1.18-2.352,2.5-5.5,2.5-.512,0-1.014-.035-1.5-.103v-1.984c.49,.057,.992,.087,1.5,.087,2.194,0,4.14-.538,5.5-1.411v.911ZM2,14.589c1.36,.873,3.306,1.411,5.5,1.411s4.14-.538,5.5-1.411v.911c0,1.18-2.352,2.5-5.5,2.5s-5.5-1.32-5.5-2.5v-.911Zm20-6.089c0,1.18-2.352,2.5-5.5,2.5-.535,0-1.06-.038-1.566-.112-.193-.887-.8-1.684-1.706-2.323,.984,.28,2.092,.435,3.272,.435,2.194,0,4.14-.538,5.5-1.411v.911Zm-5.5-6.5c3.148,0,5.5,1.32,5.5,2.5s-2.352,2.5-5.5,2.5-5.5-1.32-5.5-2.5,2.352-2.5,5.5-2.5ZM7.5,9c3.148,0,5.5,1.32,5.5,2.5s-2.352,2.5-5.5,2.5-5.5-1.32-5.5-2.5,2.352-2.5,5.5-2.5Zm0,13c-3.148,0-5.5-1.32-5.5-2.5v-.911c1.36,.873,3.306,1.411,5.5,1.411s4.14-.538,5.5-1.411v.911c0,1.18-2.352,2.5-5.5,2.5Zm9-3c-.512,0-1.014-.035-1.5-.103v-1.984c.49,.057,.992,.087,1.5,.087,2.194,0,4.14-.538,5.5-1.411v.911c0,1.18-2.352,2.5-5.5,2.5Z" />
                        </svg>
                      </button>
                    </div>
                    <div className="ml-[4px] my-2 grid place-items-center">
                      {prop[7].map((member, index) => (
                        <div key={'member_up_' + index} className="ml-[-8px] flex">
                          <img
                            src={`data:image/png;base64,${getAvatar(member)}`}
                            className="border-2 border-green-700 h-[28px] rounded-full"
                            data-tooltip-id="tooltip"
                            data-tooltip-content={usersList[member]?.nickname}
                            data-tooltip-delay-show={500}
                          ></img>
                        </div>
                      ))}
                      {prop[8].map((member, index) => (
                        <div key={'member_down_' + index} className="ml-[-8px] flex">
                          <img
                            src={`data:image/png;base64,${getAvatar(member)}`}
                            className="border-2 border-red-700 h-[28px] rounded-full"
                            data-tooltip-id="tooltip"
                            data-tooltip-content={usersList[member]?.nickname}
                            data-tooltip-delay-show={500}
                          ></img>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            : ''}
        </div>
        <div className="p-2 grid grid-cols-2 gap-4 place-items-center">
          <div className="col-start-1 flex place-items-center place-self-end">
            <button
              className={`${
                proposalsList && Number(proposalsList[0][0]) == totalVoting ? 'hidden' : ''
              } flex place-items-center bg-gray-500/90 shadow-inner hover:shadow-gray-300/70 h-8 px-2 mr-4 rounded-md text-base text-white`}
              onClick={() => setProposalID(0)}
            >
              <div>First</div>
            </button>
            <button
              className={`${
                proposalsList && Number(proposalsList[0][0]) == totalVoting ? 'hidden' : ''
              } col-start-1 flex place-items-center place-self-end bg-gray-500/90 shadow-inner hover:shadow-gray-300/70 h-8 px-2 rounded-md text-base text-white`}
              onClick={() => setProposalID(proposalID + cards)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M17.921,1.505a1.5,1.5,0,0,1-.44,1.06L9.809,10.237a2.5,2.5,0,0,0,0,3.536l7.662,7.662a1.5,1.5,0,0,1-2.121,2.121L7.688,15.9a5.506,5.506,0,0,1,0-7.779L15.36.444a1.5,1.5,0,0,1,2.561,1.061Z" />
              </svg>
            </button>
          </div>
          <button
            className={`${
              proposalsList && proposalsList[proposalsList.length - 1][0] == 1 ? 'hidden' : ''
            } col-start-2 flex place-items-center place-self-start bg-gray-500/90 shadow-inner hover:shadow-gray-300/70 h-8 px-2 rounded-md text-base text-white`}
            onClick={() => setProposalID(proposalID - cards)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M6.079,22.5a1.5,1.5,0,0,1,.44-1.06l7.672-7.672a2.5,2.5,0,0,0,0-3.536L6.529,2.565A1.5,1.5,0,0,1,8.65.444l7.662,7.661a5.506,5.506,0,0,1,0,7.779L8.64,23.556A1.5,1.5,0,0,1,6.079,22.5Z" />
            </svg>
          </button>
        </div>
      </div>
      <Tooltip id="tooltip" border="1px solid" style={{ zIndex: 99, borderRadius: 8 }} />
    </div>
  )
}
