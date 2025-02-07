import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { abi } from "./abi";

export const usePayWithUSDC = () => {
    const { writeContract, data: hash } = useWriteContract();
    
    const payWithUSDC = async (AIWalletAddress: string, amount: number) => {
        try {
            const USDCAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
            const amountInUSDCSixDecimals = amount * 1000000;

            // Send the transaction
            writeContract({
                address: USDCAddress as `0x${string}`,
                abi: abi,
                functionName: "transfer",
                args: [AIWalletAddress, amountInUSDCSixDecimals],
            });
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

    return { payWithUSDC, isConfirming, isConfirmed };
};