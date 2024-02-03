window.onload = function(e) {
    console.log("ready!");
    eventHandler();
};

function eventHandler(){
    $(".dropZone").on("drop", (e) => {
        if(e.cancelable)e.preventDefault();

        console.log("Drop event on .dropZone");
        let dataTransfer = e.originalEvent.dataTransfer;

        if (dataTransfer.items[0].type === "application/epub+zip") {
            const file = dataTransfer.items[0].getAsFile();
            console.log(`file name = ${file.name}`);

            unzipEpub(file);
        }
    });
    
    $(".dropZone").on("dragover", (e) => {
        if(e.cancelable)e.preventDefault();
        console.log("Dragover event on .dropZone");
    });
}


function unzipEpub(file){
    const zip = new JSZip();
    
    zip.loadAsync(file)
            .then(zip => {
                const coverPath = findCoverPath(zip);
                const sortPaths = sortASC(zip.files)
                    if (coverPath) {
                        const coverImage = document.getElementById('coverImage');
                        coverImage.innerHTML = '';
                        zip.file(coverPath).async('base64').then(content =>{

                            coverImage.src = 'data:image/png;base64,' + content;
                            coverImage.style.height = 500+'px';
                            coverImage.style.position = 'fixed';
                            coverImage.style.top = 220 +'px';
                        });
                    }else {
                        alert('No cover image found in the EPUB file.');
                    }

                    if(sortPaths){
                        const pagesToPrint = document.getElementById('content-container');
                        pagesToPrint.innerHTML = '';
                        sortPaths.forEach(path => {
                            zip.file(path).async("string").then(content =>{
                                const parser = new DOMParser();
                                const xmlDoc = parser.parseFromString(content, "application/xml");

                                pagesToPrint.appendChild(xmlDoc.documentElement);
                                pagesToPrint.style.width = 500+'px';
                            });
                        })
                    }else {
                        alert('No first page found in the EPUB file.');
                    }
            })
            .catch(error => {
                console.error("Error reading EPUB file:", error);
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

    const keysArray = Object.keys(files).filter(isEndsWithXHTMLExtension)
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


function isEndsWithXHTMLExtension(element){
    return ((element.endsWith("xhtml") || element.endsWith("html")) && /\d+/.test(element));
}


