//This is the script that controls the entire game. You set attributes for the time, score bar, object list, object area, etc. 
//Each level has its own GameController prefab with those attributes customized as needed.

#pragma strict
#pragma downcast

//A list of all the possible objects in the game. The hidden object for each level will be randomly selected from this list
var objectList:Transform[];
private var hiddenObjectIndex:int;

//The edges of the area which the objects are scattered within
var edgeTop:Transform;
var edgeBottom:Transform;
var edgeLeft:Transform;
var edgeRight:Transform;

//These attributes define how a level looks, the smaller the gap between objects the more objects are placed within the object area. You can also set how
//much the gap changes after each level, and the minimum gap ( A gap of less than 0.2 may cause performance issues ).
var objectGap:float = 1;
var gapChange:float = 0.05;
var gapMinimum:float = 0.2;
private var gapMargin:float = 0;
internal var areaWidth:float;
internal var areaWidthCurrent:float;
internal var areaHeight:float;
internal var areaHeightCurrent:float;

//The click area of a hidden object
var objectClickRadius:float = 1;

//How many objects we need to find to win this level
var hiddenObjectsRange:Vector2 = Vector2(1,3);
internal var numberOfHiddenObjects:int = 1;

//How many objects we found so far this level
internal var foundObjects:int = 0;

//Should we show the icons of the hidden objects at the top bar?
var showIconsOnTop:boolean = false;

//The gap between the icons in the top bar
var iconsGap:float = 1.5;

//The top bar object which contains the timer icon and text, as well as the "find object" text.
var topBar:Transform;

//The score bar which contains the level score, and total score
var scoreBar:Transform;
private var roundScore:int = 0; //Our score for the current round
private var totalScore:int = 0; //Our total score in the game

//The options screen shows options including Restart, Main Menu, Music, and Sound. When the options screen appears, the game is paused.
var optionsScreen:Transform;

//This screen shows when the timer reaches 0. After a delay, the game over screen is shown
var timeUpScreen:Transform;

//This screen is shown when the game is over. It displays the total score as well as Restart and Main Menu buttons
var gameOverScreen:Transform;

//Attributes for the timer, how much time we have left, how much time increases after each level, and how many seconds we lose when misclikcing. 
//Also how many seconds to wait before showing a hint, and how many points to earn for each second on the timer at the end of a level
var timeLeft:float = 30;
var timeChange:float = 5;
var timeLoss:float = 1;
var hintTime:float = 5;
private var hintTimeCount:float = 0;
var timeBonus:int = 100; //How many extra points we get for each second in a round
var timeBonusChange:int = 100;

//A list of messages that randomly appear when winning a level
var victoryMessage:String[];

//How many seconds to wait before starting the next level
var nextRoundDelay:float = 4;

//Various sounds
var audioFind:AudioClip;
var audioError:AudioClip;
var audioWin:AudioClip;
var audioTimeup:AudioClip;
var audioHint:AudioClip;

//The speed at which objects fall at the end of a level
var objectFallSpeedX:Vector2 = Vector2(-2,2);
var objectFallSpeedY:Vector2 = Vector2(3,6);
var objectRotateSpeed:Vector2 = Vector2(-5,5);

//The animation of the top and score bars
var screenIntroAnimation:AnimationClip;
var screenOutroAnimation:AnimationClip;

//Is the game paused now?
var isPaused:boolean = true;

//A genral use index
private var index:int = 0;

function Start() 
{
	//Deactivate various game screens if they are assigned
	if ( timeUpScreen )    timeUpScreen.gameObject.SetActive(false);
	if ( optionsScreen )    optionsScreen.gameObject.SetActive(false);
	if ( gameOverScreen )    gameOverScreen.gameObject.SetActive(false);
	if ( scoreBar )    scoreBar.gameObject.SetActive(false);
	
	//Calculate the size of the area in which objects are placed
	areaWidth = Vector3.Distance(edgeLeft.position, edgeRight.position);
	areaHeight = Vector3.Distance(edgeTop.position, edgeBottom.position);
	
	//If we are using text instead of icons, hide the looking glass icon
	if ( showIconsOnTop == false )
	{
		topBar.Find("Base/GlassIcon").gameObject.SetActive(false);
	}
	
	//Create the first level
	CreateLevel();
}

function Update() 
{
	//Check if we have a topBar assigned, which contains the timer
	if ( topBar )
	{
		//Count down the time left until the level ends
		if ( isPaused == false )    
		{
			//Reduce the timer
			timeLeft -= Time.deltaTime;
			
			//Update the timer text
			UpdateTimer();
		
			//Count down to the next hint
			if ( hintTimeCount < hintTime )
			{
				hintTimeCount += Time.deltaTime;
			}
			else
			{
				//Reset the hint timer
				hintTimeCount = 0;
				
				//Show the hint
				ShowHint();
			}
		}
	}
}

//This function creates a level, placing objects evenly within the object area, and then adding the hidden objects over them.
function CreateLevel()
{
	//Check if we have the edge points assigned. These points define the area in which the objects are placed
	if ( edgeLeft && edgeTop && edgeRight && edgeBottom )
	{
		//Reset the hint timer at the start of a level
		hintTimeCount = 0;
		
		//Reset the number of objects we found to 0
		foundObjects = 0;
		
		//Choose a random number of objects to be hidden
		numberOfHiddenObjects = Mathf.Round(Random.Range( hiddenObjectsRange.x, hiddenObjectsRange.y));
		
		//Choose the type of object that will be hidden from the list of objects we set
		hiddenObjectIndex = Mathf.Floor(Random.value * objectList.Length);
		
		//Calculate the margin based on the gap and area width
		gapMargin = (areaWidth - Mathf.Floor(areaWidth/objectGap) * objectGap)/2;
		
		//Start at the top of the area
		areaHeightCurrent = 0;
		
		//Place objects in a row until you reach the width of the area, then move down by the value of gapMargin and palce another row of objects.
		//Repeat until the entire area is filled with objects.
		while ( areaHeightCurrent <= areaHeight )
		{
			areaWidthCurrent = gapMargin;
			
			while ( areaWidthCurrent <= areaWidth )
			{
				//Choose a random object from the list
				var randomIndex:int = Mathf.Floor(Random.value * objectList.Length);
				
				//If the random object happens to be the same as the hidden object, choose another
				if ( randomIndex == hiddenObjectIndex )
				{
					if ( randomIndex != 0 )
					{
						randomIndex--;
					}
					else
					{
						randomIndex++;
					}
				}
				
				//Create the object, scale it and give it a random rotation. Then put it in the edgeTop object for easier access later
				var newObject:Transform = Instantiate( objectList[randomIndex], Vector3(edgeLeft.position.x + areaWidthCurrent, edgeBottom.position.y + areaHeightCurrent,0), Quaternion.identity);
				
				newObject.localScale *= objectGap;
				
				newObject.eulerAngles.z = Random.Range(0,360);
				
				newObject.parent = edgeTop;
				
				newObject.GetComponent(HOGHiddenObject).animationDelay = Random.Range(0,0.1);
								
				areaWidthCurrent += objectGap;
			}
			
			areaHeightCurrent += objectGap;
		}
		
		//Now we start placing the hidden objects
		index = 0;
		
		while ( index < numberOfHiddenObjects )
		{
			//Create a hidden object, scale it and give it a random rotation. Then put it in the edgeTop object for easier access later
			newObject = Instantiate( objectList[hiddenObjectIndex], Vector3( Random.Range(edgeLeft.position.x, edgeRight.position.x), Random.Range(edgeBottom.position.y, edgeTop.position.y),0), Quaternion.identity);
					
			newObject.localScale *= objectGap;
			
			newObject.eulerAngles.z = Random.Range(0,360);
						
			newObject.parent = edgeTop;
						
			newObject.GetComponent(HOGHiddenObject).animationDelay = Random.Range(0,0.1);
			
			//Also add a collider so we can click it, and make sure it shows in front of the regular objects.
			newObject.gameObject.AddComponent(CircleCollider2D);
		   	
		   	newObject.GetComponent(CircleCollider2D).radius = objectClickRadius;// * objectGap;
		   	
		    newObject.GetComponent(HOGHiddenObject).isHidden = true;
			
			newObject.position.z -= 1;
			
			//Create the icons of the hidden object in the top bar
			if ( showIconsOnTop == true )
			{
				var newIcon = Instantiate( objectList[hiddenObjectIndex], Vector3( Random.Range(edgeLeft.position.x, edgeRight.position.x), Random.Range(edgeBottom.position.y, edgeTop.position.y),0), Quaternion.identity);
					
				newIcon.parent = topBar;
				
				newIcon.position = topBar.Find("Base/GlassIcon").position;
				
				newIcon.position.x += index * iconsGap;
				
				newIcon.position.z += 0.5;
				
				newIcon.SendMessage("SetIconRotation");
				
				newIcon.SendMessage("ObjectIntro");
				
				newIcon.name = "HiddenIcon" + index;
			}
			
			index++;
		}
		
		if ( showIconsOnTop == false )
		{
			//Write the find message based on the word, the article(a,an), the number of hidden objects (more than 1), etc
			if ( numberOfHiddenObjects > 1 )
			{
				topBar.Find("Base/FindObjectText").GetComponent(TextMesh).text = topBar.Find("Base/FindObjectText/Shadow").GetComponent(TextMesh).text = "FIND " + numberOfHiddenObjects.ToString() + " " + newObject.GetComponent(HOGHiddenObject).namePlural;
			}
			else
			{
				topBar.Find("Base/FindObjectText").GetComponent(TextMesh).text = topBar.Find("Base/FindObjectText/Shadow").GetComponent(TextMesh).text = "FIND " + newObject.GetComponent(HOGHiddenObject).nameArticle + " " + newObject.GetComponent(HOGHiddenObject).objectName;
			}
		}
		else
		{
			topBar.Find("Base/FindObjectText").GetComponent(TextMesh).text = topBar.Find("Base/FindObjectText/Shadow").GetComponent(TextMesh).text = "";
		}
		
		
	}
	else
	{
		Debug.LogWarning("You must assign the Top/Bottom/Left/Right edges in the inspector");
	}
}

//This function add 1 to the number of found objects, and then checks if we found all the hidden objects to win the level. 
//The function is called from the hidden object itself when you click it. The hidden object has a HOGHiddenObject script attached to it which detects the click.
function UpdateFoundObjects()
{
	//Remove one of the hidden object icons, if they exist
	if ( showIconsOnTop == true )
	{
		//if ( topBar.Find("HiddenIcon" + (numberOfHiddenObjects - foundObjects - 1)) )    Destroy(topBar.Find("HiddenIcon" + (numberOfHiddenObjects - foundObjects - 1)).gameObject);    
	
		if ( topBar.Find("HiddenIcon" + (numberOfHiddenObjects - foundObjects - 1)) )    
		{
			//Play the object's find animation
			topBar.Find("HiddenIcon" + (numberOfHiddenObjects - foundObjects - 1)).SendMessage("ObjectIcon");
			
			//Wait a default time of 0.1 second
			yield WaitForSeconds(0.1);
			
			//Remove the object icon
			Destroy(topBar.Find("HiddenIcon" + (numberOfHiddenObjects - foundObjects - 1)).gameObject); 
		}
	}
	
	//Increase the number of found objects
	foundObjects++;
	
	//Reset hint timer
	hintTimeCount = 0;
	
	//If we find all the hidden objects we win the level
	if ( foundObjects < numberOfHiddenObjects )
	{
		if ( audio )    audio.PlayOneShot(audioFind);
	}
	else
	{
		if ( audio )    audio.PlayOneShot(audioWin);
		
		Win();
	}
}

//This function wins a level. It pauses the game and applies the score based on the level we are at and the number of seconds left on the timer. Then it creates the next level.
function Win()
{
	PauseTimer();
	
	//Activate the score bar which contains the level score and totalScore
	scoreBar.gameObject.SetActive(true);
	
	//Play the score bar intro animation
	scoreBar.animation.Play(screenIntroAnimation.name);
	
	//If we have a top bar assigned, show the victory message and add bonus time to the timer
	if ( topBar )    
	{
		//If we assigned victory messages, choose one of them randomly and display it in the top bar
		if ( victoryMessage.Length > 0 )    topBar.Find("Base/FindObjectText").GetComponent(TextMesh).text = topBar.Find("Base/FindObjectText/Shadow").GetComponent(TextMesh).text = victoryMessage[Mathf.Floor(Random.Range(0, victoryMessage.Length))];
	
		//Show the extra time we got on the timer
		topBar.Find("Base/TimerText").GetComponent(TextMesh).text = topBar.Find("Base/TimerText").Find("Shadow").GetComponent(TextMesh).text = timeLeft.ToString("00") + " +" + timeChange.ToString();
	}
	
	//If we have a score bar, show the level score and the total score
	if ( scoreBar )
	{
		//Show the level score
		scoreBar.Find("Base/RoundScore").GetComponent(TextMesh).text = scoreBar.Find("Base/RoundScore").Find("Shadow").GetComponent(TextMesh).text = "+" + (timeBonus * Mathf.Round(timeLeft)).ToString();
		
		//Add the level score to the total score
		totalScore += timeBonus * Mathf.Round(timeLeft);
		
		//Show the total score
		scoreBar.Find("Base/TotalScore").GetComponent(TextMesh).text = scoreBar.Find("Base/TotalScore").Find("Shadow").GetComponent(TextMesh).text = totalScore.ToString();
	
		//Increas the time bonus for the next level
		timeBonus += timeBonusChange;
	}
	
	//Clear the objects from the area
	ClearObjects();
	
	//Wait a few seconds before creating the next level
	yield WaitForSeconds(nextRoundDelay);
	
	//Add to the timer
	timeLeft += timeChange;
	
	UpdateTimer();
	
	//scoreBar.animation.Play("BarOutro");
	scoreBar.animation.Play(screenOutroAnimation.name);
	
	objectGap -= gapChange;
	
	if ( objectGap < gapMinimum )    objectGap = gapMinimum;
	
	CreateLevel();
	
	StartTimer();
}

//This function clears all objects from the level, making them fall down and then removing them
function ClearObjects()
{
	//Go through all the objects in the edgeTop. If you check out the creation of the objects ( CreateLevel() ) you'll notice that we placed all the objects in 
	//edgeTop for easier access.
	for ( var fallingObject:Transform in edgeTop )
	{
		//Add a rigid body to the object
		fallingObject.gameObject.AddComponent(Rigidbody2D);
		
		//Throw it in a random direction and rotation
		fallingObject.rigidbody2D.velocity.x = Random.Range(objectFallSpeedX.x, objectFallSpeedX.y);
		fallingObject.rigidbody2D.velocity.y = Random.Range(objectFallSpeedY.x, objectFallSpeedY.y);
		fallingObject.rigidbody2D.angularVelocity = Random.Range(objectRotateSpeed.x, objectRotateSpeed.y);
		
		//Destroy the object after a few seconds
		Destroy(fallingObject.gameObject, 3);
	}
}

//This function updates the timer text and checks if time is up.
function UpdateTimer()
{
	//Assign the time in the text mesh
	topBar.Find("Base/TimerText").GetComponent(TextMesh).text = topBar.Find("Base/TimerText").Find("Shadow").GetComponent(TextMesh).text = timeLeft.ToString("00");
	
	//If we have less than 5 seconds left on the timer, start animating the color of the timer icon
	if ( timeLeft > 0 && timeLeft <= 5 )
	{
		topBar.Find("Base/TimerClock").SendMessage("Pause", false);
	}
	else
	{
		topBar.Find("Base/TimerClock").GetComponent(SpriteRenderer).color = topBar.Find("Base/TimerClock").GetComponent(HOGAnimateColors).colorList[0];
		
		topBar.Find("Base/TimerClock").SendMessage("Pause", true);
	}
	
	//If there is no more time left, it's game over
	if ( timeLeft <= 0 )
	{
		//Show the TimeUp screen
		if ( timeUpScreen )    timeUpScreen.gameObject.SetActive(true);
		
		//remove all the objects from the screen
		ClearObjects();
		
		PauseTimer();
		
		timeLeft = 0;
		
		topBar.Find("Base/TimerText").GetComponent(TextMesh).text = topBar.Find("Base/TimerText").Find("Shadow").GetComponent(TextMesh).text = timeLeft.ToString("00");
		
		if ( audio )    audio.PlayOneShot(audioTimeup);
		
		//Remove all the hidden object icons, if they exist ( The timer ran out so we are clearing everything onscreen )
		if ( showIconsOnTop == true )
		{
			while ( foundObjects < numberOfHiddenObjects )
			{
				if ( topBar.Find("HiddenIcon" + (numberOfHiddenObjects - foundObjects - 1)) )    Destroy(topBar.Find("HiddenIcon" + (numberOfHiddenObjects - foundObjects - 1)).gameObject);
			
				foundObjects++;
			}
		}
		
		//Show the game over screen after 2 seconds
		GameOver(2);
	}
}

function PauseTimer()
{
	isPaused = true;
}

function StartTimer()
{
	isPaused = false;
}

//This function updates the time.
function ChangeTimer( changeValue:float )
{
	timeLeft += changeValue;
	
	UpdateTimer();
}

//This function reduces from the timer and shakes the screen
function Error()
{
	ChangeTimer(-timeLoss);
	
	transform.SendMessage("StartShake");
}

//This function shows a hint, shaking a hidden object
function ShowHint()
{
	if ( audioHint )
	{
		if ( audio )
		{
			audio.PlayOneShot(audioHint);
		}
		else
		{
			Debug.LogWarning("You must add an AudioSource component to this object in order to play sounds");
		}
	}
	
	//Find a hidden object and run the object hint frunction from it
	if ( edgeTop.Find(objectList[hiddenObjectIndex].name + "(Clone)") )    edgeTop.Find(objectList[hiddenObjectIndex].name + "(Clone)").SendMessage("ObjectHint");
}

//This function pauses the game and shows the options screen
function ToggleOptions()
{
	isPaused = !isPaused;
	
	if ( optionsScreen )
	{
		//If the options screen is not centered, center it
		optionsScreen.position.x = optionsScreen.position.y = 0;
		
		if ( isPaused == true )
		{
			optionsScreen.gameObject.SetActive(true);
			optionsScreen.animation.Play(screenIntroAnimation.name);
		}
		else
		{
			optionsScreen.animation.Play(screenOutroAnimation.name);
			
			yield WaitForSeconds(screenOutroAnimation.length);
			
			optionsScreen.gameObject.SetActive(false);
		}
		
		
	}
	else    Debug.LogWarning("You must assign a game options screen in the component");
}

//This function pauses the timer and shows the game over screen
function GameOver( delay:float )
{
	PauseTimer();
	
	if ( topBar )    topBar.animation.Play(screenOutroAnimation.name);
	
	yield WaitForSeconds(delay);
	
	if ( gameOverScreen )    
	{
		gameOverScreen.gameObject.SetActive(true);
		
		gameOverScreen.Find("Base/TotalScore").GetComponent(TextMesh).text = gameOverScreen.Find("Base/TotalScore/Shadow").GetComponent(TextMesh).text = totalScore.ToString();
	}
}
