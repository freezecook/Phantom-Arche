(function() {
	//Insert script contents here.
	
	var alias1 = SkillRandomizer.isCustomSkillInvokedInternal;
	SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword)
	{
		if (keyword === "Suit-Spade")
		{
			return this._isSkillInvokedInternal(active, passive, skill);
		}
	};
	
	ItemChangeControl._increaseUnitItem = function(unit, targetItem) {
		var arr = [];
		
		if (!UnitItemControl.isUnitItemSpace(unit)) {
			arr.push(targetItem);
			return arr;
		}
		
		//calling insertItem instead of pushItem. Assuming the item is a card.
		//UnitItemControl.insertItem(unit, targetItem, true, false);
		UnitItemControl.pushItem(unit, targetItem);
		UnitItemControl.rearrangeItem(unit);
		
		// Update because new item is possessed.
		ItemControl.updatePossessionItem(unit);
		
		return arr;
	};
	
	//This arranges items based on category. This should eliminate the need for insertItem.
	UnitItemControl.rearrangeItem = function(unit) {
		
		var i, j, swapItem, item;
		var count = this.getPossessionItemCount(unit);
		var maxCount = DataConfig.getMaxUnitItemCount();
		var dummyCard = root.getBaseData().getItemList().getData(6);
		
		var cardStartPoint = 0;
		var sleightStartPoint = 5;
		var suitStartPoint = 11;
		
		root.log("Initial Arrangement:");
		
		//logging loop 1.
		for (i = 0; i < maxCount; i++)
		{
			if (unit.getItem(i) !== null)
			{
				root.log(unit.getItem(i).getName() + " at slot " + i);
			}
			
		}
		
		root.log("rearranging Items...");
		
		for (i = 0; i < maxCount; i++)
		{
			if (unit.getItem(i) !== null)
			{
				//Cards in-hand are the first set of items and use slots 1-5. (Starts from 0 in-code)
				if (unit.getItem(i).custom.Type === "Card")
				{
					root.log("located " + unit.getItem(i).getName() + " at slot " + i);
					if (i >= sleightStartPoint)
					{
						root.log("working...");
						for (j = cardStartPoint; j < DataConfig.getHandLimit(); j++)
						{
							if (unit.getItem(j) === null)
							{
								root.log("squad...");
								//move item and clear the current location.
								unit.setItem(j, unit.getItem(i));
								unit.clearItem(i);
								//cardStartPoint++;
								break;
							}
							else if (unit.getItem(j).custom.Type !== "Card")
							{
								root.log("gang...");
								//We need to swap this item to the current location. 
								//We'll also need to start at the same place next iteration.
								swapItem = unit.getItem(j);
								unit.setItem(j, unit.getItem(i));
								unit.setItem(i, swapItem);
								//cardStartPoint++;
								i--;
								break;
							}
							else {
								root.log("wtf");
								//unit.clearItem(i);
							}
						}
					}
					
					// Stuff the item in order not to have a blank between items.
					for (j = cardStartPoint; j < DataConfig.getHandLimit(); j++) 
					{
						if (unit.getItem(j) === null) 
						{
							for (k = j + 1; k < DataConfig.getHandLimit(); k++) 
							{
								item = unit.getItem(k);
								if (item !== null) 
								{
									unit.setItem(j, item);
									unit.clearItem(k);
									break;
								}
							}
						}
					}
				}
				//Sleights are the second set of items (Slots 6-11).
				else if (unit.getItem(i).custom.Type === "Sleight")
				{
					if ( i < sleightStartPoint || i >= suitStartPoint)
					{
						for (j = sleightStartPoint; j < DataConfig.getSleightLimit(); j++)
						{
							if (unit.getItem(j) === null)
							{
								//move item and clear the current location.
								unit.setItem(j, unit.getItem(i));
								unit.clearItem(i);
								//sleightStartPoint++;
								break;
							}
							else if (unit.getItem(j).custom.Type !== "Sleight")
							{
								//We need to swap this item to the current location. 
								//We'll also need to start at the same place next iteration.
								swapItem = unit.getItem(j);
								unit.setItem(j, unit.getItem(i));
								unit.setItem(i, swapItem);
								//sleightStartPoint++;
								i--;
								break;
							}
						}
					}
					
					// Stuff the item in order not to have a blank between items.
					for (j = sleightStartPoint; j < suitStartPoint; j++) 
					{
						if (unit.getItem(j) === null) 
						{
							for (k = j + 1; k < suitStartPoint; k++) 
							{
								item = unit.getItem(k);
								if (item !== null) 
								{
									unit.setItem(j, item);
									unit.clearItem(k);
									break;
								}
							}
						}
					}
				}
				//Suits are the last items in the list, and behave like normal drop items. These use slots 12-15.
				else if (unit.getItem(i).custom.Type === "Suit")
				{
					if ( i < suitStartPoint)
					{
						
						for (j = suitStartPoint; j < maxCount; j++)
						{
							if (unit.getItem(j) === null)
							{
								root.log(unit.getItem(i).getName() + " said SQUAD at i = " + i);
								//move item and clear the current location.
								unit.setItem(j, unit.getItem(i));
								unit.clearItem(i);
								//suitStartPoint++;
								break;
							}
							else if (unit.getItem(j).custom.Type !== "Suit")
							{
								//We need to swap this item to the current location. 
								//We'll also need to start at the same place next iteration.
								swapItem = unit.getItem(j);
								root.log("swapping " + unit.getItem(i).getName() + " to slot " + i);
								unit.setItem(j, unit.getItem(i));
								unit.setItem(i, swapItem);
								//suitStartPoint++;
								i--;
								break;
							}
						}
					}
					
					// Stuff the item in order not to have a blank between items.
					for (j = suitStartPoint; j < maxCount; j++) 
					{
						if (unit.getItem(j) === null) 
						{
							for (k = j + 1; k < maxCount; k++) 
							{
								item = unit.getItem(k);
								if (item !== null) 
								{
									unit.setItem(j, item);
									unit.clearItem(k);
									break;
								}
							}
						}
					}
				}
				//Dummies simply fill space to reduce errors/increase compatibility with native scripts.
				//I just delete them here.
				else if (unit.getItem(i).custom.Type === "Dummy")
				{
					unit.clearItem(i);
				}
			}
			
		}
		//Fill empty slots with dummies.
		for (i = 0; i < maxCount -1; i++)
		{
			if (unit.getItem(i) === null)
			{
				unit.setItem(i, dummyCard);
			}
		}
		
		
		//logging loop.
		for (i = 0; i < maxCount; i++)
		{
			if (unit.getItem(i) !== null)
			{
				root.log(unit.getItem(i).getName() + " at slot " + i);
			}
			
		}
		
		root.log("-----------------------------------------");
	}
	
	
	//This checks how many cards are currently in the hand, i.e. the first 5 slots.
	UnitItemControl.getHandCount = function(unit){
		var i;
		var count = DataConfig.getHandLimit();
		var bringCount = 0;
		
		for (i = 0; i < count; i++) {
			if (unit.getItem(i) !== null) {
				bringCount++;
			}
		}
		
		return bringCount;
	}
	
	DataConfig.getSleightLimit = function () {
		return 12;
	}
	//mainly for good practice and readability; this always returns 5. 
	DataConfig.getHandLimit = function() {
		return 5;
	}
	
	/*
	//This is normally what scrunches items down in the list. I don't need that functionality.
	UnitItemControl.arrangeItem = function(unit) {
		//called by UnitItemControl.pushItem(), 
		root.log("Sumting Wong");
	}
	*/
	
	UnitItemControl.pushItem = function(unit, item) {
		root.log("PushItem reached....");
		var count = this.getPossessionItemCount(unit);
		
		if (count < DataConfig.getMaxUnitItemCount()) {	
			this.arrangeItem(unit);
			unit.setItem(count, item);
			return true;
		}
		
		return false;
	}
	
	UnitItemControl.insertItem = function(unit, item, isCard, isSleight) {
		var count = this.getPossessionItemCount(unit);
		root.log("made it");
		//Cards in-hand are the first set of items and use slots 1-5. (Starts from 0 in-code)
		if (isCard === true){
			for (i = 0; i <= 4; i++) {
				root.log("Item slot " + i);
				//root.log(unit.getItem(i).getId());
				if (unit.getItem(i) === null) {
					root.log("inserting at " + i);
					unit.setItem(i, item);
					return true;
				}
			}
		}
		//Sleights are the second set of items (Slots 6-11).
		else if (isSleight === true){
			for (i = 5; i <= 10; i++) {
				if (unit.getItem(i) === null) {
					unit.setItem(i, item);
					return true;
				}
			}
		}
		//Suits are the last items in the list, and behave like normal drop items. These use slots 12-15.
		else {
			for (i = 11; i <= 14; i++) {
				if (unit.getItem(i) === null) {
					unit.setItem(i, item);
					return true;
				}
			}
		}
		
		return false;
	};
})();