//This script shakes an object when it runs, with values for strength and time. You can set which object to shake, and if you keep the object value empty it 
//will shake the object it's attached to.

#pragma strict

//Caching the transform for quicker access
private var thisTransform:Transform;

//The original position of the camera
private var originPos:Vector3;

//How violently to shake the camera
var strength:Vector3;
private var strengthDefault:Vector3;

//How quickly to settle down from shaking
var decay:float = 0.8;

//How many seconds to shake
var shakeTime:float = 1;
private var shakeTimeDefault:float;

//
var shakeTarget:Transform;

//Is this effect playing now?
var isShaking:boolean = false;

function Start() 
{
	thisTransform = transform; //Caching transform for quicker access
	
	strengthDefault = strength;
	
	shakeTimeDefault = shakeTime;
	
	//Record the original position of the camera
	if ( !shakeTarget )    shakeTarget = thisTransform;
	
	originPos = shakeTarget.transform.position;
}

function Update()
{
	if ( isShaking == true )
	{
		if ( shakeTime > 0 )
		{		
			shakeTime -= Time.deltaTime;
			
			//Move the camera in all directions based on strength
			shakeTarget.position.x = originPos.x + Random.Range(-strength.x, strength.x);
			shakeTarget.position.y = originPos.y + Random.Range(-strength.y, strength.y);
			shakeTarget.position.z = originPos.z + Random.Range(-strength.z, strength.z);
			
			//Gradually reduce the strength value
			strength *= decay;
		}
		else if ( shakeTarget.position != originPos )
		{
			shakeTime = 0;
			
			//Reset the camera position
			shakeTarget.position = originPos;
			
			isShaking = false;
		}
	}
}

function StartShake()
{
	isShaking = true;
	
	strength = strengthDefault;
	
	shakeTime = shakeTimeDefault;
}

