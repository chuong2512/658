//This script toggles a sound source when clicked on. It also records the sound state (on/off) in a PlayerPrefs. In order to detect clicks you need to attach a collider to this object.
#pragma strict

private var thisTransform:Transform;

//The source of the sound
var soundObject:Transform;

//The PlayerPrefs name of the sound
var playerPref:String = "MusicVolume";

//The current state of the sound, 1 = on, 0 = off
var currentValue:float = 1;

//The sprites of the sound in its various states
var sprites:Sprite[];

//The sound of the button click and the source of the sound
var soundClick:AudioClip;
var soundSource:Transform;

//Should there be a click effect
var clickEffect:boolean = true;

function Awake() 
{
	thisTransform = transform;
	
	//Get the current state of the sound from PlayerPrefs
	currentValue = PlayerPrefs.GetFloat( playerPref, currentValue);
	
	//Set the sound in the sound source
	SetSound();
}

function OnMouseDown()
{
	//Create an effect
	if ( clickEffect == true )    ClickEffect();

	//Play a sound from the source
	if ( soundSource )    if ( soundSource.audio )    soundSource.audio.PlayOneShot(soundClick);
	
	//Toggle the sound
	ToggleSound();
}

function SetSound()
{
	//Set the sound in the PlayerPrefs
	PlayerPrefs.SetFloat( playerPref, currentValue);
	
	//Update the graphics of the sprite to fit the sound state
	GetComponent(SpriteRenderer).sprite = sprites[currentValue];
	
	//Set the value of the sound state to the source object
	if ( soundObject )    soundObject.audio.volume = currentValue;
}

//Toggle the sound. Turn it off if it was on, and turn it on if it was off.
function ToggleSound()
{
	currentValue = 1 - currentValue;
		
	SetSound();
}

//Start playing the sound source
function StartSound()
{	
	if ( soundObject )    soundObject.audio.Play();
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
