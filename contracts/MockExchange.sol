// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MockExchange is Ownable, ReentrancyGuard {
    // Struct to store exchange rate information
    struct ExchangeRate {
        uint256 amountA; // Amount of token A
        uint256 amountB; // Amount of token B
        bool exists;
    }

    struct SwapOrder {
        address tokenFrom;
        address tokenTo;
        uint256 amountFrom;
    }

    // Mapping to store exchange rates between token pairs
    mapping(address => mapping(address => ExchangeRate)) public exchangeRates;

    // Events
    event RateSet(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    );
    event TokensSwapped(
        address indexed user,
        address tokenFrom,
        address tokenTo,
        uint256 amountFrom,
        uint256 amountTo
    );

    constructor() Ownable(msg.sender) {}

    // Set exchange rate between two tokens
    function setExchangeRate(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) external onlyOwner {
        require(
            tokenA != address(0) && tokenB != address(0),
            "Invalid token address"
        );
        require(amountA > 0 && amountB > 0, "Amounts must be greater than 0");

        exchangeRates[tokenA][tokenB] = ExchangeRate(amountA, amountB, true);
        // Set reverse rate as well
        exchangeRates[tokenB][tokenA] = ExchangeRate(amountB, amountA, true);

        emit RateSet(tokenA, tokenB, amountA, amountB);
        emit RateSet(tokenB, tokenA, amountB, amountA);
    }

    // Calculate how much tokenB you get for a given amount of tokenA
    function getExchangeAmount(
        address tokenFrom,
        address tokenTo,
        uint256 amountFrom
    ) public view returns (uint256) {
        ExchangeRate memory rate = exchangeRates[tokenFrom][tokenTo];
        require(rate.exists, "Exchange rate not set");

        // Calculate: (amountFrom * rateB) / rateA
        return (amountFrom * rate.amountB) / rate.amountA;
    }

    // Batch swap tokens
    function batchSwap(SwapOrder[] calldata orders) external nonReentrant {
        uint256 orderCount = orders.length;
        require(orderCount > 0, "No swap orders provided");

        // for loop each order
        for (uint256 i = 0; i < orderCount; i++) {
            SwapOrder calldata order = orders[i];
            require(
                order.amountFrom > 0,
                "Order: amount must be greater than 0"
            );

            uint256 amountTo = getExchangeAmount(
                order.tokenFrom,
                order.tokenTo,
                order.amountFrom
            );
            require(amountTo > 0, "Order: invalid exchange amount");

            // Transfer tokens from user to contract 
            IERC20(order.tokenFrom).transferFrom(
                msg.sender,
                address(this),
                order.amountFrom
            );
            // Transfer swapped tokens from contract to user
            IERC20(order.tokenTo).transfer(msg.sender, amountTo);

            emit TokensSwapped(
                msg.sender,
                order.tokenFrom,
                order.tokenTo,
                order.amountFrom,
                amountTo
            );
        }
    }

    // Allow owner to withdraw tokens (in case of emergency or rebalancing)
    function withdrawTokens(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).transfer(to, amount);
    }
}
