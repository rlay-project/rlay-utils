module.exports = {
  cids: {
    'httpConnectionClass': '0x01',
    'httpEntityHeaderClass': '0x02'
  },
  schema: [
    {
      "file":"http",
      "key":"httpConnectionClass",
      "assertion":{
        "type":"Class",
        "annotations":["*httpConnectionClassLabel","*httpConnectionClassDescription"]
      }
    },
    {
      "file":"http",
      "key":"httpEntityHeaderClass",
      "assertion":{
        "type":"Class",
        "annotations":["*httpEntityHeaderClassLabel","*httpEntityHeaderClassDescription"]
      }
    }
  ],
};
