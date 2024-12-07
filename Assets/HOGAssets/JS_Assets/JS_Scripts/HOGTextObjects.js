#pragma strict

var textObjects:Transform[];

function ChangeText( textIndex:int, changeValue:String )
{
	textObjects[textIndex].Find("Text").GetComponent(TextMesh).text = textObjects[textIndex].Find("Text/Shadow").GetComponent(TextMesh).text = changeValue;
}