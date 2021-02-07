onmessage = (e)=>{
    const [FILE, DELIMITER, ..._] = e.data
    const READER = new FileReader()

    READER.readAsBinaryString(FILE)
    READER.onloadend = async ()=>{
        let contents, delimiters = 1, mostDelimiterCount = 0

        contents = Array.from(READER.result.trim()+'\n')
        contents.forEach(ch=>{
            if(ch === DELIMITER) delimiters++
            else if(ch == '\n'){
                mostDelimiterCount = delimiters > mostDelimiterCount ? delimiters : mostDelimiterCount
                delimiters = 1
            }
        })

        await disectProvidedData(contents, DELIMITER, mostDelimiterCount)
        .then((dataset)=>{
            postMessage(dataset)
        })
    }
    

}

function disectProvidedData(data, delimiter, delimitedelimitersount){
    return new Promise((resolve)=>{
        let temp = [],
            record = [],
            dataset = [],
            currentValue
        for(let k in data){
            currentValue = (data[k] == '\n') ? delimiter : data[k]

            if(currentValue == delimiter){
                record.push(temp.join('')||' ')
                temp = []
            } else {
                temp.push(currentValue)
            }

            if(data[k] == '\n'){
                let r = record.length
                if(r < delimitedelimitersount){
                    for(let i=0;i<=delimitedelimitersount-r-1;i++){
                        record.push(' ')
                    }
                }
                dataset.push(record)
                record = []
            }
        }
        resolve(dataset)
    })
}