import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Tooltip } from 'react-tooltip'
import { useClickOutside } from '../utils/useClickOutside'
import { BN } from 'bn.js'
import { netSettings } from '../dapp.config'
import { initOnboard } from '../utils/onboard'
import { useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react'
import { Web3, getUserDAO, getTotalVoting } from '../utils/interact'
import Modal from '../utils/modal'

export default function DAO() {
  // кошельки, сети и подключения
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  // const [{ chains, connectedChain, settingChain }, setChain] = useSetChain()
  const connectedWallets = useWallets()

  const [onboard, setOnboard] = useState(null)

  const [userDao, setUserDao] = useState('')
  const [totalVoting, setTotalVoting] = useState(null)

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
      if (wallet) {
        setUserDao(await getUserDAO(wallet))
      }
      setTotalVoting(await getTotalVoting())
    }
    init()
  }, [wallet])

  return (
    <div className="min-h-screen h-full w-full overflow-hidden flex flex-col items-center justify-center  bg-gradient-to-b from-gray-100 via-gray-300 to-gray-100 selection:bg-gray-300/90 selection:text-gray-900">
      <div className="bg-gray-300 h-[50px] w-full fixed top-0 z-50 grid grid-cols-6 gap-2 place-items-center">
        <div className="col-start-1 col-span-3 md:col-span-1 flex place-items-center">
          <img src="/images/Callisto_Logo.png" className="h-[32px]" />
          <div className="mx-1 font-bold text-[22px]">Callisto{'\u00A0'}DAO</div>
        </div>
        {wallet ? (
          <div className="hidden md:block col-start-4 col-span-2">
            {userDao ? (
              <div className="flex place-items-center">
                <img src={`images_tg/${userDao[4]}.jpg`} className="my-1 hidden md:block float-left h-[32px] rounded-full"></img>
                <div className="font-bold px-2">{userDao[4]}</div>
                <div className="px-3 text-[12px] grid grid-cols-2">
                  <div className="col-start-1">Total votes</div>
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
                className=" bg-gray-500/90 shadow-inner hover:shadow-gray-300/70 py-1 px-2 rounded-md text-base text-white tracking-wide"
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
                  <div className="px-3 text-[12px] grid grid-cols-2">
                    <div className="col-start-1">Total{'\u00A0'}votes</div>
                    <div className="pl-2 font-bold col-start-2">{totalVoting - Number(userDao[2])}</div>
                    <div className="col-start-1">Participated</div>
                    <div className="pl-2 font-bold col-start-2">{userDao[1]}</div>
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
    </div>
  )
}
