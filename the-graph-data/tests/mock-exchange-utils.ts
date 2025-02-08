import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  OwnershipTransferred,
  RateSet,
  TokensSwapped
} from "../generated/MockExchange/MockExchange"

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createRateSetEvent(
  tokenA: Address,
  tokenB: Address,
  amountA: BigInt,
  amountB: BigInt
): RateSet {
  let rateSetEvent = changetype<RateSet>(newMockEvent())

  rateSetEvent.parameters = new Array()

  rateSetEvent.parameters.push(
    new ethereum.EventParam("tokenA", ethereum.Value.fromAddress(tokenA))
  )
  rateSetEvent.parameters.push(
    new ethereum.EventParam("tokenB", ethereum.Value.fromAddress(tokenB))
  )
  rateSetEvent.parameters.push(
    new ethereum.EventParam(
      "amountA",
      ethereum.Value.fromUnsignedBigInt(amountA)
    )
  )
  rateSetEvent.parameters.push(
    new ethereum.EventParam(
      "amountB",
      ethereum.Value.fromUnsignedBigInt(amountB)
    )
  )

  return rateSetEvent
}

export function createTokensSwappedEvent(
  user: Address,
  tokenFrom: Address,
  tokenTo: Address,
  amountFrom: BigInt,
  amountTo: BigInt
): TokensSwapped {
  let tokensSwappedEvent = changetype<TokensSwapped>(newMockEvent())

  tokensSwappedEvent.parameters = new Array()

  tokensSwappedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  tokensSwappedEvent.parameters.push(
    new ethereum.EventParam("tokenFrom", ethereum.Value.fromAddress(tokenFrom))
  )
  tokensSwappedEvent.parameters.push(
    new ethereum.EventParam("tokenTo", ethereum.Value.fromAddress(tokenTo))
  )
  tokensSwappedEvent.parameters.push(
    new ethereum.EventParam(
      "amountFrom",
      ethereum.Value.fromUnsignedBigInt(amountFrom)
    )
  )
  tokensSwappedEvent.parameters.push(
    new ethereum.EventParam(
      "amountTo",
      ethereum.Value.fromUnsignedBigInt(amountTo)
    )
  )

  return tokensSwappedEvent
}
