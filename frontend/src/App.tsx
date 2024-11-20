import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const contractAddress = "0xf9303A97050358f310188C1DaD27E0751f1b961A";
const contractABI = [
  "function mint() public",
  "function transfer(address recipient, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)"
]

export default function ArbitrumTokenApp() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [balance, setBalance] = useState<string>('0')
  const [recipient, setRecipient] = useState<string>('')
  const [amount, setAmount] = useState<string>('')

  useEffect(() => {
    const init = async () => {
      if (typeof (window as any).ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider((window as any).ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, contractABI, signer)
        
        setProvider(provider)
        setSigner(signer)
        setContract(contract)

        // Check if we're connected to Arbitrum
        const network = await provider.getNetwork()
        if (network.chainId !== 42161) {
          alert('Please connect to Arbitrum network')
        }
      } else {
        alert('Please install MetaMask!')
      }
    }

    init()
  }, [])

  const connectWallet = async () => {
    if (provider) {
      await provider.send("eth_requestAccounts", [])
      updateBalance()
    }
  }

  const updateBalance = async () => {
    if (contract && signer) {
      const address = await signer.getAddress()
      const balance = await contract.balanceOf(address)
      setBalance(ethers.utils.formatEther(balance))
    }
  }

  const mintTokens = async () => {
    if (contract) {
      try {
        const tx = await contract.mint()
        await tx.wait()
        updateBalance()
      } catch (error) {
        console.error('Error minting tokens:', error)
      }
    }
  }

  const transferTokens = async () => {
    if (contract && recipient && amount) {
      try {
        const tx = await contract.transfer(recipient, ethers.utils.parseEther(amount))
        await tx.wait()
        updateBalance()
        setRecipient('')
        setAmount('')
      } catch (error) {
        console.error('Error transferring tokens:', error)
      }
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Arbitrum Token App</CardTitle>
        <CardDescription>Interact with your ArbitrumToken contract</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={connectWallet} className="w-full mb-4">Connect Wallet</Button>
        <p className="mb-4">Balance: {balance} ARBT</p>
        <Button onClick={mintTokens} className="w-full mb-4">Mint Tokens</Button>
        <Input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="mb-2"
        />
        <Input
          type="text"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mb-2"
        />
      </CardContent>
      <CardFooter>
        <Button onClick={transferTokens} className="w-full">Transfer Tokens</Button>
      </CardFooter>
    </Card>
  )
}