var FEW001 = MarshalCommandWindow._configureMarshalItem;
MarshalCommandWindow._configureMarshalItem = function(groupArray) {
	FEW001.call(this, groupArray);
	
	if (root.getCurrentScene() == SceneType.REST){
		groupArray.appendObject(MarshalCommand.Folder)
	}
};

MarshalCommand.Folder = defineObject(MarshalBaseCommand, {
	
	_FolderEditScreen: null,
	
	openCommand: function() {
		this._unitSelectWindow.setActive(true);
		this._unitSelectWindow.setSingleMode();
		this._setSelectableArray();
	},
	
	checkCommand: function() {
		var screenParam = this._createScreenParam();
		
		if (screenParam.unit === null) {
			MediaControl.soundDirect('operationblock');
			return false;
		}
		
		this._FolderEditScreen = createObject(FolderEditScreen);
		SceneManager.addScreen(this._FolderEditScreen, screenParam);
		
		return true;
	},
	
	isMarshalScreenCloesed: function() {
		return SceneManager.isScreenClosed(this._FolderEditScreen);
	},
	
	getInfoWindowType: function() {
		return MarshalInfoWindowType.ITEM;
	},
	
	getCommandName: function() {
		return "Deck Editing";
	},
	
	getMarshalDescription: function() {
		return "Modify your Deck with the Cards you have obtained.";
	},
	
	notifyScreenClosed: function() {
		this._parentMarshalScreen.updateUnitList();
	},
	
	_setSelectableArray: function() {
		var i, unit, classEntryArray;
		var list = this._parentMarshalScreen.getUnitList();
		var count = list.getCount();
		var arr = [];
		arr.push(true);
		this._unitSelectWindow.getChildScrollbar().setSelectableArray(arr);
	},
	
	_createScreenParam: function() {
		var screenParam = ScreenBuilder.buildItemUse();
		
		screenParam.unit = this._unitSelectWindow.getFirstUnit();
		
		if (screenParam.unit!=null) {
			var j = 0;
			var found = false;
			var item;
			while (screenParam.unit.custom.Deck[j] != null && !found) {
				card = screenParam.unit.custom.Deck[j];
				found = card !== null ? true : false
				j++;
			}
			if (!found) {
				screenParam.unit = null;
			}
		}
		
		return screenParam;
	}
	
}
);

var FolderEditMode = {
	PACK: 0,
	DECK: 1,
	SWAP: 2
};

var FolderEditScreen = defineObject(BaseScreen,
{

	_unit: null,
	_deckListWindow: null,
	_packListWindow: null,
	_cardInfoWindow: null,
	_id: null,
	_type: null,
	_replacing: null,
	_replaced: null,

	setScreenData: function(screenParam) {
		this._unit = screenParam.unit;
		var DeckLength = this._unit.custom.Deck !== null ? this._unit.custom.Deck.length : 1
		this._packListWindow = createWindowObject(PackListWindow);
		this._packListWindow.setItemFormation(StockItemControl.getStockItemCount());
		this._packListWindow.setStockItemFormation();
		this._packListWindow.enableSelectCursor(true);
		
		this._deckListWindow = createWindowObject(DeckListWindow);
		this._deckListWindow.setItemFormation(DeckLength);
		this._deckListWindow.setUnitItemFormation(this._unit);
		
		this.changeCycleMode(FolderEditMode.PACK);
	},

	moveScreenCycle: function() {
		var result = MoveResult.CONTINUE;
		var input;

		if (this.getCycleMode()==FolderEditMode.PACK) {
			input = this._packListWindow.moveWindow();
			if (input==ScrollbarInput.SELECT) {
				this._id = this._packListWindow._scrollbar.getObject().getId()
				this._type = this._packListWindow._scrollbar.getObject().custom.PSO_TYPE
				this._replacing = this._packListWindow._scrollbar.getObject()
				this.changeCycleMode(FolderEditMode.DECK);
			}
			else if (input==ScrollbarInput.CANCEL) {
				result = MoveResult.END;
			}
			else if (input === MoveResult.END){
				result = MoveResult.END;
			}
		}
		else if (this.getCycleMode()==FolderEditMode.DECK) {
			result = this._deckListWindow.moveWindow();
			this._deckListWindow.enableSelectCursor(true);
			if (result==ScrollbarInput.SELECT) {
				this._replaced = this._deckListWindow._scrollbar.getObject()
				this._unit.custom.Deck[this._deckListWindow._scrollbar.getIndex()][0] = this._type
				this._unit.custom.Deck[this._deckListWindow._scrollbar.getIndex()][1] = this._id
				// if (result2 === ScrollbarInput.SELECT){
				this._packListWindow._scrollbar.cut(this._packListWindow._scrollbar.getIndex())
				this._packListWindow._scrollbar.objectSet(this._replaced)
				var Listing1 = StockItemControl.getStockItemArray();
				var m, j;
				if (this._packListWindow._scrollbar.getObject().custom.PSO_TYPE !== "UNIT"){
					for (m = 0; m < Listing1.length; m++){
						if (Listing1[m].getName() === this._replacing.getName()){
							StockItemControl.cutStockItem(m)
							StockItemControl.pushStockItem(this._replaced)
							break;
						}
					}
				}
				else{
					root.log("wagh")
				}
				result = MoveResult.END;
				// this.changeCycleMode(FolderEditMode.SWAP);
				// result = MoveResult.CONTINUE;
			}
			else if (result==ScrollbarInput.CANCEL) {
				this.changeCycleMode(FolderEditMode.PACK);
				result = MoveResult.CONTINUE;
			}
		}
		else if (this.getCycleMode()==FolderEditMode.SWAP) {
			result = this._deckListWindow.moveWindow();
			if (result==ScrollbarInput.SELECT) {
			}
			else if (result==ScrollbarInput.CANCEL) {
				this.changeCycleMode(FolderEditMode.DECK);
				result = MoveResult.CONTINUE;
			}
		}	  

		return result;
	},

	drawScreenCycle: function() {
		var x = LayoutControl.getRelativeX(3);
		var y = LayoutControl.getRelativeY(3);
		var dx;
		var dy;

		if (this.getCycleMode() === FolderEditMode.PACK){
			this._packListWindow.drawWindow(x-200,y-100)
		}
		if (this.getCycleMode() === FolderEditMode.DECK){
			this._deckListWindow.drawWindow(x+150,y-100)
		}
		if (this.getCycleMode() === FolderEditMode.SWAP){
			this._packListWindow.drawWindow(x-200,y-100)
			this._deckListWindow.drawWindow(x+150,y-100)
		}
	}

}
);

var DeckListWindow = defineObject(ItemListWindow, {
	
	initialize: function() {
		this._scrollbar = createScrollbarObject(CardScrollbar, this);
	},
	
	moveWindowContent: function() {
		var input = this._scrollbar.moveInput();
		var result = MoveResult.CONTINUE;
		if (input==ScrollbarInput.SELECT) {
			var index = this._scrollbar.getIndex();
			result = index==this._scrollbar.getObjectCount() ? MoveResult.END : MoveResult.SELECT;
		}
		else if (input==ScrollbarInput.CANCEL) {
			result = MoveResult.CANCEL;
		}
		return result;
	},
	
	drawWindowContent: function(x, y) {
		this._scrollbar.drawScrollbar(x, y);
	},
	
	setUnitItemFormation: function(unit) {
		this._scrollbar.setUnitItemFormation(unit);
	}
});

var PackListWindow = defineObject(ItemListWindow, {
	
	initialize: function() {
		this._scrollbar = createScrollbarObject(PackListScrollbar, this);
	},
	
	moveWindowContent: function() {
		var input = this._scrollbar.moveInput();
		var result = MoveResult.CONTINUE;
		if (input==ScrollbarInput.SELECT) {
			var index = this._scrollbar.getIndex();
			result = index==this._scrollbar.getObjectCount() ? MoveResult.END : MoveResult.SELECT;
		}
		else if (input==ScrollbarInput.CANCEL) {
			result = MoveResult.CANCEL;
		}
		return result;
	},
	
	drawWindow: function(x, y) {
		var width = this.getWindowWidth();
		var height = this.getWindowHeight();
		
		if (!this._isWindowEnabled) {
			return;
		}
		
		this._drawWindowInternal(x, y, width, height);
		
		if (this._drawParentData !== null) {
			this._drawParentData(x, y);
		}
		
		// The move method enables to refer to the coordinate with a mouse.
		this.xRendering = x + this.getWindowXPadding();
		this.yRendering = y + this.getWindowYPadding();
		
		this.drawWindowContent(x + this.getWindowXPadding(), y + this.getWindowYPadding());
		
		this.drawWindowTitle(x, y, width, height);
	},
	
	setStockItemFormation: function() {
		this._scrollbar.setStockItemFormation();
		this._scrollbar.enablePageChange();
	},
	
	drawWindowContent: function(x, y) {
		this._scrollbar.drawScrollbar(x, y);
	}
});

var CardScrollbar = defineObject(ItemListScrollbar,
{
	_unit: null,
	_isWarningAllowed: false,
	_availableArray: null,
	_usedArray: null,
	_commandCursor: null,
	_edgeCursor: null,
	
	initialize: function() {
		this._commandCursor = createObject(CommandCursor);
		this._edgeCursor = createObject(EdgeCursor);
	},
	
	drawScrollContent: function(x, y, object, isSelect, index) {
		var isAvailable;
		var textui = this.getParentTextUI();
		var font = textui.getFont();
		var color = textui.getColor();
		
		if (object === null) {
			root.log('nupe')
			return;
		}
		if (this._availableArray !== null) {
			isAvailable = this._availableArray[index];
		}
		else {
			isAvailable = true;
		}
		
		if (isAvailable){
			if (object.custom.PSO_TYPE === "WEAPON" || object.custom.PSO_TYPE === "ITEM"){
				ItemRenderer.drawItem(x, y, object, color, font, true);
			}
			else{
				TextRenderer.drawText(x,y,object.getName(),42,color,font)
			}
		}
		else {
			// Draw it tinted if items cannot be used.
			if (object.custom.PSO_TYPE === "WEAPON" || object.custom.PSO_TYPE === "ITEM"){
				ItemRenderer.drawItemAlpha(x, y, object, color, font, true, 120);
			}
			else{
				TextRenderer.drawAlphaText(x,y,object.getName(),42,color,120,font)
			}
		}
	},
	
	playOptionSound: function() {
		MediaControl.soundDirect('commandselect');
	},
	
	getObjectWidth: function() {
		return ItemRenderer.getItemWidth();
	},
	
	getObjectHeight: function() {
		return ItemRenderer.getItemHeight();
	},
	
	setUnitMaxItemFormation: function(unit) {
		var i;
		var maxCount = DataConfig.getMaxUnitItemCount();
		
		this._unit = unit;
		
		this.resetScrollData();
		
		for (i = 0; i < maxCount; i++) {
			this.objectSet(UnitItemControl.getItem(unit, i));
		}
		
		this.objectSetEnd();
		
		this.resetAvailableData();
	},
	
	setUnitItemFormation: function(unit) {
		var i, item;
		var maxCount = DataConfig.getMaxUnitItemCount();
		
		this._unit = unit;
		
		this.resetScrollData();
		
		for (i = 0; i < maxCount; i++) {
			item = UnitCardControl.getCard(unit,i);
			if (item !== null) {
				this.objectSet(item);
			}
		}
		
		this.objectSetEnd();
		
		this.resetAvailableData();
	},
	
	setStockItemFormation: function() {
		var i;
		var maxCount = StockItemControl.getStockItemCount();
		
		this._unit = null;
		
		this.resetScrollData();
		
		for (i = 0; i < maxCount; i++) {
			this.objectSet(StockItemControl.getStockItem(i));
		}
		
		this.objectSetEnd();
		
		this.resetAvailableData();
	},
	
	setStockItemFormationFromWeaponType: function(weapontype) {
		var i, item;
		var maxCount = StockItemControl.getStockItemCount();
		
		this._unit = null;
		
		this.resetScrollData();
		
		for (i = 0; i < maxCount; i++) {
			item = StockItemControl.getStockItem(i);
			if (item.getWeaponType() === weapontype) {
				this.objectSet(item);
			}
		}
		
		this.objectSetEnd();
		
		this.resetAvailableData();
	},
	
	enableWarningState: function(isEnabled) {
		this._isWarningAllowed = isEnabled;
	},
	
	resetAvailableData: function() {
		var i, item;
		var length = this._objectArray.length;
		
		this._availableArray = [];
		
		for (i = 0; i < length; i++) {
			item = this._objectArray[i];
			if (item !== null) {
				this._availableArray.push(this._isAvailable(item, false, i));
			}
		}
	},
	
	setAvailableArray: function(arr) {
		this._availableArray = arr;
	},
	
	getAvailableArray: function(arr) {
		return this._availableArray;
	},
	
	_isAvailable: function(object, isSelect, index) {
		var isAvailable = false;
		if (object !== undefined){
			if (this._unit === null) {
				return true;
			}
			if (object.custom.PSO_TYPE === "WEAPON") {
				// Check if the item can be equipped when the item type is a weapon.
				isAvailable = ItemControl.isWeaponAvailable(this._unit, object);
			}
			else {
				// Check if the item can be used when the item type is not a weapon.
				// isAvailable = ItemControl.isItemUsable(this._unit, object);
				isAvailable = true;
			}
		}
		return isAvailable;
	},
	
	_getTextColor: function(object, isSelect, index) {
	},
	
	_isWarningItem: function(object) {
	}
	
}
);
var PackListScrollbar = defineObject(CardScrollbar, {
	
	setUnitItemFormation: function(unit) {
		var i, j, k, l, item;
		var maxCount = unit.custom.Deck !== null ? unit.custom.Deck.length : 0
		var WeaponList = root.getBaseData().getWeaponList();
		var UnitList = root.getBaseData().getPlayerList();
		var Items = root.getBaseData().getItemList();
		this._unit = unit;
		
		this.resetScrollData();
		
		for (i = 0; i < maxCount; i++) {
			if (unit.custom.Deck[i] !== null && unit.custom.Deck[i] !== undefined){
				var found = false;
				while (!found){
					if (unit.custom.Deck[i][0] === "WEAPON"){
						for (j = 0; j < WeaponList.getCount(); j++){
							if (WeaponList.getData(j).getId() === unit.custom.Deck[i][1]){
								this.objectSet(WeaponList.getData(j))
								found = true;
								break;
							}
						}
					}
					else if (unit.custom.Deck[i][0] === "UNIT"){
						for (k = 0; k < UnitList.getCount(); k++){
							if (UnitList.getData(k).getId() === unit.custom.Deck[i][1]){
								this.objectSet(unit.custom.Deck[i])
								found = true;
								break;
							}
						}
					}
					else{
						for (l = 0; l < Items.getCount(); l++){
							if (Items.getData(l).getId() === unit.custom.Deck[i][1]){
								this.objectSet(unit.custom.Deck[i])
								found = true;
								break;
							}
						}
					}
				}
			}
		}
		
		this.objectSetEnd();
		
		this.resetAvailableData();
	}
	
});

UnitCardControl = {

	_unit: null,
	
	getCard: function(unit, index){
		var i, j, k, item;
		var Skills1 = -1;
		var Skills2 = -1;
		var Skills3 = -1;
		var Skills4 = -1;
		var Suit1 = "None";
		var Suit2 = "None";
		var Suit3 = "None";
		var Suit4 = "None";
		var Weapons = root.getBaseData().getWeaponList();
		var Units = root.getBaseData().getPlayerList();
		var Items = root.getBaseData().getItemList();
		
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
		
		//var Skills1 = unit.getItem(0) !== null ? unit.getItem(0).getSkillReferenceList() : null;
		//var Skills2 = unit.getItem(12).getSkillReferenceList();
		//var Skills3 = unit.getItem(13).getSkillReferenceList();
		//var Skills4 = unit.getItem(14).getSkillReferenceList();
		
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
		/*
		for ( i = 0; i < Skills2.getTypeCount(); i++){
				root.log(Skills2.getTypeData(i).getName());
		}
		for ( i = 0; i < Skills3.getTypeCount(); i++){
				root.log(Skills3.getTypeData(i).getName());
		}
		for ( i = 0; i < Skills4.getTypeCount(); i++){
				root.log(Skills4.getTypeData(i).getName());
		}*/
		root.log("--------------------" + unit.getName() + "'s Skills Above---------------------------");
		
		if (unit.custom.Deck !== null && unit.custom.Deck !== undefined){
			if (unit.custom.Deck[index] !== null && unit.custom.Deck[index] !== undefined){
				if (unit.custom.Deck[index][0] === "WEAPON"){
					for (i = 0; i < Weapons.getCount(); i++){
						if (Weapons.getData(i).getId() === unit.custom.Deck[index][1]){
							if (unit.custom.Deck[index][2] === Suit1 ||
									unit.custom.Deck[index][2] === Suit2 ||
									unit.custom.Deck[index][2] === Suit3 ||
									unit.custom.Deck[index][2] === Suit4){
								
								return Weapons.getData(i);
							}
						}
					}
				}
				if (unit.custom.Deck[index][0] === "ITEM"){
					for (j = 0; j < Items.getCount(); j++){
						if (Items.getData(j).getId() === unit.custom.Deck[index][1]){
							return Items.getData(j)
						}
					}
				}
				return unit.custom.Deck[index];
			}
			else{
				return null;
			}
		}
		return null;
	},
	
	saveTempDeck: function(unit){
		var i, card;
		if (unit.custom.Deck !== null && unit.custom.Deck !== undefined){
			unit.custom.TempDeck = []
			for (i = 0; i < unit.custom.Deck.length; i++){
				card = unit.custom.Deck[i];
				unit.custom.TempDeck.push(card);
			}
		}
	},
	
	restoreMainDeck: function(unit){
		var i, card;
		if (unit.custom.TempDeck !== null && unit.custom.TempDeck !== undefined){
			delete unit.custom.Deck;
			unit.custom.Deck = [];
			for (i = 0; i < unit.custom.TempDeck.length; i++){
				card = unit.custom.TempDeck[i]
				unit.custom.Deck.push(card)
			}
		}
	},
	
	summonCard: function(unit, index){
		var i, card, item;
		var Weapons = root.getBaseData().getWeaponList();
		var Units = root.getBaseData().getPlayerList();
		var Items = root.getBaseData().getItemList();
		if (unit.custom.Deck !== null){
			card = unit.custom.Deck[index]
			if (card[0] === "WEAPON"){
				for (i = 0; i < Weapons.getCount(); i++){
					if (Weapons.getData(i).getId() === unit.custom.Deck[index][1]){
						UnitItemControl.insertItem(unit,Weapons.getData(i));
					}
				}
			}
			else if (card[0] === "ITEM"){
				for (i = 0; i < Items.getCount(); i++){
					if (Items.getData(i).getId() === unit.custom.Deck[index][1]){
						UnitItemControl.insertItem(unit,Items.getData(i));
					}
				}
			}
			else{
				return null;
			}
		}
	}
};

// PackCardControl = {
	
	
	
// }