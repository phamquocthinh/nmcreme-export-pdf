const PDFDocument = require('pdfkit');
const fs = require('fs');
const Promise = require('bluebird');
const program = require('commander');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL 
const url = 'mongodb://localhost:27017/nmcreme';
const imageDirectory = '/home/niveacreme/NW/public';

const query = [{ _id: { $exists: true } }];
const condition = { $and: query };

program
    .version('0.0.1')
    .option('-f --from <n>', 'from number of _id', parseInt)
    .option('-t --to <n>', 'to number of _id', parseInt)
    .parse(process.argv);

const fromId = program.from;
const toId = program.to;

if (fromId) {
    query.push({ _id: { $gte: fromId } });
}

if (toId) {
    query.push({ _id: { $lte: toId } });
}

const findDocs = (condition) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, db) => {
            assert.equal(null, err);

            db.collection('datas').find(condition).sort({ _id: 1 }).toArray((err, docs) => {
                resolve(docs);
            })
        });
    }).catch((error) => {
        console.log(error);
    })
}

const cleanText = (string) => {
    if (string.length > 128) {
        string = string.substr(0, 127) + '...';
    }

    return string;
}

const makePDF = (PDFDocument, docs) => {
    let pdfDoc = new PDFDocument({
        size: [2480, 3508]
    });

    let fileName = 'pdf/';

    docs.forEach((doc, index) => {
        switch (index) {
            case 0:
                let string1 = cleanText(doc._id + '_' + doc.name + '_' + doc.address);

                fileName = fileName + doc._id;

                try {
                    pdfDoc.image(imageDirectory + doc.url, 200, 200, { width: 945, height: 945 });
                    pdfDoc.image('images/1.png', 200, 200, { width: 945, height: 945 });
                    pdfDoc.image('images/2.png', 222, 222, { width: 900, height: 900 });
                    pdfDoc.image('images/2.png', 1245, 200, { width: 945, height: 945 });
                    pdfDoc.font('fonts/times.ttf').fontSize(80).text(string1, 1330, 400, { width: 800, height: 800, align: 'center' });
                } catch (err) {
                    console.log(err);
                }

                break;
            case 1:
                let string2 = cleanText(doc._id + '_' + doc.name + '_' + doc.address);

                fileName = fileName + '_' + doc._id;

                try {
                    pdfDoc.image(imageDirectory + doc.url, 200, 1245, { width: 945, height: 945 });
                    pdfDoc.image('images/1.png', 200, 1245, { width: 945, height: 945 });
                    pdfDoc.image('images/2.png', 222, 1267, { width: 900, height: 900 });
                    pdfDoc.image('images/2.png', 1245, 1245, { width: 945, height: 945 });
                    pdfDoc.font('fonts/times.ttf').fontSize(80).text(string2, 1330, 1445, { width: 800, height: 800, align: 'center' });
                } catch (err) {
                    console.log(err);
                }

                break;
            case 2:
                let string3 = cleanText(doc._id + '_' + doc.name + '_' + doc.address);

                fileName = fileName + '_' + doc._id;

                try {
                    pdfDoc.image(imageDirectory + doc.url, 200, 2290, { width: 945, height: 945 });
                    pdfDoc.image('images/1.png', 200, 2290, { width: 945, height: 945 });
                    pdfDoc.image('images/2.png', 222, 2312, { width: 900, height: 900 });
                    pdfDoc.image('images/2.png', 1245, 2290, { width: 945, height: 945 });
                    pdfDoc.font('fonts/times.ttf').fontSize(80).text(string3, 1330, 2490, { width: 800, height: 800, align: 'center' });
                } catch (err) {
                    console.log(err);
                }

                break;
            default:
                break;
        }
    })

    fileName += '.pdf';

    pdfDoc.pipe(fs.createWriteStream(fileName));

    pdfDoc.end();
}

const print = (docs) => {
    return new Promise((resolve, reject) => {
        let docsToPrint = docs.splice(0, 3);

        console.log('%s docs left...', docs.length);
        makePDF(PDFDocument, docsToPrint);

        setTimeout(() => {
            resolve();
        }, 100)
    }).then(() => {
        if (docs.length <= 0) {
            return Promise.resolve()
        }

        return print(docs);
    })
}

const execute = () => {
    return findDocs(condition)
        .then((docs) => {
            if (!docs.length) {
                console.log('No more docs to process...');

                return Promise.resolve();
            }

            console.log('Found total %s docs', docs.length);

            return print(docs);
        })
        .then(() => {
            console.log('Finished');

            setTimeout(() => {
                process.exit();
            }, 10000)
        })
}

execute()
