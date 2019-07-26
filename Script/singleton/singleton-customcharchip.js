
var CustomCharChipGroup = {
	_objectArray: null,
	
	initSingleton: function() {
		this._objectArray = [];
		this._configureCustomCharChip(this._objectArray);
	},
	
	createCustomRenderer: function(unit) {
		var i, obj;
		var count = this._objectArray.length;
		var keyword = unit.getCustomCharChipKeyword();
		
		for (i = 0; i < count; i++) {
			if (this._objectArray[i].getKeyword() === keyword) {
				obj = createObject(this._objectArray[i]);
				obj.setupCustomCharChip(unit);
				unit.setCustomRenderer(obj);
				break;
			}
		}
	},
	
	drawMenuUnit: function(unit, xPixel, yPixel, unitRenderParam) {
		var cpData;
		var obj = unit.getCustomRenderer();
		
		if (obj !== null) {
			cpData = this.createCustomCharChipDataFromUnit(unit, xPixel, yPixel, unitRenderParam);
			obj.drawMenuCharChip(cpData);
		}
	},
	
	createCustomCharChipDataFromUnit: function(unit, xPixel, yPixel, unitRenderParam) {
		var cpData = {};
		var terrain = PosChecker.getTerrainFromPos(unit.getMapX(), unit.getMapY());
		
		cpData.xPixel = xPixel;
		cpData.yPixel = yPixel;
		cpData.unit = unit;
		cpData.cls = unit.getClass();
		cpData.terrain = terrain;
		cpData.animationIndex = unitRenderParam.animationIndex;
		cpData.direction = unitRenderParam.direction;
		cpData.alpha = unitRenderParam.alpha;
		cpData.unitType = unit.getUnitType();
		cpData.wait = unit.isWait();
		cpData.isHpVisible = false;
		cpData.isStateIcon = false;
		cpData.keyword = unit.getCustomCharChipKeyword();
		
		return cpData;
	},
	
	_configureCustomCharChip: function(groupArray) {
	}
};

var BaseCustomCharChip = defineObject(BaseObject,
{
	initialize: function() {
	},
	
	setupCustomCharChip: function(unit) {
	},
	
	moveCustomCharChip: function() {
		return MoveResult.CONTINUE;
	},
	
	drawCustomCharChip: function(cpData) {
	},
	
	drawMenuCharChip: function(cpData) {
	},
	
	getKeyword: function() {
		return '';
	},
	
	_drawSymbol: function(x, y, cpData) {
		if (cpData.isSymbol) {
			root.drawCharChipSymbol(x, y, cpData.unit);
		}
	},
	
	_drawHpGauge: function(x, y, cpData) {
		if (cpData.isHpVisible) {
			root.drawCharChipHpGauge(x, y, cpData.unit);
		}
	},
	
	_drawStateIcon: function(x, y, cpData) {
		if (cpData.isStateIcon) {
			root.drawCharChipStateIcon(x, y, cpData.unit);
		}
	}
}
);

var CustomCharChip = {};
