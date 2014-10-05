var immutable = require('immutable');
var Rect = require('../lib/ImmutableRect');
var BaseStore = require('../lib/BaseStore');
var WorkbenchStore; // late import
var dispatcher = require('./dispatcher');
var constants = require('./constants');

// Data
var selectedItems = immutable.Set();
var itemsInsideSelection = immutable.Set();
var isSelecting = false;
var startScrollPos;
var startPos;
var lastPos;

/**
 * SelectionStore single object
 */
var SelectionStore = BaseStore.createStore({

	getSelectionRect() {
		return Rect.fromTwoPoints(startPos, lastPos);
	},

	isClick() {
		return startPos.equals(lastPos);
	},

	isSelecting() {
		return isSelecting;
	},

	isItemSelected(id) {
		// TODO: remove type and make ids unique
		return selectedItems.contains(id) || itemsInsideSelection.contains(id);
	},

	getSelectedItemIds() {
		// TODO: don't recalculate this union everytime
		return selectedItems.union(itemsInsideSelection);
	}

});

SelectionStore.dispatchToken = dispatcher.register(function(action) {
	switch(action.actionType) {
		case constants.START_MOVING_SELECTED_ITEMS:
			selectedItems = selectedItems.add(action.id);
			SelectionStore.emitChange();
		break;

		case constants.START_SELECTION:
			startScrollPos = action.scrollPos;
			startPos = lastPos = startScrollPos.add(action.mousePos);
			isSelecting = true;
		break;

		case constants.RESIZE_SELECTION:
			// Find itemsInsideSelection
			lastPos = startScrollPos.add(action.mousePos);
			var rect = SelectionStore.getSelectionRect();
			itemsInsideSelection = WorkbenchStore.getItemsCoveredBy(rect);
			SelectionStore.emitChange();
		break;

		case constants.FINISH_SELECTION:
			// Transfer itemsInsideSelection
			selectedItems = selectedItems.union(itemsInsideSelection);
			itemsInsideSelection = immutable.Set();
			isSelecting = false;
			SelectionStore.emitChange();
		break;

		// TODO: emitChange, because it could be cancelled for other reason than just no movement
		case constants.CANCEL_SELECTION:
			itemsInsideSelection = immutable.Set();
			isSelecting = false;
		break;

		case constants.CLEAR_SELECTED_ITEMS:
		case constants.DELETE_SELECTED_ITEMS:
			if (selectedItems.length === 0) {
				break;
			}
			selectedItems = immutable.Set();
			SelectionStore.emitChange();
		break;

		case constants.CREATE_ITEM:
			// Select the item after the it was created
			dispatcher.waitFor([ WorkbenchStore.dispatchToken ]);
			selectedItems = immutable.Set(WorkbenchStore.getLastIndex());
			SelectionStore.emitChange();
		break;

		case constants.SELECT_ALL:
			selectedItems = WorkbenchStore.getAllItems().keySeq().toSet();
			SelectionStore.emitChange();
		break;
	}
});

module.exports = SelectionStore;

// Requiring after the export prevents problems with circular dependencies
WorkbenchStore = require('./WorkbenchStore')