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
                const firstPagePath = findFirstPagePath(zip);
                    if (coverPath) {
                        zip.file(coverPath).async('base64').then(content =>{
                            const coverImage = document.getElementById('coverImage');
                            coverImage.src = 'data:image/png;base64,' + content;
                            coverImage.style.height = 400+'px';
                        });
                    }else {
                        alert('No cover image found in the EPUB file.');
                    }

                    if(firstPagePath){
                        zip.file(firstPagePath).async("string").then(content =>{
                            const parser = new DOMParser();
                            //console.log(content);
                            const xmlDoc = parser.parseFromString(content, "application/xml");
                            //"application/xhtml+xml"
                            //"application/xml"
                            //"text/html"
                            //"text/xml"
                            const pagesToPrint = document.getElementById('bookContent');
                            //console.log(xmlDoc.documentElement);
                            pagesToPrint.innerHTML = '';
                            pagesToPrint.appendChild(xmlDoc.documentElement);
                            pagesToPrint.style.width = 500+'px';
                        });
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

function findFirstPagePath(zip){
    console.log(zip.files);
    const pageExtensions = [".xhtml", ".html"];
    for(const ext of pageExtensions) {
        for(const obj in zip.files){
            if(obj.includes('1-1'+ext)){
                return obj;
            }
        }
    }
    return null;
}


