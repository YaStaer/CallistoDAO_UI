import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Tooltip } from 'react-tooltip'
import { useClickOutside } from '../utils/useClickOutside'
import { BN } from 'bn.js'
import { netSettings } from '../dapp.config'
import { initOnboard } from '../utils/onboard'
import { useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react'
import { getProposalsList, getTotalVoting, getUserDAO, getUsersList, humanDate, Web3 } from '../utils/interact'
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
  const [totalVoting, setTotalVoting] = useState(null)
  const [proposalsList, setProposalsList] = useState(null)
  const [proposalID, setProposalID] = useState(1)

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
      setTotalVoting(await getTotalVoting())
      setProposalsList(await getProposalsList(proposalID))
      setUsersList(await getUsersList())
    }
    init()
  }, [])

  useEffect(() => {
    const init = async () => {
      if (wallet) {
        setUserDao(await getUserDAO(wallet))
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
    <div className="min-h-screen h-full w-full overflow-hidden flex flex-col items-center justify-start bg-gradient-to-b from-gray-100 via-gray-300 to-gray-100 selection:bg-gray-300/90 selection:text-gray-900">
      <div className="bg-gray-300 h-[50px] w-full grid grid-cols-6 gap-2 place-items-center">
        <div className="ml-4 col-start-1 col-span-3 md:col-span-1 flex place-items-center">
          <img src="/images/Callisto_Logo.png" className="pl-2 h-[32px]" />
          <div className="mx-1 font-bold text-[22px]">Callisto{'\u00A0'}DAO</div>
        </div>
        {wallet ? (
          <div className="hidden md:block col-start-4 col-span-2">
            {userDao ? (
              <div className="flex place-items-center">
                <img src={`images_tg/${userDao[4]}.jpg`} className="my-1 hidden md:block float-left h-[32px] rounded-full"></img>
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
                  <img src={`images_tg/${userDao[4]}.jpg`} className="my-1 float-left h-[32px] rounded-full"></img>
                  {/* <div className="font-bold px-2">{userDao[4]}</div> */}
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
      <div className="my-2 w-11/12 xl:w-[1200px] shadow-md bg-gray-100/70">
        <div className="p-3 grid grid-cols-2 place-items-center w-full">
          <button className="flex place-items-center justify-self-start">
            <svg height="32" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg" className="m-2 fill-gray-800/90">
              <path d="m14.414 0h-9.414a3 3 0 0 0 -3 3v21h20v-16.414zm.586 3.414 3.586 3.586h-3.586zm-11 18.586v-19a1 1 0 0 1 1-1h8v7h7v13zm9-8h3v2h-3v3h-2v-3h-3v-2h3v-3h2z" />
            </svg>
            <div className="font-bold text-gray-800/90">New{'\u00A0'}proposal</div>
          </button>
          <div className="flex justify-self-end">
            <button>
              <svg height="32" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg" className="m-2 fill-gray-800/90">
                <path d="m7.5 13a4.5 4.5 0 1 1 4.5-4.5 4.505 4.505 0 0 1 -4.5 4.5zm0-7a2.5 2.5 0 1 0 2.5 2.5 2.5 2.5 0 0 0 -2.5-2.5zm7.5 14a5.006 5.006 0 0 0 -5-5h-5a5.006 5.006 0 0 0 -5 5v4h2v-4a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v4h2zm2.5-11a4.5 4.5 0 1 1 4.5-4.5 4.505 4.505 0 0 1 -4.5 4.5zm0-7a2.5 2.5 0 1 0 2.5 2.5 2.5 2.5 0 0 0 -2.5-2.5zm6.5 14a5.006 5.006 0 0 0 -5-5h-4v2h4a3 3 0 0 1 3 3v4h2z" />
              </svg>
            </button>
            <button>
              <svg height="32" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg" className="m-2 fill-gray-800/90">
                <path d="M21.3,13.88l-.45-.26c.1-.54,.15-1.09,.15-1.63s-.05-1.08-.15-1.63l.45-.26c1.43-.82,1.93-2.66,1.11-4.1-.4-.69-1.05-1.19-1.82-1.4-.77-.21-1.58-.1-2.28,.3l-.45,.26c-.84-.72-1.81-1.28-2.86-1.65v-.52c0-1.65-1.35-3-3-3s-3,1.35-3,3v.52c-1.05,.37-2.02,.93-2.86,1.65l-.45-.26c-.69-.4-1.5-.5-2.28-.3-.77,.21-1.42,.71-1.82,1.4-.82,1.43-.33,3.27,1.1,4.1l.45,.26c-.1,.54-.15,1.09-.15,1.63s.05,1.08,.15,1.63l-.45,.26c-1.43,.82-1.93,2.66-1.11,4.1,.4,.69,1.05,1.19,1.82,1.4,.77,.21,1.58,.1,2.28-.3l.45-.26c.84,.72,1.81,1.28,2.86,1.65v.52c0,1.65,1.35,3,3,3s3-1.35,3-3v-.52c1.05-.37,2.02-.93,2.86-1.65l.45,.26c.69,.4,1.5,.51,2.28,.3,.77-.21,1.42-.71,1.82-1.4,.82-1.43,.33-3.27-1.1-4.1Zm-2.56-3.74c.17,.62,.26,1.25,.26,1.86s-.09,1.23-.26,1.86c-.12,.44,.07,.9,.47,1.13l1.09,.63c.48,.28,.64,.89,.37,1.37-.13,.23-.35,.4-.61,.47-.26,.07-.53,.04-.76-.1l-1.09-.63c-.4-.23-.89-.16-1.21,.17-.89,.91-2.01,1.56-3.25,1.88-.44,.11-.75,.51-.75,.97v1.26c0,.55-.45,1-1,1s-1-.45-1-1v-1.26c0-.46-.31-.85-.75-.97-1.24-.32-2.36-.97-3.25-1.88-.19-.2-.45-.3-.72-.3-.17,0-.34,.04-.5,.13l-1.09,.63c-.23,.13-.5,.17-.76,.1-.26-.07-.47-.24-.61-.47-.27-.48-.11-1.09,.37-1.37l1.09-.63c.4-.23,.59-.69,.47-1.13-.17-.62-.26-1.25-.26-1.86s.09-1.23,.26-1.86c.12-.44-.07-.9-.47-1.13l-1.09-.63c-.48-.28-.64-.89-.37-1.37,.13-.23,.35-.4,.61-.47,.26-.07,.53-.03,.76,.1l1.09,.63c.4,.23,.89,.16,1.21-.17,.89-.91,2.01-1.56,3.25-1.88,.44-.11,.75-.51,.75-.97v-1.26c0-.55,.45-1,1-1s1,.45,1,1v1.26c0,.46,.31,.85,.75,.97,1.24,.32,2.36,.97,3.25,1.88,.32,.33,.82,.4,1.21,.17l1.09-.63c.23-.13,.5-.17,.76-.1,.26,.07,.47,.24,.61,.47,.27,.48,.11,1.09-.37,1.37l-1.09,.63c-.4,.23-.59,.69-.47,1.13Zm-4.96-1.94l-1.6,8c-.09,.48-.51,.8-.98,.8-.06,0-.13,0-.2-.02-.54-.11-.89-.63-.78-1.18l1.6-8c.11-.54,.63-.89,1.18-.78,.54,.11,.89,.63,.78,1.18Zm-4.57,2.65l-1.21,1.21,1.21,1.19c.39,.39,.39,1.02,0,1.41-.2,.2-.45,.29-.71,.29s-.51-.1-.71-.29l-1.21-1.21c-.78-.78-.78-2.04,0-2.81l1.21-1.21c.39-.39,1.02-.39,1.41,0s.39,1.02,0,1.41Zm8.21-.2c.78,.78,.78,2.04,0,2.81l-1.21,1.21c-.2,.2-.45,.29-.71,.29s-.51-.1-.71-.29c-.39-.39-.39-1.02,0-1.41l1.21-1.21-1.21-1.2c-.39-.39-.39-1.02,0-1.41s1.02-.39,1.41,0l1.21,1.21Z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="py-2">
          {proposalsList
            ? proposalsList.map((prop, index) => (
                <div
                  key={'proposal_' + (index + 1)}
                  id={'proposal_' + (index + 1)}
                  className="m-2 p-2 grid grid-cols-3 border-2 border-solid border-green-500 rounded-lg text-xs bg-gray-300 "
                >
                  <div className="col-start-1 col-span-2">
                    <div className="flex">
                      <div className="font-bold">{prop[0]}</div>

                      <div className="pl-2">{prop[6]}</div>
                    </div>
                    <div>Start voting - {humanDate(prop[1])}</div>
                    <div>End voting - {humanDate(prop[3])}</div>
                    <div>Reward - {Web3.utils.fromWei(prop[2], 'ether')} CLO</div>
                    <div className="hidden md:block cursor-pointer" onClick={() => navigator.clipboard.writeText(prop[4])}>
                      Owner - {usersList[prop[4]] ? usersList[prop[4]].nickname : prop[4]}
                    </div>
                    <div className="md:hidden cursor-pointer" onClick={() => navigator.clipboard.writeText(prop[4])}>
                      Owner - {usersList[prop[4]] ? usersList[prop[4]].nickname : prop[4].slice(0, 8) + '...' + prop[4].slice(-6)}
                    </div>
                    <div className="hidden md:block cursor-pointer" onClick={() => navigator.clipboard.writeText(prop[9])}>
                      Contract -{' '}
                      {prop[9] == netSettings.contracts.treasury.contractAddress
                        ? 'Treasury'
                        : prop[9] == netSettings.contracts.governanceDAO.contractAddress
                        ? 'Governance DAO'
                        : prop[9]}
                    </div>
                    <div className="md:hidden cursor-pointer" onClick={() => navigator.clipboard.writeText(prop[9])}>
                      Contract -{' '}
                      {prop[9] == netSettings.contracts.treasury.contractAddress
                        ? 'Treasury'
                        : prop[9] == netSettings.contracts.governanceDAO.contractAddress
                        ? 'Governance DAO'
                        : prop[9].slice(0, 8) + '...' + prop[9].slice(-6)}
                    </div>
                    <div>Status - {statuses[prop[5]]}</div>
                  </div>
                  <div className="col-start-3 text-base">
                    <div className="mt-3 flex place-items-center">
                      <div className="mr-2 flex place-items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          version="1.1"
                          x="0px"
                          y="0px"
                          viewBox="0 0 512 512"
                          width="24"
                          height="24"
                          className="fill-green-700/90"
                        >
                          <path d="M485.379,170.88c-22.148-27.445-55.547-43.367-90.815-43.293H351.25l1.913-11.222c7.798-45.716-22.94-89.097-68.656-96.895,c-5.03-0.858-10.128-1.256-15.23-1.188c-32.056-0.167-61.464,17.761-76.001,46.332l-32.135,62.973h-44.249,C52.364,127.658,0.07,179.951,0,244.48v106.266c0.07,64.529,52.364,116.822,116.892,116.892H372.1,c55.158-0.2,102.743-38.764,114.363-92.685l22.465-106.266C516.299,234.201,507.639,198.232,485.379,170.88z M63.759,350.745V244.48,c0-29.344,23.788-53.133,53.133-53.133h31.88v212.531h-31.88C87.548,403.878,63.759,380.09,63.759,350.745z M446.549,255.489,l-22.486,106.266c-5.273,24.506-26.897,42.035-51.964,42.124H212.531V167.139l37.533-73.557c3.978-7.446,11.886-11.937,20.318-11.54,c11.174,0.007,20.227,9.072,20.22,20.246c-0.001,1.128-0.096,2.254-0.284,3.366l-14.601,85.693h118.847,c29.344-0.003,53.135,23.783,53.138,53.127C447.703,248.176,447.316,251.867,446.549,255.489L446.549,255.489z" />
                        </svg>
                        <div className="pl-2 text-[24px] font-bold text-green-700/90">{prop[7].length}</div>
                      </div>
                      <div className="mr-2 flex place-items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          version="1.1"
                          x="0px"
                          y="0px"
                          viewBox="0 0 512 512"
                          width="24"
                          height="24"
                          className="fill-red-700/90"
                        >
                          <path d="M486.715,143.036c-11.609-53.966-59.222-92.571-114.422-92.775h-255.34C52.387,50.343,0.07,102.67,0,167.235v106.321,c0.07,64.562,52.391,116.882,116.953,116.953h44.251l32.173,63.006c14.81,28.863,44.709,46.829,77.146,46.356,c46.4,0.061,84.064-37.504,84.125-83.904c0.006-4.769-0.393-9.529-1.195-14.23l-1.914-11.227h43.336,c64.591,0,116.953-52.361,116.953-116.952c0-8.132-0.848-16.243-2.531-24.199L486.715,143.036z M63.792,273.556V167.235,c0-29.36,23.801-53.16,53.16-53.16h31.896v212.641h-31.896C87.593,326.716,63.792,302.916,63.792,273.556z M436.063,307.047,c-10.077,12.471-25.262,19.703-41.295,19.669H275.859l14.608,85.737c1.047,5.875-0.6,11.909-4.487,16.437,c-4.135,4.798-10.236,7.445-16.565,7.187c-8.051,0.085-15.459-4.385-19.138-11.546l-37.637-73.51V114.075h159.651,c25.092,0.074,46.738,17.63,51.991,42.167l22.497,106.321C450.131,278.248,446.189,294.607,436.063,307.047z" />
                        </svg>
                        <div className="pl-2 text-[24px] font-bold text-red-700/90">{prop[8].length}</div>
                      </div>
                    </div>
                    <div className="ml-[4px] my-2 flex place-items-center">
                      {prop[7].map((member, index) => (
                        <div key={index} className="ml-[-8px] flex">
                          <img src={`images_tg/${usersList[member]?.nickname}.jpg`} className="border border-green-500 h-[28px] rounded-full"></img>
                        </div>
                      ))}
                      {prop[8].map((member, index) => (
                        <div key={index} className="ml-[-8px] flex">
                          <img src={`images_tg/${usersList[member]?.nickname}.jpg`} className="border border-red-500 h-[28px] rounded-full"></img>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            : ''}
        </div>
        <div className="mb-4 p-2 grid grid-cols-2 gap-4 place-items-center">
          <button className={`${proposalID < 2 ? 'hidden' : ''} col-start-1 flex place-items-center place-self-end bg-gray-500/90 shadow-inner hover:shadow-gray-300/70 py-1 px-2 rounded-md text-base text-white tracking-wide`}
          onClick={() => setProposalID(proposalID - 5)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M4.943,5.606,1.024,9.525a3.585,3.585,0,0,0,0,4.95l3.919,3.919a1.5,1.5,0,1,0,2.121-2.121L4.285,13.492l18.25-.023a1.5,1.5,0,0,0,1.5-1.5v0a1.5,1.5,0,0,0-1.5-1.5L4.3,10.492,7.064,7.727A1.5,1.5,0,0,0,4.943,5.606Z" />
            </svg>
            <div className="pl-2">Previous page</div>
          </button>
          <button className={`${proposalsList?.length < 5 ? 'hidden' : ''} col-start-2 flex place-items-center place-self-start bg-gray-500/90 shadow-inner hover:shadow-gray-300/70 py-1 px-2 rounded-md text-base text-white tracking-wide`}
          onClick={() => setProposalID(proposalID + 5)}>
            <div className="pr-2">Next page</div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19.122,18.394l3.919-3.919a3.585,3.585,0,0,0,0-4.95L19.122,5.606A1.5,1.5,0,0,0,17,7.727l2.78,2.781-18.25.023a1.5,1.5,0,0,0-1.5,1.5v0a1.5,1.5,0,0,0,1.5,1.5l18.231-.023L17,16.273a1.5,1.5,0,0,0,2.121,2.121Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
