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
				var Generator = createObject(DynamicEvent)
				var Dynamo = Generator.acquireEventGenerator()
				var i;
				for (i = 0; i < Deck.length; i++){
					if (unit.getUnitType() != UnitType.PLAYER){
						Dynamo.unitItemChange(unit,Deck[i],IncreaseType.INCREASE,true);
					}
					else{
						Dynamo.unitItemChange(unit,Deck[i],IncreaseType.INCREASE,false);
					}
					// UnitItemControl.pushItem(unit,Deck[i])
				}
				Dynamo.execute()
				this.endCommandAction()
				return MoveResult.END;
			},

			_drawAccess: function () {
			},
			
			_getDeckArray: function (unit) {
				var DeckArrayNew = [];
				var count = Math.min(DataConfig.getHandLimit() + 1 - UnitItemControl.getHandCount(unit),unit.custom.Deck.length)
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