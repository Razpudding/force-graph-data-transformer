const fs = require('fs')
const d3 = require('d3')

loadFile()

function loadFile(){
	fs.readFile("filename.json", {encoding: 'utf-8'}, function(err,data){
	    if (!err) {
	        //console.log('received data: ' + data);
	        transformData(data,30, true, false, true, true)
	    } else {
	        console.log(err);
	    }
	})
}

function transformData(data, limit, noR, noBoard, reciprocal, omniLikes){
  const linksLimit = limit
  const board = []
  const r = []
  board.push(5)
  board.push(52)
  board.push(56)
  board.push(53)
  board.push(51)
  board.push(50)
  board.push(44)
  board.push(41)

  var transformed = {
		nodes: [],
		links: []
	}
  if (noR){
    data = data.filter(item => r.indexOf(item.id) == -1)
  }
  if (noBoard) {
    data = data.filter(item => board.indexOf(item.id) == -1)
  }
	data.forEach(item => {
		transformed.nodes.push({
			id: item.id,
			group: r.indexOf(item.id) == -1 ? 1 : 2
		})
		console.log(item.id)
    
    if (noBoard) {item.links = item.links.filter(link => board.indexOf(link) == -1)} //Remove board if necessary
    if (noR) {item.links = item.links.filter(link => r.indexOf(link) == -1)} //Remove rs if necessary
    item.links = item.links.filter(link =>{ //Remove links where people like themselves
      if (link == item.id){
        console.log("zelfbevlekking", item.id, link)
      }
      return link != item.id
    })
		item.links = item.links.slice(0,linksLimit)	
		console.log(item.links)
		
	})
	console.log(data)

	data.forEach(item => {
		item.links.forEach(link =>{
      //First, check if someone likes everyone (indicated in the data with id:0), in that case create a link for them with everyone individually
			if (omniLikes && link == 0){
        transformed.nodes.forEach(node =>{
          transformed.links.push({
            source: item.id,
            target: node.id,
            value: 1,
          })
        })
      }
      //Then check if the person they are liking actually exists in the listed nodes, if not, return
      //  This will also cause a return if the liked person is all persons, which is intended
      if (transformed.nodes.find(person => person.id == link) == undefined){
				//console.log(link, "not found")
				return
      }
      //Finally, add normal links
      transformed.links.push({
        source: item.id,
        target: link,
        value: 1,
      })
		})
	})
  //Remove links if they're not reciprocal
  if(reciprocal) { transformed.links = transformed.links.filter(link => findMatch(link)) }
  function findMatch(link){
    //console.log("finding matches", link)
    const found = transformed.links.find(refLink => {
      return refLink.source == link.target && refLink.target == link.source
    })
    return found != undefined
   }
    
  writeDataFile(transformed)
}

function writeDataFile(data)
{
	fs.writeFile('./output/filename.json', JSON.stringify(data), 'utf8', function (err) {
	    if (err) {
	        return console.log(err)
	    } else {
	    	console.log("The file was saved!")
	    }
	})
}