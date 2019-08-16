//Made by freezecook.
//Credit and thanks to LadyRena and JtheDuelist for their Omnicounter and Aggressor scripts, respectfully.
AttackChecker.isCounterattack = function(unit, targetUnit) 
{
	var aggressorWeapon, indexArray, counterWeapon;
	
	if (!Calculator.isCounterattackAllowed(unit, targetUnit)) 
	{
		return false;
	}
	
	//Get attacker's weapon
	aggressorWeapon = ItemControl.getEquippedWeapon(unit);
	// Get the equipped weapon of those who is attacked.
	counterWeapon = ItemControl.getEquippedWeapon(targetUnit);
	
	if (aggressorWeapon !== null && aggressorWeapon.isOneSide()) 
	{
		// If the attacker is equipped with "One Way" weapon, no counterattack occurs.
		return false;
	}
	
	// If no weapon is equipped, cannot counterattack.
	if (counterWeapon === null) 
	{
		return false;
	}
	
	// If "One Way" weapon is equipped, cannot counterattack.
	if (counterWeapon.isOneSide()) 
	{
		return false;
	}
	
	if (aggressorWeapon.getPow() >= counterWeapon.getPow())
	{
		return false;
	}
		
	indexArray = IndexArray.createIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), counterWeapon);
	if (IndexArray.findUnit(indexArray, unit) !== unit && SkillControl.getPossessionCustomSkill(targetUnit,"Defend-Counter"))
	{
		return true;
	}
	if (IndexArray.findUnit(indexArray, unit) !== unit && SkillControl.getPossessionCustomSkill(targetUnit,"Close-Counter"))
	{
		return true;
	}
	
	return IndexArray.findUnit(indexArray, unit);
};

//This overload will use a card at the end of a defense turn. For now, I won't worry about it.
StateControl.arrangeState = function(unit, state, increaseType) {
		var turnState = null;
		var list = unit.getTurnStateList();
		var count = list.getCount();
		var editor = root.getDataEditor();
		
		if (increaseType === IncreaseType.INCREASE) {
			turnState = this.getTurnState(unit, state);
			if (turnState !== null) {
				// If the state has already been added, update the turn number.
				turnState.setTurn(state.getTurn());
			}
			else {
				if (count < DataConfig.getMaxStateCount()) {
					turnState = editor.addTurnStateData(list, state);
				}
			}
		}
		else if (increaseType === IncreaseType.DECREASE) {
			//This is where I'll decrease a card's usage for defense mode.
			if (state.getName() === 'Defense') {
				var counterWeapon = ItemControl.getEquippedWeapon(unit);
				root.log(counterWeapon.getName());
				ItemChangeControl._decreaseUnitItem(unit, counterWeapon, false);
				
				/*counterWeapon.setLimit(counterWeapon.getLimit() - 1);
				if (counterWeapon.getLimit() === 0)
				{
					//The equipped item should always be in position 1.
					root.log(counterWeapon.getName());
					for (i = 0; i < count; i++) {
						root.log(UnitItemControl.getItem(unit, i).getName());
						if (UnitItemControl.getItem(unit, i) === counterWeapon) {
							// Remove from the unit item list.
							UnitItemControl.cutItem(unit, i);
						}
					}
				}
				*/
			}
			editor.deleteTurnStateData(list, state);
			
		}
		else if (increaseType === IncreaseType.ALLRELEASE) {
			editor.deleteAllTurnStateData(list);
		}
		
		MapHpControl.updateHp(unit);
		
		return turnState;
};


(function() {

var alias2 = AttackEvaluator.HitCritical.calculateDamage;

AttackEvaluator.HitCritical.calculateDamage = function(virtualActive, virtualPassive, entry) {
	var damage = alias2.call(this, virtualActive, virtualPassive, entry);
	var boost = 0;
	//getting a list of states to check for Defense mode.
	var stateList = virtualPassive.unitSelf.getTurnStateList();
	var count = stateList.getCount();
	var stateListActive = virtualActive.unitSelf.getTurnStateList();
	var countActive = stateListActive.getCount();
	
	
	//Check if active unit is being countered.
	for (j = 0; j < countActive; j++) {
		turnState = stateListActive.getData(j);
			if (turnState.getState().getName() === 'Defense') {
					var weapon = ItemControl.getEquippedWeapon(virtualPassive.unitSelf);
					boost = -1 * (weapon.getPow());
					return damage + boost;
			}
	}
	
	
	//Check if targeted unit is in Defense mode.
	for (i = 0; i < count; i++) {
			turnState = stateList.getData(i);
			
			if (turnState.getState().getName() === 'Defense') {
				root.log("anyone there?");
				//I need to get the Mt of virtualPassive's equipped weapon.
				var counterWeapon = ItemControl.getEquippedWeapon(virtualPassive.unitSelf);
				boost = -1 * (counterWeapon.getPow());
				if (damage + boost >= 0){
					//this will use the defense card and immediately remove the defend state.
					//No counterattack occurs, but damage is reduced and the card is used up.
					root.log("Damage Taken! Deleting Card..");
					StateControl.arrangeState(virtualPassive.unitSelf, turnState.getState(), IncreaseType.DECREASE);
					
					//counterWeapon.setLimit(counterWeapon.getLimit() - 1);
					return damage + boost;
				}
				else{
					//A CounterAttack is imminent! That logic is handled elsewhere; I just return 0 damage here.
					root.log("you done goofed");
					return 0;
				}
				
			}
		}
	
	//if target is not in defense mode, return usual damage.
	return damage;			
};

}) (); //This seemingly random () is an important part of the function. Do not remove it.