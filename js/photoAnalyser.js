
var imgWidth = 0;
var imgHeight = 0;
var faceBox;
var topEmotConf = 0;
var currEmotConf = 0;
var actualEmot;
var actualEmotConf;
var showFaces = document.getElementById("showFaces");
var showEmot = document.getElementById("showEmot");
var showGenderAge = document.getElementById("showGenderAge");
var showEyes = document.getElementById("showEyes");
var showGlasses = document.getElementById("showGlasses");
var showBeard = document.getElementById("showBeard");

function loadImage(){

	//set the image
	const photoFileName = document.getElementById("photoFileName").value;
	var img = document.getElementById("photoImg");
	img.src = "https://townhall-photo-bucket.s3.eu-west-2.amazonaws.com/" + photoFileName;
	
	// load canvas 
	var canvas = document.getElementById("photoCanvas");
	var ctx = canvas.getContext("2d");
	var img = document.getElementById("photoImg");
	imgWidth = img.width;
	imgHeight = img.height;

	canvas.width = imgWidth;
	canvas.height = imgHeight;
	ctx.drawImage(img, 0, 0);

	//img.src = "";
}

async function submitButton() {

    const lambdaUrl = document.getElementById("lambdaUrl").value;
    const photoFileName = document.getElementById("photoFileName").value;

	//set the image
	var img = document.getElementById("photoImg");
	img.src = "https://townhall-photo-bucket.s3.eu-west-2.amazonaws.com/" + photoFileName;
	


    const response = await fetch(lambdaUrl+"?imgName="+photoFileName , {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({  }) 
    });

    if (response.ok) { 
	
	readResponse(await response.json());

    } else {
        alert("HTTP-Error: " + response.status);
    }
}

function readResponse(response){

	// load canvas first
	var canvas = document.getElementById("photoCanvas");
	var ctx = canvas.getContext("2d");
	var img = document.getElementById("photoImg");
	imgWidth = img.width;
	imgHeight = img.height;

	canvas.width = imgWidth;
	canvas.height = imgHeight;
	ctx.drawImage(img, 0, 0);

	// now clear the image tag (only want one on screen)
	document.getElementById("photoImg").src = "";
	
	// now process the response
	var faceCount = response.faceDetailCount;
	var facesObj = response.faceDetails;
	
	facesObj.forEach(renderFaces);

	document.getElementById("photoOutput").innerHTML = JSON.stringify(response);

}

function renderFaces(face){
	

	// load the canvas
	var canvas = document.getElementById("photoCanvas");
	var ctx = canvas.getContext("2d");
	ctx.strokeStyle = "rgba(0,255,0,0.5)";
	ctx.lineWidth = 5;
	ctx.font = "14px Arial";
	
	// bounding boxes
	faceBox = face.BoundingBox;
	ctx.strokeStyle = "rgba(0,255,0,0.5)";
	ctx.lineWidth = 5;

	if (showFaces.checked){
		ctx.strokeRect(faceBox.Left*imgWidth,faceBox.Top*imgHeight,faceBox.Width*imgWidth,faceBox.Height*imgHeight);
	}

	// gender & age
	ctx.strokeStyle = "rgba(0,255,0,1)";
	ctx.lineWidth = 1;
	var faceGender = face.Gender;
	var faceAge = face.AgeRange;	
	if (showGenderAge.checked){
		ctx.strokeText(faceGender.Value + "," + faceAge.Low + "-" + faceAge.High,faceBox.Left*imgWidth,(faceBox.Height*imgHeight) + (faceBox.Top*imgHeight));
	}

	// beard
	var faceBeard =	face.Beard;
	if (faceBeard.Value == true && showBeard.checked){
		ctx.strokeStyle = "rgba(0,0,0,1)";
		ctx.lineWidth = 1;
		ctx.strokeText("Beard",faceBox.Left*imgWidth,(faceBox.Top*imgHeight) + 20);	
	}

	// eyes open
	var faceEyes = face.EyesOpen;
	if (faceEyes.Value == false && showEyes.checked){
		ctx.strokeStyle = "rgba(0,0,255,1)";
		ctx.lineWidth = 1;
		ctx.strokeText("Eyes Closed",faceBox.Left*imgWidth,(faceBox.Top*imgHeight) + 40);
	}

	
	// wearing glasses
	var faceGlasses = face.Eyeglasses;
	if (faceGlasses.Value == true && showGlasses.checked) {
		ctx.strokeStyle = "rgba(255,0,0,1)";
		ctx.lineWidth = 1;
		ctx.strokeText("Glasses",faceBox.Left*imgWidth,(faceBox.Top*imgHeight) + 60);
	}

	// emotions
	var faceEmotions = face.Emotions;

	// find the top emotion
	topEmotConf = 0;
	actulEmot = "";
	actualEmotConf = 0;
	faceEmotions.forEach(findTopEmotion);
	
	//redner the top emotion
	ctx.strokeStyle = "rgba(255,255,255,1)";
	ctx.lineWidth = 1;
	ctx.font = "14px Arial";
	if (showEmot.checked){
		ctx.strokeText(actualEmot+"("+parseFloat(actualEmotConf).toFixed(2)+")",faceBox.Left*imgWidth,faceBox.Top*imgHeight);
	}	
}
function findTopEmotion(emotions){
	
	currEmotConf = emotions.Confidence;

	if (currEmotConf >= topEmotConf){
		topEmotConf = currEmotConf;
		actualEmot = emotions.Type;
		actualEmotConf = currEmotConf;		
	}
	
}