// @flow
import { FILE_STATES, logger } from "@rpldy/shared";
import ChunkedSendError from "./ChunkedSendError";
import handleChunkRequest from "./handleChunkRequest";
import getChunksToSend from "./getChunksToSend";
import sendChunk from "./sendChunk";

import type { BatchItem } from "@rpldy/shared";
import type { OnProgress } from "@rpldy/sender";
import type { TriggerMethod } from "@rpldy/life-events";
import type { Chunk, ChunkedState } from "./types";

const resolveOnError = (resolve, ex) => {
    if (ex instanceof ChunkedSendError) {
        resolve({
            state: FILE_STATES.ERROR,
            response: "At least one chunk failed",
        });
    } else {
        resolve({
            state: FILE_STATES.ERROR,
            response: ex.message,
        });
    }
};

const resolveOnAllChunksFinished = (chunkedState: ChunkedState, item: BatchItem, resolve): boolean => {
	const state = chunkedState.getState(),
		finished = !state.chunks.length;

	if (finished && !state.error) {
		chunkedState.updateState((state) => {
			state.finished = true;
		});

		logger.debugLog(`chunkedSender: chunked upload finished for item: ${item.id}`, state.responses);

        resolve({
            state: FILE_STATES.FINISHED,
            response: state.responses,
        });
    }

    return finished || state.error;
};

export const handleChunk = async (
	chunkedState: ChunkedState,
	item: BatchItem,
	onProgress: OnProgress,
	resolve: (any) => void,
	chunk: Chunk,
	trigger: TriggerMethod
) => {
	const chunkSendResult = sendChunk(chunk, chunkedState, item, onProgress, trigger);
	await handleChunkRequest(chunkedState, item, chunk.id, chunkSendResult, trigger);

	if (!resolveOnAllChunksFinished(chunkedState, item, resolve)) {
		//not finished - continue sending remaining chunks
		sendChunks(chunkedState, item, onProgress, resolve, trigger);
	}
};

const sendChunks = async (
    chunkedState: ChunkedState,
    item: BatchItem,
    onProgress: OnProgress,
    resolve: (any) => void,
    trigger: TriggerMethod,
) => {
	const state = chunkedState.getState();

	if (!state.finished && !state.aborted) {
		const inProgress = Object.keys(state.requests).length;

        if (!inProgress ||
            (state.parallel && state.parallel > inProgress)) {

            let chunks;

            try {
                chunks = getChunksToSend(state);
            } catch (ex) {
                resolveOnError(resolve, ex);
            }

            if (chunks) {
                chunks.forEach((chunk) => {
                    handleChunk(chunkedState, item, onProgress, resolve, chunk, trigger)
                        .catch((ex) => {
							chunkedState.updateState((state) => {
								state.error = true;
							});

							resolveOnError(resolve, ex);
                        });
                });
            }
        }
    }
};

export default sendChunks;
