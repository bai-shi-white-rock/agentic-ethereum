import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { baseSepolia } from '@reown/appkit/networks'
import { getCsrfToken, signIn, signOut, getSession } from 'next-auth/react'
import type { SIWEVerifyMessageArgs, SIWECreateMessageArgs, SIWESession } from '@reown/appkit-siwe'
import { createSIWEConfig, formatMessage } from '@reown/appkit-siwe'
import { createAppKit } from '@reown/appkit/react' 

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks = [baseSepolia]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig


export const siweConfig = createSIWEConfig({
    getMessageParams: async () => ({
      domain: typeof window !== 'undefined' ? window.location.host : '',
      uri: typeof window !== 'undefined' ? window.location.origin : '',
      chains: [baseSepolia.id],
      statement: 'Please sign with your account'
    }),
    createMessage: ({ address, ...args }: SIWECreateMessageArgs) => formatMessage(args, address),
    getNonce: async () => {
      const nonce = await getCsrfToken()
      if (!nonce) {
        throw new Error('Failed to get nonce!')
      }
  
      return nonce
    },
    getSession: async () => {
      const session = await getSession();
      if (!session) {
        return null;
      }
      
      // Validate address and chainId types
      if (typeof session.address !== "string" || typeof session.chainId !== "number") {
        return null;
      }
  
      return { address: session.address, chainId: session.chainId } satisfies SIWESession;
    },
    verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs) => {
      try {
        const success = await signIn('credentials', {
          message,
          redirect: false,
          signature,
          callbackUrl: '/protected'
        })
  
        return Boolean(success?.ok)
      } catch (error) {
        console.error(error)
        return false
      }
    },
    signOut: async () => {
      try {
        await signOut({
          redirect: false
        })
  
        return true
      } catch (error) {
        console.error(error)
        return false
      }
    }
  })

  // Set up metadata
const metadata = {
    name: 'Bai Shi',
    description: 'Your personal investment agent',
    url: 'https://reown.com/appkit', // origin must match your domain & subdomain
    icons: ['https://assets.reown.com/reown-profile-pic.png']
  }

  // Pass your siweConfig inside the createAppKit() function
  const modal = createAppKit({
    adapters: [wagmiAdapter], //or your Ethers adapter
    projectId,
    networks: [baseSepolia],
    defaultNetwork: baseSepolia,
    metadata: metadata,
    features: {
      analytics: true, // Optional - defaults to your Cloud configuration
    },
    siweConfig: siweConfig // pass your siweConfig
})

export default modal