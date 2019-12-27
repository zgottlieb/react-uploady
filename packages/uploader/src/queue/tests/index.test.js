
describe("queue tests", () => {
	const mockProcessNext = jest.fn();

	jest.doMock("../processQueueNext", () => mockProcessNext);

	const createQueue = require("../").default;

	it("should initialize and add uploads", () => {

		let senderOnHandler;

		const mockSenderOn = (name, handler) => {
			senderOnHandler = handler;
		};

		const trigger = ()=> {},
			cancellable = ()=>{},
		sender = {on: mockSenderOn};

		const queue = createQueue({destination: "foo"}, cancellable, trigger, sender);

		const batch = {items: [{id: "u1"}, {id: "u2"}]},
			batchOptions = {concurrent: true};

		queue.uploadBatch(batch, batchOptions);

		expect(mockProcessNext).toHaveBeenCalled();

		const queueState = mockProcessNext.mock.calls[0][0];

		expect(queueState.trigger).toBe(trigger);
		expect(queueState.cancellable).toBe(cancellable);
		expect(queueState.getOptions().destination).toBe("foo");

		const state = queueState.getState();

		expect(state.itemQueue).toEqual(["u1", "u2"]);

		expect(state.items["u1"]).toBe(batch.items[0]);
		expect(state.items["u2"]).toBe(batch.items[1]);

		senderOnHandler({id: "u1"}, 20, 1000);

		const state2 = queueState.getState();
		expect(state2.items["u1"].loaded).toBe(1000);
		expect(state2.items["u1"].completed).toBe(20);

	});


});