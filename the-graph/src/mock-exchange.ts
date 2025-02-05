import {
  OwnershipTransferred as OwnershipTransferredEvent,
  RateSet as RateSetEvent,
  TokensSwapped as TokensSwappedEvent
} from "../generated/MOCK_Exchange/MOCK_Exchange"
import {
  OwnershipTransferred,
  RateSet,
  TokensSwapped
} from "../generated/schema"

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRateSet(event: RateSetEvent): void {
  let entity = new RateSet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenA = event.params.tokenA
  entity.tokenB = event.params.tokenB
  entity.amountA = event.params.amountA
  entity.amountB = event.params.amountB

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokensSwapped(event: TokensSwappedEvent): void {
  let entity = new TokensSwapped(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.user = event.params.user
  entity.tokenFrom = event.params.tokenFrom
  entity.tokenTo = event.params.tokenTo
  entity.amountFrom = event.params.amountFrom
  entity.amountTo = event.params.amountTo

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
