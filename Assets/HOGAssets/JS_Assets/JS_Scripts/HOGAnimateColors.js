//This script animates a sprite or a text mesh with several colors over time. You can set a list of colors, and the speed at
//which they change.
#pragma strict

//A list of the colors that will be animated
var colorList:Color[];

//The index number of the current color in the list
var colorIndex:int = 0;

//How long the animation of the color change lasts, and a counter to track it
var changeTime:float = 1;
var changeTimeCount:float = 0;

//How quickly the sprite animates from one color to another
var changeSpeed:float = 1;

//Is the animation paused?
var isPaused:boolean = false;

//Is the animation looping?
var isLooping:boolean = true;

function Start() 
{
	//Apply the chosen color to the sprite or text mesh
	SetColor();
}

function Update() 
{
	//If the animation isn't paused, animate it over time
	if ( isPaused == false )
	{
		if ( changeTime > 0 )
		{
			//Count down to the next color change
			if ( changeTimeCount > 0 )
			{
				changeTimeCount -= Time.deltaTime;
			}
			else
			{
				changeTimeCount = changeTime;
				
				//Switch to the next color
				if ( colorIndex < colorList.Length - 1 )
				{
					colorIndex++;
				}
				else
				{
					if ( isLooping == true )    colorIndex = 0;
				}
			}
		}
		
		//If we have a text mesh, animated its color
		if ( GetComponent(TextMesh) )
		{
			GetComponent(TextMesh).color = Color.Lerp(GetComponent(TextMesh).color, colorList[colorIndex], changeSpeed * Time.deltaTime);
		}
		
		//If we have a sprite renderer, animated its color
		if ( GetComponent(SpriteRenderer) )
		{
			GetComponent(SpriteRenderer).color = Color.Lerp(GetComponent(SpriteRenderer).color, colorList[colorIndex], changeSpeed * Time.deltaTime);
		}
	}
	else
	{
		//Apply the chosen color to the sprite or text meshh
		SetColor();
	}
}

//This function applies the chosen color to the sprite based on the index from the list of colors
function SetColor()
{
	//If you have a text mesh component attached to this object, set its color
	if ( GetComponent(TextMesh) )
	{
		GetComponent(TextMesh).color = colorList[0];
	}
	
	//If you have a sprite renderer component attached to this object, set its color
	if ( GetComponent(SpriteRenderer) )
	{
		GetComponent(SpriteRenderer).color = colorList[0];
	}
}

// Set the pause state
function Pause( pauseState:boolean )
{
	isPaused = pauseState;
}
