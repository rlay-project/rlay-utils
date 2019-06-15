module.exports = {
  version: "2",
  entities: {
    classAssertRef: {
      type: "ClassAssertion",
      subject: "*indRef",
      class: "*classRef"
    },
    classRef: {
      type: "Class"
    },
    indRef: {
      type: "Individual"
    }
  }
};
