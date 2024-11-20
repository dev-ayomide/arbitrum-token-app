// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArbitrumToken is ERC20, Ownable {
    uint256 public constant TOKENS_PER_MINT = 100 * 10**18; // 100 tokens

    constructor() ERC20("ArbitrumToken", "ARBT") Ownable(msg.sender) {}

    function mint() public {
        _mint(msg.sender, TOKENS_PER_MINT);
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        return super.transfer(recipient, amount);
    }
}