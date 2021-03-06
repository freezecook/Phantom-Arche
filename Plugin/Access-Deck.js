(function () {
	var DECK001 = UnitCommand.configureCommands;
	/*UnitCommand.configureCommands = function(groupArray) {
		groupArray.appendObject(UnitCommand.Deck);
		DECK001.call(this, groupArray);
	};*/
	var DeckAccessMode = {
		ACCESS: 0
	};
	
	UnitCommand.Deck = defineObject(UnitListCommand,
		{
			openCommand: function () {
				this._prepareCommandMemberData();
				this._completeCommandMemberData();
			},

			moveCommand: function () {
				var mode = this.getCycleMode();
				var result = MoveResult.CONTINUE;

				if (mode === DeckAccessMode.ACCESS) {
					result = this._moveAccess();
				}

				return result;
			},
			
			drawCommand: function () {
				var mode = this.getCycleMode();

				if (mode === DeckAccessMode.ACCESS) {
					this._drawAccess();
				}
			},
			
			isCommandDisplayable: function () {
				var unit = this.getCommandTarget();
				var Deck;
				root.log("checking deck availability...")
				//Does this unit have a deck?
				if (unit.custom !== null && unit.custom !== undefined){
					if (unit.custom.Deck !== null && unit.custom.Deck !== undefined){
						root.log("unit \""+ unit.getId() +"\" has a deck");
						Deck = unit.custom.Deck.length > 0;
					}
					else{
						root.log("unit \""+ unit.getId() +"\" does not have a deck");
						Deck = false;
					}
				}
				else{
					root.log("unit \""+ unit.getId() +"\" has no custom parameters");
					Deck = false;
				}
				//Is this unit's inventory full?
				var ItemCheck = this._isDeckAccessible();
				return (Deck && ItemCheck);
				
			},
			
			getCommandName: function () {
				return "Access Deck";
			},
			
			isRepeatMoveAllowed: function () {
				return true;
			},
			
			_prepareCommandMemberData: function () {
			},
			
			_completeCommandMemberData: function () {
				this.changeCycleMode(DeckAccessMode.ACCESS);
			},
			
			_moveAccess: function () {
				var unit = this.getCommandTarget();
				var Deck = this._getDeckArray(unit);
				//var Generator = createObject(DynamicEvent)
				//var Dynamo = Generator.acquireEventGenerator()
				var i;
				for (i = 0; i < Deck.length; i++){
					if (unit.getUnitType() != UnitType.PLAYER){
						//Dynamo.unitItemChange(unit,Deck[i],IncreaseType.INCREASE,true);
						ItemChangeControl._increaseUnitItem(unit, Deck[i]);
					}
					else{
						//Dynamo.unitItemChange(unit,Deck[i],IncreaseType.INCREASE,false);
						ItemChangeControl._increaseUnitItem(unit, Deck[i]);
					}
					// UnitItemControl.pushItem(unit,Deck[i])
				}
				//Dynamo.execute()
				//this.endCommandAction()
				//return MoveResult.END;
				return MoveResult.CONTINUE;
			},

			_drawAccess: function () {
			},
			
			_getDeckArray: function (unit) {
				var DeckArrayNew = [];
				var count = Math.min(DataConfig.getHandLimit() + 1 - UnitItemControl.getHandCount(unit),unit.custom.Deck.length)
				var Deck = unit.custom.Deck
				var i, Card, RandInt;
				var Skills1 = -1;
				var Skills2 = -1;
				var Skills3 = -1;
				var Skills4 = -1;
				var Suit1 = "None";
				var Suit2 = "None";
				var Suit3 = "None";
				var Suit4 = "None";
				
				for (i = 0; i < DataConfig.getMaxUnitItemCount(); i++){
					if (unit.getItem(i) !== null){
						root.log( i + ": " + unit.getItem(i).getName() + ": " + unit.getItem(i).custom.Type );
						
						if (unit.getItem(i).custom.Type === "Suit"){
							if (Skills1 === -1){
								root.log("Skills1 acquired");
								Skills1 = unit.getItem(i).getSkillReferenceList();
							}
							else if (Skills2 === -1){
								Skills2 = unit.getItem(i).getSkillReferenceList();
							}
							else if (Skills3 === -1){
								Skills3 = unit.getItem(i).getSkillReferenceList();
							}
							else if (Skills4 === -1){
								Skills4 = unit.getItem(i).getSkillReferenceList();
							}
						}
						
					}
				}
				
				if (Skills1 !== -1){
					for ( i = 0; i < Skills1.getTypeCount(); i++){
							root.log(Skills1.getTypeData(i).getName());
							Suit1 = Skills1.getTypeData(i).getName();
					}
				}
				else {
					root.log("error finding suit item 1");
				}
				
				if (Skills2 !== -1){
					for ( i = 0; i < Skills2.getTypeCount(); i++){
							root.log(Skills2.getTypeData(i).getName());
							Suit2 = Skills2.getTypeData(i).getName();
					}
				}
				else {
					root.log("error finding suit item 2");
				}
				
				if (Skills3 !== -1){
					for ( i = 0; i < Skills3.getTypeCount(); i++){
							root.log(Skills3.getTypeData(i).getName());
							Suit3 = Skills3.getTypeData(i).getName();
					}
				}
				else {
					root.log("error finding suit item 3");
				}
				
				if (Skills4 !== -1){
					for ( i = 0; i < Skills4.getTypeCount(); i++){
							root.log(Skills4.getTypeData(i).getName());
							Suit4 = Skills4.getTypeData(i).getName();
					}
				}
				else {
					root.log("error finding suit item 4");
				}
		
				root.log("--------------------" + unit.getName() + "'s Skills Above---------------------------");
				
				i = 0;
				while (i < count) {
					RandInt = Math.round(Math.random()*Deck.length)
					if (Deck[RandInt] !== null && Deck[RandInt] !== undefined && (Deck[RandInt][2] === Suit1 ||
								Deck[RandInt][2] === Suit2 || Deck[RandInt][2] === Suit3 || Deck[RandInt][2] === Suit4)){
						Card = UnitCardControl.getCard(unit,RandInt)
						DeckArrayNew.push(Card)
						Deck.splice(RandInt,1)
						i++
					}
				}
				return DeckArrayNew;
			},
			
			_isDeckAccessible: function () {
				//return UnitItemControl.getPossessionItemCount(this.getCommandTarget()) != DataConfig.getMaxUnitItemCount();
				return UnitItemControl.getHandCount(this.getCommandTarget()) != DataConfig.getHandLimit();
			}
		}
	);
})();

AIScorer.Deck = defineObject(BaseAIScorer,
{
	getScore: function(unit, combination) {
		var score = 0;
		var MaxHand = DataConfig.getHandLimit();
		var Hand = UnitItemControl.getHandCount(unit);
		
		if (Hand === MaxHand){
			return score;
		}
		else{
			var i;
			for (i = Hand; i < MaxHand; i++){
				score += 25
			}
		}
		root.log(score)
		return score + this._getPlusScore(unit, combination);
	}
}
);
var AD001 = CombinationSelector._configureScorerFirst;
CombinationSelector._configureScorerFirst = function(groupArray) {
	AD001.call(this,groupArray);
	groupArray.appendObject(AIScorer.Deck)
};

CombinationCollector.Deck = defineObject(BaseCombinationCollector,
{
	collectCombination: function(misc) {
		misc.actionTargetType = ActionTargetType.SINGLE;
		this._setCombination(misc)
	},
	
	_setCombination: function(misc) {
		this._setSingleRangeCombination(misc);
	}
}
);

var AD002 = CombinationBuilder._configureCombinationCollector;
CombinationBuilder._configureCombinationCollector = function(groupArray) {
	AD002.call(this,groupArray);
	groupArray.appendObject(CombinationCollector.Deck)
};
var DeckAutoActionMode = {
	ACCESS: 0
}
DeckAutoAction = defineObject(BaseAutoAction,
{
	_unit: null,
	_autoActionCursor: null,
	
	setAutoActionInfo: function(unit, combination) {
		this._unit = unit;
	},
	
	enterAutoAction: function() {
		if (this.isSkipMode()) {
			return EnterResult.NOTENTER;
		}
		
		return EnterResult.OK;
	},
	
	moveAutoAction: function() {
		var result = MoveResult.CONTINUE;
		var mode = this.getCycleMode();
		
		if (mode === DeckAutoActionMode.ACCESS) {
			result = this._moveAccess();
		}
		
		return result;
	},
	
	drawAutoAction: function() {
		var mode = this.getCycleMode();
		
		if (mode === DeckAutoActionMode.ACCESS) {
			result = this._drawAccess();
		}
		
		return result;
	},
	
	_moveAccess: function(){
		var unit = this._unit;
		var Deck = this._getDeckArray(unit);
		var Generator = createObject(DynamicEvent)
		var Dynamo = Generator.acquireEventGenerator()
		var i;
		for (i = 0; i < Deck.length; i++){
			Dynamo.unitItemChange(unit,Deck[i],IncreaseType.INCREASE,true);
		}
		Dynamo.execute()
		return MoveResult.END;
	},
	
	_getDeckArray: function(unit){
		var DeckArrayNew = [];
		var count;
		if (unit.custom.Deck === null || unit.custom.Deck === undefined){
			count = 0;
		}
		else{
			count = Math.min(DataConfig.getHandLimit() + 1 - UnitItemControl.getHandCount(unit),unit.custom.Deck.length)
		}
		var Deck = unit.custom.Deck
		var i, Card, RandInt;
		i = 0;
		while (i < count) {
			RandInt = Math.round(Math.random()*Deck.length)
			if (Deck[RandInt] !== null && Deck[RandInt] !== undefined){
				Card = UnitCardControl.getCard(unit,RandInt)
				DeckArrayNew.push(Card)
				Deck.splice(RandInt,1)
				i++
			}
		}
		return DeckArrayNew;
	},
	
	_drawAccess: function () {
	}
}
);

var AD003 = AutoActionBuilder._pushCustom;
AutoActionBuilder._pushCustom = function(unit, autoActionArray, combination) {
	var autoAction = createObject(DeckAutoAction)
	autoAction.setAutoActionInfo(unit, combination);
	autoActionArray.push(autoAction);
};