import { interceptWithHandler } from "../intercept";
import { interceptFormData } from "cypress-intercept-formdata";
import uploadFile from "../uploadFile";

describe("ChunkedUploady - Abort and continue", () => {
    const fileName = "flower.jpg",
        abortedFileName = "aborted.jpg";

    before(() => {
        cy.visitStory("chunkedUploady", "with-abort-button&knob-destination_Upload Destination=url&knob-upload url_Upload Destination=http://test.upload/url&knob-chunk size (bytes)_Upload Settings=50000");
    });

    it("should be able to upload again after abort", () => {
        let abortedRequests = 0;

        interceptWithHandler((req) => {
            const formData = interceptFormData(req);

            if (formData["file"] === abortedFileName) {
                abortedRequests += 1;
            }

            req.reply(200, { success: true });
        });

        uploadFile(fileName, () => {
            cy.wait(100);
            cy.get("button[data-test='abort-batch-0']")
                .click();

            cy.wait(500);

            cy.storyLog().assertLogPattern(/BATCH_ABORT/);
            cy.storyLog().assertLogPattern(/ITEM_ABORT/);

            for (let i = 0; i < (abortedRequests); i++) {
                cy.wait("@uploadReq");
            }

            uploadFile(fileName, () => {

                cy.wait(1000);

                cy.storyLog().assertFileItemStartFinish(fileName, 5);

                let uniqueHeader;

                cy.wait("@uploadReq")
                    .then(({ request }) => {
                        const headers = request.headers;
                        uniqueHeader = headers["x-unique-upload-id"];

                        expect(uniqueHeader)
                            .to.match(/rpldy-chunked-uploader-/);

                        expect(headers["content-range"])
                            .to.match(/bytes 0-49999\//, `aborted upload made: ${abortedRequests} requests`);
                    });

                cy.wait("@uploadReq")
                    .then((xhr) => {
                        expect(uniqueHeader).to.be.ok;
                        expect(xhr.request.headers["x-unique-upload-id"]).to.equal(uniqueHeader);

                        expect(xhr.request.headers["content-range"])
                            .to.match(/bytes 50000-\d+\//);
                    });
            }, "#upload-button");
        }, "#upload-button", { fileName: abortedFileName });
    });
});
