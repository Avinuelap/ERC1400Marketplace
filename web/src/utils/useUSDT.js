import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

export function useUSDT(contractAddress, contractAbi) {
    const [usdtContract, setUsdtContract] = useState(null);
    useEffect(() => {
        if (!contractAddress || !contractAbi) return;
        if (typeof window.ethereum !== 'undefined') {
            const provider = new Web3Provider(window.ethereum, "any");
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);
            setUsdtContract(contract);
        } else {
            alert('No ethereum provider found. Please install metamask!');
        }
    }, [contractAddress, contractAbi]);

    return { usdtContract };
}