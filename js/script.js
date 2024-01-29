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

            showEpub(file);
        }
    });
    
    $(".dropZone").on("dragover", (e) => {
        if(e.cancelable)e.preventDefault();
        console.log("Dragover event on .dropZone");
    });
}


function showEpub(file){
    const zip = new JSZip();
    
    zip.loadAsync(file)
            .then(zip => {
                const coverPath = findCoverPath(zip);
                
                    if (coverPath) {
                        zip.file(coverPath).async('base64').then(content =>{
                            const coverImage = document.getElementById('coverImage');
                            coverImage.src = 'data:image/png;base64,' + content;
                            coverImage.style.display = 'block';
                        });
                    }else {
                        alert('No cover image found in the EPUB file.');
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


