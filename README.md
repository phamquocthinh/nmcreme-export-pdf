# nmcreme-export-pdf
nmcreme-export-pdf

# How to use:
>>cd nmcreme-export-pdf <br />
>>npm install <br />
>>node export.js <br />
<br />
PDF file will be create in nmcreme-export-pdf/pdf folder.<br />
Each pdf contains at most 3 images, pdf file name is _id of those images (ex: 350_360_370.pdf, 375_356.pdf or 380.pdf).<br />
<br />
# Optional params:
--from  (-f)  : export from _id (number)<br />
--to    (-t)  : export to _id (number)<br />
<br />
Example:<br />
>>node export.js -f 350 -t 700
<br />
<br />
Script will export images from _id of 350 to 700
