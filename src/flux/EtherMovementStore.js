var immutable = require('immutable');
var Rect = require('../lib/ImmutableRect');

var BaseStore = require('../lib/BaseStore');
var WorkbenchStore = require('./WorkbenchStore');
var SelectionStore = require('./SelectionStore');
var Dispatcher = require('./dispatcher');
var Constants = require('./constants');

var requestAnimationFrame = window.requestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame;

// Data
var wires = {};
var isDragging = false;
var startMousePos;
var lastMousePos;
var requestId;

function update() {
	var delta = lastMousePos.subtract(startMousePos);

	SelectionStore.getSelectedItems().forEach((item, id) => {
		var currentFrame = item.get('rect');
		var connections = item.get('connections');
		var frame = currentFrame.moveBy(delta);

		// TODO: only update each wire once
		connections.forEach(cId => {
			var connection = WorkbenchStore.getConnection(cId);
			if (id === connection.fromFilter) {
				connection.fromPoint = connection.fromOffset.add(frame);
			}
			if (id === connection.toFilter) {
				connection.toPoint = connection.toOffset.add(frame);
			}
			wires[cId].forceUpdate();
		});

		// Re-draw filter position
		// element.style.left = frame.x + 'px';
		// element.style.top = frame.y + 'px';
	});

	// Reset
	requestId = null;
}

/**
 * EtherMovementStore single object
 */
var EtherMovementStore = BaseStore.createStore({
	registerWire(id, wire) {
		wires[id] = wire;
	},
	unregisterWire(id) {
		delete wires[id];
	},
	getAmountDragged(mousePos) {
		return mousePos.subtract(startMousePos);
	},
	isDragging() {
		return isDragging;
	}
});
module.exports = EtherMovementStore;

// Register for all actions with the Dispatcher
Dispatcher.register(function(action) {
	switch(action.actionType) {
		case Constants.START_MOVING_SELECTED_ITEMS:
		startMousePos = action.mousePos;
		isDragging = true;
		return;

		case Constants.MOVING_SELECTED_ITEMS:
		lastMousePos = action.mousePos;
		if (!requestId) {
			requestId = requestAnimationFrame(update);
		}
		return;

		case Constants.FINISH_MOVING_SELECTED_ITEMS:
		isDragging = false;
		requestId = null;
		return;
	}
});