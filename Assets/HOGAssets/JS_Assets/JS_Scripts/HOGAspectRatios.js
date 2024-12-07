#pragma strict

internal var cameraObject:Camera;

var backgroundObject:Transform;

var topBarObject:Transform;

var customAspect:CustomAspects[];

class CustomAspects
{
	var aspect:Vector2 = Vector2(16,9);
	
	var cameraSize:float = 5;
	
	var backgroundScale:Vector2 = Vector2(3.5,2);
	
	var topBarPosition:Vector2 = Vector2(0,4);
}

function Start() 
{
	cameraObject = this.camera;
	
	for ( var index in customAspect )
	{
		if ( Mathf.Round(cameraObject.aspect * 100f) / 100f == Mathf.Round((index.aspect.x/index.aspect.y) * 100f) / 100f )
		{
			cameraObject.orthographicSize = index.cameraSize;
			
			if ( backgroundObject )
			{
				backgroundObject.localScale.x = index.backgroundScale.x;
				backgroundObject.localScale.y = index.backgroundScale.y;
			}
			
			if ( topBarObject )
			{
				topBarObject.position.x = index.topBarPosition.x;
				topBarObject.position.y = index.topBarPosition.y;
			}
		}
	}
}
