// @flow
import { logger, throttle } from "@rpldy/shared";
import createState from "@rpldy/simple-state";
import getChunks from "./getChunks";
import sendChunks from "./sendChunks";
import { CHUNKED_SENDER_TYPE } from "../consts";

import type { BatchItem } from "@rpldy/shared";
import type { OnProgress, SendResult } from "@rpldy/sender";
import type { TriggerMethod } from "@rpldy/life-events";
import type { MandatoryChunkedOptions, ChunkedSendOptions } from "../types";
import type { State, ChunkedState, ChunksSendResponse, Chunk } from "./types";

export const abortChunkedRequest = (chunkedState: ChunkedState, item: BatchItem) => {
    logger.debugLog(`chunkedSender: aborting chunked upload for item: ${item.id}`);

    const state = chunkedState.getState();

    if (!state.finished && !state.aborted) {
        Object.keys(state.requests)
            .forEach((chunkId) => {
                logger.debugLog(`chunkedSender: aborting chunk: ${chunkId}`);
                state.requests[chunkId].abort();
            });

        chunkedState.updateState((state) => {
			state.aborted = true;
		});
    }

    return chunkedState.getState().aborted;
};

export const process = (
	chunkedState: ChunkedState,
    item: BatchItem,
    onProgress: OnProgress,
    trigger: TriggerMethod,
): ChunksSendResponse => {
    const onChunkProgress = throttle(
        (e, chunks: Chunk[]) => {
            //we only ever send one chunk per request
            const { id } = chunks[0];

			chunkedState.updateState((state: State) => {
				state.uploaded[id] = e.loaded;
			});

			const state = chunkedState.getState();

			const loaded = Object.keys(state.uploaded)
				.reduce((res, id) =>
					res + state.uploaded[id], 0);

            onProgress({ loaded, total: item.file.size }, [item]);
        },
        100, true);

    const sendPromise = new Promise((resolve) => {
        sendChunks(chunkedState, item, onChunkProgress, resolve, trigger);
    });

    return {
        sendPromise,
        abort: () => abortChunkedRequest(chunkedState, item),
    };
};

export default (
    item: BatchItem,
    chunkedOptions: MandatoryChunkedOptions,
    url: string,
    sendOptions: ChunkedSendOptions,
    onProgress: OnProgress,
    trigger: TriggerMethod
): SendResult => {
    const chunks = getChunks(item, chunkedOptions, sendOptions.startByte);
    logger.debugLog(`chunkedSender: created ${chunks.length} chunks for: ${item.file.name}`);

    const { state, update: updateState } = createState<State>({
        finished: false,
        aborted: false,
        error: false,
        uploaded: {},
        requests: {},
        responses: [],
        chunks,
        url,
        sendOptions,
        ...chunkedOptions,
    });

    const getState = () => state;

    const getFreshChunk = (chunk: Chunk, state: State = getState()) =>
        state.chunks.find((c) => c.id === chunk.id);

    const updateChunk = (chunk: Chunk, updater) => {
        updateState((state) => {
            const fresh = getFreshChunk(chunk, state);
            updater(fresh);
        });
    };

    const chunkedState = {
        getState,
        updateState,
        getFreshChunk,
        updateChunk,
    };

    const { sendPromise, abort } = process(chunkedState, item, onProgress, trigger);

    return {
        request: sendPromise,
        abort,
        senderType: CHUNKED_SENDER_TYPE,
    };
};

