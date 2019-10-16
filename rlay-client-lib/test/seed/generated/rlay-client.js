
    const { Client } = require('../../../built/client');
    const map = new Map();

    const getClient = (config) => {
      const stringConfig = JSON.stringify(config);
      if (map.has(stringConfig)) {
        return map.get(stringConfig);
      } else {
        const client = new Client(config);
        const schemaCIDs = {"httpGeneralHeaderClassLabel":"0x019580031b200092897dee46d1b9c6d1116372e2dae58ca9217c2d2e60ba2b7e45e929eab647","httpHeaderNameClassLabel":"0x019580031b20c518008e90217fda9274cbc5a1854c4ffee0d1a6080d8a5ec6a93600dd39b32f","httpConnectionClassDescription":"0x019580031b20e1e83732791905022995dfdc79b3da2be0f44bcf6fc22dc57683f06c9e24f3aa","httpHeaderElementClassLabel":"0x019580031b2071e76679c4f84f1135f373718d2d612ee425fdcc8b042f52138a1873a1624ef8","httpGeneralHeaderClassDescription":"0x019580031b201bb9b77fb9d199e757dbd9756a8cb08c3ebb1df26d866a89e110ce1ba0bba9a5","httpConnectionClassLabel":"0x019580031b2047420b86cffade88d4a7e17b2b41c67d1ab9582bfb9db7064bf3bedf441038fc","httpHeaderNameClassDescription":"0x019580031b20961b4a6325b987c1f65c7029f9bcd333d0fa6d9a422db1fb662f532daa12a8cf","httpEntityHeaderClassLabel":"0x019580031b20bad4783460c256936592d1831be5bab84ac1af7d47653eff1ed3485fbb07d188","httpHeaderElementClassDescription":"0x019580031b2005e7bbedfeab0802b1e621a8774c07c89082ee9f1e0e67f76e8e8b2d27137dd5","httpEntityHeaderClassDescription":"0x019580031b206c88e3a64e6e0429e51580bb6fe21718d5b129a0507e53788066c25bd87d6c04","httpMessageHeaderClassLabel":"0x019580031b20b12c304417ab1386d77800245a2601fcf3fb68731886e1e4b381c58e0bb0bf46","httpParameterClassLabel":"0x019580031b209ef79db09594242fc1f709dda7971f04b2cb822a9313cd68b55ac34570d96e77","httpMessageClassLabel":"0x019580031b209e2537e34bcd8d2287f9bbbc5335ec741a619c0187825d06ca283d2a9d0bd6dc","httpRequestClassLabel":"0x019580031b20f518cd55c1ff7ea577094425cdbe569f07633fc30a88d63cd37ce12a4689d49a","httpMessageHeaderClassDescription":"0x019580031b208d2d3cb56360b90edcb50bd0fb36828cd42f4139f614b64ad9a2192b62aeda75","httpParameterClassDescription":"0x019580031b2068d99bf840be9ce7efffae7f156f50761416f1939cecbafd0b8972b47e25847b","httpMethodClassDescription":"0x019580031b20756474bc206a4a7f20088a9ec662d0776df5206b422c517eac5b11f9252937cb","httpMessageClassDescription":"0x019580031b20ee17879135dedbeb6e7e189c971a283d2376651d2f3c5cbfdc24d0ea751c8453","httpMethodClassLabel":"0x019580031b20616dd280b3981d24cd8cb918faebe01ca8aee3e6a774836a761ec621e12d95bf","httpRequestClassDescription":"0x019580031b202bcc352b50b7f1f3d6882080dae85cd77e7557433c1e59b5fc6b5847ef2dac47","httpRequestHeaderClassLabel":"0x019580031b207db7bc42e5e93fce85aef70db7f20b98f1975530eef7f2e3b55f55b4e54ef1ef","httpRequestHeaderClassDescription":"0x019580031b207949d0dc12085f8fbbec3c2378d429149bec17d9a5bc98af968f3fbf3d04359d","httpResponseClassLabel":"0x019580031b200d3acb1ed83c1fe7a3c5cadd9cf4bc5bed441bae23dedbd453611dffcd7fb926","httpStatusCodeClassDescription":"0x019580031b202d1dd5c0cb910bb33bb2f589168a74e36dfcc24794476ff0bf93f607d2597d63","httpResponseClassDescription":"0x019580031b20b0d9e4fd4cb1ce9e1755c98809ff8fad3ae3dfe2f52b47caecce10553b754889","httpStatusCodeClassLabel":"0x019580031b2034352d2f1ba21ba9a70dd75a72982e8dc2f78be06fb1b6be3e40e51d071a69be","httpResponseHeaderClassLabel":"0x019580031b20a282d6ced7f4eca240044d07168c421bb2037ade1a4eb1174d80e2b34aeb2b7f","httpResponseHeaderClassDescription":"0x019580031b20345d4ee58fc4330e594f514f03584f1cf80c5f1c7e2a57848d8ff02d57fd721a","httpAbsolutePathDataPropertyDescription":"0x019580031b20b720999ce8eef4f268e90ff9270277852ac878a4e4dd7a5f33781f7cfae9eedd","httpAbsolutePathDataPropertyLabel":"0x019580031b200cd43255852869734e6b7a337a8725b74ea2d577945448529c4477166d467fe0","httpAbsoluteURIDataPropertyLabel":"0x019580031b200cd43255852869734e6b7a337a8725b74ea2d577945448529c4477166d467fe0","httpAbsoluteURIDataPropertyDescription":"0x019580031b20b720999ce8eef4f268e90ff9270277852ac878a4e4dd7a5f33781f7cfae9eedd","httpAuthorityDataPropertyLabel":"0x019580031b200cd43255852869734e6b7a337a8725b74ea2d577945448529c4477166d467fe0","httpAuthorityDataPropertyDescription":"0x019580031b20b720999ce8eef4f268e90ff9270277852ac878a4e4dd7a5f33781f7cfae9eedd","httpBodyDataPropertyLabel":"0x019580031b208422ccdb5a48f06d6d6cff4371a6b80f1c709c6aea9a601df498a21cfa74bb2e","httpBodyDataPropertyDescription":"0x019580031b2043f0e576fcc90b937911ff645b42146e4a8d0b850dcbd2bea8e0c491c2b228bf","httpConnectionAuthorityDataPropertyLabel":"0x019580031b20032089d3806b8b3c30bc3e5ff57c4935f7d444a6273462b040dcc12d423e5d42","httpConnectionAuthorityDataPropertyDescription":"0x019580031b2038e7d3bbae1122d5252db5ae6064dd4c43a69b1bcc921df07c51075a33f3c015","httpElementNameDataPropertyLabel":"0x019580031b202451a22c148d50030caa2fe9609d9aa03968634884f12a9dc2f7759098bab88f","httpElementNameDataPropertyDescription":"0x019580031b203c6166e6e80197e02ef272598bc966d62dfc1a112531c6baf3191a077219e67c","httpElementValueDataPropertyLabel":"0x019580031b2051c7e9ae0350b81af324f9007635fd3cd858d630482f456b8fe0e0a9b2a3fff0","httpFieldNameDataPropertyLabel":"0x019580031b20f66fb3f3b760ce8c97516e0d08c7421cb67719543b09659da3bca072784f25d0","httpElementValueDataPropertyDescription":"0x019580031b203b1505b746d7445ac32848b06abaefc540cc23eb5bb91b3db1381cde3333cfae","httpFieldNameDataPropertyDescription":"0x019580031b20f04c81c12250cf4c47af7ab8965af5ed96ace27d1218458a9d0221c11d3e15bd","httpFieldValueDataPropertyLabel":"0x019580031b201d58d433c7049d475814b4a278910893c80ee71184c8e96b96d041d97bdb3a0c","httpHTTPVersionDataPropertyDescription":"0x019580031b20aa83d41401eb688025285c1c0ca3c213d22b24df04588c111c986a26cc37b36a","httpMethodNameDataPropertyLabel":"0x019580031b20a04fbddeb154205ae61d5d14dc4aac1c5f8dfc672cba6c86d0426a8bc514a4ec","httpFieldValueDataPropertyDescription":"0x019580031b205062d90235ebbec4db11db6721c42b80937bc9af3cdb0c1582c53ca92afc99c6","httpHTTPVersionDataPropertyLabel":"0x019580031b20aaacd1ec031381aa8efb5efbb83a1b3f8ecff2089ea591c8d02cf74f9b1b98cf","httpMethodNameDataPropertyDescription":"0x019580031b2055a406b499c02ec644352c20b5390bddb95629b98e8f5c07d1d49c1b4fdbc31a","httpParamNameDataPropertyLabel":"0x019580031b20a751e8ef26b836d08675aac09d4573ac4aa9e94c34cc2ac620ac5bcf751c80f8","httpParamValueDataPropertyLabel":"0x019580031b20a34dc53f0047a1b3fdb556669f3694144c1faee2e8c021ef93d566625c1befe0","httpParamNameDataPropertyDescription":"0x019580031b20f5ed78c132617752d63004ded1d939c7942d94601d4a8236901a1f31bfe843a8","httpReasonPhraseDataPropertyLabel":"0x019580031b20c66d2d93529089e778c39d2df16255f73e349f2305f3b05b091a1732513dda28","httpParamValueDataPropertyDescription":"0x019580031b208d9742c940c9fe516610ad554ca6740f7c29b6d7d97dc6b9a13d9ad377b6da9d","httpReasonPhraseDataPropertyDescription":"0x019580031b2043179251f23a9ef3d4f72ef48ecac10466c41e37c9807aa16b18b70cd9cfea4d","httpRequestURIDataPropertyDescription":"0x019580031b2004971fe7de944fcb9786c706837b4090fc9ed586d8b53c1273f3b67b913b791c","httpRequestURIDataPropertyLabel":"0x019580031b200cd43255852869734e6b7a337a8725b74ea2d577945448529c4477166d467fe0","httpStatusCodeNumberDataPropertyDescription":"0x019580031b2004c3075da60b08b39fc4e0793eb6f8f3ac601dfd24dbc101841a26364ec4e2ca","httpStatusCodeNumberDataPropertyLabel":"0x019580031b208a84efd5e5db8864096ed94ff90b30c62c7f95ccc1b5f1943a7957d44255fbfa","httpStatusCodeValueDataPropertyLabel":"0x019580031b2029591ff708e315aab6e6303c554cb6f841008d56cb87e549329b4807a73bb1a1","httpStatusCodeValueDataPropertyDescription":"0x019580031b20b5642ecec1ad094141cd070fe9194b725e8dd11a6fd09fed1c1e24213701ab47","httpHdrNameObjectPropertyLabel":"0x019580031b20c518008e90217fda9274cbc5a1854c4ffee0d1a6080d8a5ec6a93600dd39b32f","httpHeaderElementsObjectPropertyDescription":"0x019580031b201a739283ed61c66248e992dd7ce0ff6aa6af6bb74dae0f4a0775024986c84001","httpHeaderElementsObjectPropertyLabel":"0x019580031b20845e127365109f4020b3d6b93bc2d427e601916254ae562b1802c6b0921b28cc","httpHdrNameObjectPropertyDescription":"0x019580031b204c9260992dc7e540e616d0e37761feb0a3dc651c171dd170830ea6b195c43c30","httpHeadersObjectPropertyDescription":"0x019580031b20366eedd5cbaba6516959b96e47aae3c28d31c23a4b80a615de6f20a47995de8a","httpHeadersObjectPropertyLabel":"0x019580031b2086a8c0df9e4e4cc18b72dfc6d22e80f89e6b8910f3eab9dd98670394429702d3","httpMthdObjectPropertyDescription":"0x019580031b20b17643c93139996be6de9dc0b5f5813b8c99009a7e7791a2ca6bcb7224dcae0e","httpMthdObjectPropertyLabel":"0x019580031b20616dd280b3981d24cd8cb918faebe01ca8aee3e6a774836a761ec621e12d95bf","httpParamsObjectPropertyLabel":"0x019580031b20ed6e5cfa54b8f8d9b67b425073e8e7c83747cedb1de0474abb3c9ecf1516d928","httpParamsObjectPropertyDescription":"0x019580031b208ee5438176cf900bc1fd18c570d939fd9bf568402357ec72783d1b931d1ecb74","httpRequestsObjectPropertyDescription":"0x019580031b208b644901e84b1b574c7788e0c0477c1b4c647e3b2ab1e5dd512f5597d51cc009","httpRespObjectPropertyLabel":"0x019580031b200d3acb1ed83c1fe7a3c5cadd9cf4bc5bed441bae23dedbd453611dffcd7fb926","httpRequestsObjectPropertyLabel":"0x019580031b20a7bbc8bfe1f34f5d06f62d2dd967f95fb79cd9e22d25d32391eb374348f5a477","httpRespObjectPropertyDescription":"0x019580031b202cb19f359886cba9d5b64f841254c6d694b755802eedbbff7faddfd63b650ee5","httpScObjectPropertyLabel":"0x019580031b2034352d2f1ba21ba9a70dd75a72982e8dc2f78be06fb1b6be3e40e51d071a69be","httpScObjectPropertyDescription":"0x019580031b20f0f99f9dc39c0571653d835345b8e63537eb5da661ecb343e1f99546a4555491","httpMessageClass":"0x018080031b204ab5aba7f85f0ab4047234981abb407fa63790f794dac5c73591d7f1c85c1511","httpParameterClass":"0x018080031b20b7884c62dd8f67a93e16fd3aa84e8f56579e54afb2aaf5596c5472482710a281","httpConnectionClass":"0x018080031b204691534dff630c4482c3b92a7521a1138c4621af6618497bbc052136064b7333","httpRequestClass":"0x018080031b201ef3533fd70fe3eb4eb55e52918cd35626bf917a29a2041e11fbc1ee5f7111a3","httpMessageHeaderClass":"0x018080031b205a4db5ba0994ff4c4b0cf62602cb1244ae9d6f686ce4506647695734f975f7d0","httpEntityHeaderClass":"0x018080031b20294e1a2e4c2b7dbcd0f1427dc4691333eabe9749b161bbdf648c0ffe8fb93cb9","httpMethodClass":"0x018080031b2005108fe8fea80d2ca49afa497421625363834542fb7564ab420c07a37ddd61dd","httpGeneralHeaderClass":"0x018080031b20c353ffe4cd10c157e71d82111b934d4143dd6b985b230ebb32e7ddc9f575cd92","httpHeaderElementClass":"0x018080031b20a1c82eb259c0d5c6d7905f7492c0f6767789230531af6315ddb5a706bbb378fe","httpHeaderNameClass":"0x018080031b207c37273d08eaeef2781f9d5fe9488a9869989200777963babea731f0b4434af3","httpRequestHeaderClass":"0x018080031b2094c0d7d635d1977382cdc717685cd26df2f757fd6b0df2deb18e433809e00ebc","httpAbsolutePathDataProperty":"0x019480031b206a9cfaac8c40060e3e9a799df4d0788a1b7ce2f45640f962c23b36d2386b9560","httpResponseClass":"0x018080031b20fa9f4e110d87c79bb6d24a3936ecbc952779ba5570c80fcd91898ab40edee817","httpResponseHeaderClass":"0x018080031b209a3ef36ab2d7f3db397d22caefca22a26e12760df6481b0e82a0f64a923c3283","httpStatusCodeClass":"0x018080031b20aff8aab412fc8f2e52d8904f03b449e86a8b658549b63a474a6833bb2e463c60","httpBodyDataProperty":"0x019480031b20e8f3c5ac780817fc2dbf85275cb062ba0b2f18b16f0e82e6e3ad280960a73bd4","httpAbsoluteURIDataProperty":"0x019480031b206a9cfaac8c40060e3e9a799df4d0788a1b7ce2f45640f962c23b36d2386b9560","httpAuthorityDataProperty":"0x019480031b206a9cfaac8c40060e3e9a799df4d0788a1b7ce2f45640f962c23b36d2386b9560","httpConnectionAuthorityDataProperty":"0x019480031b20c456c5322dc11c36b545df28b86c96403e4a7859bdc8cbf72cf741be3e9d770f","httpElementNameDataProperty":"0x019480031b20540b82f98b20d3cc49e2caa40a1175a6ed0203fc3b3e6522931ef4ec3554adf8","httpElementValueDataProperty":"0x019480031b2080317bfc14f313166403ebcf2d83616554032b3fea50d926bfb5526074d93ac0","httpFieldValueDataProperty":"0x019480031b20111e69ba37d31cf7958edae2d0d17189297ad9d9ef26849f3b35aba9b8f51a1c","httpFieldNameDataProperty":"0x019480031b20a58eee4aea0076f2e5ee9ecdee5703f4879f91123d3aa07f3a6c7eb81df2c0aa","httpHTTPVersionDataProperty":"0x019480031b2017a6365c9cd584f783ed463f3310da440099dad825d03d470ea668de9607551e","httpParamNameDataProperty":"0x019480031b201eadedef3a4c7cceca7152d5a0f061de83b9e6bfb8d41fb9c3f3d5668fc5efeb","httpMethodNameDataProperty":"0x019480031b20da0efd91dcc26ea4f4c6a9fdcb2732b325fdbef96ca76cfaf1ae08ff6889199a","httpParamValueDataProperty":"0x019480031b20ff68e4be0e67f9218336a8a29bcb604a9cce1b2902fe005441bbd068312d772e","httpRequestURIDataProperty":"0x019480031b20da556731c7557f1245cd4d98c9dffb3758695bf1b803cf407f566421ab9f4e85","httpReasonPhraseDataProperty":"0x019480031b20865fba97375bb2f54a1441437efb7827c233d290c06db95437f568b02b8feb8c","httpStatusCodeNumberDataProperty":"0x019480031b20628b5a214b7ebc77be1152cb71ae83686cad8383342ba6dcbbd39f87e52501c7","httpStatusCodeValueDataProperty":"0x019480031b207c010ec434c0be887d2c60b68a72c9a6c858591693b20d7f249e515eb8f0c8df","httpHdrNameObjectProperty":"0x019280031b206eb7ccfcc7ea38b4ae75b9b3d9006b52b8ff322e5c9333e5a627a8e701885c32","httpHeadersObjectProperty":"0x019280031b208f18f000bbfc2a854afe3b7c2e06d489dc810cccd04b71f4c3f8b7bfc74a95b9","httpHeaderElementsObjectProperty":"0x019280031b20299684762f7a6954d38eb68f9f0f6fe61dba1ebdc7c2153a8c70ecb645a918ec","httpParamsObjectProperty":"0x019280031b20da900abd3449702db0d8150325a230da60f09742e355fb9e75ea8bd206c0f932","httpMthdObjectProperty":"0x019280031b20be39c6d883e1494d02a7399efe58e8b4a2417b563d184ad66c2f3e8246e1a1cc","httpRequestsObjectProperty":"0x019280031b2054731141737e0ebbf25db560c2f1a5e61475c71c7d77a486c0eeeb4c3eaa19f6","httpScObjectProperty":"0x019280031b20d5737b1f6127c970a5a526c787dd6989a89ea893946b357e8acff382d43daf27","httpRespObjectProperty":"0x019280031b2031bc42318aa06ecff180bde49246f880ed270ff355c775af0a96e31d2b864fed","labelAnnotationProperty":"0x019780031b20b3179194677268c88cfd1644c6a1e100729465b42846a2bf7f0bddcd07e300a9","seeAlsoAnnotationProperty":"0x019780031b2073df9fe9531a29afa7435bb4564336d0613c2f5ca550dabd9427d8d854e01de5","commentAnnotationProperty":"0x019780031b20e77fddce0bc5ecd30e3959d43d9dc36ef5448a113b7524621bac9053c02b3319"};
        const schema = [{"key":"httpConnectionClass","assertion":{"type":"Class","annotations":["0x019580031b2047420b86cffade88d4a7e17b2b41c67d1ab9582bfb9db7064bf3bedf441038fc","0x019580031b20e1e83732791905022995dfdc79b3da2be0f44bcf6fc22dc57683f06c9e24f3aa"]}},{"key":"httpEntityHeaderClass","assertion":{"type":"Class","annotations":["0x019580031b20bad4783460c256936592d1831be5bab84ac1af7d47653eff1ed3485fbb07d188","0x019580031b206c88e3a64e6e0429e51580bb6fe21718d5b129a0507e53788066c25bd87d6c04"]}},{"key":"httpGeneralHeaderClass","assertion":{"type":"Class","annotations":["0x019580031b200092897dee46d1b9c6d1116372e2dae58ca9217c2d2e60ba2b7e45e929eab647","0x019580031b201bb9b77fb9d199e757dbd9756a8cb08c3ebb1df26d866a89e110ce1ba0bba9a5"]}},{"key":"httpHeaderElementClass","assertion":{"type":"Class","annotations":["0x019580031b2071e76679c4f84f1135f373718d2d612ee425fdcc8b042f52138a1873a1624ef8","0x019580031b2005e7bbedfeab0802b1e621a8774c07c89082ee9f1e0e67f76e8e8b2d27137dd5"]}},{"key":"httpHeaderNameClass","assertion":{"type":"Class","annotations":["0x019580031b20c518008e90217fda9274cbc5a1854c4ffee0d1a6080d8a5ec6a93600dd39b32f","0x019580031b20961b4a6325b987c1f65c7029f9bcd333d0fa6d9a422db1fb662f532daa12a8cf"]}},{"key":"httpMessageClass","assertion":{"type":"Class","annotations":["0x019580031b209e2537e34bcd8d2287f9bbbc5335ec741a619c0187825d06ca283d2a9d0bd6dc","0x019580031b20ee17879135dedbeb6e7e189c971a283d2376651d2f3c5cbfdc24d0ea751c8453"]}},{"key":"httpMessageHeaderClass","assertion":{"type":"Class","annotations":["0x019580031b20b12c304417ab1386d77800245a2601fcf3fb68731886e1e4b381c58e0bb0bf46","0x019580031b208d2d3cb56360b90edcb50bd0fb36828cd42f4139f614b64ad9a2192b62aeda75"]}},{"key":"httpMethodClass","assertion":{"type":"Class","annotations":["0x019580031b20616dd280b3981d24cd8cb918faebe01ca8aee3e6a774836a761ec621e12d95bf","0x019580031b20756474bc206a4a7f20088a9ec662d0776df5206b422c517eac5b11f9252937cb"]}},{"key":"httpParameterClass","assertion":{"type":"Class","annotations":["0x019580031b209ef79db09594242fc1f709dda7971f04b2cb822a9313cd68b55ac34570d96e77","0x019580031b2068d99bf840be9ce7efffae7f156f50761416f1939cecbafd0b8972b47e25847b"]}},{"key":"httpRequestClass","assertion":{"type":"Class","annotations":["0x019580031b20f518cd55c1ff7ea577094425cdbe569f07633fc30a88d63cd37ce12a4689d49a","0x019580031b202bcc352b50b7f1f3d6882080dae85cd77e7557433c1e59b5fc6b5847ef2dac47"]}},{"key":"httpRequestHeaderClass","assertion":{"type":"Class","annotations":["0x019580031b207db7bc42e5e93fce85aef70db7f20b98f1975530eef7f2e3b55f55b4e54ef1ef","0x019580031b207949d0dc12085f8fbbec3c2378d429149bec17d9a5bc98af968f3fbf3d04359d"]}},{"key":"httpResponseClass","assertion":{"type":"Class","annotations":["0x019580031b200d3acb1ed83c1fe7a3c5cadd9cf4bc5bed441bae23dedbd453611dffcd7fb926","0x019580031b20b0d9e4fd4cb1ce9e1755c98809ff8fad3ae3dfe2f52b47caecce10553b754889"]}},{"key":"httpResponseHeaderClass","assertion":{"type":"Class","annotations":["0x019580031b20a282d6ced7f4eca240044d07168c421bb2037ade1a4eb1174d80e2b34aeb2b7f","0x019580031b20345d4ee58fc4330e594f514f03584f1cf80c5f1c7e2a57848d8ff02d57fd721a"]}},{"key":"httpStatusCodeClass","assertion":{"type":"Class","annotations":["0x019580031b2034352d2f1ba21ba9a70dd75a72982e8dc2f78be06fb1b6be3e40e51d071a69be","0x019580031b202d1dd5c0cb910bb33bb2f589168a74e36dfcc24794476ff0bf93f607d2597d63"]}},{"key":"httpAbsolutePathDataProperty","assertion":{"type":"DataProperty","annotations":["0x019580031b200cd43255852869734e6b7a337a8725b74ea2d577945448529c4477166d467fe0","0x019580031b20b720999ce8eef4f268e90ff9270277852ac878a4e4dd7a5f33781f7cfae9eedd"]}},{"key":"httpAbsoluteURIDataProperty","assertion":{"type":"DataProperty","annotations":["0x019580031b200cd43255852869734e6b7a337a8725b74ea2d577945448529c4477166d467fe0","0x019580031b20b720999ce8eef4f268e90ff9270277852ac878a4e4dd7a5f33781f7cfae9eedd"]}},{"key":"httpAuthorityDataProperty","assertion":{"type":"DataProperty","annotations":["0x019580031b200cd43255852869734e6b7a337a8725b74ea2d577945448529c4477166d467fe0","0x019580031b20b720999ce8eef4f268e90ff9270277852ac878a4e4dd7a5f33781f7cfae9eedd"]}},{"key":"httpBodyDataProperty","assertion":{"type":"DataProperty","annotations":["0x019580031b208422ccdb5a48f06d6d6cff4371a6b80f1c709c6aea9a601df498a21cfa74bb2e","0x019580031b2043f0e576fcc90b937911ff645b42146e4a8d0b850dcbd2bea8e0c491c2b228bf"]}},{"key":"httpConnectionAuthorityDataProperty","assertion":{"type":"DataProperty","annotations":["0x019580031b20032089d3806b8b3c30bc3e5ff57c4935f7d444a6273462b040dcc12d423e5d42","0x019580031b2038e7d3bbae1122d5252db5ae6064dd4c43a69b1bcc921df07c51075a33f3c015"]}},{"key":"httpElementNameDataProperty","assertion":{"type":"DataProperty","annotations":["0x019580031b202451a22c148d50030caa2fe9609d9aa03968634884f12a9dc2f7759098bab88f","0x019580031b203c6166e6e80197e02ef272598bc966d62dfc1a112531c6baf3191a077219e67c"]}},{"key":"httpElementValueDataProperty","assertion":{"type":"DataProperty","annotations":["0x019580031b2051c7e9ae0350b81af324f9007635fd3cd858d630482f456b8fe0e0a9b2a3fff0","0x019580031b203b1505b746d7445ac32848b06abaefc540cc23eb5bb91b3db1381cde3333cfae"]}},{"key":"httpFieldNameDataProperty","assertion":{"type":"DataProperty","annotations":["0x019580031b20f66fb3f3b760ce8c97516e0d08c7421cb67719543b09659da3bca072784f25d0","0x019580031b20f04c81c12250cf4c47af7ab8965af5ed96ace27d1218458a9d0221c11d3e15bd"]}},{"key":"httpFieldValueDataProperty","assertion":{"type":"DataProperty","annotations":["0x019580031b201d58d433c7049d475814b4a278910893c80ee71184c8e96b96d041d97bdb3a0c","0x019580031b205062d90235ebbec4db11db6721c42b80937bc9af3cdb0c1582c53ca92afc99c6"]}},{"key":"httpHTTPVersionDataProperty","assertion":{"type":"DataProperty","annotations":["0x019580031b20aaacd1ec031381aa8efb5efbb83a1b3f8ecff2089ea591c8d02cf74f9b1b98cf","0x019580031b20aa83d41401eb688025285c1c0ca3c213d22b24df04588c111c986a26cc37b36a"]}},{"key":"httpMethodNameDataProperty","assertion":{"type":"DataProperty","annotations":["0x019580031b20a04fbddeb154205ae61d5d14dc4aac1c5f8dfc672cba6c86d0426a8bc514a4ec","0x019580031b2055a406b499c02ec644352c20b5390bddb95629b98e8f5c07d1d49c1b4fdbc31a"]}},{"key":"httpParamNameDataProperty","assertion":{"type":"DataProperty","annotations":["0x019580031b20a751e8ef26b836d08675aac09d4573ac4aa9e94c34cc2ac620ac5bcf751c80f8","0x019580031b20f5ed78c132617752d63004ded1d939c7942d94601d4a8236901a1f31bfe843a8"]}},{"key":"httpParamValueDataProperty","assertion":{"type":"DataProperty","annotations":["0x019580031b20a34dc53f0047a1b3fdb556669f3694144c1faee2e8c021ef93d566625c1befe0","0x019580031b208d9742c940c9fe516610ad554ca6740f7c29b6d7d97dc6b9a13d9ad377b6da9d"]}},{"key":"httpReasonPhraseDataProperty","assertion":{"type":"DataProperty","annotations":["0x019580031b20c66d2d93529089e778c39d2df16255f73e349f2305f3b05b091a1732513dda28","0x019580031b2043179251f23a9ef3d4f72ef48ecac10466c41e37c9807aa16b18b70cd9cfea4d"]}},{"key":"httpRequestURIDataProperty","assertion":{"type":"DataProperty","annotations":["0x019580031b200cd43255852869734e6b7a337a8725b74ea2d577945448529c4477166d467fe0","0x019580031b2004971fe7de944fcb9786c706837b4090fc9ed586d8b53c1273f3b67b913b791c"]}},{"key":"httpStatusCodeNumberDataProperty","assertion":{"type":"DataProperty","annotations":["0x019580031b208a84efd5e5db8864096ed94ff90b30c62c7f95ccc1b5f1943a7957d44255fbfa","0x019580031b2004c3075da60b08b39fc4e0793eb6f8f3ac601dfd24dbc101841a26364ec4e2ca"]}},{"key":"httpStatusCodeValueDataProperty","assertion":{"type":"DataProperty","annotations":["0x019580031b2029591ff708e315aab6e6303c554cb6f841008d56cb87e549329b4807a73bb1a1","0x019580031b20b5642ecec1ad094141cd070fe9194b725e8dd11a6fd09fed1c1e24213701ab47"]}},{"key":"httpHdrNameObjectProperty","assertion":{"type":"ObjectProperty","annotations":["0x019580031b20c518008e90217fda9274cbc5a1854c4ffee0d1a6080d8a5ec6a93600dd39b32f","0x019580031b204c9260992dc7e540e616d0e37761feb0a3dc651c171dd170830ea6b195c43c30"]}},{"key":"httpHeaderElementsObjectProperty","assertion":{"type":"ObjectProperty","annotations":["0x019580031b20845e127365109f4020b3d6b93bc2d427e601916254ae562b1802c6b0921b28cc","0x019580031b201a739283ed61c66248e992dd7ce0ff6aa6af6bb74dae0f4a0775024986c84001"]}},{"key":"httpHeadersObjectProperty","assertion":{"type":"ObjectProperty","annotations":["0x019580031b2086a8c0df9e4e4cc18b72dfc6d22e80f89e6b8910f3eab9dd98670394429702d3","0x019580031b20366eedd5cbaba6516959b96e47aae3c28d31c23a4b80a615de6f20a47995de8a"]}},{"key":"httpMthdObjectProperty","assertion":{"type":"ObjectProperty","annotations":["0x019580031b20616dd280b3981d24cd8cb918faebe01ca8aee3e6a774836a761ec621e12d95bf","0x019580031b20b17643c93139996be6de9dc0b5f5813b8c99009a7e7791a2ca6bcb7224dcae0e"]}},{"key":"httpParamsObjectProperty","assertion":{"type":"ObjectProperty","annotations":["0x019580031b20ed6e5cfa54b8f8d9b67b425073e8e7c83747cedb1de0474abb3c9ecf1516d928","0x019580031b208ee5438176cf900bc1fd18c570d939fd9bf568402357ec72783d1b931d1ecb74"]}},{"key":"httpRequestsObjectProperty","assertion":{"type":"ObjectProperty","annotations":["0x019580031b20a7bbc8bfe1f34f5d06f62d2dd967f95fb79cd9e22d25d32391eb374348f5a477","0x019580031b208b644901e84b1b574c7788e0c0477c1b4c647e3b2ab1e5dd512f5597d51cc009"]}},{"key":"httpRespObjectProperty","assertion":{"type":"ObjectProperty","annotations":["0x019580031b200d3acb1ed83c1fe7a3c5cadd9cf4bc5bed441bae23dedbd453611dffcd7fb926","0x019580031b202cb19f359886cba9d5b64f841254c6d694b755802eedbbff7faddfd63b650ee5"]}},{"key":"httpScObjectProperty","assertion":{"type":"ObjectProperty","annotations":["0x019580031b2034352d2f1ba21ba9a70dd75a72982e8dc2f78be06fb1b6be3e40e51d071a69be","0x019580031b20f0f99f9dc39c0571653d835345b8e63537eb5da661ecb343e1f99546a4555491"]}}];

        client.initSchema(schemaCIDs, schema);
        client.initClient();

        map.set(stringConfig, client);
        return getClient(config);
      }
    }

    const t = getClient({});
    t.getClient = getClient;

    module.exports = t;
