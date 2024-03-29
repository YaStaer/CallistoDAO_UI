import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Tooltip } from 'react-tooltip'
import { useClickOutside } from '../utils/useClickOutside'
import { BN } from 'bn.js'
import { netSettings } from '../dapp.config'
import { initOnboard } from '../utils/onboard'
import { useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react'
import {
  Web3
} from '../utils/interact'
import Modal from '../utils/modal'

export default function DAO() {

  return (
    <div className="min-h-screen h-full w-full overflow-hidden flex flex-col items-center justify-center  bg-gradient-to-b from-gray-300 via-gray-100 to-gray-300 selection:bg-gray-300/90 selection:text-gray-900">
      
    </div>
  )
}
