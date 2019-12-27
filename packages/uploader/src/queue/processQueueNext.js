// @flow

//TODO: NEED TO REMOVE THE ABORT method from the batch items

import { logger } from "@rpldy/shared";
import processBatchItems from "./processBatchItems";
import {
	getBatchDataFromItemId,
	isNewBatchStarting,
	cancelBatchForItem,
	loadNewBatchForItem,
	isItemBelongsToBatch,
} from "./batchHelpers";

import type { QueueState } from "./types";

const isItemInActiveRequest = (queue: QueueState, itemId: string): boolean => {
	return !!~queue.getState().activeIds
		// $FlowFixMe - no flat
		.flat().indexOf(itemId);
};

const findNextNotActiveItemIndex = (queue: QueueState): number => {
	const itemQueue = queue.getState().itemQueue;
	let index = 0,
		nextId = itemQueue[index];

	while (nextId && isItemInActiveRequest(queue, nextId)) {
		index += 1;
		nextId = itemQueue[index];
	}

	return nextId ? index : -1;
};

export const getNextIdGroup = (queue: QueueState): ?string[] => {
	const itemQueue = queue.getState().itemQueue;
	const nextItemIndex = findNextNotActiveItemIndex(queue);
	let nextId = itemQueue[nextItemIndex],
		nextGroup;

	if (nextId) {
		const batchData = getBatchDataFromItemId(queue, nextId),
			batchId = batchData.batch.id,
			groupMax = batchData.batchOptions.maxGroupSize || 0;

		if (batchData.batchOptions.grouped && groupMax > 1) {
			nextGroup = [];
			let nextBelongsToSameBatch = true;

			//dont group files from different batches
			while (nextGroup.length < groupMax && nextBelongsToSameBatch) {
				nextGroup.push(nextId);
				nextId = itemQueue[nextItemIndex + nextGroup.length];
				nextBelongsToSameBatch = nextId &&
					isItemBelongsToBatch(queue, nextId, batchId);
			}
		} else {
			nextGroup = [nextId];
		}
	}

	return nextGroup;
};

const processNext = async (queue: QueueState) => {
	console.log("!!!!!!!!!! process next - ENTER");
	const ids = getNextIdGroup(queue);

	if (ids) {
		const currentCount = queue.getCurrentActiveCount();
		console.log("!!!!!!!!!! process next - count", currentCount);
		logger.debugLog("uploady.uploader.processor: Processing next upload - ", {
			ids,
			state: queue.getState(),
			currentCount,
		});

		const { concurrent = 0, maxConcurrent = 0 } = queue.getOptions();

		if (!currentCount || (concurrent && currentCount < maxConcurrent)) {
			let cancelled = false;
			console.log("!!!!!!!!!! process next - concurrent", concurrent);
			if (isNewBatchStarting(queue, ids[0])) {
				console.log("!!!!!!!!!! process next", ids);
				const allowBatch = await loadNewBatchForItem(queue, ids[0]);
				console.log("!!!!!!!!!! process next 2", ids);
				cancelled = !allowBatch;

				if (cancelled) {
					cancelBatchForItem(queue, ids[0]);
					processNext(queue);
				}
			}

			if (!cancelled) {
				processBatchItems(queue, ids, processNext);
			}
		}
	}
};

export default processNext;