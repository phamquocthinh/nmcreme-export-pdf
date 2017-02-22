var PDFDocument = require('pdfkit');
var fs = require('fs');
var Promise = require('bluebird');
var program = require('commander');

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

// Connection URL 
var url = 'mongodb://localhost:27017/nmcreme';

var query = [{ _id: { $exists: true } }];
var condition = { $and: query };

program
    .version('0.0.1')
    .option('-f --from <n>', 'from number of _id', parseInt)
    .option('-t --to <n>', 'to number of _id', parseInt)
    .parse(process.argv);

var fromId = program.from;
var toId = program.to;

if (fromId) {
  query.push({ _id: { $gte: fromId } });
}

if (toId) {
  query.push({ _id: { $lte: toId } });
}

function findDocs(condition) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
     
      db.collection('datas').find(condition).sort({_id: 1}).toArray(function(err, docs) {
        resolve(docs);
      })
    });
  }).catch(function(error) {
    console.log(error);
  })
}

function cleanText(string) {
  if (string.length > 128) {
    string = string.substr(0, 127) + '...';
  }

  return string;
}

function makePDF(PDFDocument, docs) {
  var pdfDoc = new PDFDocument({
	  size: [2480, 3508]
  });

  var fileName = 'pdf/';

  docs.forEach(function(doc, index) {
    switch(index) {
      case 0:
        var string1 = cleanText(doc._id + '_' + doc.name + '_' + doc.address);

        fileName = fileName + doc._id;
        //pdfDoc.image(doc.url, 200, 200, { width: 945, height: 945 });
        pdfDoc.image('images/1.png', 200, 200, { width: 945, height: 945 });
        pdfDoc.image('images/2.png', 222, 222, { width: 900, height: 900 });
        pdfDoc.image('images/2.png', 1245, 200, { width: 945, height: 945 });
        pdfDoc.font('fonts/times.ttf').fontSize(80).text(string1, 1330, 400, {width: 800, height: 800, align: 'center'});
        break;
      case 1:
        var string2 = cleanText(doc._id + '_' + doc.name + '_' + doc.address);

        fileName = fileName + '_' + doc._id;
        //pdfDoc.image(doc.url, 200, 1245, { width: 945, height: 945 });
        pdfDoc.image('images/1.png', 200, 1245, { width: 945, height: 945 });
        pdfDoc.image('images/2.png', 222, 1267, { width: 900, height: 900 });
        pdfDoc.image('images/2.png', 1245, 1245, { width: 945, height: 945 });
        pdfDoc.font('fonts/times.ttf').fontSize(80).text(string2, 1330, 1445, {width: 800, height: 800, align: 'center'});
        break;
      case 2:
        var string3 = cleanText(doc._id + '_' + doc.name + '_' + doc.address);

        fileName = fileName + '_' + doc._id;
        //pdfDoc.image(doc.url, 200, 2290, { width: 945, height: 945 });
        pdfDoc.image('images/1.png', 200, 2290, { width: 945, height: 945 });
        pdfDoc.image('images/2.png', 222, 2312, { width: 900, height: 900 });
        pdfDoc.image('images/2.png', 1245, 2290, { width: 945, height: 945 });
        pdfDoc.font('fonts/times.ttf').fontSize(80).text(string3, 1330, 2490, {width: 800, height: 800, align: 'center'});
    }
  })

  fileName += '.pdf';
  
  pdfDoc.pipe(fs.createWriteStream(fileName));

  pdfDoc.end();
}

function print(docs) {
  return new Promise(function(resolve, reject) {
    var docsToPrint = docs.splice(0, 3);

    console.log('%s docs left...', docs.length);
    makePDF(PDFDocument, docsToPrint);

    setTimeout(function() {
      resolve();
    }, 100)
  }).then(function() {
    if (docs.length <= 0) {
      return Promise.resolve()
    }

    return print(docs);
  })
  
}

function execute() {
  return findDocs(condition)
    .then(function(docs) {
      if (!docs.length) {
        console.log('No more docs to process...');

        return Promise.resolve();
      }

      console.log('Found total %s docs', docs.length);

      return print(docs);
    })
    .then(function() {
      console.log('Finished');

      setTimeout(function() {
        process.exit();
      }, 10000)
    })
}

execute()
