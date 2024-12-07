//This script handles a hidden object. When the objects are created, they all have this script. The objects which are specifically hidden also have a collider which
//Lets us click them. When clicked, the hidden object will be added to the list of found objects.
#pragma strict

//The name of the object in singular form
var objectName:String = "Object";

//The article for the name. For example: "An Apple", or "A Shoe"
var nameArticle:String = "An";

//The name of the object in plural form, example: "Apples"
var namePlural:String = "Objects";

//The tags that describe this object (red,small,animal,round,etc)
var keywords:String[];

//The rotation of the icon of this object
var iconRotation:float = 0;

//Is this object hidden?
var isHidden:boolean = false;

//Delay of the animation when the object first appears
internal var animationDelay:float = 0;

//Various animations for when the object appears, is found, or hints at its own location
var animationIntro:AnimationClip;
var animationHint:AnimationClip;
var animationFind:AnimationClip;
var animationIcon:AnimationClip;

function Start() 
{
	//If there is an animation delay for the object, wait for the delay and then play the animation
	if ( animationDelay > 0 )
	{
		//Remember the original scale of the object 
		var objectScale:Vector3 = transform.localScale;
		
		//Set the scale to 0, making the object invisible
		transform.localScale *= 0;
		
		//Wait the delay
		yield WaitForSeconds(animationDelay);
		
		//Reset the object's scale to its original
		transform.localScale = objectScale;
		
		//Play the intro animation of the object, if it exists
		if ( animation )   animation.Play(animationIntro.name); 
	}
}

//This function plays the object intro animation
function ObjectIntro()
{
	if ( animation )   animation.Play(animationIntro.name); 
}

//This function plays the object hint animation
function ObjectHint()
{
	if ( animation )   animation.Play(animationHint.name); 
}

//This function plays the object find animation
function ObjectFind()
{
	if ( animation )   animation.Play(animationFind.name); 
}

//This function plays the object icon remove animation
function ObjectIcon()
{
	if ( animation )   animation.Play(animationIcon.name); 
}

//This function runs when you click on it
function OnMouseDown()
{
	//If this is one of the hidden objects, it is clickable
	if ( isHidden == true )
	{
		//Take the object out of the hierarchy
		transform.parent = null;
		
		//Update the number of found objects in the game controller
		GameObject.FindGameObjectWithTag("GameController").SendMessage("UpdateFoundObjects");
		
		//Play the find animation, if it exists
		if ( animation )   
		{
			if ( animationFind )
			{
				animation.Play(animationFind.name); 
			
				yield WaitForSeconds(animationFind.length);
			}
		}
		
		//Finally, destroy the object
		Destroy(gameObject);
	}
}

//This function sets the rotation of the object as an icon ( used for the hidden object icons in the top bar )
function SetIconRotation()
{
	transform.eulerAngles.z = iconRotation;
}

function Hidden( hiddenValue:boolean )
{
	isHidden = hiddenValue;
}
