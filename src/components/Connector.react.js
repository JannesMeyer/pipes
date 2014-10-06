var CreateConnectionStore = require('../flux/CreateConnectionStore');

var Connector = React.createClass({

	getInitialState: function() {
		return {
			eligibleTarget: CreateConnectionStore.isEligibleTarget(this.props.address)
		};
	},

	componentDidMount() {
		CreateConnectionStore.addStateChangeListener(this._handleChange);
	},

	componentWillUnmount() {
		CreateConnectionStore.removeStateChangeListener(this._handleChange);
	},

	render() {
		var classes = "connector";
		if (this.state.eligibleTarget) {
			classes += ' glow';
		}
		return <div className={classes} onMouseDown={this.props.onMouseDown} />;
	},

	_handleChange() {
		this.replaceState(this.getInitialState());
	}

});
module.exports = Connector;