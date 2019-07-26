
// It's called only once at the time of game initialization.
// Only this function cannot refer to the root.  
function ScriptCall_Initialize(startupInfo)
{
}
	
// It's called only once just before displaying the game window.
function ScriptCall_Setup()
{
	SetupControl.setup();
}

// It's called just before updating environment data at the time of script error.
function ScriptCall_Backup()
{
	SetupControl.backup();
}

// It's called  when retrying after a script error.
// This function is called before setSceneData.
function ScriptCall_Retry(customObject)
{
	RetryControl.start(customObject);
}

// It's called when a new scene or the event command start.
function ScriptCall_Enter(scene, commandType)
{
	var result;
	
	if (scene === SceneType.EVENT) {
		result = EventCommandManager.enterEventCommandManagerCycle(commandType);
	}
	else {
		result = SceneManager.enterSceneManagerCycle(scene);
	}
	
	return result;
}

// At the method which starts from a string of the move such as MoveScript, process data update.
// For example, if the unit position is changed, change the member's value which expresses x-coordinate and y-coordinate.
// In this case, process these variable updates.
// Moreover, process a detection of the user input.
// Don't process drawing at all and leave drawing to draw function methods.
// At the move function methods, a return value should be returned.
// Normally, if data update process is completed, return MoveResult.END,
// and if the update is not completed, return MoveResult.CONTINUE.
// However, there is also no problem if the original return value is returned.
function ScriptCall_Move(scene, commandType)
{
	var result;
	
	if (scene === SceneType.EVENT) {
		if (commandType === root.getEventCommandType()) {
			result = EventCommandManager.moveEventCommandManagerCycle(commandType);
		}
		else {
			result = EventCommandManager.backEventCommandManagerCycle(commandType);
		}
	}
	else {
		if (scene === root.getCurrentScene() || SceneManager.isForceForeground()) {
			result = SceneManager.moveSceneManagerCycle(scene);
		}
		else {
			result = SceneManager.backSceneManagerCycle(scene);
		}
	}
	
	MouseControl.moveAutoMouse();

	return result;
}

// At the method which starts from a string of the draw such as DrawScript, processes data drawing.
// Draw function method is to draw according to the updated variables with a move function method,
// so don't change some variable values with a draw function method.
// Because the draw function method has a feature to draw only, so even if the draw function method doesn't process anything,
// it means only there is nothing drawn on the screen, however, the game itself continues.
// Due to this feature, if there is a problem in a game progress, check the move function method,
// and if there is a problem on drawing, it'd be better to check the draw function method.
// The return value at the draw function method does not need to be returned.
function ScriptCall_Draw(scene, layerNumber, commandType)
{
	if (layerNumber === 0) {
		if (scene !== SceneType.REST) {
			MapLayer.drawMapLayer();
		}
	}
	else if (layerNumber === 1) {
		SceneManager.drawSceneManagerCycle(scene);
		root.drawAsyncEventData();
	}
	else {
		EventCommandManager.drawEventCommandManagerCycle(commandType);
	}
}

// It's called when loading a save file is completed.
function ScriptCall_Load()
{
	// The EnterScript is called when control is returned.
}

// It's called when the game is reset.
function ScriptCall_Reset()
{
	MessageViewControl.reset();
	ConfigVolumeControl.setDefaultVolume();
}

// It's called when an event command detects user input.
// For example, if the "Wait" of the event command is 0, it waits until InputControl.isSelectAction returns true.
function ScriptCall_CheckInput(reason)
{
	var result = false;
	
	if (reason === 0) {
		result = InputControl.isSelectAction();
	}
	else if (reason === 1) {
		result = InputControl.isSystemState();
	}
	else if (reason === 2) {
		result = InputControl.isStartAction();
	}
	
	return result;
}

// It's called when the unit is moved with a mouse, or  the unit is beaten with a mouse.
function ScriptCall_DebugAction()
{
	SceneManager.getActiveScene().notifyAutoEventCheck();
}

// It's called when checking if the state can be operated by a mouse.
function ScriptCall_CheckDebugAction()
{
	return SceneManager.getActiveScene().isDebugMouseActionAllowed();
}

// It's called when a message needs to be deleted.
function ScriptCall_EraseMessage(value)
{
	EventCommandManager.eraseMessage(value);
}

// It's called when the unit appears at the event.
function ScriptCall_AppearEventUnit(unit)
{
	UnitProvider.setupFirstUnit(unit);
	SkillChecker.addAllNewSkill(unit);
}

// It's called if keywords of "Conditional Show" of the class are satisfied.
function ScriptCall_NewCustomRenderer(unit)
{
	CustomCharChipGroup.createCustomRenderer(unit);
}

// It's called if the weapon is referred to with an event condition.
function ScriptCall_GetWeapon(unit)
{
	return ItemControl.getEquippedWeapon(unit);
}

// It's called when checking if the item can be used with an event condition.
function ScriptCall_CheckItem(unit, item)
{
	return ItemControl.isItemUsable(unit, item);
}

// It's called when marking.
function ScriptCall_GetUnitAttackRange(unit)
{
	var rangePanel = createObject(UnitRangePanel);
	
	return rangePanel.getUnitAttackRange(unit);
}

// It's called when the unit moves with an event.
function ScriptCall_GetUnitMoveCource(unit, xGoal, yGoal)
{
	var goalIndex = CurrentMap.getIndex(xGoal, yGoal);
	var simulator = root.getCurrentSession().createMapSimulator();
	
	simulator.disableMapUnit();
	simulator.startSimulation(unit, CurrentMap.getWidth() * CurrentMap.getHeight());
	
	return CourceBuilder.createLongCource(unit, goalIndex, simulator);
}

// It's called when "End Turn" is selected in "Skip Event" of event command.
function ScriptCall_TurnEnd()
{
	TurnControl.turnEnd();
}

// It's called when "Stop Turn Skip" is selected in "Skip Event" of the event command
function ScriptCall_DisableTurnSkip()
{
	CurrentMap.setTurnSkipMode(false);
	CurrentMap.enableEnemyAcceleration(false);
}

// It's called by "Move Unit" or "Show Moving Object" of event command.
// Check if the moving speed should be accelerated.
function ScriptCall_CheckGameAcceleration()
{
	return Miscellaneous.isGameAcceleration();
}
