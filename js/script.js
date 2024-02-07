window.onload = function(e) {
    console.log("ready!");
    eventHandler();
};

var amountOfPages = 0;
var pages = [];
var pagesSize = 1;
var startIndex = 1;
var endIndex = 0;
var currentIndex = 1;
var maxIndex = 0;

function eventHandler(){
    $(".dropZone").on("drop", (e) => {
        if(e.cancelable)e.preventDefault();

        let dataTransfer = e.originalEvent.dataTransfer;

        if (dataTransfer.items[0].type === "application/epub+zip") {
            const file = dataTransfer.items[0].getAsFile();

            unzipEpub(file);
        }
    });

    $(".NextPageButton").on("click", (e) =>{
        PextPageButton();
    })

    $(".PrevPageButton").on("click", (e) =>{
        PrevPageButton();
    })
    
    $(".dropZone").on("dragover", (e) => {
        if(e.cancelable)e.preventDefault();
    });
}

function ResetValues(){
    amountOfPages = 0;
    pages = [];
    pagesSize = 1;
    startIndex = 1;
    endIndex = 0;
    currentIndex = 1;
    maxIndex = 0;
    $(".currentPage").text(currentIndex);
}


function unzipEpub(file){
    const zip = new JSZip();
    zip.file("mimetype", "application/vnd.oasis.opendocument.spreadsheet");
    ResetValues();
    zip.loadAsync(file)
            .then(zip => {
                const coverPath = findCoverPath(zip);
                const sortedChaptersPaths = sortASC(zip.files)
                PreLoadCalculations(sortedChaptersPaths);
                    if (coverPath) {
                        const coverImage = document.getElementById('coverImage');
                        coverImage.innerHTML = '';

                        zip.file(coverPath).async('base64').then(content =>{

                            coverImage.src = 'data:image/png;base64,' + content;
                            coverImage.style.height = 500+'px';
                            coverImage.style.position = 'fixed';
                            coverImage.style.top = 220 +'px';
                        })
                    }else {
                        alert('No cover image found in the EPUB file.');
                    }

                    if(sortedChaptersPaths){
                        const promises = sortedChaptersPaths.map(path => {
                           return zip.file(path).async("string").then(content => {
                                const parser = new DOMParser();
                                const xmlDoc = parser.parseFromString(content, "text/xml");

                                pages.push(xmlDoc.documentElement);

                                //pagesToPrint.appendChild(xmlDoc.documentElement);
                            });
                        })
                        Promise.all(promises).then(() => {
                            Paginate();
                        })
                    }else {
                        alert('No first page found in the EPUB file.');
                    }
            })
            .catch(error => {
                alert("Error reading EPUB file:", error);
            });
}

function findCoverPath(zip){
    const coverExtensions = [".jpg", ".jpeg", ".png"];
    for(const ext of coverExtensions) {
        for(const obj in zip.files){
            if(obj.includes('cover'+ext)){
                return obj;
            }
        }
    }
    return null;
}


function sortASC(files){

    const keysArray = Object.keys(files).filter(IsEndsWithXHTMLExtension)
    .sort((a, b)=>{
        let [fullAName, numberA, subNumberA] = a.match(/(\d+)(?:-(\d+))?/);
        let [fullBName, numberB, subNumberB] = b.match(/(\d+)(?:-(\d+))?/);

        if (parseInt(numberA) === parseInt(numberB)) {

            if (!subNumberA && !subNumberB) {
                return a.localeCompare(b);
            }

            return parseInt(subNumberA || 0) - parseInt(subNumberB || 0);
        } else {
            return parseInt(numberA) - parseInt(numberB);
        }
    });

    return keysArray;
}


function IsEndsWithXHTMLExtension(element){
    return ((element.endsWith("xhtml") || element.endsWith("html")) && /\d+/.test(element));
}


function Paginate(){
    const pagesToPrint = document.getElementById('content-container');
    pagesToPrint.innerHTML = '';
    console.log(currentIndex);
    //$(".currentPage").val(currentIndex);
    pagesToPrint.appendChild(pages[currentIndex-startIndex]);
}

function PextPageButton(){
    if(currentIndex<maxIndex){
        currentIndex++;
        $(".currentPage").text(currentIndex);
        Paginate();
    }
}

function PrevPageButton(){
    if(currentIndex>1){
        currentIndex--;
        $(".currentPage").text(currentIndex);
        Paginate();
    }
}


// var amountOfPages = 0;
// var pages = [];
// var pagesSize = 1;
// var startIndex = 1;
// var endIndex = 0;
// var currentIndex = 0;
// var maxIndex = 0;

function PreLoadCalculations(sorterPaths){
    amountOfPages = sorterPaths.length;
    maxIndex = amountOfPages / pagesSize;
    $(".maxIndexPage").text("/"+maxIndex);
    if((amountOfPages % pagesSize)>0){
        maxIndex++;
    }
}
