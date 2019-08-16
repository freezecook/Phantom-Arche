UnitCommand.configureCommands = function(groupArray) {
		this._appendTalkEvent(groupArray);
		groupArray.appendObject(UnitCommand.Attack);
		//New Attack Option
		groupArray.appendObject(UnitCommand.Sleight);
		//Deck Filler (temporary)
		//groupArray.appendObject(UnitCommand.Deck);
		//DECK001.call(this, groupArray);
		
		groupArray.appendObject(UnitCommand.PlaceCommand);
		groupArray.appendObject(UnitCommand.Occupation);
		groupArray.appendObject(UnitCommand.Treasure);
		groupArray.appendObject(UnitCommand.Village);
		groupArray.appendObject(UnitCommand.Shop);
		groupArray.appendObject(UnitCommand.Gate);
		this._appendUnitEvent(groupArray);
		groupArray.appendObject(UnitCommand.Quick);
		groupArray.appendObject(UnitCommand.Steal);
		groupArray.appendObject(UnitCommand.Wand);
		groupArray.appendObject(UnitCommand.Information);
		this._appendMetamorphozeCommand(groupArray);
		this._appendFusionCommand(groupArray);
		groupArray.appendObject(UnitCommand.Item);
		groupArray.appendObject(UnitCommand.Trade);
		groupArray.appendObject(UnitCommand.Stock);
		groupArray.appendObject(UnitCommand.MetamorphozeCancel);
		groupArray.appendObject(UnitCommand.Wait);
	}




var SleightCommandMode = {
	TOP: 0,
	SELECTION: 1,
	RESULT: 2
};

UnitCommand.Sleight = defineObject(UnitListCommand,
{
	_sleightSelectMenu: null,
	_posSelector: null,
	_isWeaponSelectDisabled: false,
	
	openCommand: function() {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	moveCommand: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode === SleightCommandMode.TOP) {
			result = this._moveTop();
		}
		else if (mode === SleightCommandMode.SELECTION) {
			result = this._moveSelection();
		}
		else if (mode === SleightCommandMode.RESULT) {
			result = this._moveResult();
		}
		
		return result;
	},
	
	drawCommand: function() {
		var mode = this.getCycleMode();
		
		if (mode === SleightCommandMode.TOP) {
			this._drawTop();
		}
		else if (mode === SleightCommandMode.SELECTION) {
			this._drawSelection();
		}
		else if (mode === SleightCommandMode.RESULT) {
			this._drawResult();
		}
	},
	
	isCommandDisplayable: function() {
		return AttackChecker.isUnitAttackable(this.getCommandTarget());
	},
	
	getCommandName: function() {
		return "Sleight";//root.queryCommand('attack_unitcommand');
	},
	
	isRepeatMoveAllowed: function() {
		return DataConfig.isUnitCommandMovable(RepeatMoveType.ATTACK);
	},
	
	_prepareCommandMemberData: function() {
		this._sleightSelectMenu = createObject(SleightSelectMenu);
		this._posSelector = createObject(PosSelector);
		this._isWeaponSelectDisabled = false;
	},
	
	_completeCommandMemberData: function() {
		if (DataConfig.isWeaponSelectSkippable()) {
			if (this._getWeaponCount() === 1) {
				this._isWeaponSelectDisabled = true;
			}
		}
		
		if (this._isWeaponSelectDisabled) {
			this._startSelection(ItemControl.getEquippedWeapon(this.getCommandTarget()));
		}
		else { 
			this._sleightSelectMenu.setMenuTarget(this.getCommandTarget());
			this.changeCycleMode(SleightCommandMode.TOP);
		}
	},
	
	_getWeaponCount: function() {
		var i, weapon;
		var unit = this.getCommandTarget();
		var count = UnitItemControl.getPossessionItemCount(unit);
		var weaponCount = 0;
		
		for (i = 0; i < count; i++) {
			weapon = UnitItemControl.getItem(unit, i);
			if (weapon === null) {
				continue;
			}
			
			if (ItemControl.isWeaponAvailable(unit, weapon)) {
				weaponCount++;
			}
		}
		
		return weaponCount;
	},
	
	_startSelection: function(weapon) {
		var unit = this.getCommandTarget();
		var filter = this._getUnitFilter();
		var indexArray = this._getIndexArray(unit, weapon);
		
		// Equip with the selected item.
		ItemControl.setEquippedWeapon(unit, weapon);
		
		this._posSelector.setUnitOnly(unit, weapon, indexArray, PosMenuType.Attack, filter);
		this._posSelector.setFirstPos();
		
		this.changeCycleMode(SleightCommandMode.SELECTION);
	},
	
	_moveTop: function() {
		var weapon;
		var input = this._sleightSelectMenu.moveWindowManager();
		
		if (input === ScrollbarInput.SELECT) {
			weapon = this._sleightSelectMenu.getSelectWeapon();
			this._startSelection(weapon);
		}
		else if (input === ScrollbarInput.CANCEL) {
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	_moveSelection: function() {
		var attackParam;
		var result = this._posSelector.movePosSelector();
		
		if (result === PosSelectorResult.SELECT) {
			if (this._isPosSelectable()) {
				this._posSelector.endPosSelector();
				
				attackParam = this._createAttackParam();
				
				this._preAttack = createObject(PreAttack);
				result = this._preAttack.enterPreAttackCycle(attackParam);
				if (result === EnterResult.NOTENTER) {
					this.endCommandAction();
					return MoveResult.END;
				}
				
				this.changeCycleMode(SleightCommandMode.RESULT);
			}
		}
		else if (result === PosSelectorResult.CANCEL) {
			this._posSelector.endPosSelector();
			if (this._isWeaponSelectDisabled) {
				return MoveResult.END;
			}
			
			this._sleightSelectMenu.setMenuTarget(this.getCommandTarget());
			this.changeCycleMode(SleightCommandMode.TOP);
		}
		
		return MoveResult.CONTINUE;
	},
	
	_moveResult: function() {
		if (this._preAttack.movePreAttackCycle() !== MoveResult.CONTINUE) {
			this.endCommandAction();
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	_drawTop: function() {
		this._sleightSelectMenu.drawWindowManager();
	},
	
	_drawSelection: function() {
		this._posSelector.drawPosSelector();
	},
	
	_drawResult: function() {
		if (this._preAttack.isPosMenuDraw()) {
			// Without the following code, it flickers at the easy battle.
			this._posSelector.drawPosMenu();
		}
		
		this._preAttack.drawPreAttackCycle();
	},
	
	_isPosSelectable: function() {
		var unit = this._posSelector.getSelectorTarget(true);
		
		return unit !== null;
	},
	
	_getUnitFilter: function() {
		return FilterControl.getReverseFilter(this.getCommandTarget().getUnitType());
	},
	
	_getIndexArray: function(unit, weapon) {
		return AttackChecker.getAttackIndexArray(unit, weapon, false);
	},
	
	_createAttackParam: function() {
		var attackParam = StructureBuilder.buildAttackParam();
		
		attackParam.unit = this.getCommandTarget();
		attackParam.targetUnit = this._posSelector.getSelectorTarget(false);
		attackParam.attackStartType = AttackStartType.NORMAL;
		
		return attackParam;
	}
}
);

//Edited from WeaponSelectMenu (windowmanager-weaponselectmenu.js)
var SleightSelectMenu = defineObject(BaseWindowManager,
{
	_unit: null,
	_itemListWindow: null,
	_itemInfoWindow: null,
	
	setMenuTarget: function(unit) {
		this._unit = unit;
		this._itemListWindow = createWindowObject(ItemListWindow, this);
		this._itemInfoWindow = createWindowObject(ItemInfoWindow, this); 
		
		this._setWeaponFormation();
		this._setWeaponbar(unit);
		this._itemListWindow.setActive(true);
	},
	
	moveWindowManager: function() {
		var result = this._itemListWindow.moveWindow();
		
		if (this._itemListWindow.isIndexChanged()) {
			this._itemInfoWindow.setInfoItem(this._itemListWindow.getCurrentItem());
		}
		
		return result;
	},
	
	drawWindowManager: function() {
		var x = this.getPositionWindowX();
		var y = this.getPositionWindowY();
		var height = this._itemListWindow.getWindowHeight();
		
		this._itemListWindow.drawWindow(x, y);
		this._itemInfoWindow.drawWindow(x, y + height + this._getWindowInterval());
	},
	
	getTotalWindowWidth: function() {
		return this._itemInfoWindow.getWindowWidth();
	},
	
	getTotalWindowHeight: function() {
		return this._itemListWindow.getWindowHeight() + this._getWindowInterval() + this._itemInfoWindow.getWindowHeight();
	},
	
	getPositionWindowX: function() {
		var width = this.getTotalWindowWidth();
		return LayoutControl.getUnitBaseX(this._unit, width);
	},
	
	getPositionWindowY: function() {
		return LayoutControl.getCenterY(-1, 340);
	},
	
	//Changing this will change how many weapon slots are displayed. See _setWeaponbar().
	getWeaponCount: function() {
		var i, item;
		var count = UnitItemControl.getPossessionItemCount(this._unit);
		var weaponCount = 0;
		
		
		for (i = 5; i < count; i++) {
			item = UnitItemControl.getItem(this._unit, i);
			if (this._isWeaponAllowed(this._unit, item)) {
				weaponCount++;
			}
		}
		
		return weaponCount;
	},
	
	getSelectWeapon: function() {
		return this._itemListWindow.getCurrentItem();
	},
	
	_getWindowInterval: function() {
		return 10;
	},
	
	_setWeaponFormation: function() {
		var count = this.getWeaponCount();
		var visibleCount = 8;
		
		if (count > visibleCount) {
			count = visibleCount;
		}
		
		this._itemListWindow.setItemFormation(count);
	},
	
	//Changing this will change which weapon slots are displayed. See getWeaponCount()
	_setWeaponbar: function(unit) {
		var i, item;
		var count = UnitItemControl.getPossessionItemCount(unit);
		var scrollbar = this._itemListWindow.getItemScrollbar();
		
		scrollbar.resetScrollData();
		
		for (i = 5; i < count; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (this._isWeaponAllowed(unit, item)) {
				scrollbar.objectSet(item);
			}
		}
		
		scrollbar.objectSetEnd();
	},
	
	_isWeaponAllowed: function(unit, item) {
		var indexArray;
		
		if (!ItemControl.isWeaponAvailable(unit, item)) {
			return false;
		}
	
		indexArray = AttackChecker.getAttackIndexArray(unit, item, true);
		
		return indexArray.length !== 0;
	}
}
);