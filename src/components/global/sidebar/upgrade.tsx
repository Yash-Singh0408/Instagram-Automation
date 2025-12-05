import React from 'react'
import PaymentButton from '../payment-button'

type Props = {}

const UpgradeCard = (props: Props) => {
  return (
    <div className='bg-[#252525] p-3 rounded-2xl flex flex-col gap-y-3'>
        <span className='text-sm'>
            Upgrade to {''}
            <span className='bg-gradient-to-r 
            from-[#974476] via-[#2d3ac8] to-[#1771a6] 
            bg-clip-text 
            text-transparent
            font-bold'>
                Smart AI Plan
                </span>  
        </span>
        <p className='text-[#9B9CA0] font-light text-sm'>
            Unlock advanced AI features<br /> Including AI and more.
        </p>
        <PaymentButton />
    </div>
  )
}

export default UpgradeCard