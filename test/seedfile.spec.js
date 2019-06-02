const assert = require("assert");

const { calculateEntityTreeReferences } = require("../src/commands/seed/utils");

describe("Seed Utils", () => {
  it("should not modify tree without references", () => {
    const entityTree = {
      classRef: {
        type: "Class"
      },
      indRef: {
        type: "Individual"
      }
    };

    const calculatedTree = calculateEntityTreeReferences(entityTree);
    assert.deepEqual(calculatedTree["classRef"], {
      type: "Class"
    });
    assert.deepEqual(calculatedTree["indRef"], {
      type: "Individual"
    });
  });

  it("should calculate a simple reference CID correctly", () => {
    const entityTree = {
      classRef: {
        type: "Class"
      },
      indRef: {
        type: "Individual"
      },
      classAssertRef: {
        type: "ClassAssertion",
        subject: "*indRef",
        class: "*classRef"
      }
    };

    const calculatedTree = calculateEntityTreeReferences(entityTree);
    assert.deepEqual(calculatedTree["classRef"], entityTree["classRef"]);
    assert.deepEqual(calculatedTree["indRef"], entityTree["indRef"]);
    assert.deepEqual(calculatedTree["classAssertRef"], {
      type: "ClassAssertion",
      subject:
        "0x019680031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
      class:
        "0x018080031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
    });
  });
});
