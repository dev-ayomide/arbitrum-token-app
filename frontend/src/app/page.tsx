"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "../styles/globals.css";
import {
	getDefaultWallets,
	RainbowKitProvider,
	ConnectButton,
} from "@rainbow-me/rainbowkit";
import {
	configureChains,
	createConfig,
	WagmiConfig,
	useAccount,
	useContractWrite,
	useBalance,
	usePrepareContractWrite,
	useWaitForTransaction,
	useContractRead,
	useContractEvent,
} from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	AlertCircle,
	Coins,
	Send,
	ShieldCheck,
	RefreshCw,
	CreditCard,
	Clock,
	Info,
} from "lucide-react";
import "@rainbow-me/rainbowkit/styles.css";
import { config } from "dotenv";

// Load environment variables from .env file
config({ path: "./env" });

const contractAddress =
	process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const contractABI = [
	{
		name: "mint",
		type: "function",
		stateMutability: "nonpayable",
		inputs: [],
		outputs: [],
	},
	{
		name: "transfer",
		type: "function",
		stateMutability: "nonpayable",
		inputs: [
			{ name: "recipient", type: "address" },
			{ name: "amount", type: "uint256" },
		],
		outputs: [{ name: "", type: "bool" }],
	},
	{
		name: "balanceOf",
		type: "function",
		stateMutability: "view",
		inputs: [{ name: "account", type: "address" }],
		outputs: [{ name: "", type: "uint256" }],
	},
	{
		name: "approve",
		type: "function",
		stateMutability: "nonpayable",
		inputs: [
			{ name: "spender", type: "address" },
			{ name: "amount", type: "uint256" },
		],
		outputs: [{ name: "", type: "bool" }],
	},
	{
		name: "allowance",
		type: "function",
		stateMutability: "view",
		inputs: [
			{ name: "owner", type: "address" },
			{ name: "spender", type: "address" },
		],
		outputs: [{ name: "", type: "uint256" }],
	},
	{
		name: "Transfer",
		type: "event",
		inputs: [
			{ name: "from", type: "address", indexed: true },
			{ name: "to", type: "address", indexed: true },
			{ name: "value", type: "uint256" },
		],
	},
	{
		name: "Mint",
		type: "event",
		inputs: [
			{ name: "to", type: "address", indexed: true },
			{ name: "amount", type: "uint256" },
		],
	},
] as const;

const { chains, publicClient } = configureChains(
	[arbitrumSepolia],
	[publicProvider()]
);

const { connectors } = getDefaultWallets({
	appName: "Arbitrum Token App",
	projectId: process.env.NEXT_PUBLIC_PROJECT_ID || "",
	chains,
});

const wagmiConfig = createConfig({
	autoConnect: true,
	connectors,
	publicClient,
});

const queryClient = new QueryClient();

export default function ComprehensiveTokenApp() {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) return null;

	return (
		<WagmiConfig config={wagmiConfig}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider chains={chains}>
					<div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
						<Card className="w-full max-w-2xl shadow-2xl border-none">
							<CardHeader className="bg-blue-500 text-white rounded-t-lg p-6">
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="text-3xl font-bold flex items-center gap-3">
											<Coins className="w-10 h-10" />
											Token Management Hub
										</CardTitle>
										<CardDescription className="text-blue-100 mt-2">
											Comprehensive Blockchain Token Interactions
										</CardDescription>
									</div>
									<div className="flex items-center">
										<ConnectButton accountStatus="avatar" showBalance={false} />
									</div>
								</div>
							</CardHeader>
							<CardContent className="p-6">
								<FullTokenInteractions />
							</CardContent>
						</Card>
					</div>
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiConfig>
	);
}

function FullTokenInteractions() {
	const { address, isConnected } = useAccount();
	const [activeTab, setActiveTab] = useState("overview");

	// Token Interaction States
	const [recipient, setRecipient] = useState("");
	const [amount, setAmount] = useState("");
	const [spenderAddress, setSpenderAddress] = useState("");
	const [approveAmount, setApproveAmount] = useState("");

	// Transaction & Status Management
	const [txMessage, setTxMessage] = useState("");
	const [txStatus, setTxStatus] = useState<"success" | "error" | null>(null);
	const [allowanceAmount, setAllowanceAmount] = useState<string | null>(null);

	const [transactions, setTransactions] = useState<Array<{
        type: 'Transfer' | 'Mint',
        from?: string,
        to: string,
        amount: string,
        timestamp: number
	}>>([]);
	
	// Balance and Contract Hooks
	const { data: balance, refetch: refetchBalance } = useBalance({
		address,
		token: contractAddress,
	});

	// Contract Write Hooks (Mint, Transfer, Approve)
	const { config: mintConfig } = usePrepareContractWrite({
		address: contractAddress,
		abi: contractABI,
		functionName: "mint",
	});

	const {
		write: mint,
		data: mintData,
		isLoading: isMinting,
	} = useContractWrite(mintConfig);

	const { isLoading: isMintLoading } = useWaitForTransaction({
		hash: mintData?.hash,
		onSuccess: () => {
			setTxMessage("Tokens successfully minted!");
			setTxStatus("success");
			refetchBalance();
		},
	});

	const { config: transferConfig } = usePrepareContractWrite({
		address: contractAddress,
		abi: contractABI,
		functionName: "transfer",
		args:
			recipient && amount
				? [recipient as `0x${string}`, ethers.utils.parseEther(amount)]
				: undefined,
	});

	const {
		write: transfer,
		data: transferData,
		isLoading: isTransferring,
	} = useContractWrite(transferConfig);

	const { isLoading: isTransferLoading } = useWaitForTransaction({
		hash: transferData?.hash,
		onSuccess: () => {
			setTxMessage("Tokens successfully transferred!");
			setTxStatus("success");
			refetchBalance();
		},
	});

	const { config: approveConfig } = usePrepareContractWrite({
		address: contractAddress,
		abi: contractABI,
		functionName: "approve",
		args:
			spenderAddress && approveAmount
				? [
						spenderAddress as `0x${string}`,
						ethers.utils.parseEther(approveAmount),
				  ]
				: undefined,
	});

	const {
		write: approve,
		data: approveData,
		isLoading: isApproving,
	} = useContractWrite(approveConfig);

	const { isLoading: isApproveLoading } = useWaitForTransaction({
		hash: approveData?.hash,
		onSuccess: () => {
			setTxMessage("Tokens successfully approved!");
			setTxStatus("success");
			refetchBalance();
		},
	});

	const { data: allowanceData, refetch: refetchAllowance } = useContractRead({
		address: contractAddress,
		abi: contractABI,
		functionName: "allowance",
		args:
			address && spenderAddress
				? [address, spenderAddress as `0x${string}`]
				: undefined,
	});

	useEffect(() => {
		if (allowanceData) {
			setAllowanceAmount(ethers.utils.formatEther(allowanceData.toString()));
		}
	}, [allowanceData]);

	if (!isConnected)
		return (
			<div className="text-center text-gray-500 py-10">
				<Info className="mx-auto mb-4 w-12 h-12 text-blue-500" />
				<p>Please connect your wallet to interact with the token hub.</p>
			</div>
		);
	useContractEvent({
		address: contractAddress,
		abi: contractABI,
		eventName: "Transfer",
		listener(logs) {
			const newTransfers = logs.map((log) => ({
				type: "Transfer" as const,
				from: log.args.from,
				to: log.args.to,
				amount: ethers.utils.formatEther(log.args.value),
				timestamp: Date.now(),
			}));
			setTransactions((prev) => [...newTransfers, ...prev]);
		},
	});

	useContractEvent({
		address: contractAddress,
		abi: contractABI,
		eventName: "Mint",
		listener(logs) {
			const newMints = logs.map((log) => ({
				type: "Mint" as const,
				to: log.args.to,
				amount: ethers.utils.formatEther(log.args.amount),
				timestamp: Date.now(),
			}));
			setTransactions((prev) => [...newMints, ...prev]);
		},
	});	

	    const renderTransactionHistory = () => (
				<div className="space-y-2">
					<h3 className="text-lg font-semibold mb-2 flex items-center">
						<Clock className="mr-2 w-5 h-5 text-blue-600" />
						Transaction History
					</h3>
					{transactions.length === 0 ? (
						<p className="text-gray-500 text-sm">No transactions yet</p>
					) : (
						<div className="max-h-64 overflow-y-auto">
							{transactions.map((tx, index) => (
								<div
									key={index}
									className="bg-blue-50 rounded-lg p-3 mb-2 last:mb-0 hover:bg-blue-100 transition-colors"
								>
									<div className="flex justify-between items-center">
										<div>
											<p className="font-medium text-blue-800">
												{tx.type === "Transfer"
													? "Token Transfer"
													: "Token Mint"}
											</p>
											{tx.type === "Transfer" && (
												<p className="text-sm text-gray-600">
													From: {tx.from?.slice(0, 6)}...{tx.from?.slice(-4)}{" "}
													To: {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
												</p>
											)}
											{tx.type === "Mint" && (
												<p className="text-sm text-gray-600">
													To: {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
												</p>
											)}
										</div>
										<div className="text-right">
											<p className="font-bold text-green-600">
												{tx.amount} Tokens
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			);
	
	const renderTabContent = () => {
		switch (activeTab) {
			case "overview":
				return (
					<div className="space-y-4">
						<div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
							<div className="flex items-center gap-3">
								<CreditCard className="w-8 h-8 text-blue-600" />
								<div>
									<p className="text-sm text-gray-600">Total Balance</p>
									<p className="text-2xl font-bold text-blue-800">
										{balance?.formatted} {balance?.symbol}
									</p>
								</div>
							</div>
							<Button
								variant="outline"
								size="icon"
								onClick={refetchBalance}
								className="text-blue-600 hover:bg-blue-100"
							>
								<RefreshCw className="w-5 h-5" />
							</Button>
						</div>
						<div className="grid grid-cols-3 gap-4">
							{[
								{ icon: Coins, title: "Mint Tokens", value: "mint" },
								{ icon: Send, title: "Transfer", value: "transfer" },
								{ icon: ShieldCheck, title: "Approve", value: "approve" },
							].map(({ icon: Icon, title, value }) => (
								<Button
									key={value}
									variant="outline"
									className="flex flex-col h-24 justify-center items-center"
									onClick={() => setActiveTab(value)}
								>
									<Icon className="w-6 h-6 mb-2 text-blue-600" />
									<span>{title}</span>
								</Button>
							))}
						</div>
						{renderTransactionHistory()}
					</div>
				);
			case "mint":
				return (
					<div className="space-y-4">
						<Button
							onClick={() => mint?.()}
							className="w-full bg-blue-500 hover:bg-blue-600 text-white"
							disabled={!mint || isMinting || isMintLoading}
						>
							{isMinting || isMintLoading ? "Minting..." : "Mint New Tokens"}
						</Button>
					</div>
				);
			case "transfer":
				return (
					<div className="space-y-4">
						<Input
							placeholder="Recipient Address"
							value={recipient}
							onChange={(e) => setRecipient(e.target.value)}
							className="mb-2"
						/>
						<Input
							placeholder="Amount to Transfer"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
						/>
						<Button
							onClick={() => transfer?.()}
							className="w-full mt-2 bg-blue-700 hover:bg-blue-800 text-white"
							disabled={
								!transfer ||
								!recipient ||
								!amount ||
								isTransferring ||
								isTransferLoading
							}
						>
							{isTransferring || isTransferLoading
								? "Transferring..."
								: "Transfer Tokens"}
						</Button>
					</div>
				);
			case "approve":
				return (
					<div className="space-y-4">
						<Input
							placeholder="Spender Address"
							value={spenderAddress}
							onChange={(e) => setSpenderAddress(e.target.value)}
							className="mb-2"
						/>
						<Input
							placeholder="Approve Amount"
							value={approveAmount}
							onChange={(e) => setApproveAmount(e.target.value)}
						/>
						<Button
							onClick={() => approve?.()}
							className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white"
							disabled={
								!approve ||
								!spenderAddress ||
								!approveAmount ||
								isApproving ||
								isApproveLoading
							}
						>
							{isApproving || isApproveLoading
								? "Approving..."
								: "Approve Tokens"}
						</Button>
						{spenderAddress && (
							<div className="mt-2">
								<Button
									onClick={refetchAllowance}
									variant="outline"
									className="w-full text-blue-600 border-blue-600"
								>
									Check Allowance
								</Button>
								{allowanceAmount !== null && (
									<div className="p-3 bg-blue-50 rounded-lg mt-2">
										<p className="text-sm text-blue-800">
											Approved Spending: {allowanceAmount} tokens
										</p>
									</div>
								)}
							</div>
						)}
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<div>
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid grid-cols-4 bg-blue-50 mb-4">
					{["overview", "mint", "transfer", "approve"].map((tab) => (
						<TabsTrigger key={tab} value={tab} className="capitalize">
							{tab}
						</TabsTrigger>
					))}
				</TabsList>
				<TabsContent value={activeTab}>{renderTabContent()}</TabsContent>
			</Tabs>

			{txMessage && (
				<div
					className={`
                        mt-4 p-3 rounded-lg 
                        ${
													txStatus === "success"
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}
                        flex items-center gap-2
                    `}
				>
					{txStatus === "success" ? <ShieldCheck /> : <AlertCircle />}
					<p className="text-sm font-medium">{txMessage}</p>
				</div>
			)}
		</div>
	);
}
