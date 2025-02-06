import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from "viem";

export const usePayWithETH = () => {
    const { sendTransaction, data: hash } = useSendTransaction();
    
    const payWithETH = async (AIWalletAddress: string, amount: number) => {
        try {
            console.log('in payWithETH file, AIWalletAddress:', AIWalletAddress);
            console.log('in payWithETH file, amount:', amount);
            // Convert USDC to ETH amount
            const amountInETH = amount * 0.001;

            // Send the transaction
            sendTransaction({
                to: AIWalletAddress as `0x${string}`,
                value: parseEther(amountInETH.toString()),
            });
            console.log('after sending transaction, hash:', hash);
            return hash;
        } catch (error) {
            console.error('Error in USDC transfer:', error);
            throw error;
        }
    };

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

    return { payWithETH, isConfirming, isConfirmed };
};