module.exports = {
  version: "2",
  imports: {
    ...require("./with_import-import.json")
  },
  entities: {
    classAssertRef2: {
      type: "ClassAssertion",
      subject: "*indRef",
      class: "*classRef"
    }
  }
};
