# nmcreme-export-pdf
nmcreme-export-pdf

# How to use:
cd nmcreme-export-pdf
npm install
node export.js

PDF file will be create in nmcreme-export-pdf/pdf folder.
Each pdf contains at most 3 images, pdf file name is _id of those images (ex: 350_360_370.pdf, 375_356.pdf or 380.pdf).

# Optional params:
--from  (-f)  : export from _id (number)
--to    (-t)  : export to _id (number)

Example:
node export.js -f 350 -t 700

>>script will export images from _id of 350 to 700
