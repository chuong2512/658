//This function loads a URL when clicked on. In order to detect clicks you need to attach a collider to this object.
#pragma strict

private var thisTransform:Transform;

//The name of the URL to be loaded
var urlName:String = "https://www.assetstore.unity3d.com/en/#!/publisher/4255";;

//How many seconds to wait before loading the URL, after a click
var delay:float = 0.5;

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
	yield WaitForSeconds(delay);
	
	//Load the URL
	if ( urlName )    Application.OpenURL(urlName);
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