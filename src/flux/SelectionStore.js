var immutable = require('immutable');
var Rect = require('../lib/ImmutableRect');

var BaseStore = require('../lib/BaseStore');
var WorkbenchStore = require('./WorkbenchStore');
var Dispatcher = require('./dispatcher');
var Constants = require('./constants');

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

SelectionStore.dispatchToken = Dispatcher.register(function(action) {
	switch(action.actionType) {
		case Constants.START_MOVING_SELECTED_ITEMS:
			selectedItems = selectedItems.add(action.id);
			SelectionStore.emitChange();
		return;

		case Constants.START_SELECTION:
			startScrollPos = action.scrollPos;
			startPos = lastPos = startScrollPos.add(action.mousePos);
			isSelecting = true;
		return;

		case Constants.RESIZE_SELECTION:
			// Find itemsInsideSelection
			lastPos = startScrollPos.add(action.mousePos);
			var rect = SelectionStore.getSelectionRect();
			itemsInsideSelection = WorkbenchStore.getItemsCoveredBy(rect);
			SelectionStore.emitChange();
		return;

		case Constants.FINISH_SELECTION:
			// Transfer itemsInsideSelection
			selectedItems = selectedItems.union(itemsInsideSelection);
			itemsInsideSelection = immutable.Set();
			isSelecting = false;
			SelectionStore.emitChange();
		return;

		// TODO: emitChange, because it could be cancelled for other reason than just no movement
		case Constants.CANCEL_SELECTION:
			itemsInsideSelection = immutable.Set();
			isSelecting = false;
		return;

		case Constants.CLEAR_SELECTED_ITEMS:
		case Constants.DELETE_SELECTED_ITEMS:
			if (selectedItems.length === 0) {
				break;
			}
			selectedItems = immutable.Set();
			SelectionStore.emitChange();
		return;

		case Constants.CREATE_ITEM:
			// Select the item after the it was created
			Dispatcher.waitFor([ WorkbenchStore.dispatchToken ]);
			selectedItems = immutable.Set(WorkbenchStore.getLastIndex());
			SelectionStore.emitChange();
		return;

		case Constants.SELECT_ALL:
			selectedItems = WorkbenchStore.getAllItems().keySeq().toSet();
			SelectionStore.emitChange();
		return;
	}
});

module.exports = SelectionStore;