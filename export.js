const PDFDocument = require('pdfkit');
const fs = require('fs');
const Promise = require('bluebird');
const program = require('commander');
const moment = require('moment');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL 
const url = 'mongodb://localhost:27017/nmcreme';
const imageDirectory = '/home/niveacreme/NW/public';

let query = [{ _id: { $exists: true } }];
let condition = { $and: query };

program
    .version('0.0.1')
    .option('-f --from <n>', 'from number of _id', parseInt)
    .option('-t --to <n>', 'to number of _id', parseInt)
    .option('-i --id <s>', 'number of _id, each _id separated by commas')
    .option('-d --date <d>', 'print on <date> only')
    .parse(process.argv);

let fromId = program.from;
let toId = program.to;
let stringId = program.id;
let date = program.date;

if (fromId) {
    console.log('Get docs from id: ', fromId);
    query.push({ _id: { $gte: fromId } });
}

if (toId) {
    console.log('Get docs to id: ', toId);
    query.push({ _id: { $lte: toId } });
}

if (stringId) {
    let arrIds = stringId.split(',').map((id) => {
        return parseInt(id.trim());
    });

    console.log('Get docs from id of: ', arrIds);
    query.push({ _id: { $in: arrIds } });
}

if (date) {
    let stringDate = moment(date).format('ddd MMM DD YYYY');

    console.log('Get docs on date: ', stringDate);
    query.push({ time: { $regex: stringDate } });
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

const makePDF = (PDFDocument, doc) => {
    return new Promise((resolve, reject) => {
        let pdfDoc = new PDFDocument({
            size: [2480, 3508]
        });

        let fileName = 'pdf/' + doc._id + '.pdf';
        let string = cleanText(doc._id + '_' + doc.name + '_' + doc.address);

        try {
            pdfDoc.image(imageDirectory + doc.url, 200, 200, { width: 945, height: 945 });
        } catch (err) {
            console.log('Can not found image directory for doc: %s', doc._id);
        }

        pdfDoc.image('images/1.png', 200, 200, { width: 945, height: 945 });
        pdfDoc.image('images/2.png', 222, 222, { width: 900, height: 900 });
        pdfDoc.image('images/3.png', 1245, 200, { width: 945, height: 945 });
        pdfDoc.font('fonts/times.ttf').fontSize(80).text(string, 1330, 400, { width: 800, height: 800, align: 'center' });

        pdfDoc.pipe(fs.createWriteStream(fileName));

        pdfDoc.end();
        resolve();
    })
    
}

const print = (docs) => {
    return Promise.each(docs, (doc, index) => {
        return makePDF(PDFDocument, doc)
            .then(() => {
                console.log('%s docs left...', docs.length - index -1);
            })
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
}

execute().then(() => {
    console.log('Finished');
    console.log('Exit after 5 minutes...')

    setTimeout(() => {
        process.exit();
    }, 5 * 60 * 1000)
}).catch((error) => {
    console.log(error);
})
