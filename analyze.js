const fs = require('fs')
const d3 = require('d3')

loadFile()

function loadFile(){
	fs.readFile("/input/fileName.csv", {encoding: 'utf-8'}, function(err,data){
	    if (!err) {
	        //console.log('received data: ' + data);
	        parseData(data)
	    } else {
	        console.log(err);
	    }
	})
}

function parseData(source){
	console.log("parsing data")
	const data = d3.csvParse(source)
	console.log("#Entries in data: ", data.length)
	console.log(data[0])
	const selection = data//.slice(0,10)
	
	const anonymizedIndex = {"Ik heb geen specifieke voorkeur voor woongroepsgenoten": 0}
	data.forEach(item => {
		anonymizedIndex[item.id] = Object.keys(anonymizedIndex).length
	})
	console.log(anonymizedIndex)

	function anonomyze(name){
		const id = anonymizedIndex[name.trim()]
		if (id == null) console.log("not found", name)
		return id
	}

	const transformed = data.map(item => {
		return {
			id: anonymizedIndex[item.id],
			links: item.voorkeur.split(",").map(anonomyze)
		}
	})

	writeDataFile(transformed)
}

function writeDataFile(data)
{
	fs.writeFile('/output/fileName.json', JSON.stringify(data), 'utf8', function (err) {
	    if (err) {
	        return console.log(err)
	    } else {
	    	console.log("The file was saved!")
	    }
	})
}