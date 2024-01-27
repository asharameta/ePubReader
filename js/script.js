

window.onload = function() {
    console.log( "ready!" );
    eventHandler();
};

function eventHandler(){
    $(".dropZone").on("drop", (e) => {
        // Prevent default behavior to allow drop
        e.preventDefault();

        console.log("Drop event on .dropZone");
        let dataTransfer = e.originalEvent.dataTransfer;
        if([...dataTransfer.items].forEach((item, i) => {
            // If dropped items aren't files, reject them
            if (item.type === "application/epub+zip") {
              const file = item.getAsFile();
              console.log(`file name = ${file.name}`);
            }else{
                console.log("WRONG FILE FORMAT WE TAKE ONLY EPUB AT THE MOMENT");
            }
          }));
    });
    
    $(".dropZone").on("dragover", (e) => {
        // Prevent default behavior to allow drop
        e.preventDefault();
    
        console.log("Dragover event on .dropZone");
    });
}