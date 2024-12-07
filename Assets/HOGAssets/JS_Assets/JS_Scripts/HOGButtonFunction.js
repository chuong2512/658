//This script runs a function in a target object when clicked on. In order to detect clicks you need to attach a collider to this object.
#pragma strict

private var thisTransform:Transform;

//The target object in which the function needs to be executed
var functionTarget:Transform;

//The name of the function that will be executed
var functionName:String;

//A delay before running the function
var functionDelay:float = 0;

//The sound of the click and the source of the sound
var soundClick:AudioClip;
var soundSource:Transform;

//Should there be a click effect
var clickEffect:boolean = true;

function Start() 
{
	thisTransform = transform;
}

function OnMouseDown()
{
	//Create an effect
	if ( clickEffect == true )    ClickEffect();
		
	//Play a sound from the source
	if ( soundSource )    if ( soundSource.audio )    soundSource.audio.PlayOneShot(soundClick);
	
	//Wait a while
	yield WaitForSeconds(functionDelay);
	
	//Run the function at the target object
	if ( functionName )
	{  
		if ( functionTarget )    
		{
			functionTarget.SendMessage(functionName);
		}
	}
}

//Create an effect, making the object large and then gradually smaller
function ClickEffect()
{
	//Register the original size of the object
	var initScale = thisTransform.localScale;
	
	//Resize it to be larger
	thisTransform.localScale = initScale * 1.1;
	
	//Gradually reduce its size back to the original size
	while ( thisTransform.localScale.x > initScale.x * 1.01 )
	{
		yield WaitForFixedUpdate();
		
		thisTransform.localScale.x -= 1 * Time.deltaTime;
		
		thisTransform.localScale.y = thisTransform.localScale.x;
	}
	
	//Reset the size to the original
	thisTransform.localScale = thisTransform.localScale = initScale;
}	