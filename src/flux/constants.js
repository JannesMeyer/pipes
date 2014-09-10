var keyMirror = require('react/lib/keyMirror');

module.exports = keyMirror({
	IMPORT_FILE: null,
	EXPORT_FILE: null,
	UNDO: null,
	REDO: null,
	CREATE_FILTER: null,
	CREATE_PIPE: null,
	REMOVE_SELECTED_ITEMS: null,
	SAVE_SELECTION_AS_FILTER: null,

	START_MOVING_SELECTED_ITEMS: null,
	MOVING_SELECTED_ITEMS: null,
	END_DRAG_ON_WORKBENCH: null,

	MOVE_SELECTED_ITEMS: null,
	ITEM_CLICKED_ON_WORKBENCH: null,

	START_SELECTION: null,
	MOVE_SELECTION: null,
	FINISH_SELECTION: null,
	CANCEL_SELECTION: null,

	CLEAR_SELECTED_ITEMS: null,

	SELECTION_TYPE_NEW: null,
	SELECTION_TYPE_EXTEND: null,

	ITEM_TYPE_FILTER: null,
	ITEM_TYPE_PIPE: null
});