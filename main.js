const DRAG_ZONE = document.querySelector('#dropbox'),
        HEADER_CHECKBOX = document.querySelector('#isheader'),
        CUSTOM_DELIMITER = document.querySelector('#delimiter'),
        TABLE = document.querySelector('#dataset'),
        EXPORT = document.querySelector('#export')
const ACCEPTED_FILE_TYPES = {'text/csv': ',', 'text/tab-separated-values': '\t'}
const WORKER = new Worker('./worker.js', {credentials: 'include'})

window.onload = ()=>{
    var isFileDropped = false,
        currentDataSet
    EXPORT.hidden = true

    HEADER_CHECKBOX.onclick = async ()=>{
        if(isFileDropped){
            TABLE.innerHTML = ''
            await createTable(currentDataSet)
        }
    }

    DRAG_ZONE.ondragover = (e)=>{
        e.stopPropagation()
        e.preventDefault()
    }
    
    DRAG_ZONE.ondrop = (e)=>{
        isFileDropped = true

        e.stopPropagation()
        e.preventDefault()

        const DROPPED_FILES = e.dataTransfer.items

        TABLE.innerHTML = ''
        
        if(DROPPED_FILES.length > 1){
            alert('Only one file is allowed!')
            return
        }
        if(DROPPED_FILES[0].kind == 'file' && (DROPPED_FILES[0].type in ACCEPTED_FILE_TYPES || CUSTOM_DELIMITER.value)){
            var file = DROPPED_FILES[0].getAsFile()
            var delimiter = CUSTOM_DELIMITER.value||ACCEPTED_FILE_TYPES[DROPPED_FILES[0].type]
        } else {
            alert('Dropped content should be a CSV or TSV file, or set a custom delimiter!')
            return
        }

        WORKER.postMessage([file, delimiter])
    }

    WORKER.onmessage = async (e)=>{
        await createTable(e.data)
        .then(()=>{
            EXPORT.hidden = false
        })
    }

    EXPORT.onclick = (e)=>{
        let exportString = '',
            rowChildren

        e.preventDefault()

        for(let row of TABLE.childNodes){
            rowChildren = row.childNodes
            for(let cell in rowChildren){
                if(!(rowChildren[cell] instanceof HTMLElement)) continue

                if(rowChildren[cell] !== row.firstChild){
                    rowChildren[cell].innerText = rowChildren[cell].innerText.replace(/[\n]+/g, '')
                    if(cell == rowChildren.length-1){
                        exportString += rowChildren[cell].innerText
                    } else {
                        exportString += rowChildren[cell].innerText+','
                    }
                }
            }
            exportString += '\n'
        }

        let a = document.createElement('a')
        document.body.appendChild(a)

        const DATA_BLOB = new Blob([exportString], {type: 'text/csv'})
        const _URL = URL.createObjectURL(DATA_BLOB)

        a.href = _URL
        a.download = 'exported-data.csv'
        a.click()

        URL.revokeObjectURL(_URL)
        document.body.removeChild(a)
    }

    function createTable(dataset){
        return new Promise((resolve)=>{
            let rowNode, colNode, rowId = 1
            dataset.forEach(row=>{
                rowNode = document.createElement('tr')
    
                colNode = document.createElement('td')
                colNode.appendChild(document.createTextNode(rowId))
                rowNode.appendChild(colNode)
                row.forEach(col=>{
                    if(HEADER_CHECKBOX.checked && row === dataset[0]){
                        colNode = document.createElement('th')
                    } else {
                        colNode = document.createElement('td')
                    }
                    colNode.contentEditable = true
                    colNode.appendChild(document.createTextNode(col))
    
                    rowNode.appendChild(colNode)
                })
                TABLE.appendChild(rowNode)
    
                rowId++
            })
            resolve(true)
        })
    }
}