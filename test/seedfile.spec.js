const assert = require("assert");

const {
  calculateEntityTreeReferences,
  sortByDependencyCount
} = require("../src/commands/seed/utils");

describe("Seed Utils", () => {
  describe("calculateEntityTreeReferences", () => {
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

  describe("sortByDependencyCount", () => {
    it("should sort a few entities correctly", () => {
      const entities = [
        {
          type: "ClassAssertion",
          annotations: [
            "0x1111111111111111111111111111111111111111111111111111111111111111111111111111"
          ],
          subject:
            "0x019680031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
          class:
            "0x018080031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
        },
        {
          type: "Class"
        },
        {
          type: "ClassAssertion",
          subject:
            "0x019680031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
          class:
            "0x018080031b20c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
        },
        {
          type: "Individual"
        }
      ];

      const sortedEntities = sortByDependencyCount(entities);
      assert.equal(sortedEntities[0].type, "Class");
      assert.equal(sortedEntities[1].type, "Individual");
      assert.equal(sortedEntities[2].type, "ClassAssertion");
      assert.equal(sortedEntities[3].type, "ClassAssertion");
      assert.equal(
        sortedEntities[3].annotations[0],
        "0x1111111111111111111111111111111111111111111111111111111111111111111111111111"
      );
    });
  });
});
